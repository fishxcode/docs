import { getLLMText, getPageMarkdownUrl, getPageSummary, source } from './source';
import { HOME_COPY, HOME_START_PATH } from './home-copy';
import { SITE_COPY } from './site-copy';
import { docsContentRoute, homeSlug, joinRoute } from './shared';
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  LOCALE_ITEMS,
  isTranslatedPage,
  localePath,
  type Locale,
} from './i18n';
import { siteConfig } from './site';

/**
 * 面向机器的内容入口，按语言输出：llms.txt 索引（/llms.txt 与 /en/llms.txt）、
 * 全文（llms-full.txt）与首页的 Markdown 副本。
 *
 * 只收录真实翻译的页面：loader 的 fallbackLanguage 会让每个 slug 在全部
 * 语言下都有页面（未翻译时回退渲染中文正文），照单全收会让外语 llms.txt
 * 混入中文内容，AI 消费时语言标签与正文不符。
 */

/** 每种语言的站点名与 llms 开头说明。新增语言时补一行。 */
const COPY: Record<
  Locale,
  { title: string; intro: string; fullIntro: string; indexLabel: string }
> = {
  zh: {
    title: `${siteConfig.productName} 文档`,
    intro:
      `${siteConfig.productName} 是 AI Coding 中转站，支持 Claude、Codex 模型在多种平台使用。本索引列出全部文档页的 Markdown 副本。`,
    fullIntro: '下方是全部文档页的完整 Markdown 正文。',
    indexLabel: '索引',
  },
  en: {
    title: `${siteConfig.productName} Documentation`,
    intro:
      `${siteConfig.productName} is an AI Coding relay for using Claude and Codex models across multiple platforms. This index lists a Markdown copy of every docs page.`,
    fullIntro: 'The full Markdown body of every docs page follows.',
    indexLabel: 'Index',
  },
  fr: {
    title: `${siteConfig.productName} Documentation`,
    intro:
      `${siteConfig.productName} est un relais AI Coding pour utiliser les modèles Claude et Codex sur plusieurs plateformes. Cet index répertorie une copie Markdown de chaque page.`,
    fullIntro: 'Le corps Markdown complet de chaque page de documentation suit.',
    indexLabel: 'Index',
  },
  ru: {
    title: `Документация ${siteConfig.productName}`,
    intro:
      `${siteConfig.productName} — шлюз для AI Coding: модели Claude и Codex на разных платформах. В этом индексе перечислены Markdown-копии всех страниц.`,
    fullIntro: 'Ниже — полный Markdown-текст каждой страницы документации.',
    indexLabel: 'Индекс',
  },
  ja: {
    title: `${siteConfig.productName} ドキュメント`,
    intro:
      `${siteConfig.productName} は AI Coding 中継サービスです。Claude・Codex のモデルをさまざまなプラットフォームで利用できます。このインデックスは全ドキュメントページの Markdown コピーを列挙します。`,
    fullIntro: '以下に各ドキュメントページの完全な Markdown 本文を示します。',
    indexLabel: 'インデックス',
  },
  vi: {
    title: `Tài liệu ${siteConfig.productName}`,
    intro:
      `${siteConfig.productName} là trạm trung chuyển AI Coding, giúp dùng các mô hình Claude và Codex trên nhiều nền tảng. Chỉ mục này liệt kê bản sao Markdown của mọi trang tài liệu.`,
    fullIntro: 'Nội dung Markdown đầy đủ của mỗi trang tài liệu nằm bên dưới.',
    indexLabel: 'Chỉ mục',
  },
  'zh-TW': {
    title: `${siteConfig.productName} 文件`,
    intro:
      `${siteConfig.productName} 是 AI Coding 中轉站，支援 Claude、Codex 模型在多種平台使用。本索引列出全部文件頁的 Markdown 副本。`,
    fullIntro: '下方是全部文件頁的完整 Markdown 正文。',
    indexLabel: '索引',
  },
};

export function discoveryTitle(lang: Locale): string {
  return COPY[lang].title;
}

/** 只收录真实翻译，避免外语资源混入 loader 自动回退的中文正文。 */
export function discoveryPages(lang: Locale) {
  return source.getPages(lang).filter((page) => isTranslatedPage(page, lang));
}

function markdownText(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/[\\[\]]/g, '\\$&');
}

function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString().replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/** llms 索引与首页副本共用的页面条目：标题链到该页的 Markdown 副本，后接一句描述。 */
function pageEntry(page: (typeof source)['$inferPage']): string {
  const summary = getPageSummary(page);
  // 摘要在页面既无描述、正文又没有文字段落时会退回标题，这时不必再重复一遍
  const description = summary === page.data.title ? '' : `: ${markdownText(summary)}`;
  return `- [${markdownText(page.data.title)}](${absoluteUrl(getPageMarkdownUrl(page).url)})${description}`;
}

