import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

// Globals used by the benchmark runner scripts (plain .mjs, run via node).
// They also embed browser code inside Playwright `page.evaluate` callbacks, so
// the browser globals below are referenced (and valid) there too.
const benchGlobals = {
  process: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  window: 'readonly',
  document: 'readonly',
  PointerEvent: 'readonly',
  MutationObserver: 'readonly',
  requestAnimationFrame: 'readonly',
}

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.config.{js,ts,mjs,cjs}',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['bench/**/*.mjs'],
    languageOptions: { globals: benchGlobals },
  },
)
