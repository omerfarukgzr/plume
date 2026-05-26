import { defineConfig, type HeadConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

// Live origin including the GitHub Pages project base. Used for canonical URLs,
// Open Graph tags, the sitemap and llms.txt. Change this (and `base`) in one
// place if the docs ever move to a custom domain.
const origin = 'https://omerfarukgzr.github.io'
const siteUrl = `${origin}/plume`
const description = 'Customizable, framework-agnostic rich text editor built on tiptap.'

// `index.md` -> '', `guide/index.md` -> 'guide/', `guide/x.md` -> 'guide/x'
function pageToPath(page: string): string {
  return page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
}

// Sidebars are shared between the guide pages and the (root-level) examples
// page so navigation stays put as readers move between them.
const enGuideSidebar = [
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
      { text: 'Extensions', link: '/guide/extensions' },
      { text: 'Editor & commands', link: '/guide/editor-api' },
      { text: 'Images & uploads', link: '/guide/images' },
      { text: 'Theming', link: '/guide/theming' },
    ],
  },
  {
    text: 'For content authors',
    items: [{ text: 'Editing', link: '/guide/editing' }],
  },
  {
    text: 'Cookbook',
    items: [
      { text: 'Examples & recipes', link: '/examples' },
      { text: 'Live demo', link: '/demo' },
    ],
  },
]

const trGuideSidebar = [
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
      { text: 'Eklentiler', link: '/tr/guide/extensions' },
      { text: 'Editor & komutlar', link: '/tr/guide/editor-api' },
      { text: 'Görseller & yükleme', link: '/tr/guide/images' },
      { text: 'Tema', link: '/tr/guide/theming' },
    ],
  },
  {
    text: 'İçerik yazarları için',
    items: [{ text: 'Yazım', link: '/tr/guide/editing' }],
  },
  {
    text: 'Tarifler',
    items: [
      { text: 'Örnekler & tarifler', link: '/tr/examples' },
      { text: 'Canlı demo', link: '/tr/demo' },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Plume',
  description,
  // Project Pages site is served under https://omerfarukgzr.github.io/plume/
  base: '/plume/',
  cleanUrls: true,
  lastUpdated: true,

  // Trailing slash matters: sitemap URLs are resolved relative to this, so the
  // `/plume/` base is preserved (e.g. `guide/x` -> `${siteUrl}/guide/x`).
  // VitePress auto-emits hreflang alternates from the `locales` block below.
  sitemap: { hostname: `${siteUrl}/` },

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/plume/favicon.svg' }]],

  // Per-page social/canonical/structured-data tags. VitePress already injects
  // <title> and <meta name="description">; everything below is additive.
  transformHead({ page, pageData, title }) {
    const path = pageToPath(page)
    const url = `${siteUrl}/${path}`
    const desc = pageData.description || description
    const isTr = page === 'tr/index.md' || page.startsWith('tr/')
    const isHome = page === 'index.md' || page === 'tr/index.md'
    const locale = isTr ? 'tr_TR' : 'en_US'
    // Shared 1200×630 social card (docs/public/og.png).
    const image = `${siteUrl}/og.png`

    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: desc }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:site_name', content: 'Plume' }],
      ['meta', { property: 'og:locale', content: locale }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      [
        'meta',
        { property: 'og:image:alt', content: 'Plume — framework-agnostic rich text editor' },
      ],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: desc }],
      ['meta', { name: 'twitter:image', content: image }],
    ]

    // JSON-LD: the library itself on the home page, a tech article elsewhere.
    const jsonLd = isHome
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Plume',
          description: desc,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web',
          url: `${siteUrl}/`,
          license: 'https://opensource.org/licenses/MIT',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          codeRepository: 'https://github.com/omerfarukgzr/plume',
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description: desc,
          url,
          inLanguage: isTr ? 'tr' : 'en',
          ...(pageData.lastUpdated
            ? { dateModified: new Date(pageData.lastUpdated).toISOString() }
            : {}),
          isPartOf: { '@type': 'WebSite', name: 'Plume', url: `${siteUrl}/` },
        }
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)])

    return head
  },

  // AI/LLM optimization: emits /llms.txt (index) + /llms-full.txt (whole docs as
  // one markdown file) and a raw .md alongside every page. Turkish pages are
  // excluded — English alone is enough for LLMs and avoids duplicate tokens.
  vite: {
    plugins: [
      llmstxt({
        // Origin only — the plugin already prefixes the `/plume/` base onto paths.
        domain: origin,
        ignoreFiles: ['tr/**/*'],
        description,
      }),
    ],
  },

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
          { text: 'Examples', link: '/examples' },
          { text: 'Demo', link: '/demo' },
        ],
        sidebar: {
          '/guide/': enGuideSidebar,
          '/examples': enGuideSidebar,
          '/demo': enGuideSidebar,
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
          { text: 'Örnekler', link: '/tr/examples' },
          { text: 'Demo', link: '/tr/demo' },
        ],
        sidebar: {
          '/tr/guide/': trGuideSidebar,
          '/tr/examples': trGuideSidebar,
          '/tr/demo': trGuideSidebar,
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