function textResponse(body: string, lang: Locale): Response {
  return new Response(`${body}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': HTML_LANG[lang],
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

/**
 * 页面按顶层目录分组，目录名取该语言 `meta.json` 的 folder title——
 * 即侧边栏上用户看到的目录名，天然多语言，无需维护第二套翻译。
 * 不属于任何目录的顶层页面进「Pages」组。
 */
function groupPages(lang: Locale) {
  const groups = new Map<string, string[]>();
  const tree = source.getPageTree(lang);

  // folder 的 name 是 meta.json 的 title（侧边栏显示名），与目录 slug 无对应
  // 关系，所以按树形结构做「页面 URL → 所在目录显示名」映射。
  const pageTopic = new Map<string, string>();
  for (const node of tree.children) {
    if (node.type !== 'folder') continue;
    for (const child of node.index ? [node.index, ...node.children] : node.children) {
      if (child.type === 'page' && typeof node.name === 'string') {
        pageTopic.set(child.url, node.name);
      }
    }
  }

  for (const page of discoveryPages(lang)) {
    const topic = pageTopic.get(page.url) ?? 'Pages';
    const entries = groups.get(topic) ?? [];
    entries.push(pageEntry(page));
    groups.set(topic, entries);
  }

  return groups;
}

export function createLlmsIndex(lang: Locale): Response {
  const groups = groupPages(lang);

  const resources = [
    `- [${lang === DEFAULT_LOCALE ? '完整文档（单文件）' : 'Full documentation (single file)'}](${absoluteUrl(localePath(lang, '/llms-full.txt'))})`,
    `- [Sitemap](${absoluteUrl('/sitemap.xml')})`,
    `- [RSS](${absoluteUrl(localePath(lang, '/rss.xml'))})`,
    ...LOCALE_ITEMS.map(
      ({ name, locale }) => `- [${name}](${absoluteUrl(localePath(locale, '/llms.txt'))})`,
    ),
  ];

  return textResponse(
    [
      `# ${discoveryTitle(lang)}`,
      `> ${COPY[lang].intro}`,
      ...[...groups].map(([topic, entries]) => `## ${topic}\n\n${entries.join('\n')}`),
      `## Optional\n\n${resources.join('\n')}`,
    ].join('\n\n'),
    lang,
  );
}

export async function createLlmsFull(lang: Locale): Promise<Response> {
  const pages = await Promise.all(discoveryPages(lang).map((page) => getLLMText(page)));
  return textResponse(
    [
      `# ${discoveryTitle(lang)}`,
      `> ${COPY[lang].intro}`,
      COPY[lang].fullIntro,
      `[${COPY[lang].indexLabel}](${absoluteUrl(localePath(lang, '/llms.txt'))})`,
      pages.join('\n\n---\n\n'),
    ].join('\n\n'),
    lang,
  );
}

/** 首页 Markdown 副本的路径段与地址：zh 为 /llms.mdx/index/content.md，其余语言在后面多一个语言段。 */
export function getHomeMarkdownUrl(lang: Locale) {
  const segments = [...(lang === DEFAULT_LOCALE ? [] : [lang]), homeSlug, 'content.md'];

  return { segments, url: joinRoute(docsContentRoute, segments) };
}

/**
 * 首页的 Markdown 副本：供 Accept: text/markdown 协商使用（/ 与 /{lang}，
 * 映射规则见 public/_worker.js 与 src/proxy.ts）。
 *
 * 首页是 React 组件而不是 .mdx 文档，进不了 docs loader，所以副本在这里按
 * 首页的可见文案拼装：标题、描述、两个按钮、特性卡片，再附该语言的文档页清单
 * 与机器可读资源。文案同源于 home-copy.ts，页面改了副本自动跟随。
 */
export function createHomeMarkdown(lang: Locale): string {
  const copy = HOME_COPY[lang];
  const at = (path: string) => absoluteUrl(localePath(lang, path));
  const link = (label: string, path: string) => `- [${label}](${at(path)})`;

  return [
    `# ${copy.title}`,
    '',
    `> ${copy.description}`,
    '',
    // 与首页的两个按钮一一对应
    `- [${copy.register}](${siteConfig.links.register})`,
    link(copy.docs, HOME_START_PATH),
    '',
    ...copy.features.map((feature) => `- **${feature.title}** — ${feature.details}`),
    '',
    `## ${SITE_COPY[lang].docs}`,
    '',
    ...discoveryPages(lang).map(pageEntry),
    '',
    `## ${SITE_COPY[lang].resources}`,
    '',
    link('llms.txt', '/llms.txt'),
    link('llms-full.txt', '/llms-full.txt'),
    link('RSS', '/rss.xml'),
    `- [sitemap.xml](${absoluteUrl('/sitemap.xml')})`,
  ].join('\n');
}
