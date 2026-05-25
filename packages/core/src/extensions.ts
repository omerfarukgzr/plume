import { Placeholder } from '@tiptap/extensions'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import { Color, FontFamily, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import type { Extensions } from '@tiptap/core'
import { AutoCapitalize } from './auto-capitalize'
import { ChangeCase } from './change-case'
import { resolveMessages } from './i18n'
import { customBlockquoteExtensions, type CustomBlockquoteSpec } from './custom-blockquote'
import { footnoteExtensions, type FootnoteExtensionOptions } from './footnotes'
import { ResizableImage, type ResizableImageOptions } from './resizable-image'

export interface DefaultExtensionOptions {
  /** Placeholder text shown while the document is empty. */
  placeholder?: string
  /**
   * BCP-47 locale for case-related features (ChangeCase / AutoCapitalize),
   * e.g. `'tr'`. Defaults to the runtime locale.
   */
  locale?: string
  /**
   * Enable automatic sentence capitalization. Off by default since automatic
   * edits can surprise users. Pass `true` or `{ locale }`.
   */
  autoCapitalize?: boolean | { locale?: string }
  /**
   * Configure the resizable image node, or pass `false` to omit it.
   * Accepts an upload handler so apps control where files are stored.
   */
  image?: boolean | Partial<ResizableImageOptions>
  /**
   * Configure footnotes (label), or pass `false` to omit them. Enabling
   * footnotes swaps StarterKit's Document for one that allows a trailing
   * footnotes section. Defaults to enabled.
   */
  footnote?: boolean | FootnoteExtensionOptions
  /**
   * Custom blockquote variants (e.g. a "Kuran" or "Hadis" citation). Each spec
   * becomes a styled `<blockquote>` node; reference the same name in the
   * toolbar layout to get a matching button.
   */
  blockquotes?: CustomBlockquoteSpec[]
}

/**
 * Plume's default extension set.
 *
 * tiptap v3's StarterKit already bundles Bold, Italic, Underline, Strike, Code,
 * Heading, BulletList, OrderedList, ListItem, Blockquote, CodeBlock,
 * HorizontalRule, HardBreak, Link, ListKeymap and undo/redo. On top we add
 * Highlight, Superscript, Subscript, TextAlign, a Placeholder, text styling
 * (font family + color), case tools and a resizable image node.
 */
export function defaultExtensions(options: DefaultExtensionOptions = {}): Extensions {
  const { placeholder, locale, autoCapitalize, image, footnote, blockquotes } = options
  const m = resolveMessages(locale)
  const footnoteEnabled = footnote !== false

  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'plume-link',
          rel: 'noopener noreferrer nofollow',
        },
      },
      // Footnotes need a Document that permits a trailing footnotes section,
      // so we replace StarterKit's default Document with our own below.
      ...(footnoteEnabled ? { document: false as const } : {}),
    }),
    Highlight,
    Superscript,
    Subscript,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    FontFamily,
    Color,
    ChangeCase.configure({ locale }),
    Placeholder.configure({
      placeholder: placeholder ?? m.placeholder,
    }),
  ]

  if (footnoteEnabled) {
    const footnoteOptions = typeof footnote === 'object' ? footnote : {}
    // Locale defaults for the heading and back-link; explicit options win.
    extensions.push(
      ...footnoteExtensions({
        label: m.footnote.label,
        backrefLabel: m.footnote.backref,
        ...footnoteOptions,
      }),
    )
  }

  if (image !== false) {
    const imageOptions = typeof image === 'object' ? image : {}
    // Localized bubble-menu/caption labels, with any app overrides layered on top.
    extensions.push(
      ResizableImage.configure({
        ...imageOptions,
        labels: { ...m.image, ...imageOptions.labels },
      }),
    )
  }

  if (autoCapitalize) {
    const autoLocale = typeof autoCapitalize === 'object' ? autoCapitalize.locale : locale
    extensions.push(AutoCapitalize.configure({ locale: autoLocale }))
  }

  if (blockquotes?.length) {
    extensions.push(...customBlockquoteExtensions(blockquotes))
  }

  return extensions
}
