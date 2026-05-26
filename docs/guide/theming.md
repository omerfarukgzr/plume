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

### Variable reference

These are the variables most apps touch. See `styles.css` for the complete set
(tooltip, selection and code-block colors are in there too).

**Layout & type**

| Variable                    | Default                         | Controls                        |
| --------------------------- | ------------------------------- | ------------------------------- |
| `--plume-font`              | Inter, system-ui, …             | Editor UI + content font stack  |
| `--plume-font-mono`         | JetBrains Mono, ui-monospace, … | Code / code-block font          |
| `--plume-font-size`         | `1rem`                          | Base content font size          |
| `--plume-line-height`       | `1.7`                           | Content line height             |
| `--plume-content-max-width` | `none`                          | Max width of the writing column (`none` = full width) |
| `--plume-content-padding`   | `0.75rem 1rem`                  | Padding around the content      |
| `--plume-radius`            | `16px`                          | Editor frame corner radius      |
| `--plume-radius-sm`         | `8px`                           | Buttons, dropdowns, inputs      |
| `--plume-gap`               | `2px`                           | Spacing between toolbar buttons |

**Colors**

| Variable                        | Default   | Controls                           |
| ------------------------------- | --------- | ---------------------------------- |
| `--plume-color-bg`              | `#ffffff` | Editor background                  |
| `--plume-color-text`            | `#1a1a1a` | Body text                          |
| `--plume-color-muted`           | `#6b7280` | Captions, placeholders             |
| `--plume-color-border`          | `#e6e6e8` | Frame + separators                 |
| `--plume-color-primary`         | `#6c5ce7` | Focus rings, accents               |
| `--plume-color-toolbar-bg`      | `#ffffff` | Toolbar background                 |
| `--plume-color-button`          | `#5c5c66` | Toolbar icon color                 |
| `--plume-color-button-hover-bg` | `#f1f1f3` | Toolbar button hover background    |
| `--plume-color-button-hover`    | `#1a1a1a` | Toolbar icon color on hover        |
| `--plume-color-active-bg`       | `#eef0ff` | Active (toggled) button background |
| `--plume-color-active-text`     | `#5b4ddb` | Active button icon color           |
| `--plume-color-highlight-bg`    | `#fef3a3` | Highlight mark background          |

### Brand example

Retheme the whole editor by overriding a handful of variables on the `.plume`
root:

```css
.plume {
  --plume-color-primary: #e11d48;
  --plume-color-active-bg: #ffe4e6;
  --plume-color-active-text: #be123c;
  --plume-radius: 10px;
  --plume-font: 'Inter', system-ui, sans-serif;
}
```

## Content width & padding

By default the content is **edge-to-edge**: it fills its container
(`--plume-content-max-width: none`) with tight padding
(`--plume-content-padding: 0.75rem 1rem`), so the text sits close to the
editor's edges. That suits forms, admin panels and full-page editors. Adjust the
padding to taste:

```css
.plume {
  --plume-content-padding: 1.5rem 2rem; /* roomier */
  /* or per-side, like CSS shorthand: top right bottom left */
}
```

### Centered reading column

For a blog/document layout, give the content a max width — it's auto-centered
once a width is set — and add the generous article padding:

```css
.plume {
  --plume-content-max-width: 680px;
  --plume-content-padding: 3rem 1.5rem 6rem;
}
```

If an ancestor opts into a reading column like this but you want a specific
editor to stay full width, pass the **`fluid`** prop (or add the `plume--fluid`
class) to force edge-to-edge again:

::: code-group

```tsx [React]
<PlumeEditor fluid content="<p>Fills its container</p>" />
```

```vue [Vue]
<PlumeEditor fluid content="<p>Fills its container</p>" />
```

:::

## Dark mode

Plume ships a dark theme. Set `data-theme="dark"` on any ancestor of the editor to
enable it:

```html
<div data-theme="dark">
  <PlumeEditor />
</div>
```

Wiring this to a toggle button is a few lines — see the
[dark-mode toggle recipe](/examples#dark-mode-toggle).

## Unstyled mode

If you want to provide all the styling yourself, simply don't import
`@useplume/core/styles.css`. The editor still works; it just renders without Plume's
default theme, so you can style the `.plume*` class names from scratch.
