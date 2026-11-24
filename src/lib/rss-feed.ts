import { discoveryPages } from './discovery';
import { getPageSummary } from './source';
import { HOME_COPY } from './home-copy';
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

/** Feed 频道名；首页条目的描述与首页同源（home-copy.ts） */
const CHANNEL_TITLE: Record<Locale, string> = {
  zh: `${siteConfig.productName} 文档`,
  en: `${siteConfig.productName} Documentation`,
  fr: `Documentation ${siteConfig.productName}`,
  es: `Documentación de ${siteConfig.productName}`,
  pt: `Documentação do ${siteConfig.productName}`,
  ru: `Документация ${siteConfig.productName}`,
  ja: `${siteConfig.productName} ドキュメント`,
  vi: `Tài liệu ${siteConfig.productName}`,
  'zh-TW': `${siteConfig.productName} 文件`,
};

export async function createRssFeed(lang: Locale): Promise<Response> {
  // 每份 Feed 只收录对应语言的真实翻译，避免外语 Feed 混入回退的中文正文。
  const docItems: FeedItem[] = discoveryPages(lang).map((page) => ({
    title: page.data.title ?? page.url,
    url: new URL(page.url, siteConfig.url).toString(),
    description: getPageSummary(page),
  }));

  const home: FeedItem = {
    title: CHANNEL_TITLE[lang],
    url: new URL(localePath(lang, '/'), siteConfig.url).toString(),
    description: HOME_COPY[lang].description,
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
    <title>${escapeXml(CHANNEL_TITLE[lang])}</title>
    <link>${escapeXml(new URL(localePath(lang, '/'), siteConfig.url).toString())}</link>
    <description>${escapeXml(HOME_COPY[lang].description)}</description>
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
