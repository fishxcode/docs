import { posix } from 'node:path';
import { createElement, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { icons, type LucideIcon } from 'lucide-react';
import { loader, type LoaderPlugin } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { siteConfig } from './site';
import { machineResourceTypes } from './machine-resources';
import {
  docsContentRoute,
  docsImageRoute,
  docsRoute,
  joinRoute,
} from './shared';
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  isLocale,
  isTranslatedPage,
  localePath,
  OG_LOCALE,
  docAlternates,
  LOCALES,
  stripLocalePrefix,
  type Locale,
} from './i18n';

/** loader 里一个文档页的类型；本文件内各处统一用它，不再重复推导 */
type DocPage = (typeof source)['$inferPage'];

const docs = defineDocs({
  // 必须是字符串字面量：fumadocs-mdx 宏在转译期静态读取 dir（决定内容文件如何打包），
  // 传 import 进来的常量会直接报错，且 tsc / oxlint 都查不出来。
  // 值必须与 shared.ts 的 contentDir 一致——git 日期与「在 GitHub 上编辑」用的是那一处。
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      // Markdown 副本由语法树序列化而来（见 llm-markdown.ts），需要把语法树带进产物；
      // 源文件的行列坐标副本用不到，去掉可以减小产物体积。
      includeProcessedMarkdown: false,
      includeMDAST: { removePosition: true },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * 图标名 → 渲染节点，两种写法混用：
 * - 图片路径（/icons/xxx.png、https://…）渲染为 <img>，与 lucide 图标同尺寸；
 * - 其余按 lucide-react 的图标名解析（PascalCase，如 `Rocket`）。
 *
 * ⚠️ lucide v1 停用了一批旧图标名（如 BarChart3 → ChartColumn），旧名不在 `icons`
 * 映射表里，写错会静默丢图标，所以对解析不了的名字打一条构建日志。
 */
function resolveIcon(icon?: string) {
  if (!icon) return undefined;

  if (icon.startsWith('/') || icon.startsWith('http')) {
    return createElement('img', {
      // 侧边栏把图标节点混进列表渲染，缺 key 会报 React 警告
      key: 'icon',
      src: icon,
      alt: '',
      width: 16,
      height: 16,
      // logo 比例各异，用 contain 避免拉伸
      className: 'size-4 shrink-0 rounded-[3px] object-contain',
    });
  }

  const Icon: LucideIcon | undefined = icons[icon as keyof typeof icons];
  if (!Icon) {
    console.warn(`[icons] 无法解析的图标：${icon}（既不是图片路径，也不是 lucide 图标名）`);
    return undefined;
  }
  return createElement(Icon, { key: 'icon' });
}

/**
 * 与 fumadocs 内置的 lucideIconsPlugin 等价，另外支持图片路径。
 * file / folder / separator 三种节点都带可选的 icon，处理方式一致。
 */
function mixedIconsPlugin(): LoaderPlugin {
  const replace = <T extends { icon?: ReactNode }>(node: T): T => {
    if (node.icon === undefined || typeof node.icon === 'string') {
      node.icon = resolveIcon(node.icon as string | undefined);
    }
    return node;
  };

  return {
    name: 'fishxcode:mixed-icons',
    transformPageTree: { file: replace, folder: replace, separator: replace },
  };
}

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  i18n: {
    languages: [...LOCALES],
    defaultLanguage: DEFAULT_LOCALE,
    // SSR 没有 middleware，hideLocale 的 rewrite 不可用；这里只影响
    // URL 拼接：默认语言不带前缀（/quickstart），其余 /{lang}/quickstart。
    hideLocale: 'default-locale',
    // parser 'dir'：content/docs/{lang}/ 目录即对应语言，顶层文件归默认语言 zh
    parser: 'dir',
    fallbackLanguage: DEFAULT_LOCALE,
  },
  plugins: [mixedIconsPlugin()],
});

