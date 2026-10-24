import { useState, useRef, useEffect } from "react";
import { Download, Package, Loader2, CheckCircle, PlusCircle } from "lucide-react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SlideChunk } from "@/types/article";
import { SlideCanvas } from "./SlideRenderer";

interface ExportSectionProps {
  chunks: SlideChunk[];
  articleTitle: string;
  titleImageDataUrl?: string | null;
  onRenderComplete: () => void;
  onNewSlides?: () => void;
}

interface RenderedSlide {
  index: number;
  dataUrl: string;
}

const BRAND_BG = "#EFEEEA";
const BRAND_ORANGE = "#ed612b";
const BRAND_DARK = "#1a1a1a";

export const ExportSection = ({ chunks, articleTitle, titleImageDataUrl, onRenderComplete, onNewSlides }: ExportSectionProps) => {
  const [renderedSlides, setRenderedSlides] = useState<RenderedSlide[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalSlides = chunks.length;

  useEffect(() => {
    renderAll();
  }, []);

  const renderAll = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderedSlides([]);
    setIsDone(false);

    const results: RenderedSlide[] = [];

    // Wait for all images inside the hidden slide canvases to finish loading/decoding
    // before capturing — otherwise html-to-image snapshots before the icon paints.
    const imgs = slideRefs.current
      .filter((el): el is HTMLDivElement => !!el)
      .flatMap((el) => Array.from(el.querySelectorAll("img")));
    await Promise.all(
      imgs.map(async (img) => {
        if (!(img.complete && img.naturalWidth > 0)) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }
        try {
          await img.decode();
        } catch {
          /* ignore decode errors */
        }
      })
    );

    for (let i = 0; i < totalSlides; i++) {
      const el = slideRefs.current[i];
      if (!el) continue;

      try {
        const dataUrl = await toPng(el, {
          width: 1080,
          height: 1350,
          pixelRatio: 1,
        });
        results.push({ index: i, dataUrl });
      } catch (err) {
        console.error(`Failed to render slide ${i}:`, err);
      }

      setRenderProgress(Math.round(((i + 1) / totalSlides) * 100));
    }

    setRenderedSlides(results);
    setIsRendering(false);
    setIsDone(true);
    onRenderComplete();
  };

  const downloadSingle = (slide: RenderedSlide) => {
    const link = document.createElement("a");
    const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    link.download = `tiny-wisdom-${slug}-slide-${String(slide.index + 1).padStart(2, "0")}.png`;
    link.href = slide.dataUrl;
    link.click();
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const folder = zip.folder(`tiny-wisdom-${slug}`);

    for (const slide of renderedSlides) {
      const base64 = slide.dataUrl.split(",")[1];
      folder?.file(
        `slide-${String(slide.index + 1).padStart(2, "0")}.png`,
        base64,
        { base64: true }
      );
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `tiny-wisdom-${slug}.zip`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: BRAND_ORANGE }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Export
            </span>
          </div>
          <h2 className="font-serif text-2xl" style={{ color: BRAND_DARK }}>
            {isDone ? `${renderedSlides.length} slides ready` : `Rendering ${totalSlides} slides…`}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            1080 × 1350 px · PNG format
          </p>
        </div>

        {isDone && renderedSlides.length > 0 && (
          <div className="shrink-0 flex items-center gap-2">
            {onNewSlides && (
              <button
                onClick={onNewSlides}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ background: 'transparent', color: BRAND_DARK, border: `1.5px solid ${BRAND_DARK}` }}
              >
                <PlusCircle className="w-4 h-4" />
                New slides
              </button>
            )}
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
              style={{ background: BRAND_DARK, color: BRAND_BG }}
            >
              <Package className="w-4 h-4" />
              Download ZIP
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      {isRendering && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Rendering slides…
            </span>
            <span>{renderProgress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${renderProgress}%`, background: BRAND_ORANGE }}
            />
          </div>
        </div>
      )}

      {isDone && (
        <div className="flex items-center gap-2 text-sm mb-6 px-4 py-3 rounded-lg"
          style={{ background: `${BRAND_ORANGE}15`, color: BRAND_ORANGE }}>
          <CheckCircle className="w-4 h-4" />
          All {renderedSlides.length} slides rendered — hover a slide to download individually
        </div>
      )}

      {/* Hidden renderers — off-screen for capture */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, pointerEvents: "none" }}>
        {chunks.map((chunk, i) => (
          <SlideCanvas
            key={chunk.id}
            ref={(el) => { slideRefs.current[i] = el; }}
            chunk={chunk}
            isTitle={i === 0}
            isFinal={i === chunks.length - 1 && chunks.length > 1}
            articleTitle={articleTitle}
            totalSlides={totalSlides}
            titleImageDataUrl={titleImageDataUrl}
          />
        ))}
      </div>

      {/* Preview grid */}
      {renderedSlides.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {renderedSlides.map((slide) => (
            <div
              key={slide.index}
              className="group relative rounded-lg overflow-hidden border transition-all"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={slide.dataUrl}
                  alt={`Slide ${slide.index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: `${BRAND_DARK}80` }}
              >
                <button
                  onClick={() => downloadSingle(slide)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold"
                  style={{ background: BRAND_BG, color: BRAND_DARK }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>

              {/* Slide number */}
              <div
                className="absolute top-2 left-2 w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                style={{ background: BRAND_ORANGE, color: BRAND_BG }}
              >
                {slide.index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
