import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use the workspace source directly — no package build needed during dev.
      '@plume/core/styles.css': fromHere('../../packages/core/src/styles.css'),
      '@plume/core': fromHere('../../packages/core/src/index.ts'),
      '@plume/react': fromHere('../../packages/react/src/index.ts'),
    },
  },
})
