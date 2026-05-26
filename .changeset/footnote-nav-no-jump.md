---
'@useplume/core': patch
---

Fix footnote navigation jumping/yanking the page, in both directions.

Two issues, both surfacing when the editor sits inside a scrollable page (e.g. a height-capped container):

- **Marker → footnote (forward):** the marker rendered a native `<a href="#fn:N">` whose fragment jump fires even when the click is `preventDefault`-ed inside a contenteditable, so the page snapped to the footnote before the smooth scroll ran. The marker no longer renders an `href` (it stays a clickable `a.footnote-ref` driven by the editor's own handler); the footnote item keeps its `id`, so deep links and no-JS readers still reach it.
- **Both directions:** navigation used `scrollIntoView`, which scrolls *every* scrollable ancestor — so it dragged the surrounding page along with the editor's own scroll area, and the two simultaneous animations read as a jump. Navigation now scrolls **only the editor's own scroll container** (when it has one), leaving the page still; a full-page editor with no inner scroll area falls back to scrolling the page. Focus is taken with `preventScroll` so nothing else moves.

Footnote navigation now scrolls smoothly to the target in both directions with no page jump.
