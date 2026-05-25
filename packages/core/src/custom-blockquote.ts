import { Extension, Node, mergeAttributes } from '@tiptap/core'
import type { Extensions } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customBlockquote: {
      /**
       * Toggle a custom blockquote variant (by its node name) around the
       * selection. No-ops when the selection already sits inside a *different*
       * quote — a plain blockquote or another variant — so quotes never nest or
       * mix.
       */
      toggleCustomBlockquote: (name: string) => ReturnType
    }
  }
}

/**
 * Describes one custom blockquote variant an app wants to offer. This is all an
 * app supplies: a name, a label and (optionally) a color, class and icon. Plume
 * turns each spec into a tiptap node plus a matching toolbar button.
 */
export interface CustomBlockquoteSpec {
  /** Unique node name, also used as the toolbar item id, e.g. `'kuran'`. */
  name: string
  /** Tooltip/label for the toolbar button, e.g. `'Kuran alıntısı'`. */
  label: string
  /** Accent color (left border + faint tint). Any CSS color. Optional. */
  color?: string
  /** Extra CSS class on the rendered `<blockquote>`. Defaults to `plume-quote-<name>`. */
  class?: string
  /** Toolbar icon as inner SVG markup. Defaults to {@link icons.quote}. */
  icon?: string
}

export interface CustomBlockquoteOptions {
  /** Node names of every registered variant, used for mutual-exclusion checks. */
  names: string[]
}

/**
 * Shared command provider for custom blockquotes. It carries the list of all
 * registered variant names so toggling one variant can refuse to run while the
 * selection is inside a plain blockquote or a different variant.
 */
export const CustomBlockquote = Extension.create<CustomBlockquoteOptions>({
  name: 'customBlockquote',

  addOptions() {
    return { names: [] }
  },

  addCommands() {
    return {
      toggleCustomBlockquote:
        (name) =>
        ({ editor, commands }) => {
          const isActiveSelf = editor.isActive(name)
          const others = ['blockquote', ...this.options.names.filter((n) => n !== name)]
          // Don't create a new quote while sitting inside a different one.
          if (!isActiveSelf && others.some((n) => editor.isActive(n))) return false
          return commands.toggleWrap(name)
        },
    }
  },
})

/** Builds the tiptap node for a single custom blockquote variant. */
export function customBlockquoteNode(spec: CustomBlockquoteSpec): Node {
  const className = spec.class ?? `plume-quote-${spec.name}`
  // First token of the (possibly multi-class) string, for the parse selector.
  const matchClass = className.split(/\s+/)[0]

  return Node.create({
    name: spec.name,
    group: 'block',
    // Wrapper block (like blockquote): holds one or more block children.
    content: 'block+',
    defining: true,

    parseHTML() {
      return [
        { tag: `blockquote[data-quote="${spec.name}"]`, priority: 51 },
        { tag: `blockquote.${matchClass}`, priority: 51 },
      ]
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'blockquote',
        mergeAttributes(HTMLAttributes, {
          class: `plume-blockquote ${className}`,
          'data-quote': spec.name,
          ...(spec.color ? { style: `--plume-quote-color: ${spec.color}` } : {}),
        }),
        0,
      ]
    },
  })
}

/**
 * Expands custom blockquote specs into the extensions Plume should register:
 * the shared command provider plus one node per variant. Returns an empty array
 * when there are no specs.
 */
export function customBlockquoteExtensions(specs: CustomBlockquoteSpec[]): Extensions {
  if (!specs.length) return []
  return [
    CustomBlockquote.configure({ names: specs.map((s) => s.name) }),
    ...specs.map(customBlockquoteNode),
  ]
}
