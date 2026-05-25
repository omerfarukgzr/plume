import type { ImageLabels } from './resizable-image'
import type { LinkPanelLabels } from './types'

/** Locales Plume ships UI strings for. Turkish is the default. */
export type SupportedLocale = 'tr' | 'en'

/** Every user-facing string Plume renders, grouped by where it appears. */
export interface PlumeMessages {
  /** `aria-label` for the toolbar container. */
  toolbarLabel: string
  /** Tooltips / `aria-label`s for toolbar controls, keyed by item name. */
  toolbar: {
    bold: string
    italic: string
    underline: string
    strike: string
    code: string
    highlight: string
    fontFamily: string
    textColor: string
    changeCase: string
    /** Trailing entry of the text-color dropdown that clears the color. */
    removeColor: string
    heading1: string
    heading2: string
    heading3: string
    bulletList: string
    orderedList: string
    blockquote: string
    codeBlock: string
    link: string
    image: string
    footnote: string
    superscript: string
    subscript: string
    alignLeft: string
    alignCenter: string
    alignRight: string
    alignJustify: string
    horizontalRule: string
    undo: string
    redo: string
  }
  /** Labels for the link popover (URL/text fields and the apply/remove actions). */
  link: LinkPanelLabels
  /** Labels for the built-in font-family options. */
  fonts: {
    default: string
    sansSerif: string
    serif: string
    monospace: string
  }
  /** Labels for the change-case dropdown options. */
  cases: {
    sentence: string
    lower: string
    upper: string
    capitalize: string
    toggle: string
  }
  /** Placeholder shown while the document is empty. */
  placeholder: string
  /** Image bubble-menu and caption labels. */
  image: ImageLabels
  /** Footnotes section heading and the back-link `aria-label`. */
  footnote: {
    label: string
    backref: (number: number) => string
  }
}

const tr: PlumeMessages = {
  toolbarLabel: 'Biçimlendirme',
  toolbar: {
    bold: 'Kalın',
    italic: 'İtalik',
    underline: 'Altı çizili',
    strike: 'Üstü çizili',
    code: 'Satır içi kod',
    highlight: 'Vurgu',
    fontFamily: 'Yazı tipi',
    textColor: 'Metin rengi',
    changeCase: 'Harf düzeni',
    removeColor: 'Rengi kaldır',
    heading1: 'Başlık 1',
    heading2: 'Başlık 2',
    heading3: 'Başlık 3',
    bulletList: 'Madde işaretli liste',
    orderedList: 'Numaralı liste',
    blockquote: 'Alıntı',
    codeBlock: 'Kod bloğu',
    link: 'Bağlantı',
    image: 'Görsel',
    footnote: 'Dipnot',
    superscript: 'Üst simge',
    subscript: 'Alt simge',
    alignLeft: 'Sola hizala',
    alignCenter: 'Ortala',
    alignRight: 'Sağa hizala',
    alignJustify: 'İki yana yasla',
    horizontalRule: 'Ayraç',
    undo: 'Geri al',
    redo: 'Yinele',
  },
  link: {
    urlPlaceholder: 'Bağlantı adresini yapıştırın',
    textPlaceholder: 'Görünen metin',
    apply: 'Uygula',
    remove: 'Kaldır',
  },
  fonts: {
    default: 'Varsayılan',
    sansSerif: 'Sans serif',
    serif: 'Serif',
    monospace: 'Monospace',
  },
  cases: {
    sentence: 'Cümle düzeni',
    lower: 'küçük harf',
    upper: 'BÜYÜK HARF',
    capitalize: 'Her Sözcük Büyük',
    toggle: 'bÜYÜK/kÜÇÜK dEĞİŞTİR',
  },
  placeholder: 'Bir şeyler yazın …',
  image: {
    alignLeft: 'Sola hizala',
    alignCenter: 'Ortala',
    alignRight: 'Sağa hizala',
    caption: 'Açıklama',
    delete: 'Sil',
    captionPlaceholder: 'Açıklama ekle…',
  },
  footnote: {
    label: 'Dipnotlar',
    backref: (number) => `${number}. referansa dön`,
  },
}

const en: PlumeMessages = {
  toolbarLabel: 'Formatting',
  toolbar: {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    code: 'Inline code',
    highlight: 'Highlight',
    fontFamily: 'Font',
    textColor: 'Text color',
    changeCase: 'Change case',
    removeColor: 'Remove color',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    bulletList: 'Bullet list',
    orderedList: 'Numbered list',
    blockquote: 'Blockquote',
    codeBlock: 'Code block',
    link: 'Link',
    image: 'Image',
    footnote: 'Footnote',
    superscript: 'Superscript',
    subscript: 'Subscript',
    alignLeft: 'Align left',
    alignCenter: 'Align center',
    alignRight: 'Align right',
    alignJustify: 'Justify',
    horizontalRule: 'Divider',
    undo: 'Undo',
    redo: 'Redo',
  },
  link: {
    urlPlaceholder: 'Paste a link',
    textPlaceholder: 'Display text',
    apply: 'Apply',
    remove: 'Remove',
  },
  fonts: {
    default: 'Default',
    sansSerif: 'Sans serif',
    serif: 'Serif',
    monospace: 'Monospace',
  },
  cases: {
    sentence: 'Sentence case',
    lower: 'lowercase',
    upper: 'UPPERCASE',
    capitalize: 'Capitalize Each Word',
    toggle: 'tOGGLE cASE',
  },
  placeholder: 'Write something …',
  image: {
    alignLeft: 'Align left',
    alignCenter: 'Align center',
    alignRight: 'Align right',
    caption: 'Caption',
    delete: 'Delete',
    captionPlaceholder: 'Add a caption…',
  },
  footnote: {
    label: 'Footnotes',
    backref: (number) => `Back to reference ${number}`,
  },
}

/** Built-in message catalogs, keyed by {@link SupportedLocale}. */
export const messages: Record<SupportedLocale, PlumeMessages> = { tr, en }

/**
 * Maps any BCP-47 locale onto a {@link SupportedLocale}. An undefined or
 * unrecognized locale resolves to Turkish (the default); only an explicit
 * English tag (`'en'`, `'en-US'`, …) selects English.
 */
export function resolveLocale(locale?: string): SupportedLocale {
  return locale?.toLowerCase().split('-')[0] === 'en' ? 'en' : 'tr'
}

/** Returns the message catalog for the given locale (Turkish by default). */
export function resolveMessages(locale?: string): PlumeMessages {
  return messages[resolveLocale(locale)]
}
