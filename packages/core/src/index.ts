export type {
  Editor,
  FontOption,
  LinkPanelLabels,
  PlumeOptions,
  ToolbarBuildConfig,
  ToolbarConfig,
  ToolbarItem,
  ToolbarItemName,
  ToolbarMenuOption,
} from './types'
export { defaultExtensions } from './extensions'
export type { DefaultExtensionOptions } from './extensions'
export { messages, resolveLocale, resolveMessages } from './i18n'
export type { PlumeMessages, SupportedLocale } from './i18n'
export { injectFontFaces, primaryFontFamily } from './fonts'
export { resolveEditorOptions } from './options'
export type { PlumeEditorOptions } from './options'
export {
  createToolbarItems,
  defaultColors,
  defaultFonts,
  defaultToolbar,
  defaultToolbarItems,
  resolveToolbarItems,
} from './toolbar/items'
export { icons } from './toolbar/icons'
export type { IconName } from './toolbar/icons'
export { applyLink, getLinkState, normalizeLinkHref, removeLink } from './toolbar/link'
export type { LinkState } from './toolbar/link'

// Individual extensions, so apps can compose their own sets.
export { AutoCapitalize } from './auto-capitalize'
export type { AutoCapitalizeOptions } from './auto-capitalize'
export { ChangeCase } from './change-case'
export type { CaseType, ChangeCaseOptions } from './change-case'
export {
  CustomBlockquote,
  customBlockquoteExtensions,
  customBlockquoteNode,
} from './custom-blockquote'
export type { CustomBlockquoteOptions, CustomBlockquoteSpec } from './custom-blockquote'
export { footnoteExtensions, PlumeDocument } from './footnotes'
export type { FootnoteExtensionOptions } from './footnotes'
export { insertPaste, PasteManager, PASTE_EVENT } from './paste-manager'
export type { PasteManagerOptions, PasteMode, PendingPaste } from './paste-manager'
export { ResizableImage, insertImageFromFile, collectImageAssetIds } from './resizable-image'
export type {
  ImageAlign,
  ImageLabels,
  ImageUploadResult,
  ResizableImageOptions,
  SetImageOptions,
  UploadContext,
} from './resizable-image'
export { base64UploadHandler, createUploadHandler, validateImageFile } from './upload'
export type { FileValidationOptions, UploadHandlerConfig } from './upload'

/** Current Plume version. */
export const version = '0.1.0'
