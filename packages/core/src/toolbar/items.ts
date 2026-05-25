import { icons } from './icons'
import type { Editor } from '@tiptap/core'
import type {
  FontOption,
  ToolbarBuildConfig,
  ToolbarConfig,
  ToolbarItem,
  ToolbarItemName,
  ToolbarMenuOption,
} from '../types'
import { resolveMessages, type PlumeMessages } from '../i18n'
import { insertImageFromFile, type ResizableImageOptions } from '../resizable-image'

function button(
  name: string,
  title: string,
  icon: string,
  run: (editor: Editor) => void,
  isActive?: (editor: Editor) => boolean,
  isDisabled?: (editor: Editor) => boolean,
): ToolbarItem {
  return { name, type: 'button', title, icon, run, isActive, isDisabled }
}

function dropdown(
  name: string,
  title: string,
  icon: string,
  variant: 'menu' | 'swatch' | 'select',
  options: ToolbarMenuOption[],
  isActive?: (editor: Editor) => boolean,
): ToolbarItem {
  return { name, type: 'dropdown', title, icon, variant, options, isActive }
}

/** CSS `font-family` stacks behind the built-in font options. */
const fontStacks = {
  sansSerif: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", serif',
  monospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

/** Built-in fonts with labels drawn from the given locale's messages. */
function localizedDefaultFonts(m: PlumeMessages): FontOption[] {
  return [
    { label: m.fonts.default, value: null },
    { label: m.fonts.sansSerif, value: fontStacks.sansSerif },
    { label: m.fonts.serif, value: fontStacks.serif },
    { label: m.fonts.monospace, value: fontStacks.monospace },
  ]
}

/** Fonts offered by the font-family dropdown when an app doesn't supply its own. */
export const defaultFonts: FontOption[] = localizedDefaultFonts(resolveMessages())

/** Color swatches offered by the text-color dropdown by default. */
export const defaultColors: string[] = [
  '#6E6A77',
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#FAF594',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
]

function fontFamilyItem(fonts: FontOption[], m: PlumeMessages): ToolbarItem {
  const options: ToolbarMenuOption[] = fonts.map((font) => ({
    label: font.label,
    value: font.value ?? undefined,
    run: (e) =>
      font.value
        ? e.chain().focus().setFontFamily(font.value).run()
        : e.chain().focus().unsetFontFamily().run(),
    isActive: font.value ? (e) => e.isActive('textStyle', { fontFamily: font.value }) : undefined,
  }))
  return dropdown('fontFamily', m.toolbar.fontFamily, icons.fontFamily, 'select', options, (e) =>
    fonts.some((f) => f.value != null && e.isActive('textStyle', { fontFamily: f.value })),
  )
}

function textColorItem(colors: string[], m: PlumeMessages): ToolbarItem {
  const options: ToolbarMenuOption[] = colors.map((color) => ({
    label: color,
    value: color,
    run: (e) => e.chain().focus().setColor(color).run(),
    isActive: (e) => e.isActive('textStyle', { color }),
  }))
  options.push({
    label: m.toolbar.removeColor,
    run: (e) => e.chain().focus().unsetColor().run(),
  })
  return dropdown('textColor', m.toolbar.textColor, icons.textColor, 'swatch', options, (e) =>
    colors.some((color) => e.isActive('textStyle', { color })),
  )
}

function changeCaseItem(m: PlumeMessages): ToolbarItem {
  const cases: { label: string; type: 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle' }[] =
    [
      { label: m.cases.sentence, type: 'sentence' },
      { label: m.cases.lower, type: 'lower' },
      { label: m.cases.upper, type: 'upper' },
      { label: m.cases.capitalize, type: 'capitalize' },
      { label: m.cases.toggle, type: 'toggle' },
    ]
  const options: ToolbarMenuOption[] = cases.map((c) => ({
    label: c.label,
    run: (e) => e.chain().focus().setChangeCase(c.type).run(),
  }))
  return dropdown('changeCase', m.toolbar.changeCase, icons.changeCase, 'menu', options)
}

function imageItem(m: PlumeMessages): ToolbarItem {
  return button('image', m.toolbar.image, icons.image, (e) => {
    if (typeof document === 'undefined') return
    const ext = e.extensionManager.extensions.find((x) => x.name === 'image')
    const accept = (ext?.options as Partial<ResizableImageOptions> | undefined)?.accept ?? 'image/*'

    // Always open a file picker. With no `uploadHandler` the file is embedded
    // as base64 (zero-config default); otherwise it is uploaded. Both go
    // through the shared pipeline (validation + optimistic placeholder).
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (file) insertImageFromFile(e, file)
    })
    input.click()
  })
}