/** 资源路径段：非默认语言带语言前缀，其后与页面 slug 一致，以文件名收尾。 */
function resourceSegments(page: DocPage, filename: string): string[] {
  const langPrefix = page.locale && page.locale !== DEFAULT_LOCALE ? [page.locale] : [];
  return [...langPrefix, ...page.slugs, filename];
}

export function getPageImageUrl(page: DocPage) {
  // 语言段放在静态前缀 /og 之后：/og/en/quickstart/image.png。
  // 扩展名必须是真实格式（PNG），部分抓取器按后缀决定是否渲染缩略图。
  // 静态段路由优先级高于根 catch-all，不会像根级 [lang] 那样吞掉 zh 的
  // 无前缀 URL；zh（默认语言）不带语言段。
  const segments = resourceSegments(page, 'image.png');

  return { segments, url: joinRoute(docsImageRoute, segments) };
}

/** Markdown 副本地址：/llms.mdx/en/quickstart/content.md，规则同分享图。 */
export function getPageMarkdownUrl(page: DocPage) {
  const segments = resourceSegments(page, 'content.md');

  return { segments, url: joinRoute(docsContentRoute, segments) };
}

/**
 * 回退页的 og 图与 Markdown 副本沿用 zh 版：/[lang]/og、/[lang]/llms.mdx
 * 只为真实翻译的页面生成静态参数，回退页若直接用 page.url 会指向不存在的
 * 路由（内容与 zh 完全一致，指向 zh 资源没有任何损失）。
 */
export function getResourcePage(page: DocPage, lang: Locale) {
  if (isTranslatedPage(page, lang)) return page;
  // fallbackLanguage 机制保证默认语言必有同 slug 页面；?? page 仅作类型兜底
  return source.getPage(page.slugs) ?? page;
}

/**
 * slug → 真实存在翻译的语言清单（不含回退语言）。
 *
 * 只在这里查页面索引：`i18n.ts` 是零依赖纯函数模块，不能反向 import 本文件，
 * 所以 hreflang 的语言清单必须由这一侧算好后传给 `docAlternates`。
 * sitemap 会对同一 slug 反复求值（每个语言各一次），故做一层缓存。
 */
const translatedLocaleCache = new Map<string, Locale[]>();

export function getTranslatedLocales(slugs: readonly string[]): Locale[] {
  const key = slugs.join('/');
  const cached = translatedLocaleCache.get(key);
  if (cached) return cached;

  const languages = LOCALES.filter((lang) => {
    const page = source.getPage([...slugs], lang);
    // 回退页的 path 仍是 zh 源文件路径，isTranslatedPage 据此判定
    return page ? isTranslatedPage(page, lang) : false;
  });

  translatedLocaleCache.set(key, languages);
  return languages;
}

/** 该 slug 在默认语言下的 URL；回退页的 canonical 指回这里 */
function defaultLocaleUrl(slugs: readonly string[]): string {
  const path = slugs.length > 0 ? `/${slugs.join('/')}` : '/';
  return localePath(DEFAULT_LOCALE, path);
}

/** metadata 共用规范地址，回退正文归属默认语言。 */
export function getDocCanonicalUrl(
  page: DocPage,
  lang: Locale,
): string {
  return isTranslatedPage(page, lang) ? page.url : defaultLocaleUrl(page.slugs);
}

