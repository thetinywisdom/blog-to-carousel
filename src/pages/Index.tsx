import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LandingStep } from "@/components/LandingStep";
import { SlideEditor } from "@/components/SlideEditor";
import { ExportSection } from "@/components/ExportSection";
import { IconPicker } from "@/components/IconPicker";
import { ArticleData, SlideChunk, ProcessingMode, AppStep } from "@/types/article";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

const BRAND_BG = "#EFEEEA";
const BRAND_ORANGE = "#ed612b";
const BRAND_DARK = "#1a1a1a";

const Index = () => {
  const [step, setStep] = useState<AppStep>("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [chunks, setChunks] = useState<SlideChunk[]>([]);
  const [titleImageDataUrl, setTitleImageDataUrl] = useState<string | null>(null);
  const [selectedIconUrl, setSelectedIconUrl] = useState<string | null>(null);

  // Append a fixed closing chunk to the list
  const buildChunks = (rawChunks: string[]): SlideChunk[] => {
    return rawChunks.map((text, index) => ({
      id: `chunk-${index}-${Date.now()}`,
      text,
      index,
    }));
  };

  const handleProcess = async (url: string, mode: ProcessingMode) => {
    setIsLoading(true);
    setError(null);
    setTitleImageDataUrl(null);
    setSelectedIconUrl(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("parse-article", {
        body: { url, mode },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || "Failed to process article");

      setArticleData(data);
      setChunks(buildChunks(data.chunks));
      setStep("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Split pasted text into slides: first line = title, rest chunked by paragraphs (~400 chars)
  const handleProcessText = (text: string) => {
    setError(null);
    setTitleImageDataUrl(null);
    setSelectedIconUrl(null);

    const lines = text.split("\n");
    const title = lines[0].trim() || "Untitled";
    const body = lines.slice(1).join("\n").trim();

    const paragraphs = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const rawChunks: string[] = [];
    let current = "";

    for (const para of paragraphs) {
      if (current && (current + "\n\n" + para).length > 400) {
        rawChunks.push(current);
        current = para;
      } else {
        current = current ? current + "\n\n" + para : para;
      }
    }
    if (current) rawChunks.push(current);

    setArticleData({
      title,
      subtitle: "",
      rawText: text,
      chunks: rawChunks,
      imageUrl: null,
    });
    setChunks(buildChunks(rawChunks.length ? rawChunks : [""]));
    setStep("editing");
  };

  const handleSelectIcon = async (url: string | null) => {
    if (!url) {
      setSelectedIconUrl(null);
      setTitleImageDataUrl(null);
      return;
    }
    setSelectedIconUrl(url);
    try {
      // Inline as data URL so rendering/export works regardless of fetch context
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => setTitleImageDataUrl(reader.result as string);
      reader.readAsDataURL(blob);
    } catch {
      setTitleImageDataUrl(url);
    }
  };

  const handleRenderImages = () => {
    setIsRendering(true);
    setStep("exporting");
  };

  const handleRenderComplete = () => {
    setIsRendering(false);
  };

  const handleBack = () => {
    if (step === "exporting") {
      setStep("editing");
    } else {
      setStep("landing");
      setArticleData(null);
      setChunks([]);
      setError(null);
      setTitleImageDataUrl(null);
      setSelectedIconUrl(null);
    }
  };

  const handleNewSlides = () => {
    setStep("landing");
    setArticleData(null);
    setChunks([]);
    setError(null);
    setTitleImageDataUrl(null);
    setSelectedIconUrl(null);
  };

  if (step === "landing") {
    return <LandingStep onProcess={handleProcess} onProcessText={handleProcessText} isLoading={isLoading} error={error} />;
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND_BG }}>
      <SiteHeader>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "exporting" ? "Back to editor" : "New article"}
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {(["editing", "exporting"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <div className="w-4 h-px bg-border" />}
              <span
                className="text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider"
                style={{
                  background: step === s ? BRAND_ORANGE : 'transparent',
                  color: step === s ? BRAND_BG : 'hsl(var(--muted-foreground))',
                  border: step !== s ? '1px solid hsl(var(--border))' : 'none',
                }}
              >
                {s === "editing" ? "Edit" : "Export"}
              </span>
            </div>
          ))}
        </div>
      </SiteHeader>

      {/* Pick a cover icon for title slide */}
      {step === "editing" && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <IconPicker selectedUrl={selectedIconUrl} onSelect={handleSelectIcon} />
        </div>
      )}

      {step === "editing" && articleData && (
        <SlideEditor
          title={articleData.title}
          chunks={chunks}
          onUpdateChunks={setChunks}
          onRenderImages={handleRenderImages}
          isRendering={isRendering}
        />
      )}

      {step === "exporting" && articleData && (
        <ExportSection
          chunks={chunks}
          articleTitle={articleData.title}
          titleImageDataUrl={titleImageDataUrl}
          onRenderComplete={handleRenderComplete}
          onNewSlides={handleNewSlides}
        />
      )}
    </div>
  );
};

export default Index;
