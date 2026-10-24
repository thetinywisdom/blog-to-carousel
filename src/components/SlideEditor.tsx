import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { SlideChunk } from "@/types/article";

interface SlideEditorProps {
  title: string;
  chunks: SlideChunk[];
  onUpdateChunks: (chunks: SlideChunk[]) => void;
  onRenderImages: () => void;
  isRendering: boolean;
}

const MAX_SLIDES = 12;
const BRAND_ORANGE = "#ed612b";
const BRAND_DARK = "#1a1a1a";
const BRAND_BG = "#EFEEEA";

export const SlideEditor = ({ title, chunks, onUpdateChunks, onRenderImages, isRendering }: SlideEditorProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateText = (id: string, text: string) => {
    onUpdateChunks(chunks.map(c => c.id === id ? { ...c, text } : c));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...chunks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onUpdateChunks(next.map((c, i) => ({ ...c, index: i })));
  };

  const moveDown = (index: number) => {
    if (index === chunks.length - 1) return;
    const next = [...chunks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onUpdateChunks(next.map((c, i) => ({ ...c, index: i })));
  };

  const deleteChunk = (id: string) => {
    if (chunks.length <= 1) return;
    onUpdateChunks(chunks.filter(c => c.id !== id).map((c, i) => ({ ...c, index: i })));
  };

  const addChunk = (afterIndex: number) => {
    if (chunks.length >= MAX_SLIDES) return;
    const newChunk: SlideChunk = {
      id: `chunk-${Date.now()}`,
      text: '',
      index: afterIndex + 1,
    };
    const next = [...chunks];
    next.splice(afterIndex + 1, 0, newChunk);
    onUpdateChunks(next.map((c, i) => ({ ...c, index: i })));
    setExpandedId(newChunk.id);
  };

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = (text: string) => text.length;
  const isOverLimit = (text: string) => charCount(text) > 420;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: BRAND_ORANGE }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Slide Editor
            </span>
          </div>
          <h2 className="font-serif text-2xl" style={{ color: BRAND_DARK }}>
            "{title}"
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {chunks.length} of {MAX_SLIDES} slides · click a slide to edit
          </p>
        </div>

        <button
          onClick={onRenderImages}
          disabled={isRendering || chunks.length === 0}
          className="shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
          style={{ background: BRAND_ORANGE, color: BRAND_BG }}
        >
          {isRendering ? "Rendering…" : "Render Images →"}
        </button>
      </div>

      {/* Slide list */}
      <div className="space-y-2">
        {chunks.map((chunk, index) => {
          const isExpanded = expandedId === chunk.id;
          const isTitle = index === 0;
          const over = isOverLimit(chunk.text);

          return (
            <div key={chunk.id}>
              <div
                className="rounded-lg border transition-all"
                style={{
                  background: BRAND_BG,
                  borderColor: over
                    ? 'hsl(var(--destructive) / 0.5)'
                    : isExpanded
                    ? BRAND_ORANGE
                    : 'hsl(var(--border))',
                }}
              >
                {/* Slide header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : chunk.id)}
                >
                  {/* Slide number badge */}
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded text-xs font-bold shrink-0"
                    style={{
                      background: isTitle ? BRAND_ORANGE : (isExpanded ? BRAND_DARK : 'hsl(var(--muted))'),
                      color: isTitle ? BRAND_BG : (isExpanded ? BRAND_BG : 'hsl(var(--muted-foreground))'),
                    }}
                  >
                    {index + 1}
                  </div>

                  <p className="flex-1 text-sm truncate" style={{ color: chunk.text ? BRAND_DARK : 'hsl(var(--muted-foreground))' }}>
                    {chunk.text || <em>Empty slide…</em>}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs ${over ? 'font-semibold' : ''}`} style={{ color: over ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))' }}>
                      {charCount(chunk.text)}c
                    </span>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    }
                  </div>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t space-y-3" style={{ borderColor: 'hsl(var(--border))' }}>
                    <textarea
                      value={chunk.text}
                      onChange={(e) => updateText(chunk.id, e.target.value)}
                      rows={isTitle ? 2 : 6}
                      placeholder={isTitle ? "Article title…" : "Slide content…"}
                      className="w-full px-4 py-3 rounded-lg border text-sm resize-none focus:outline-none transition-all leading-relaxed"
                      style={{
                        background: 'hsl(var(--card))',
                        borderColor: over ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--border))',
                        color: BRAND_DARK,
                      }}
                    />



                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <span>{wordCount(chunk.text)} words</span>
                        <span>·</span>
                        <span className={over ? 'font-semibold' : ''} style={over ? { color: 'hsl(var(--destructive))' } : {}}>
                          {charCount(chunk.text)} chars {over && '— over limit'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move up">
                          <ArrowUp className="w-3.5 h-3.5" style={{ color: 'hsl(var(--muted-foreground))' }} />
                        </button>
                        <button onClick={() => moveDown(index)} disabled={index === chunks.length - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors" title="Move down">
                          <ArrowDown className="w-3.5 h-3.5" style={{ color: 'hsl(var(--muted-foreground))' }} />
                        </button>
                        <button onClick={() => deleteChunk(chunk.id)} disabled={chunks.length <= 1} className="p-1.5 rounded disabled:opacity-30 transition-colors" title="Delete slide"
                          style={{ color: 'hsl(var(--destructive) / 0.7)' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add between slides */}
              {index < chunks.length - 1 && chunks.length < MAX_SLIDES && (
                <div className="flex justify-center my-1">
                  <button
                    onClick={() => addChunk(index)}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-all hover:opacity-70"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <Plus className="w-3 h-3" /> add slide
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add at end */}
        {chunks.length < MAX_SLIDES && (
          <button
            onClick={() => addChunk(chunks.length - 1)}
            className="w-full py-3 rounded-lg border border-dashed text-sm flex items-center justify-center gap-2 transition-all hover:opacity-60"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
          >
            <Plus className="w-4 h-4" />
            Add slide ({chunks.length}/{MAX_SLIDES})
          </button>
        )}
      </div>

      {/* Bottom render CTA */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={onRenderImages}
          disabled={isRendering || chunks.length === 0}
          className="px-8 py-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-40"
          style={{ background: BRAND_DARK, color: BRAND_BG }}
        >
          {isRendering ? "Rendering images…" : "✦ Render All Images"}
        </button>
      </div>
    </div>
  );
};
