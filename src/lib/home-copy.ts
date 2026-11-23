import { siteConfig } from './site';
import { docsImageRoute, joinRoute } from './shared';
import { DEFAULT_LOCALE, type Locale } from './i18n';

/**
 * 各语言首页文案（纯数据，零组件依赖）。
 * localized-home-page.tsx 与 og/[...slug]/route.tsx 共用这份标题/描述，
 * 新增语言在此补充一项即可。
 */
export const HOME_COPY: Record<
  Locale,
  { title: string; description: string; start: string; console: string; updated: string }
> = {
  zh: {
    title: `${siteConfig.productName} 文档`,
    description: siteConfig.description,
    start: '快速开始',
    console: '前往控制台 ↗',
    updated: '文档持续更新中 · 最近更新 ',
  },
  en: {
    title: `${siteConfig.productName} Docs`,
    description:
      'One API key for Claude, GPT, Gemini and more — OpenAI-compatible, no overseas account required.',
    start: 'Get Started',
    console: 'Open Console ↗',
    updated: 'Continuously updated · Last updated ',
  },
  fr: {
    title: `Documentation ${siteConfig.productName}`,
    description:
      "Une seule clé API pour Claude, GPT, Gemini et plus — compatible OpenAI, sans compte à l'étranger.",
    start: 'Commencer',
    console: 'Ouvrir la console ↗',
    updated: 'Mis à jour en continu · Dernière mise à jour le ',
  },
  ru: {
    title: `Документация ${siteConfig.productName}`,
    description:
      'Один API-ключ для Claude, GPT, Gemini и других — совместимость с OpenAI, без зарубежного аккаунта.',
    start: 'Начать',
    console: 'Открыть консоль ↗',
    updated: 'Документация постоянно обновляется · Последнее обновление ',
  },
  ja: {
    title: `${siteConfig.productName} ドキュメント`,
    description:
      'API キー 1 つで Claude、GPT、Gemini など主要モデルを利用可能 — OpenAI 互換、海外アカウント不要。',
    start: '始める',
    console: 'コンソールを開く ↗',
    updated: '継続的に更新中 · 最終更新 ',
  },
  vi: {
    title: `Tài liệu ${siteConfig.productName}`,
    description:
      'Một API key cho Claude, GPT, Gemini và nhiều hơn nữa — tương thích OpenAI, không cần tài khoản nước ngoài.',
    start: 'Bắt đầu',
    console: 'Mở console ↗',
    updated: 'Tài liệu được cập nhật liên tục · Cập nhật lần cuối ',
  },
  'zh-TW': {
    title: `${siteConfig.productName} 文件`,
    description:
      '一個 API Key 統一呼叫 Claude、GPT、Gemini 等全球主流大模型，相容 OpenAI 協議，無需海外帳號。',
    start: '快速開始',
    console: '前往控制台 ↗',
    updated: '文件持續更新中 · 最近更新 ',
  },
};

/**
 * 首页文案的源文件（相对仓库根）。首页「最近更新」与 sitemap 的 lastmod
 * 都取它的提交时间：改了文案就是内容更新，两处必须同源，否则页面与
 * sitemap 会对同一次更新给出不同的日期。
 */
export const HOME_COPY_SOURCE = 'src/lib/home-copy.ts';

/** 首页「快速开始」按钮与首页 Markdown 副本共用的入口文档 */
export const HOME_START_PATH = '/introduction';

/**
 * 首页分享图（og 路由为每种语言的首页各渲染一张）：zh 为 /og/home/image.png，
 * 其余语言 /og/{lang}/home/image.png。
 *
 * 页面一旦定义 openGraph，Next 会整体替换根布局的同名字段，所以首页
 * metadata 必须自带图片，否则分享卡片只剩标题。
 */
export function getHomeImage(lang: Locale) {
  const segments = [...(lang === DEFAULT_LOCALE ? [] : [lang]), 'home', 'image.png'];

  return {
    url: joinRoute(docsImageRoute, segments),
    width: 1200,
    height: 630,
    // 显式声明类型：微信等抓取器不总能从 URL 推断，缺 type 时可能拒绝预取
    type: 'image/png',
    alt: HOME_COPY[lang].title,
  };
}
