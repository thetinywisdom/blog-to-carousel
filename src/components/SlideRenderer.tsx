import { forwardRef } from "react";
import { SlideChunk } from "@/types/article";

interface SlideCanvasProps {
  chunk: SlideChunk;
  isTitle: boolean;
  isFinal: boolean;
  articleTitle: string;
  totalSlides: number;
  titleImageDataUrl?: string | null;
}

const BRAND_BG = "#EFEEEA";
const BRAND_ORANGE = "#ed612b";
const BRAND_DARK = "#1a1a1a";
const FONT_SERIF = "'DM Serif Display', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ chunk, isTitle, isFinal, articleTitle, totalSlides, titleImageDataUrl }, ref) => {

    if (isTitle) {
      const hasImage = !!titleImageDataUrl;

      return (
        <div
          ref={ref}
          style={{
            width: "1080px",
            height: "1350px",
            background: BRAND_BG,
            display: "flex",
            flexDirection: "column",
            padding: "90px 100px",
            boxSizing: "border-box",
            position: "relative",
            fontFamily: FONT_SANS,
            overflow: "hidden",
          }}
        >
          {/* Left orange rule */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "6px",
            background: BRAND_ORANGE,
            zIndex: 2,
          }} />

          {/* Brand tag — top */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: BRAND_ORANGE,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: FONT_SERIF,
              fontSize: "28px",
              color: BRAND_DARK,
              letterSpacing: "0.01em",
            }}>
              The Tiny Wisdom
            </span>
          </div>

          {/* Center area: image + title */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "48px" }}>
            {hasImage && (
              <img
                src={titleImageDataUrl!}
                style={{
                  maxWidth: "320px",
                  height: "320px",
                  width: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
                crossOrigin="anonymous"
              />
            )}
            <h1 style={{
              fontFamily: FONT_SERIF,
              fontSize: chunk.text.length > 70 ? "64px" : chunk.text.length > 50 ? "76px" : "88px",
              color: BRAND_DARK,
              lineHeight: 1.1,
              margin: 0,
              fontWeight: 400,
              fontStyle: "italic",
              textAlign: "center",
            }}>
              {chunk.text}
            </h1>
          </div>

          {/* Bottom row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: "22px",
              color: "rgba(26,26,26,0.35)",
              letterSpacing: "0.08em",
              fontFamily: FONT_SANS,
            }}>
              thetinywisdom.com
            </span>
            <span style={{
              fontSize: "22px",
              color: "rgba(26,26,26,0.35)",
              fontFamily: FONT_SANS,
            }}>
              1 / {totalSlides}
            </span>
          </div>
        </div>
      );
    }

    if (isFinal) {
      const finalLines = chunk.text.split('\n\n').filter(Boolean);
      const isFinalLong = chunk.text.length > 280;

      return (
        <div
          ref={ref}
          style={{
            width: "1080px",
            height: "1350px",
            background: BRAND_DARK,
            display: "flex",
            flexDirection: "column",
            padding: "90px 100px",
            boxSizing: "border-box",
            position: "relative",
            fontFamily: FONT_SANS,
          }}
        >
          {/* Orange left rule */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, bottom: 0,
            width: "6px",
            background: BRAND_ORANGE,
          }} />

          {/* Top brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: BRAND_ORANGE, flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_SERIF, fontSize: "26px", color: BRAND_BG, letterSpacing: "0.01em" }}>
              The Tiny Wisdom
            </span>
            <div style={{ marginLeft: "auto", fontSize: "20px", color: BRAND_BG, opacity: 0.3, fontFamily: FONT_SERIF, fontStyle: "italic", maxWidth: "500px", textAlign: "right", lineHeight: 1.2 }}>
              {articleTitle}
            </div>
          </div>

          {/* Main editable content — centered */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div>
              {finalLines.map((line, i) => (
                <p key={i} style={{
                  fontFamily: FONT_SERIF,
                  fontSize: isFinalLong ? "46px" : "54px",
                  lineHeight: 1.45,
                  color: BRAND_BG,
                  margin: 0,
                  marginBottom: i < finalLines.length - 1 ? "36px" : 0,
                  fontWeight: 400,
                }}>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Fixed footer — hardcoded, not editable */}
          <div style={{
            borderTop: `1px solid rgba(239,238,234,0.1)`,
            paddingTop: "32px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "24px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{
                fontFamily: FONT_SERIF,
                fontSize: "28px",
                color: BRAND_BG,
                lineHeight: 1.4,
                margin: 0,
                fontStyle: "italic",
                fontWeight: 400,
                opacity: 0.7,
              }}>
                It's not going to be easy.<br />
                But it's not impossible.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "20px", color: BRAND_BG, fontFamily: FONT_SERIF, opacity: 0.4 }}>
                  The Tiny Wisdom
                </span>
                <span style={{ fontSize: "16px", color: BRAND_BG, opacity: 0.2 }}>·</span>
                <span style={{ fontSize: "18px", color: BRAND_BG, opacity: 0.3, letterSpacing: "0.06em", fontFamily: FONT_SANS }}>
                  www.thetinywisdom.com
                </span>
              </div>
            </div>
            {titleImageDataUrl && (
              <img
                src={titleImageDataUrl}
                style={{
                  maxWidth: "140px",
                  height: "140px",
                  width: "auto",
                  objectFit: "contain",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
      );
    }

    // Body slide
    const lines = chunk.text.split('\n\n').filter(Boolean);
    const isLong = chunk.text.length > 280;

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1350px",
          background: BRAND_BG,
          display: "flex",
          flexDirection: "column",
          padding: "90px 100px",
          boxSizing: "border-box",
          position: "relative",
          fontFamily: FONT_SANS,
        }}
      >
        {/* Left orange rule */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0,
          width: "6px",
          background: BRAND_ORANGE,
        }} />

        {/* Top row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: BRAND_ORANGE, flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_SERIF, fontSize: "26px", color: BRAND_DARK, letterSpacing: "0.01em" }}>
              The Tiny Wisdom
            </span>
          </div>
          <span style={{ fontSize: "20px", color: BRAND_DARK, opacity: 0.3, fontFamily: FONT_SERIF, fontStyle: "italic", maxWidth: "500px", textAlign: "right", lineHeight: 1.2 }}>
            {articleTitle}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div>
            {lines.map((line, i) => (
              <p key={i} style={{
                fontFamily: FONT_SERIF,
                fontSize: isLong ? "46px" : "54px",
                lineHeight: 1.45,
                color: BRAND_DARK,
                margin: 0,
                marginBottom: i < lines.length - 1 ? "36px" : 0,
                fontWeight: 400,
              }}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontSize: "22px",
            color: "rgba(26,26,26,0.35)",
            letterSpacing: "0.08em",
            fontFamily: FONT_SANS,
          }}>
            thetinywisdom.com
          </span>
          <span style={{ fontSize: "22px", color: BRAND_DARK, opacity: 0.3 }}>
            {chunk.index + 1} / {totalSlides}
          </span>
        </div>
      </div>
    );
  }
);

SlideCanvas.displayName = "SlideCanvas";
