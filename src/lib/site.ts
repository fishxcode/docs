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
  name: 'FishXcode 文档',
  /** 产品主站，用于跳转控制台、注册等 */
  productUrl: 'https://fishxcode.com',
  productName: 'FishXcode',
  description:
    'FishXcode 是面向开发者的 AI API 中转聚合平台。一个 API Key 统一调用 Claude、GPT、Gemini 等全球主流大模型，兼容 OpenAI 协议，无需海外账号。',
  keywords: [
    'FishXcode',
    'AI API',
    'API 中转',
    'API 聚合',
    'Claude API',
    'OpenAI API',
    'Anthropic API',
    'Gemini API',
    '大模型 API',
    'LLM API',
    'Claude Code 接入',
    'Cursor 配置',
  ],
  locale: 'zh_CN',
  lang: 'zh-CN',
} as const;
