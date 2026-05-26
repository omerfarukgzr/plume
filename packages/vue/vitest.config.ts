import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      // Resolve the workspace core from source so tests run without a build.
      '@useplume/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
})