/**
 * Builds the registry of built-in toolbar controls. The font/color/case
 * dropdowns are derived from {@link ToolbarBuildConfig}; everything else is
 * static. Adapters call this (via {@link resolveToolbarItems}) with the app's
 * fonts, colors and locale.
 */
export function createToolbarItems(config: ToolbarBuildConfig = {}): Record<string, ToolbarItem> {
  const m = resolveMessages(config.locale)
  const fonts = config.fonts ?? localizedDefaultFonts(m)
  const colors = config.colors ?? defaultColors

  const items: Record<string, ToolbarItem> = {
    bold: button(
      'bold',
      m.toolbar.bold,
      icons.bold,
      (e) => e.chain().focus().toggleBold().run(),
      (e) => e.isActive('bold'),
    ),
    italic: button(
      'italic',
      m.toolbar.italic,
      icons.italic,
      (e) => e.chain().focus().toggleItalic().run(),
      (e) => e.isActive('italic'),
    ),
    underline: button(
      'underline',
      m.toolbar.underline,
      icons.underline,
      (e) => e.chain().focus().toggleUnderline().run(),
      (e) => e.isActive('underline'),
    ),
    strike: button(
      'strike',
      m.toolbar.strike,
      icons.strike,
      (e) => e.chain().focus().toggleStrike().run(),
      (e) => e.isActive('strike'),
    ),
    code: button(
      'code',
      m.toolbar.code,
      icons.code,
      (e) => e.chain().focus().toggleCode().run(),
      (e) => e.isActive('code'),
    ),
    highlight: button(
      'highlight',
      m.toolbar.highlight,
      icons.highlight,
      (e) => e.chain().focus().toggleHighlight().run(),
      (e) => e.isActive('highlight'),
    ),
    fontFamily: fontFamilyItem(fonts, m),
    textColor: textColorItem(colors, m),
    changeCase: changeCaseItem(m),
    heading1: button(
      'heading1',
      m.toolbar.heading1,
      icons.heading1,
      (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      (e) => e.isActive('heading', { level: 1 }),
    ),
    heading2: button(
      'heading2',
      m.toolbar.heading2,
      icons.heading2,
      (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      (e) => e.isActive('heading', { level: 2 }),
    ),
    heading3: button(
      'heading3',
      m.toolbar.heading3,
      icons.heading3,
      (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      (e) => e.isActive('heading', { level: 3 }),
    ),
    bulletList: button(
      'bulletList',
      m.toolbar.bulletList,
      icons.bulletList,
      (e) => e.chain().focus().toggleBulletList().run(),
      (e) => e.isActive('bulletList'),
    ),
    orderedList: button(
      'orderedList',
      m.toolbar.orderedList,
      icons.orderedList,
      (e) => e.chain().focus().toggleOrderedList().run(),
      (e) => e.isActive('orderedList'),
    ),
    blockquote: button(
      'blockquote',
      m.toolbar.blockquote,
      icons.blockquote,
      (e) => e.chain().focus().toggleBlockquote().run(),
      (e) => e.isActive('blockquote'),
    ),
    codeBlock: button(
      'codeBlock',
      m.toolbar.codeBlock,
      icons.codeBlock,
      (e) => e.chain().focus().toggleCodeBlock().run(),
      (e) => e.isActive('codeBlock'),
    ),
    link: {
      name: 'link',
      type: 'link',
      title: m.toolbar.link,
      icon: icons.link,
      linkLabels: m.link,
      isActive: (e) => e.isActive('link'),
    },
    image: imageItem(m),
    footnote: button(
      'footnote',
      m.toolbar.footnote,
      icons.footnote,
      (e) => {
        // Snapshot existing markers so we can find the one we're about to add.
        const before = new Set<string>()
        e.state.doc.descendants((n) => {
          if (n.type.name === 'footnoteReference') before.add(n.attrs['data-id'] as string)
        })

        e.chain().focus().addFootnote().run()

        // Jump down to the freshly created footnote so the caret lands there and
        // the user can type its text right away (smooth scroll via focusFootnote).
        let newId: string | undefined
        e.state.doc.descendants((n) => {
          if (newId) return false
          if (n.type.name === 'footnoteReference' && !before.has(n.attrs['data-id'] as string)) {
            newId = n.attrs['data-id'] as string
          }
          return undefined
        })
        if (newId) e.commands.focusFootnote(newId)
      },
      (e) => e.isActive('footnoteReference'),
    ),
    superscript: button(
      'superscript',
      m.toolbar.superscript,
      icons.superscript,
      (e) => e.chain().focus().toggleSuperscript().run(),
      (e) => e.isActive('superscript'),
    ),
    subscript: button(
      'subscript',
      m.toolbar.subscript,
      icons.subscript,
      (e) => e.chain().focus().toggleSubscript().run(),
      (e) => e.isActive('subscript'),
    ),
    alignLeft: button(
      'alignLeft',
      m.toolbar.alignLeft,
      icons.alignLeft,
      (e) => e.chain().focus().setTextAlign('left').run(),
      (e) => e.isActive({ textAlign: 'left' }),
    ),
    alignCenter: button(
      'alignCenter',
      m.toolbar.alignCenter,
      icons.alignCenter,
      (e) => e.chain().focus().setTextAlign('center').run(),
      (e) => e.isActive({ textAlign: 'center' }),
    ),
    alignRight: button(
      'alignRight',
      m.toolbar.alignRight,
      icons.alignRight,
      (e) => e.chain().focus().setTextAlign('right').run(),
      (e) => e.isActive({ textAlign: 'right' }),
    ),
    alignJustify: button(
      'alignJustify',
      m.toolbar.alignJustify,
      icons.alignJustify,
      (e) => e.chain().focus().setTextAlign('justify').run(),
      (e) => e.isActive({ textAlign: 'justify' }),
    ),
    horizontalRule: button('horizontalRule', m.toolbar.horizontalRule, icons.horizontalRule, (e) =>
      e.chain().focus().setHorizontalRule().run(),
    ),
    undo: button(
      'undo',
      m.toolbar.undo,
      icons.undo,
      (e) => e.chain().focus().undo().run(),
      undefined,
      (e) => !e.can().undo(),
    ),
    redo: button(
      'redo',
      m.toolbar.redo,
      icons.redo,
      (e) => e.chain().focus().redo().run(),
      undefined,
      (e) => !e.can().redo(),
    ),
  }

  // App-defined blockquote variants: one toggle button each, keyed by name so
  // the toolbar layout can reference them like any built-in control.
  for (const spec of config.blockquotes ?? []) {
    items[spec.name] = button(
      spec.name,
      spec.label,
      spec.icon ?? icons.quote,
      (e) => e.chain().focus().toggleCustomBlockquote(spec.name).run(),
      (e) => e.isActive(spec.name),
    )
  }

  return items
}

/** Registry of built-in toolbar controls, using the default fonts/colors. */
export const defaultToolbarItems: Record<string, ToolbarItem> = createToolbarItems()

/**
 * The toolbar layout used when no `toolbar` option is provided. Ordered to
 * mirror a familiar word-processor flow: font first, then inline marks, text
 * alignment, block/list formatting, inserts, and finally undo/redo.
 */
export const defaultToolbar: ToolbarItemName[] = [
  'fontFamily',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'changeCase',
  'textColor',
  'highlight',
  'code',
  '|',
  'alignLeft',
  'alignCenter',
  'alignRight',
  'alignJustify',
  '|',
  'heading1',
  'heading2',
  'heading3',
  'orderedList',
  'bulletList',
  '|',
  'blockquote',
  'codeBlock',
  '|',
  'link',
  'image',
  'footnote',
  'superscript',
  'subscript',
  'horizontalRule',
  '|',
  'undo',
  'redo',
]

/**
 * Resolves a {@link ToolbarConfig} into a flat list of {@link ToolbarItem}s,
 * inserting separators and skipping (with a warning) any unknown item names.
 * Pass {@link ToolbarBuildConfig} to feed fonts/colors/locale into the
 * font, color and case dropdowns.
 */
export function resolveToolbarItems(
  config: ToolbarConfig = defaultToolbar,
  build: ToolbarBuildConfig = {},
): ToolbarItem[] {
  if (config === false) return []

  const base =
    build.fonts || build.colors || build.locale || build.blockquotes?.length
      ? createToolbarItems(build)
      : defaultToolbarItems

  // Merge app-provided controls (custom buttons or built-in overrides) on top,
  // keyed by name. Spread into a fresh object so the shared default registry is
  // never mutated.
  const registry = build.items?.length
    ? { ...base, ...Object.fromEntries(build.items.map((item) => [item.name, item])) }
    : base

  const items: ToolbarItem[] = []
  config.forEach((name, index) => {
    if (name === '|') {
      items.push({ name: `sep-${index}`, type: 'separator' })
      return
    }
    const item = registry[name]
    if (!item) {
      if (typeof console !== 'undefined') {
        console.warn(`[plume] unknown toolbar item: "${name}"`)
      }
      return
    }
    items.push(item)
  })
  return items
}
