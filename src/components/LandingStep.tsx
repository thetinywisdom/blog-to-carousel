import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ProcessingMode } from "@/types/article";
import { SiteHeader } from "@/components/SiteHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LandingStepProps {
  onProcess: (url: string, mode: ProcessingMode) => void;
  onProcessText: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingStep = ({ onProcess, onProcessText, isLoading, error }: LandingStepProps) => {
  const [url, setUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [source, setSource] = useState<"url" | "text">("url");
  const [mode, setMode] = useState<ProcessingMode>("full");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source === "url") {
      if (!url.trim()) return;
      onProcess(url.trim(), mode);
    } else {
      if (!pastedText.trim()) return;
      onProcessText(pastedText.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EFEEEA' }}>
      <SiteHeader />

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full">



          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-5">BLOG TO CAROUSEL</p>

          <p className="text-base leading-relaxed mb-10" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Paste any article URL from The Tiny Wisdom and get up to 12 carousel slides ready to post — styled exactly to The Tiny Wisdom.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={source} onValueChange={(v) => setSource(v as "url" | "text")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="url">From URL</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-4">
                {/* URL input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1a1a1a' }}>
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.thetinywisdom.com/p/your-article"
                    className="w-full px-4 py-3.5 rounded-lg border text-sm focus:outline-none transition-all"
                    style={{
                      background: '#EFEEEA',
                      borderColor: url ? '#1a1a1a' : 'hsl(var(--border))',
                      color: '#1a1a1a',
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Mode selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1a1a1a' }}>
                    Content Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "full", label: "Full Text", desc: "Everything, lightly formatted" },
                      { value: "short", label: "Shortened", desc: "Core message & emotional arc" },
                    ] as { value: ProcessingMode; label: string; desc: string }[]).map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMode(m.value)}
                        className="px-4 py-3 rounded-lg border text-left transition-all"
                        style={{
                          background: mode === m.value ? '#1a1a1a' : '#EFEEEA',
                          borderColor: mode === m.value ? '#1a1a1a' : 'hsl(var(--border))',
                          color: mode === m.value ? '#EFEEEA' : '#1a1a1a',
                        }}
                      >
                        <div className="text-sm font-semibold">{m.label}</div>
                        <div className="text-xs mt-0.5 opacity-60">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#1a1a1a' }}>
                  Your Text
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste or write your text here — it will be split into slides…"
                  rows={10}
                  className="w-full px-4 py-3.5 rounded-lg border text-sm focus:outline-none transition-all resize-y leading-relaxed"
                  style={{
                    background: '#EFEEEA',
                    borderColor: pastedText ? '#1a1a1a' : 'hsl(var(--border))',
                    color: '#1a1a1a',
                  }}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  The first line becomes the title slide. The rest is split into slides of about 400 characters.
                </p>
              </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'hsl(0 72% 51% / 0.1)', color: 'hsl(0 72% 44%)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (source === "url" ? !url.trim() : !pastedText.trim())}
              className="w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#ed612b',
                color: '#EFEEEA',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching article…
                </>
              ) : source === "url" ? (
                "Process Article →"
              ) : (
                "Create Slides →"
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t text-center text-xs" style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
        Generates up to 12 slides · 1080 × 1350 px · PNG export
      </footer>
    </div>
  );
};
