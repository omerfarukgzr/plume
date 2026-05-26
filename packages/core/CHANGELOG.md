# @useplume/core

## 0.2.4

### Patch Changes

- 33e7cb1: Fix the footnote number showing twice when back-links are enabled. The clickable back-link number sits next to the list item's native marker, so the native marker must be hidden — but that rule used `:where()` (zero specificity) and lost to a host app's own `ol { list-style: … }` (e.g. a docs framework's `.content ol { list-style: decimal }`), re-showing the native marker and doubling the number (`1. 1. …`). The hide-marker rule now uses real class specificity so it survives host list styles.
- 33e7cb1: Fix footnote navigation jumping/yanking the page, in both directions.

  Two issues, both surfacing when the editor sits inside a scrollable page (e.g. a height-capped container):
  - **Marker → footnote (forward):** the marker rendered a native `<a href="#fn:N">` whose fragment jump fires even when the click is `preventDefault`-ed inside a contenteditable, so the page snapped to the footnote before the smooth scroll ran. The marker no longer renders an `href` (it stays a clickable `a.footnote-ref` driven by the editor's own handler); the footnote item keeps its `id`, so deep links and no-JS readers still reach it.
  - **Both directions:** navigation used `scrollIntoView`, which scrolls _every_ scrollable ancestor — so it dragged the surrounding page along with the editor's own scroll area, and the two simultaneous animations read as a jump. Navigation now scrolls **only the editor's own scroll container** (when it has one), leaving the page still; a full-page editor with no inner scroll area falls back to scrolling the page. Focus is taken with `preventScroll` so nothing else moves.

  Footnote navigation now scrolls smoothly to the target in both directions with no page jump.

## 0.2.3

### Patch Changes

- optional font value (derive family from label) + unified blockquote styling

## 0.2.2

### Patch Changes

- Blockquote toolbar button now uses a double-quotation-mark icon (two quote marks)
  instead of the indented-lines glyph, so the "quote" action reads more clearly.
  Rendered blockquotes show the same quote mark on the left in place of the plain
  bar (custom blockquote variants keep their colored bar).

## 0.2.1

### Patch Changes

- Edge-to-edge content by default. `--plume-content-max-width` now defaults to
  `none` and `--plume-content-padding` to `0.75rem 1rem`, so text fills the editor
  and sits close to the edges out of the box. Opt into the old centered reading
  column by setting `--plume-content-max-width: 680px` (and roomier padding); the
  `fluid` prop now only forces edge-to-edge when an ancestor sets a column.

  Docs: explicit `@tiptap/core@^3` / `@tiptap/pm@^3` install step, a "Already using
  tiptap v2?" guide with a `.pnpmfile.cjs` isolation recipe, and `v-model`/`output`
  examples on the docs site.

## 0.2.0

### Minor Changes

- d05f869: Add an optional paste manager. Enable it with `pasteManager` to intercept paste and let users choose between pasting plain text or keeping the source formatting through a modal. The core ships the `PasteManager` extension and a shared `insertPaste(editor, data, mode)` helper; the React and Vue `<PlumeEditor>` render the chooser automatically (closes on Esc, backdrop click, or choice; labels follow `locale`).
- 2f0a390: Improve embedding and dependency hygiene:
  - **tiptap is now a peer dependency.** `@tiptap/core` and `@tiptap/pm` moved from `dependencies` to `peerDependencies` across all packages, so your app and Plume share a single tiptap instance — no duplicate copies, no bundle bloat, and no v2/v3 conflicts. Most package managers install peers automatically.
  - **Vue: `v-model:content` support.** The `content` prop is now reactive (covers async/late-loaded data without remounting), and `<PlumeEditor>` emits `update:content`. A new `output` prop (`'html'` | `'json'`, default `'html'`) selects the emitted format. Emissions are debounced by `updateDelay`.
  - **`fluid` prop + `--plume-content-padding`.** Pass `fluid` (React & Vue) — or add the `plume--fluid` class — for an edge-to-edge editor that fills its container instead of the centered article column (form/admin layouts). Padding is now driven by the new `--plume-content-padding` variable.

## 0.1.0

### Minor Changes

- Initial public release of Plume — a customizable, framework-agnostic rich text editor built on tiptap, with React and Vue 3 adapters.
