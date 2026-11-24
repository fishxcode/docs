import { siteConfig } from './site';
import { docsImageRoute, joinRoute } from './shared';
import { DEFAULT_LOCALE, type Locale } from './i18n';

type HomeCopy = {
  /** 页面 <title>、分享卡片、页脚品牌与结构化数据里的站点名 */
  title: string;
  /** 首页大标题（品牌名）下的一句话定位 */
  headline: string;
  /** 定位下方的说明 */
  tagline: string;
  /** meta description；页脚、RSS 与结构化数据也用它介绍本站 */
  description: string;
  /** 主按钮：注册（站外，地址见 siteConfig.links.register） */
  register: string;
  /** 次按钮：进入文档（HOME_START_PATH） */
  docs: string;
  features: ReadonlyArray<{ title: string; details: string }>;
  updated: string;
};

/**
 * 各语言首页文案（纯数据，零组件依赖），内容沿用旧文档站首页。
 * localized-home-page.tsx、首页 Markdown 副本、分享图、页脚与结构化数据共用，
 * 新增语言在此补充一项即可。zh / en / fr 是旧站原文，其余语言为译文。
 */
export const HOME_COPY: Record<Locale, HomeCopy> = {
  zh: {
    title: `${siteConfig.productName} - AI Coding 中转站`,
    headline: 'AI Coding 中转站',
    tagline: '支持 Claude、Codex 模型在多种平台使用',
    description: siteConfig.description,
    register: '立即注册',
    docs: '使用文档',
    features: [
      { title: '开箱即用', details: '注册即可使用，快速接入 AI Coding 工作流。' },
      { title: '多模型支持', details: '支持 Claude、Codex 等主流 AI 模型，按需切换。' },
      {
        title: '多工具兼容',
        details: 'Claude Code、OpenAI Codex、RooCode、Qwen Code、Droid、OpenCode 全面支持。',
      },
    ],
    updated: '文档持续更新中 · 最近更新 ',
  },
  en: {
    title: `${siteConfig.productName} - AI Coding Relay`,
    headline: 'AI Coding Relay',
    tagline: 'Use Claude and Codex models across multiple platforms',
    description: 'AI Coding relay to use Claude and Codex models across multiple platforms.',
    register: 'Register Now',
    docs: 'Documentation',
    features: [
      { title: 'Easy to Start', details: 'Sign up and start powering your AI Coding workflow in minutes.' },
      {
        title: 'Multi-Model Support',
        details: 'Supports Claude, Codex and other mainstream AI models. Switch on demand.',
      },
      {
        title: 'Multi-Tool Compatible',
        details: 'Works with Claude Code, OpenAI Codex, RooCode, Qwen Code, Droid and OpenCode.',
      },
    ],
    updated: 'Continuously updated · Last updated ',
  },
  fr: {
    title: `${siteConfig.productName} - Relais AI Coding`,
    headline: 'Relais AI Coding',
    tagline: 'Utilisez les modèles Claude et Codex sur plusieurs plateformes',
    description: 'Relais AI Coding pour utiliser Claude et Codex sur plusieurs plateformes.',
    register: "S'inscrire",
    docs: 'Documentation',
    features: [
      {
        title: 'Démarrage rapide',
        details: 'Inscrivez-vous et commencez votre workflow AI Coding en quelques minutes.',
      },
      {
        title: 'Support multi-modèles',
        details: "Supporte Claude, Codex et d'autres modèles IA. Changez selon vos besoins.",
      },
      {
        title: 'Compatible multi-outils',
        details: 'Fonctionne avec Claude Code, OpenAI Codex, RooCode, Qwen Code, Droid et OpenCode.',
      },
    ],
    updated: 'Mis à jour en continu · Dernière mise à jour le ',
  },
  ru: {
    title: `${siteConfig.productName} - шлюз для AI Coding`,
    headline: 'Шлюз для AI Coding',
    tagline: 'Используйте модели Claude и Codex на разных платформах',
    description: 'Шлюз для AI Coding: модели Claude и Codex на разных платформах.',
    register: 'Зарегистрироваться',
    docs: 'Документация',
    features: [
      {
        title: 'Быстрый старт',
        details: 'Зарегистрируйтесь и подключите свой AI Coding‑процесс за несколько минут.',
      },
      {
        title: 'Несколько моделей',
        details: 'Claude, Codex и другие популярные модели с переключением по необходимости.',
      },
      {
        title: 'Совместимость с инструментами',
        details: 'Работает с Claude Code, OpenAI Codex, RooCode, Qwen Code, Droid и OpenCode.',
      },
    ],
    updated: 'Документация постоянно обновляется · Последнее обновление ',
  },
  ja: {
    title: `${siteConfig.productName} - AI Coding 中継サービス`,
    headline: 'AI Coding 中継サービス',
    tagline: 'Claude・Codex のモデルをさまざまなプラットフォームで利用',
    description: 'AI Coding 中継サービス。Claude・Codex のモデルをさまざまなプラットフォームで利用できます。',
    register: '今すぐ登録',
    docs: 'ドキュメント',
    features: [
      { title: 'すぐに使える', details: '登録するだけで、AI Coding のワークフローにすぐ接続できます。' },
      {
        title: 'マルチモデル対応',
        details: 'Claude、Codex など主要な AI モデルに対応し、必要に応じて切り替えられます。',
      },
      {
        title: 'マルチツール対応',
        details: 'Claude Code、OpenAI Codex、RooCode、Qwen Code、Droid、OpenCode に対応。',
      },
    ],
    updated: '継続的に更新中 · 最終更新 ',
  },
  vi: {
    title: `${siteConfig.productName} - Trạm trung chuyển AI Coding`,
    headline: 'Trạm trung chuyển AI Coding',
    tagline: 'Dùng các mô hình Claude và Codex trên nhiều nền tảng',
    description: 'Trạm trung chuyển AI Coding: dùng các mô hình Claude và Codex trên nhiều nền tảng.',
    register: 'Đăng ký ngay',
    docs: 'Tài liệu',
    features: [
      { title: 'Dùng ngay', details: 'Đăng ký là dùng được, kết nối nhanh vào quy trình AI Coding.' },
      {
        title: 'Hỗ trợ nhiều mô hình',
        details: 'Hỗ trợ Claude, Codex và các mô hình AI phổ biến, chuyển đổi theo nhu cầu.',
      },
      {
        title: 'Tương thích nhiều công cụ',
        details: 'Hỗ trợ Claude Code, OpenAI Codex, RooCode, Qwen Code, Droid và OpenCode.',
      },
    ],
    updated: 'Tài liệu được cập nhật liên tục · Cập nhật lần cuối ',
  },
  'zh-TW': {
    title: `${siteConfig.productName} - AI Coding 中轉站`,
    headline: 'AI Coding 中轉站',
    tagline: '支援 Claude、Codex 模型在多種平台使用',
    description: 'AI Coding 中轉站 - 支援 Claude、Codex 模型在多種平台使用',
    register: '立即註冊',
    docs: '使用文件',
    features: [
      { title: '開箱即用', details: '註冊即可使用，快速接入 AI Coding 工作流程。' },
      { title: '多模型支援', details: '支援 Claude、Codex 等主流 AI 模型，按需切換。' },
      {
        title: '多工具相容',
        details: 'Claude Code、OpenAI Codex、RooCode、Qwen Code、Droid、OpenCode 全面支援。',
      },
    ],
    updated: '文件持續更新中 · 最近更新 ',
  },
};

/**
 * 首页文案的源文件（相对仓库根）。首页「最近更新」与 sitemap 的 lastmod
 * 都取它的提交时间：改了文案就是内容更新，两处必须同源，否则页面与
 * sitemap 会对同一次更新给出不同的日期。
 */
export const HOME_COPY_SOURCE = 'src/lib/home-copy.ts';

/** 首页「使用文档」按钮与首页 Markdown 副本共用的入口文档（旧站同样指向 Claude Code 上手页） */
export const HOME_START_PATH = '/start';

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
