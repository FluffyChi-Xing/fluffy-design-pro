import { defineConfig } from 'vitepress'

const repository = 'https://github.com/FluffyChi-Xing/fluffy-design-pro'
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')
const description = '用于生成 Vue 3 中后台应用的 CLI 与轻量前端基础层模板。'

function absoluteUrl(path: string) {
  return siteUrl ? new URL(path, `${siteUrl}/`).href : undefined
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Fluffy Design Pro',
  titleTemplate: ':title | Fluffy Design Pro',
  description,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: siteUrl ? { hostname: siteUrl } : undefined,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#4f46e5' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Fluffy Design Pro' }],
    ['meta', { property: 'og:title', content: 'Fluffy Design Pro' }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ...(siteUrl
      ? [
          ['link', { rel: 'canonical', href: siteUrl }],
          ['meta', { property: 'og:url', content: siteUrl }],
        ]
      : []),
  ],
  themeConfig: {
    logo: false,
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '使用指南', link: '/guide/usage' },
      { text: '组件', link: '/guide/components' },
      { text: '功能', link: '/guide/features' },
      { text: '路线图', link: '/roadmap/template-plugins' },
      { text: 'GitHub', link: repository },
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '命令与迁移', link: '/guide/usage' },
        ],
      },
      {
        text: '使用指南',
        items: [
          { text: '功能概览', link: '/guide/features' },
          { text: '路由：自动重建', link: '/guide/routing' },
          { text: '部署选项', link: '/guide/deployment' },
          { text: 'Fluffy 生态集成', link: '/guide/integrations' },
        ],
      },
      {
        text: '组件与扩展',
        items: [
          { text: '组件预览', link: '/guide/components' },
          { text: '组合式函数', link: '/guide/composables' },
          { text: '自定义指令', link: '/guide/custom-directives' },
        ],
      },
      {
        text: '参考',
        items: [
          { text: 'CLI 选项', link: '/reference/cli-options' },
          { text: '生成项目结构', link: '/reference/project-structure' },
        ],
      },
      {
        text: '项目',
        items: [{ text: '模板插件（规划中）', link: '/roadmap/template-plugins' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: repository }],
    editLink: {
      pattern: `${repository}/edit/master/packages/docs/:path`,
      text: '在 GitHub 上编辑此页',
    },
    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2026 Fluffy Design Pro',
    },
    outline: { label: '本页内容' },
    docFooter: { prev: '上一页', next: '下一页' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '切换外观',
  },
  transformHead({ pageData }) {
    const path = pageData.relativePath === 'index.md'
      ? '/'
      : `/${pageData.relativePath.replace(/\.md$/, '')}`
    const pageTitle = pageData.frontmatter.title
      ? `${pageData.frontmatter.title} | Fluffy Design Pro`
      : 'Fluffy Design Pro'
    const pageDescription = pageData.frontmatter.description ?? description
    const url = absoluteUrl(path)
    const head: [string, Record<string, string>][] = [
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
    ]

    if (!url) {
      return head
    }

    const structuredData: Record<string, unknown>[] = [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'Fluffy Design Pro',
        url: siteUrl,
        description,
        sameAs: [repository],
      },
      {
        '@type': 'SoftwareSourceCode',
        name: 'Fluffy Design Pro',
        codeRepository: repository,
        license: `${repository}/blob/master/LICENSE`,
        programmingLanguage: ['TypeScript', 'Vue'],
      },
    ]

    if (path !== '/') {
      structuredData.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: pageData.frontmatter.title ?? '文档', item: url },
        ],
      })
    }

    return [
      ...head,
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['script', { type: 'application/ld+json' }, JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': structuredData,
      })],
    ]
  },
})
