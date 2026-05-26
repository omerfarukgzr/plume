---
description: 'Try Plume live in the browser — switch toolbar presets, themes, brand colors, fonts and language, and watch the matching config update as you go.'
aside: false
outline: false
---

# Live demo

This is the real `@useplume/vue` editor — not a screenshot. Type in it, drag the
image handle, then use the controls to reshape the toolbar, flip the theme, pick
a brand color and font, or switch the UI language. It's a single component with
a few props — the section below shows which ones.

<ClientOnly>
  <PlumeDemo />
</ClientOnly>

## How this maps to props

Everything above is plain `<PlumeEditor>` configuration:

- **Toolbar** — the preset buttons just swap the `toolbar` array. Pass any
  ordered list of [item names](/api/toolbar), use `'|'` for a separator, or
  `toolbar={false}` to hide it entirely.
- **Brand color & font** — `--plume-*` CSS variables on the `.plume` root. No
  JS, no rebuild; see [Theming](/guide/theming) for the full token list.
- **Dark theme** — set `data-theme="dark"` on any ancestor. That's the whole
  toggle.
- **Language** — the `locale` prop (`"en"` or `"tr"`) localizes every label,
  tooltip and dialog.

Want more? Add your own [toolbar buttons](/examples#a-custom-toolbar-button),
[callout blockquotes](/examples#callouts-custom-blockquotes), or any
[third-party tiptap extension](/examples#mentions-third-party-tiptap-extension) —
each is a single prop. Start at [Getting started](/guide/getting-started).
