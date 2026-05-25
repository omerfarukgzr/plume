# Toolbar items

The `toolbar` option takes an ordered list of item names. Below are the built-in
`ToolbarItemName`s. Any other string is also accepted, so you can reference custom
controls (registered via `toolbarItems`) or custom blockquote variants by name.

## Built-in names

| Category    | Names                                                            |
| ----------- | ---------------------------------------------------------------- |
| Marks       | `bold`, `italic`, `underline`, `strike`, `code`, `highlight`     |
| Headings    | `heading1`, `heading2`, `heading3`                               |
| Blocks      | `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `horizontalRule` |
| Insert      | `link`, `image`, `footnote`                                      |
| Script      | `superscript`, `subscript`                                       |
| Dropdowns   | `fontFamily`, `textColor`, `changeCase`                          |
| Alignment   | `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`         |
| History     | `undo`, `redo`                                                   |
| Separator   | `'|'`                                                            |

## Example

```tsx
<PlumeEditor
  toolbar={[
    'bold', 'italic', 'underline', '|',
    'heading1', 'heading2', '|',
    'bulletList', 'orderedList', '|',
    'link', 'image', '|',
    'undo', 'redo',
  ]}
/>
```

## Resolving items programmatically

`@plume/core` exposes the helpers the adapters use, in case you build a fully custom
toolbar UI:

- `defaultToolbar` — the default ordered list of names.
- `resolveToolbarItems(toolbar, config)` — turns a `ToolbarConfig` into resolved
  `ToolbarItem[]` (buttons, separators, dropdowns, the link popover).
- `defaultToolbarItems`, `createToolbarItems`, `defaultFonts`, `defaultColors`.

```ts
import { resolveToolbarItems } from '@plume/core'

const items = resolveToolbarItems(['bold', 'italic', '|', 'link'], { locale: 'en' })
```
