---
'@useplume/core': patch
---

Fix the footnote number showing twice when back-links are enabled. The clickable back-link number sits next to the list item's native marker, so the native marker must be hidden — but that rule used `:where()` (zero specificity) and lost to a host app's own `ol { list-style: … }` (e.g. a docs framework's `.content ol { list-style: decimal }`), re-showing the native marker and doubling the number (`1. 1. …`). The hide-marker rule now uses real class specificity so it survives host list styles.
