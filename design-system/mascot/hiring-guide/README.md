# Hiring Guide mascot frames

This is a design-stage library of 68 transparent PNG frames extracted from the 17 supplied four-frame sheets. It is organized by pose or activity, not by upload date. Nothing here is loaded by the public portfolio yet.

- `frames/<sequence>/frame-01.png` through `frame-04.png` keep the original 2 × 2 reading order. Every frame has the same 627 × 627 canvas, so a future animation can swap sources without layout shifts.
- `manifest.json` maps each sequence to its original source sheet, records file checksums, and flags source-limited frames.
- Retained artwork keeps the source RGB pixels. The gray checkerboard in most sheets was baked into the PNG rather than transparent, so extraction replaced it with alpha. The `idle` poster also needed its headings, borders, and pale backdrop removed. No frame was redrawn or resized.
- The files are prepared for visual selection and motion planning. A final idle/open/loading/answer mapping, timing, reduced-motion behavior, and live placement still need design review.

Inspect the contact sheets on both light and dark backgrounds before choosing animation frames. The few `source_limit` notes in the manifest identify generated art that touched a quadrant boundary; they should be checked at the intended display size.
