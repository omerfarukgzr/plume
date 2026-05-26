# @useplume/core

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
