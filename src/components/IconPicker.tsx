import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

const BRAND_DARK = "#1a1a1a";
const BRAND_ORANGE = "#ed612b";

// Eagerly load all icon URLs from src/assets/icons
const iconModules = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const ICONS = Object.entries(iconModules)
  .map(([path, url]) => {
    const file = path.split("/").pop() || "";
    const name = file.replace(/^Variant=/, "").replace(/\.svg$/, "");
    return { name, url };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

interface IconPickerProps {
  selectedUrl: string | null;
  onSelect: (url: string | null) => void;
}

export const IconPicker = ({ selectedUrl, onSelect }: IconPickerProps) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter((i) => i.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div
      className="rounded-lg p-4 mb-2"
      style={{ background: `${BRAND_DARK}06`, border: `1px solid ${BRAND_ORANGE}30` }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="font-medium text-sm" style={{ color: BRAND_DARK }}>
            Choose a cover icon
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Shown on the title slide
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUrl && (
            <button
              onClick={() => onSelect(null)}
              className="text-xs px-3 py-1.5 rounded font-medium transition-opacity hover:opacity-70"
              style={{ background: "hsl(var(--muted))", color: BRAND_DARK }}
            >
              Clear
            </button>
          )}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
            style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons"
              className="bg-transparent text-xs outline-none w-28"
              style={{ color: BRAND_DARK }}
            />
          </div>
        </div>
      </div>

      <div
        className="grid gap-2 overflow-y-auto pr-1"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
          maxHeight: "240px",
        }}
      >
        {filtered.map((icon) => {
          const isSelected = selectedUrl === icon.url;
          return (
            <button
              key={icon.url}
              onClick={() => onSelect(icon.url)}
              title={icon.name}
              className="relative aspect-square rounded-md flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: isSelected ? `${BRAND_ORANGE}15` : "hsl(var(--background))",
                border: isSelected
                  ? `2px solid ${BRAND_ORANGE}`
                  : "1px solid hsl(var(--border))",
              }}
            >
              <img src={icon.url} alt={icon.name} className="w-10 h-10 object-contain" />
              {isSelected && (
                <div
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: BRAND_ORANGE }}
                >
                  <Check className="w-2.5 h-2.5" style={{ color: "white" }} />
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs col-span-full py-4 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
            No icons match "{query}"
          </p>
        )}
      </div>
    </div>
  );
};