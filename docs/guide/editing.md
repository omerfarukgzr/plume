---
description: 'What content authors can do inside the Plume editor: formatting, keyboard shortcuts, images, footnotes, callouts, links and paste behaviour.'
---

# Editing (for content authors)

This page is for the people **writing** in the editor, not the developers
embedding it. Everything here is available with Plume's default configuration —
your app's developer may have hidden some controls (see
[Customization](/guide/customization)).

## The writing surface

The editor is a single document area with a toolbar on top. Click anywhere to
place the cursor and start typing. Selecting text shows its active formatting in
the toolbar (e.g. the **Bold** button lights up inside bold text).

## Keyboard shortcuts

These are the default shortcuts. On macOS use <kbd>⌘</kbd> where the table says
<kbd>Ctrl</kbd>.

| Action                          | Windows / Linux                                                              | macOS                                            |
| ------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| Bold                            | <kbd>Ctrl</kbd> <kbd>B</kbd>                                                 | <kbd>⌘</kbd> <kbd>B</kbd>                        |
| Italic                          | <kbd>Ctrl</kbd> <kbd>I</kbd>                                                 | <kbd>⌘</kbd> <kbd>I</kbd>                        |
| Underline                       | <kbd>Ctrl</kbd> <kbd>U</kbd>                                                 | <kbd>⌘</kbd> <kbd>U</kbd>                        |
| Strikethrough                   | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>S</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>S</kbd>       |
| Inline code                     | <kbd>Ctrl</kbd> <kbd>E</kbd>                                                 | <kbd>⌘</kbd> <kbd>E</kbd>                        |
| Highlight                       | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>H</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>H</kbd>       |
| Heading 1 / 2 / 3               | <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>1/2/3</kbd>                              | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>1/2/3</kbd>       |
| Bullet list                     | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>8</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>8</kbd>       |
| Numbered list                   | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>7</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>7</kbd>       |
| Blockquote                      | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>B</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>B</kbd>       |
| Code block                      | <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>C</kbd>                                  | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>C</kbd>           |
| Superscript                     | <kbd>Ctrl</kbd> <kbd>.</kbd>                                                 | <kbd>⌘</kbd> <kbd>.</kbd>                        |
| Subscript                       | <kbd>Ctrl</kbd> <kbd>,</kbd>                                                 | <kbd>⌘</kbd> <kbd>,</kbd>                        |
| Align left/center/right/justify | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>L/E/R/J</kbd>                          | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>L/E/R/J</kbd> |
| Undo                            | <kbd>Ctrl</kbd> <kbd>Z</kbd>                                                 | <kbd>⌘</kbd> <kbd>Z</kbd>                        |
| Redo                            | <kbd>Ctrl</kbd> <kbd>Y</kbd> / <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd> | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>Z</kbd>       |

::: tip
The shortcuts above come from tiptap/ProseMirror. Buttons hidden from the
toolbar still respond to their shortcut, because the underlying command is part
of the editor regardless of whether the button is shown.
:::

## Markdown-style input rules

You can produce structure by typing, without reaching for the toolbar:

| Type this…              | …to get            |
| ----------------------- | ------------------ |
| `# ` (then space)       | Heading 1          |
| `## ` / `### `          | Heading 2 / 3      |
| `- ` or `* `            | Bullet list        |
| `1. `                   | Numbered list      |
| `> `                    | Blockquote         |
| ` ``` `                 | Code block         |
| `---`                   | Horizontal divider |
| `**bold**` / `*italic*` | Bold / italic      |
| `` `code` ``            | Inline code        |

## Toolbar controls

| Control                                | What it does                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| **Bold / Italic / Underline / Strike** | Toggle the inline mark on the selection.                                        |
| **Inline code**                        | Mark the selection as `monospace code`.                                         |
| **Highlight**                          | Apply a highlight (marker) background.                                          |
| **Heading 1 / 2 / 3**                  | Turn the current block into a heading.                                          |
| **Bullet / Numbered list**             | Wrap the selected lines in a list. Press <kbd>Tab</kbd> to nest.                |
| **Blockquote**                         | Indent the block as a quote.                                                    |
| **Code block**                         | A fenced, monospaced block for code.                                            |
| **Divider**                            | Insert a horizontal rule between blocks.                                        |
| **Superscript / Subscript**            | Raise or lower the selected text (e.g. `x²`, `H₂O`).                            |
| **Font**                               | Pick a font family for the selection from a dropdown.                           |
| **Text color**                         | Pick a swatch for the selection; the last entry clears the color.               |
| **Change case**                        | Rewrite the selection: Sentence case, lowercase, UPPERCASE, Capitalize, tOGGLE. |
| **Align left/center/right/justify**    | Set the alignment of headings and paragraphs.                                   |
| **Link**                               | Open a popover to add or edit a link (see below).                               |
| **Image**                              | Pick an image file to insert (see below).                                       |
| **Footnote**                           | Insert a numbered footnote at the cursor (see below).                           |
| **Undo / Redo**                        | Step through the edit history.                                                  |

Which of these appear, and in what order, is up to the developer who configured
the editor. Dropdowns (Font, Text color) and custom callout buttons only show up
when the app provides their options.

## Links

Click **Link** (or select text first to link it) to open the popover. Paste or
type a URL; if you had nothing selected, a second field lets you type the visible
text. Plume normalizes the URL (a bare `example.com` becomes `https://example.com`).
Click an existing link to edit it, or use **Remove** in the popover to unlink.

Links don't open on click _inside the editor_ (so you can edit them) — they open
normally once the content is published.

## Images

Three ways to add an image, all going through the same pipeline:

1. **Toolbar** — click **Image** and pick a file.
2. **Paste** — paste an image from the clipboard.
3. **Drag & drop** — drop an image file onto the editor.

Once inserted, select the image to:

- **Resize** — drag the corner handle. There's a minimum width so it never
  collapses.
- **Align** — left, center or right, from the selection bubble menu.
- **Caption** — add a caption that's edited inline, right under the image.
- **Delete** — remove it from the bubble menu (or select and press
  <kbd>Backspace</kbd>).

Large images may take a moment to upload; a placeholder shows in the meantime,
then swaps to the final image.

## Footnotes

Place the cursor where the reference should appear and click **Footnote**. Plume
inserts a numbered marker and creates (or focuses) the matching entry in a
footnotes section at the bottom of the document. Type the note's text there.

- Numbering is automatic and reorders itself as you add or remove footnotes.
- Click a marker to jump to its note; click a note's number to jump back to the
  marker.

## Callouts (custom blockquotes)

If the developer enabled custom blockquote variants, you'll see extra
quote-style buttons (for example **Note** or **Warning**). They wrap the current
block in a colored callout. Quotes don't nest — toggling one while inside another
does nothing, so callouts stay clean.

## Pasting content

By default, pasting keeps the formatting that survives the editor's schema
(bold, links, lists…) and drops the rest.

If the app turned on the **paste manager**, every paste first asks how you want
it inserted:

- **Plain text** — strips all formatting, inserts the text only.
- **Keep formatting** — preserves the source styling.

Dismiss the dialog with <kbd>Esc</kbd>, a click outside it, or by choosing an
option.

## Next

Developers configuring what authors can do should head to
[Customization](/guide/customization) and the [PlumeOptions](/api/options)
reference.
