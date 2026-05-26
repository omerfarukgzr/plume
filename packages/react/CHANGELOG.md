# @useplume/react

## 0.2.3

### Patch Changes

- optional font value (derive family from label) + unified blockquote styling
- Updated dependencies
  - @useplume/core@0.2.3

## 0.2.2

### Patch Changes

- Blockquote toolbar button now uses a double-quotation-mark icon (two quote marks)
  instead of the indented-lines glyph, so the "quote" action reads more clearly.
- Updated dependencies
  - @useplume/core@0.2.2

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

- Updated dependencies
  - @useplume/core@0.2.1

## 0.2.0

### Minor Changes

- d05f869: Add an optional paste manager. Enable it with `pasteManager` to intercept paste and let users choose between pasting plain text or keeping the source formatting through a modal. The core ships the `PasteManager` extension and a shared `insertPaste(editor, data, mode)` helper; the React and Vue `<PlumeEditor>` render the chooser automatically (closes on Esc, backdrop click, or choice; labels follow `locale`).
- 2f0a390: Improve embedding and dependency hygiene:
  - **tiptap is now a peer dependency.** `@tiptap/core` and `@tiptap/pm` moved from `dependencies` to `peerDependencies` across all packages, so your app and Plume share a single tiptap instance — no duplicate copies, no bundle bloat, and no v2/v3 conflicts. Most package managers install peers automatically.
  - **Vue: `v-model:content` support.** The `content` prop is now reactive (covers async/late-loaded data without remounting), and `<PlumeEditor>` emits `update:content`. A new `output` prop (`'html'` | `'json'`, default `'html'`) selects the emitted format. Emissions are debounced by `updateDelay`.
  - **`fluid` prop + `--plume-content-padding`.** Pass `fluid` (React & Vue) — or add the `plume--fluid` class — for an edge-to-edge editor that fills its container instead of the centered article column (form/admin layouts). Padding is now driven by the new `--plume-content-padding` variable.

### Patch Changes

- Updated dependencies [d05f869]
- Updated dependencies [2f0a390]
  - @useplume/core@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of Plume — a customizable, framework-agnostic rich text editor built on tiptap, with React and Vue 3 adapters.

### Patch Changes

- Updated dependencies
  - @useplume/core@0.1.0
