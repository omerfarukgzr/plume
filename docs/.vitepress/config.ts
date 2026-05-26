import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Plume',
  description: 'Customizable, framework-agnostic rich text editor built on tiptap.',
  // Project Pages site is served under https://omerfarukgzr.github.io/plume/
  base: '/plume/',
  cleanUrls: true,
  lastUpdated: true,

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/plume/favicon.svg' }]],

  themeConfig: {
    logo: { light: '/logo.svg', dark: '/logo-dark.svg', alt: 'Plume' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/omerfarukgzr/plume' }],
    search: { provider: 'local' },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/api/options' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is Plume?', link: '/guide/' },
                { text: 'Getting started', link: '/guide/getting-started' },
              ],
            },
            {
              text: 'Usage',
              items: [
                { text: 'Customization', link: '/guide/customization' },
                { text: 'Images & uploads', link: '/guide/images' },
                { text: 'Theming', link: '/guide/theming' },
              ],
            },
          ],
          '/api/': [
            {
              text: 'Reference',
              items: [
                { text: 'PlumeOptions', link: '/api/options' },
                { text: 'Toolbar items', link: '/api/toolbar' },
              ],
            },
          ],
        },
      },
    },

    tr: {
      label: 'Türkçe',
      lang: 'tr',
      link: '/tr/',
      themeConfig: {
        nav: [
          { text: 'Rehber', link: '/tr/guide/getting-started' },
          { text: 'API', link: '/tr/api/options' },
        ],
        sidebar: {
          '/tr/guide/': [
            {
              text: 'Giriş',
              items: [
                { text: 'Plume nedir?', link: '/tr/guide/' },
                { text: 'Başlangıç', link: '/tr/guide/getting-started' },
              ],
            },
            {
              text: 'Kullanım',
              items: [
                { text: 'Özelleştirme', link: '/tr/guide/customization' },
                { text: 'Görseller & yükleme', link: '/tr/guide/images' },
                { text: 'Tema', link: '/tr/guide/theming' },
              ],
            },
          ],
          '/tr/api/': [
            {
              text: 'Referans',
              items: [
                { text: 'PlumeOptions', link: '/tr/api/options' },
                { text: 'Toolbar öğeleri', link: '/tr/api/toolbar' },
              ],
            },
          ],
        },
        docFooter: { prev: 'Önceki', next: 'Sonraki' },
        outline: { label: 'Bu sayfada' },
        lastUpdated: { text: 'Son güncelleme' },
        returnToTopLabel: 'Başa dön',
        darkModeSwitchLabel: 'Görünüm',
        lightModeSwitchTitle: 'Açık temaya geç',
        darkModeSwitchTitle: 'Koyu temaya geç',
      },
    },
  },
})