/** 文档页独立生成分享信息，避免继承首页的 Twitter 文案与图片。 */
export function docPageMetadata(
  page: DocPage,
  lang: Locale,
): Metadata {
  const contentLocale = isTranslatedPage(page, lang) ? lang : DEFAULT_LOCALE;
  const canonical = getDocCanonicalUrl(page, lang);
  const description = page.data.description?.trim() || page.data.title;
  const title = `${page.data.title} | ${siteConfig.productName}`;
  const image = {
    url: getPageImageUrl(getResourcePage(page, lang)).url,
    width: 1200,
    height: 630,
    // 显式声明类型：微信等抓取器不总能从 URL 推断，缺 type 时可能拒绝预取
    type: 'image/png',
    alt: page.data.title,
  };

  return {
    title: page.data.title,
    description,
    alternates: {
      /**
       * 回退页（`/{lang}/xxx` 渲染中文）不是独立内容：canonical 指回中文版，
       * 否则 Google 会在 `/xxx` 与 `/en/xxx` 之间自行挑选 canonical，结果不可控。
       * 真实翻译页自指，声明"这就是该语言的正式版本"。
       */
      canonical,
      types: {
        ...machineResourceTypes(lang),
        // 本页的 Markdown 副本；回退页没有自己语言的副本，与正文一样指向 zh 的那一份
        'text/markdown': [
          {
            url: getPageMarkdownUrl(getResourcePage(page, lang)).url,
            title: `${page.data.title} · Markdown`,
          },
        ],
      },
      languages: docAlternates(page.slugs, getTranslatedLocales(page.slugs)),
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: OG_LOCALE[contentLocale],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

/**
 * 文档里的站内链接 → 规范绝对 URL。
 *
 * Markdown 副本会被拼进 llms-full.txt、被各种 AI 客户端摘录，`./quickstart` 这种
 * 相对链接脱离了原位置就无从解析。站内链接一律解析成目标页的规范地址（回退页
 * 落到默认语言版本），查询参数与锚点原样保留；站外链接不动。
 */
function resolveMachineLink(href: string, page: DocPage, lang: Locale): string {
  // 带协议（http:、mailto:）或协议相对（//）的是站外链接
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return href;

  const canonical = new URL(getDocCanonicalUrl(page, lang), siteConfig.url);
  const resolved = new URL(href, canonical);
  const pathname = href.split(/[?#]/, 1)[0];
  // loader 的相对文件索引不含语言目录，page.path 则保留真实源文件路径
  const virtualPath =
    lang !== DEFAULT_LOCALE && page.path.startsWith(`${lang}/`)
      ? page.path.slice(lang.length + 1)
      : page.path;
  const targetLanguage = stripLocalePrefix(resolved.pathname).lang;
  const target = pathname.startsWith('./') || pathname.startsWith('../')
    ? source.getPageByHref(pathname, { dir: posix.dirname(virtualPath), language: lang })
    : source.getPageByHref(resolved.pathname, { language: targetLanguage });
  // 不是指向文档页的链接（静态文件、站外路径）：按页面地址解析后原样输出
  if (!target) return resolved.toString();

  const targetLocale = isLocale(target.page.locale ?? '')
    ? (target.page.locale as Locale)
    : DEFAULT_LOCALE;
  const url = new URL(getDocCanonicalUrl(target.page, targetLocale), siteConfig.url);
  url.search = resolved.search;
  url.hash = resolved.hash;
  return url.toString();
}

/**
 * 输出带规范来源、正文语言与摘要的可引用文本：每页的 Markdown 副本
 * （/llms.mdx/...）与 llms-full.txt 的正文都来自这里。
 *
 * 正文由文档的语法树序列化（见 llm-markdown.ts），其中的站内链接已改写成
 * 规范绝对 URL。回退页取默认语言那一份的正文——页面渲染的也是它。
 */
export async function getLLMText(page: DocPage) {
  const requestedLocale = isLocale(page.locale ?? '') ? (page.locale as Locale) : DEFAULT_LOCALE;
  const lang = isTranslatedPage(page, requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const resourcePage = getResourcePage(page, requestedLocale);
  // 序列化器只在机器文本的请求里加载，普通页面的服务端包不必带上 mdast 依赖
  const { readableMarkdown } = await import('./llm-markdown');
  const body = readableMarkdown(await resourcePage.data.getMDAST(), (href) =>
    resolveMachineLink(href, resourcePage, lang),
  );
  const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

  return [
    `# ${singleLine(page.data.title)}`,
    `URL: ${new URL(getDocCanonicalUrl(page, requestedLocale), siteConfig.url)}`,
    `Language: ${HTML_LANG[lang]}`,
    ...(page.data.description?.trim() ? [`> ${singleLine(page.data.description)}`] : []),
    body,
  ].join('\n\n');
}
