---
description: 'Theme the Plume editor with --plume-* CSS custom properties, override the default look, or ship a fully unstyled editor.'
---

# Theming

Plume's appearance is driven entirely by CSS custom properties prefixed with
`--plume-*`. Import the stylesheet to get the default look, then override any variable
in your own CSS — or skip the stylesheet for a fully unstyled editor.

```ts
import '@useplume/core/styles.css'
```

## Overriding variables

Set `--plume-*` variables on any ancestor of the editor (or `:root`) to retheme it:

```css
.plume {
  --plume-color-primary: #7c3aed;
  --plume-color-text: #1f2937;
  --plume-radius: 8px;
  --plume-font: 'Inter', sans-serif;
}
```

Common variables include `--plume-color-bg`, `--plume-color-text`,
`--plume-color-primary`, `--plume-color-border`, `--plume-color-button`,
`--plume-radius`, `--plume-font`, `--plume-font-mono`, `--plume-font-size` and
`--plume-content-max-width`. See `styles.css` for the complete set.

## Dark mode

Plume ships a dark theme. Set `data-theme="dark"` on any ancestor of the editor to
enable it:

```html
<div data-theme="dark">
  <PlumeEditor />
</div>
```

## Unstyled mode

If you want to provide all the styling yourself, simply don't import
`@useplume/core/styles.css`. The editor still works; it just renders without Plume's
default theme, so you can style the `.plume*` class names from scratch.
