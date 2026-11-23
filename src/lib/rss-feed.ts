import { discoveryPages } from './discovery';
import { siteConfig } from '@/lib/site';
import { HTML_LANG, localePath, type Locale } from './i18n';

/** 转义 XML 特殊字符，避免标题里的 & < > 破坏 feed 结构 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type FeedItem = {
  title: string;
  url: string;
  description: string;
};

const COPY: Record<Locale, { channelTitle: string; homeDescription: string }> = {
  zh: {
    channelTitle: `${siteConfig.productName} 文档`,
    homeDescription: siteConfig.description,
  },
  en: {
    channelTitle: `${siteConfig.productName} Documentation`,
    homeDescription:
      'FishXcode is an AI API gateway for developers: one API key for Claude, GPT, Gemini and more, OpenAI-compatible.',
  },
  fr: {
    channelTitle: `Documentation ${siteConfig.productName}`,
    homeDescription:
      "FishXcode est une passerelle d'API IA pour développeurs : une seule clé API pour Claude, GPT, Gemini et plus, compatible OpenAI.",
  },
  ru: {
    channelTitle: `Документация ${siteConfig.productName}`,
    homeDescription:
      'FishXcode — шлюз AI API для разработчиков: один API-ключ для Claude, GPT, Gemini и других, совместимость с OpenAI.',
  },
  ja: {
    channelTitle: `${siteConfig.productName} ドキュメント`,
    homeDescription:
      'FishXcode は開発者向け AI API ゲートウェイ：API キー 1 つで Claude、GPT、Gemini などの主要モデルを利用可能、OpenAI 互換。',
  },
  vi: {
    channelTitle: `Tài liệu ${siteConfig.productName}`,
    homeDescription:
      'FishXcode là cổng API AI dành cho lập trình viên: một API key cho Claude, GPT, Gemini và nhiều hơn nữa, tương thích OpenAI.',
  },
  'zh-TW': {
    channelTitle: `${siteConfig.productName} 文件`,
    homeDescription:
      'FishXcode 是面向開發者的 AI API 中轉聚合平台：一個 API Key 統一呼叫 Claude、GPT、Gemini 等主流大模型，相容 OpenAI 協議。',
  },
};

export async function createRssFeed(lang: Locale): Promise<Response> {
  // 每份 Feed 只收录对应语言的真实翻译，避免外语 Feed 混入回退的中文正文。
  const docItems: FeedItem[] = discoveryPages(lang).map((page) => ({
    title: page.data.title ?? page.url,
    url: new URL(page.url, siteConfig.url).toString(),
    description: page.data.description ?? '',
  }));

  const home: FeedItem = {
    title: COPY[lang].channelTitle,
    url: new URL(localePath(lang, '/'), siteConfig.url).toString(),
    description: COPY[lang].homeDescription,
  };

  // 同 URL 只保留一条
  const uniqueItems = new Map<string, FeedItem>();
  for (const item of [home, ...docItems]) {
    uniqueItems.set(item.url.replace(/\/$/, ''), item);
  }

  // 没有可信的文章发布日期时省略 pubDate；lastBuildDate 仅表示 Feed 的生成时间。
  const items = [...uniqueItems.values()]
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(COPY[lang].channelTitle)}</title>
    <link>${escapeXml(new URL(localePath(lang, '/'), siteConfig.url).toString())}</link>
    <description>${escapeXml(COPY[lang].homeDescription)}</description>
    <language>${HTML_LANG[lang]}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(new URL(localePath(lang, '/rss.xml'), siteConfig.url).toString())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
