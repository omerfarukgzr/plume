import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Use the workspace source directly — no package build needed during dev.
      '@useplume/core/styles.css': fromHere('../../packages/core/src/styles.css'),
      '@useplume/core': fromHere('../../packages/core/src/index.ts'),
      '@useplume/vue': fromHere('../../packages/vue/src/index.ts'),
    },
  },
})
