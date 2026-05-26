# @useplume/vue

## 1.0.0

### Minor Changes

- d05f869: Add an optional paste manager. Enable it with `pasteManager` to intercept paste and let users choose between pasting plain text or keeping the source formatting through a modal. The core ships the `PasteManager` extension and a shared `insertPaste(editor, data, mode)` helper; the React and Vue `<PlumeEditor>` render the chooser automatically (closes on Esc, backdrop click, or choice; labels follow `locale`).

### Patch Changes

- Updated dependencies [d05f869]
  - @useplume/core@1.0.0

## 0.1.0

### Minor Changes

- Initial public release of Plume — a customizable, framework-agnostic rich text editor built on tiptap, with React and Vue 3 adapters.

### Patch Changes

- Updated dependencies
  - @useplume/core@0.1.0
