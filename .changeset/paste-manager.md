---
'@useplume/core': minor
'@useplume/react': minor
'@useplume/vue': minor
---

Add an optional paste manager. Enable it with `pasteManager` to intercept paste and let users choose between pasting plain text or keeping the source formatting through a modal. The core ships the `PasteManager` extension and a shared `insertPaste(editor, data, mode)` helper; the React and Vue `<PlumeEditor>` render the chooser automatically (closes on Esc, backdrop click, or choice; labels follow `locale`).
