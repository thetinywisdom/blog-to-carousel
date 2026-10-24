const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, mode } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the article HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinyWisdomBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch article: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Parse title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? decodeEntities(titleMatch[1].trim()) : 'Untitled';
    // Clean up common site suffixes
    title = title.replace(/\s*[-–—|·•]\s*by\s+.*$/i, '').trim();
    title = title.replace(/\s*[|–—-]\s*The Tiny Wisdom.*$/i, '').trim();
    title = title.replace(/\s*[|–—-]\s*Tiny Wisdom.*$/i, '').trim();

    // Extract og:description or meta description for subtitle
    const descMatch = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:description"|name="description")/i);
    const subtitle = descMatch ? decodeEntities(descMatch[1].trim()) : '';

    // Extract og:image (featured image for title slide)
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    let imageUrl: string | null = ogImageMatch ? ogImageMatch[1].trim() : null;

    // Fallback: first large image in the content
    if (!imageUrl) {
      const firstImgMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
      imageUrl = firstImgMatch ? firstImgMatch[1] : null;
    }

    // Extract main content — try article, main, .entry-content, .post-content etc.
    let contentHtml = '';
    
    const contentPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*(?:available-content|entry-content|post-content|article-content|content-area|the-content|post-body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];

    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > 200) {
        contentHtml = match[1];
        break;
      }
    }

    if (!contentHtml) {
      // Fallback: extract body content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      contentHtml = bodyMatch ? bodyMatch[1] : html;
    }

    // Strip HTML tags and decode entities
    const rawText = stripHtml(contentHtml);

    // Split into paragraphs
    const paragraphs = rawText
      .split(/\n{2,}/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.trim().length > 0 && !isBoilerplate(p) && !isTitleOrByline(p, title))
      .map(p => p.replace(/\s*Your friend,?\s*Brian\.?\s*$/i, '').trim())
      .map(p => p.replace(/\s*\d+\s+\d+\s+\d*\s*Share\s*$/i, '').trim())
      .filter(p => p.trim().length > 0);

    if (paragraphs.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not extract article content. Please check the URL.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chunk paragraphs into slides (max 11 to leave room for closing slide)
    const chunks = chunkIntoSlides(paragraphs, mode || 'full', title);

    return new Response(
      JSON.stringify({
        success: true,
        title,
        subtitle,
        rawText: paragraphs.join('\n\n'),
        imageUrl,
        chunks,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error parsing article:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(html: string): string {
  // Remove script and style blocks entirely
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '');

  // Replace block elements with newlines
  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n');

  // Strip all remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...');

  // Clean up whitespace
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function isBoilerplate(text: string): boolean {
  const normalized = text.trim().toLowerCase();

  // Fixed closing excerpt from The Tiny Wisdom articles
  if (/i hope you find this insightful/i.test(normalized)) return true;
  if (/it.?s not going to be easy/i.test(normalized)) return true;
  if (/but it.?s not impossible/i.test(normalized)) return true;
  if (/not going to be easy.*not impossible/i.test(normalized)) return true;
  if (/by brian.*the tiny wisdom/i.test(normalized)) return true;
  if (/- by brian/i.test(normalized)) return true;
  if (/your friend,?\s*$/i.test(normalized)) return true;
  if (/^brian\.?$/i.test(normalized)) return true;
  if (/your friend,?\s*brian/i.test(normalized)) return true;
  if (/^share$/i.test(normalized)) return true;
  if (/^\d+(\s+\d+)*\s*(share)?$/i.test(normalized)) return true;

  const boilerplate = [
    /^share this/i, /^share$/i, /^follow us/i, /^subscribe/i, /^newsletter/i,
    /^copyright/i, /^all rights reserved/i, /^privacy policy/i,
    /^terms of/i, /^cookie/i, /^advertisement/i, /^\d+ comments?$/i,
    /^leave a (reply|comment)/i, /^related posts?/i, /^you may also/i,
    /^tags:/i, /^categories:/i, /^filed under/i, /^written by/i,
    /^posted by/i, /^author:/i, /^read more/i, /^click here/i,
  ];
  return boilerplate.some(re => re.test(normalized));
}

function isTitleOrByline(text: string, title: string): boolean {
  const normalized = text.trim().toLowerCase();
  const normalizedTitle = title.trim().toLowerCase();

  // Exact or near-exact title match
  if (normalized === normalizedTitle) return true;
  if (normalizedTitle.length > 10 && normalized.includes(normalizedTitle)) return true;
  if (normalizedTitle.length > 10 && normalizedTitle.includes(normalized)) return true;

  // Byline patterns: "By Author Name", "January 1, 2025", "By X · 5 min read", etc.
  if (/^by\s+[A-Z]/i.test(text.trim())) return true;
  if (/^\w+\s+\d{1,2},?\s+\d{4}/i.test(text.trim())) return true; // "January 1, 2025"
  if (/^\d{1,2}\s+\w+\s+\d{4}/i.test(text.trim())) return true;   // "1 January 2025"
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text.trim())) return true; // "01/01/2025"
  if (/\d+\s*min\s*read/i.test(text.trim()) && text.length < 100) return true;
  // Short lines with just a name and date
  if (text.length < 80 && /\b\d{4}\b/.test(text) && /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(text)) return true;

  return false;
}

function chunkIntoSlides(paragraphs: string[], mode: string, title: string): string[] {
  const MAX_SLIDES = 11; // Leave slot 12 for the fixed closing slide added on the frontend
  const MAX_CHARS_PER_SLIDE = mode === 'short' ? 280 : 420;

  const slides: string[] = [];

  // Slide 1: Title (always)
  slides.push(title);

  if (mode === 'short') {
    // For shortened mode: summarize by picking key paragraphs
    // Take intro, evenly spaced key paragraphs, and conclusion
    const totalParagraphs = paragraphs.length;
    
    if (totalParagraphs <= 10) {
      // Group paragraphs into chunks
      const groupSize = Math.ceil(totalParagraphs / Math.min(10, MAX_SLIDES - 1));
      for (let i = 0; i < totalParagraphs; i += groupSize) {
        const group = paragraphs.slice(i, i + groupSize);
        // Take the longest/most meaningful paragraph from each group
        const best = group.reduce((a, b) => a.length > b.length ? a : b);
        const trimmed = trimToSentence(best, MAX_CHARS_PER_SLIDE);
        if (trimmed && slides.length < MAX_SLIDES) {
          slides.push(trimmed);
        }
      }
    } else {
      // Spread selection evenly
      const step = Math.floor(totalParagraphs / (MAX_SLIDES - 1));
      for (let i = 0; i < totalParagraphs && slides.length < MAX_SLIDES; i += step) {
        const trimmed = trimToSentence(paragraphs[i], MAX_CHARS_PER_SLIDE);
        if (trimmed) {
          slides.push(trimmed);
        }
      }
      // Always include last paragraph (conclusion)
      if (slides.length < MAX_SLIDES) {
        const lastPara = trimToSentence(paragraphs[paragraphs.length - 1], MAX_CHARS_PER_SLIDE);
        if (lastPara && slides[slides.length - 1] !== lastPara) {
          slides.push(lastPara);
        }
      }
    }
  } else {
    // Full mode: pack paragraphs into slides, wrapping at MAX_CHARS_PER_SLIDE
    let currentSlide = '';
    for (const para of paragraphs) {
      if (slides.length >= MAX_SLIDES) break;
      
      if (currentSlide === '') {
        currentSlide = para;
      } else if ((currentSlide + '\n\n' + para).length <= MAX_CHARS_PER_SLIDE) {
        currentSlide += '\n\n' + para;
      } else {
        slides.push(currentSlide);
        currentSlide = para;
      }
    }
    
    // Add remaining content
    if (currentSlide && slides.length < MAX_SLIDES) {
      slides.push(currentSlide);
    }
    
    // If we've exceeded 12, compress by merging shorter slides
    if (slides.length > MAX_SLIDES) {
      return compressSlides(slides, MAX_SLIDES);
    }
  }

  // Ensure we don't exceed 12 total
  return slides.slice(0, MAX_SLIDES);
}

function trimToSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  
  // Try to cut at sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
  );
  
  if (lastPeriod > maxChars * 0.5) {
    return truncated.slice(0, lastPeriod + 1).trim();
  }
  
  return truncated.trim() + '...';
}

function compressSlides(slides: string[], max: number): string[] {
  // Merge adjacent short slides until we're within limit
  while (slides.length > max) {
    let minLen = Infinity;
    let minIdx = 1; // Don't merge slide 0 (title)
    
    for (let i = 1; i < slides.length - 1; i++) {
      if (slides[i].length < minLen) {
        minLen = slides[i].length;
        minIdx = i;
      }
    }
    
    // Merge with next slide
    slides[minIdx] = slides[minIdx] + '\n\n' + slides[minIdx + 1];
    slides.splice(minIdx + 1, 1);
  }
  
  return slides;
}
