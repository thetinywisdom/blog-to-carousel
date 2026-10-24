## Problem

The selected cover icon shows correctly in the editor preview but is missing from the exported PNG slides (title slide and final slide).

## Root cause

In `src/components/ExportSection.tsx`, `renderAll()` runs inside a `useEffect` on mount and immediately loops through each hidden `SlideCanvas` calling `toPng(el)`. The `<img src={titleImageDataUrl}>` elements inside those canvases have not finished decoding yet on the first frame, so `html-to-image` snapshots the slide before the icon paints. The PNG is captured without the icon.

This affects all icons equally (it isn't a per-file issue), which matches what you're seeing now after the rename fix.

## Fix

Before the capture loop runs, wait until every `<img>` inside the hidden render container is fully loaded/decoded.

In `src/components/ExportSection.tsx`:

1. At the top of `renderAll()`, collect every `<img>` element inside the off-screen container (via the slide refs) and await all of them:
   ```ts
   const imgs = slideRefs.current
     .filter(Boolean)
     .flatMap((el) => Array.from(el!.querySelectorAll("img")));
   await Promise.all(
     imgs.map((img) =>
       img.complete && img.naturalWidth > 0
         ? Promise.resolve()
         : new Promise<void>((resolve) => {
             img.onload = () => resolve();
             img.onerror = () => resolve();
           })
     )
   );
   // Optional belt-and-braces: await img.decode() where available.
   ```
2. Then run the existing `for` loop that calls `toPng` per slide.

This guarantees the icon is painted into the DOM before `html-to-image` rasterizes each slide, so it appears in both the title slide and the final slide PNGs.

No other files need to change.
