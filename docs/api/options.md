# PlumeOptions

Every adapter accepts the same options, exposed as props on `<PlumeEditor>` and as the
argument to `usePlumeEditor`. The type is exported from `@useplume/core` as `PlumeOptions`.

## Content & behaviour

| Option              | Type                                            | Default | Description                                                              |
| ------------------- | ----------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `content`           | `string \| object \| null`                      | `''`    | Initial content as an HTML string or a tiptap JSON document.             |
| `editable`          | `boolean`                                       | `true`  | Whether the document can be edited.                                      |
| `placeholder`       | `string`                                        | —       | Placeholder shown while the document is empty.                           |
| `autofocus`         | `boolean \| 'start' \| 'end' \| number`         | `false` | Autofocus behaviour on mount.                                            |
| `editorClass`       | `string`                                        | —       | Extra class name(s) added to the editable content element.              |
| `immediatelyRender` | `boolean`                                       | `true`  | Render synchronously on first paint. Set `false` for SSR.                |

## Toolbar

| Option         | Type                          | Default   | Description                                                       |
| -------------- | ----------------------------- | --------- | ----------------------------------------------------------------- |
| `toolbar`      | `ToolbarConfig` (`string[] \| false`) | default set | Ordered list of item names, or `false` to hide the toolbar. |
| `toolbarItems` | `ToolbarItem[]`               | —         | Custom controls / overrides, referenced by `name` in `toolbar`.   |

See [Toolbar items](/api/toolbar) for the built-in names.

## Extensions

| Option              | Type         | Default | Description                                            |
| ------------------- | ------------ | ------- | ------------------------------------------------------ |
| `extensions`        | `Extensions` | `[]`    | Additional tiptap extensions appended after defaults.  |
| `defaultExtensions` | `boolean`    | `true`  | Include Plume's default extension set.                 |

## Features

| Option           | Type                                     | Default | Description                                                  |
| ---------------- | ---------------------------------------- | ------- | ------------------------------------------------------------ |
| `fonts`          | `FontOption[]`                           | —       | Fonts offered by the font-family dropdown.                   |
| `colors`         | `string[]`                               | —       | Hex colors offered by the text-color dropdown.               |
| `locale`         | `string`                                 | `'tr'`  | BCP-47 locale for UI strings and case features.              |
| `autoCapitalize` | `boolean \| { locale?: string }`         | `false` | Enable automatic sentence capitalization.                    |
| `image`          | `boolean \| Partial<ResizableImageOptions>` | enabled | Configure the resizable image node, or `false` to omit it. |
| `footnote`       | `boolean \| FootnoteExtensionOptions`    | enabled | Configure footnotes, or `false` to omit them.                |
| `blockquotes`    | `CustomBlockquoteSpec[]`                 | —       | Custom blockquote variants (callouts).                       |

## Change handling

| Option        | Type                        | Default | Description                                                                    |
| ------------- | --------------------------- | ------- | ------------------------------------------------------------------------------ |
| `onUpdate`    | `(editor: Editor) => void`  | —       | Called after the document changes (debounced by `updateDelay`).                |
| `updateDelay` | `number`                    | `300`   | Debounce in ms for `onUpdate`. `0` fires synchronously on every change.        |

::: tip
`onUpdate` receives the underlying tiptap `Editor`, so serialize with
`editor.getHTML()` or `editor.getJSON()`. The debounce matters because that
serialization is the dominant per-edit cost on large documents.
:::
