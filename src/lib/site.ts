/**
 * 站点级配置。所有 SEO（TDK、OG、sitemap、robots、RSS）共用这一份，
 * 避免域名、站点名散落在多个文件里各写一遍。
 */
export const siteConfig = {
  /**
   * 文档站的线上地址（不带结尾斜杠）。canonical、sitemap、robots、RSS、llms.txt
   * 与分享图里的绝对地址都由它拼出；整站换域名时改这里，或在构建时设
   * NEXT_PUBLIC_SITE_URL。它不是产品主站——主站见下方的 productUrl。
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://docs.fishxcode.com',
  name: 'FishXCode 文档',
  /** 产品主站，用于跳转控制台、注册等 */
  productUrl: 'https://fishxcode.com',
  productName: 'FishXCode',
  /** 品牌 logo（public 下的静态文件），导航栏与首页共用；站点图标由 src/app 下的 icon 文件生成 */
  logo: '/img/logo.svg',
  description:
    '一站式 AI 模型接入与账号服务平台，覆盖 Claude、Codex、Kiro、Grok、国产模型与多模态模型，稳定、高性价比、即开即用。',
  /**
   * 导航栏的站外入口。注册链接带推广码，改动前先确认推广归属。
   */
  links: {
    console: 'https://fishxcode.com/console',
    status: 'https://status.fishxcode.com',
    quota: 'https://api-key-tool.fishxcode.com',
    /** 企业专属站点：团队接入、批量采购与定制化方案 */
    enterprise: 'https://enterprise.fishxcode.com/',
    register: 'https://fishxcode.com/register?aff=9CTW',
  },
  /** 官方社交账号（来自旧文档站的 socialLinks），结构化数据的 sameAs 用 */
  socials: ['https://x.com/fishxcode', 'https://github.com/fishxcode'],
  keywords: [
    'FishXCode',
    'AI 模型接入',
    'API 中转',
    'Claude API',
    'OpenAI API',
    'Anthropic API',
    'Claude Code 接入',
    'Codex 接入',
    'Codex 号池月包',
    'Kiro',
    'Grok',
    'Cursor 配置',
    'LLM API',
  ],
  locale: 'zh_CN',
  lang: 'zh-CN',
} as const;
