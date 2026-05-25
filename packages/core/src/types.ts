import type { Editor, Extensions } from '@tiptap/core'
import type { CustomBlockquoteSpec } from './custom-blockquote'
import type { FootnoteExtensionOptions } from './footnotes'
import type { ResizableImageOptions } from './resizable-image'

export type { Editor }

/**
 * Identifier for a built-in toolbar control, or `'|'` to insert a separator.
 */
export type ToolbarItemName =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'footnote'
  | 'highlight'
  | 'horizontalRule'
  | 'superscript'
  | 'subscript'
  | 'fontFamily'
  | 'textColor'
  | 'changeCase'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'undo'
  | 'redo'
  | '|'

/**
 * Toolbar layout: an ordered list of item names, or `false` to hide the
 * toolbar. Besides the built-in {@link ToolbarItemName}s, any string is allowed
 * so apps can reference their own controls (e.g. custom blockquote variants);
 * the `(string & {})` keeps autocomplete for the built-ins.
 */
export type ToolbarConfig = (ToolbarItemName | (string & {}))[] | false

/** Localized labels for the link popover, attached to the `link` toolbar item. */
export interface LinkPanelLabels {
  /** Placeholder for the URL field. */
  urlPlaceholder: string
  /** Placeholder for the optional "visible text" field (shown when nothing is selected). */
  textPlaceholder: string
  /** Confirm button label. */
  apply: string
  /** Remove-link button label (shown while editing an existing link). */
  remove: string
}

/** A selectable choice inside a dropdown toolbar control. */
export interface ToolbarMenuOption {
  /** Human-readable label, also used as the swatch `aria-label`. */
  label: string
  /** Optional value: a color hex for swatches, or a font stack for fonts. */
  value?: string
  /** Executes this option against the editor. */
  run: (editor: Editor) => void
  /** Returns `true` when this option matches the current selection. */
  isActive?: (editor: Editor) => boolean
}

/**
 * A resolved toolbar entry — a button, a separator, a dropdown, or the link
 * popover. Adapters render these without needing to know about specific commands.
 */
export interface ToolbarItem {
  /** Stable identifier, e.g. `"bold"` or `"sep-3"`. */
  name: string
  /** What kind of control this entry is. */
  type: 'button' | 'separator' | 'dropdown' | 'link'
  /** Human-readable label, used as the tooltip and `aria-label`. */
  title?: string
  /** Inline SVG markup (the inner content of an `<svg>` element). */
  icon?: string
  /**
   * How a `dropdown`'s options are rendered, and how its trigger looks:
   * `'menu'` (icon button), `'swatch'` (color grid) or `'select'` (a text
   * field showing the active option's label — used by the font picker).
   */
  variant?: 'menu' | 'swatch' | 'select'
  /** Options for a `dropdown` control. */
  options?: ToolbarMenuOption[]
  /** Localized labels for the popover of a `link` control. */
  linkLabels?: LinkPanelLabels
  /** Returns `true` when the command applies to the current selection. */
  isActive?: (editor: Editor) => boolean
  /** Returns `true` when the command currently cannot run. */
  isDisabled?: (editor: Editor) => boolean
  /** Executes the command against the given editor (buttons only). */
  run?: (editor: Editor) => void
}

/** A font choice shown in the font-family dropdown. */
export interface FontOption {
  /** Display name, e.g. `"Serif"`. */
  label: string
  /**
   * CSS `font-family` value to apply, or `null` to clear the font (use the
   * editor default). The first option is treated as the default.
   *
   * When {@link FontOption.src} is set, the first family in this stack is the
   * name the loaded font file registers under, so it must match (e.g.
   * `value: 'Inter'` with `src: '/fonts/Inter.woff2'`).
   */
  value: string | null
  /**
   * Optional font file to load for this option. Pass a URL/path string
   * (e.g. `'/fonts/Inter.woff2'`) or a `File`/`Blob` (e.g. a user upload).
   * Plume injects a matching `@font-face` rule so the font renders without the
   * app declaring it manually. Ignored when {@link FontOption.value} is `null`.
   */
  src?: string | Blob
}

/**
 * Configuration the toolbar builder needs beyond the layout itself: the font
 * list, color swatches and locale that drive the dropdown controls.
 */
export interface ToolbarBuildConfig {
  /** Fonts offered by the `fontFamily` dropdown. */
  fonts?: FontOption[]
  /** Hex colors offered by the `textColor` swatch dropdown. */
  colors?: string[]
  /** Locale forwarded to the `changeCase` command. */
  locale?: string
  /**
   * Custom blockquote variants to expose as toolbar buttons. Must match the
   * `blockquotes` passed to the editor so the buttons map to real nodes.
   */
  blockquotes?: CustomBlockquoteSpec[]
  /**
   * Extra toolbar controls — or replacements for built-ins — merged into the
   * registry, keyed by each item's `name`. Reference those names in the toolbar
   * layout to render them. An item whose `name` matches a built-in overrides it.
   */
  items?: ToolbarItem[]
}

/**
 * Options shared by every Plume adapter. Adapters map their framework-native
 * props/inputs onto this shape and forward it to the core.
 */
export interface PlumeOptions {
  /** Initial content as an HTML string or a tiptap JSON document. */
  content?: string | Record<string, unknown> | null
  /** Whether the document is editable. Defaults to `true`. */
  editable?: boolean
  /** Placeholder text shown while the document is empty. */
  placeholder?: string
  /** Toolbar layout. Omit for the default set, or pass `false` to hide it. */
  toolbar?: ToolbarConfig
  /**
   * Custom toolbar controls — or replacements for built-ins — made available to
   * the toolbar layout, keyed by each item's `name`. Reference those names in
   * {@link PlumeOptions.toolbar} to render them; a `name` that matches a built-in
   * overrides it.
   */
  toolbarItems?: ToolbarItem[]
  /** Additional tiptap extensions appended after the default set. */
  extensions?: Extensions
  /** Include Plume's default extension set. Defaults to `true`. */
  defaultExtensions?: boolean
  /** Autofocus behaviour on mount. */
  autofocus?: boolean | 'start' | 'end' | number
  /** Extra class name(s) added to the editable content element. */
  editorClass?: string
  /** Render synchronously on first paint. Set `false` for SSR. Defaults to `true`. */
  immediatelyRender?: boolean
  /** Fonts offered by the font-family dropdown. */
  fonts?: FontOption[]
  /** Hex colors offered by the text-color dropdown. */
  colors?: string[]
  /** BCP-47 locale for case features (e.g. `'tr'`). */
  locale?: string
  /** Enable automatic sentence capitalization. Defaults to `false`. */
  autoCapitalize?: boolean | { locale?: string }
  /** Configure the resizable image node, or pass `false` to omit it. */
  image?: boolean | Partial<ResizableImageOptions>
  /** Configure footnotes (label), or pass `false` to omit them. */
  footnote?: boolean | FootnoteExtensionOptions
  /**
   * Custom blockquote variants (e.g. Kuran / Hadis citations). Each becomes a
   * styled blockquote node; reference the same name in {@link PlumeOptions.toolbar}
   * (and in {@link ToolbarBuildConfig.blockquotes} when resolving toolbar items)
   * to render a matching button.
   */
  blockquotes?: CustomBlockquoteSpec[]
}
