import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [/^@tiptap\//, /^prosemirror-/],
  // Ship the stylesheet alongside the build output so consumers can
  // `import '@useplume/core/styles.css'`.
  onSuccess: 'cp src/styles.css dist/styles.css',
})
