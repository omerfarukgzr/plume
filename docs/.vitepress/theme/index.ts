import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import PlumeDemo from './components/PlumeDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // Custom layout adds the compact live demo under the home hero.
  Layout,
  enhanceApp({ app }) {
    // Registered globally so the dedicated /demo page can use it from markdown.
    app.component('PlumeDemo', PlumeDemo)
  },
} satisfies Theme
