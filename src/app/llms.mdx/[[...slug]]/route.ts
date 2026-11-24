import { getDocCanonicalUrl, getLLMText, getPageMarkdownUrl, getResourcePage, source } from '@/lib/source';
import { createHomeMarkdown, getHomeMarkdownUrl } from '@/lib/discovery';
import { DEFAULT_LOCALE, HTML_LANG, isLocale, isTranslatedPage, LOCALES, localePath, type Locale } from '@/lib/i18n';
import { homeSlug } from '@/lib/shared';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * Markdown 副本的统一响应。
 *
 * 静态导出不保留 route handler 设置的响应头：Cloudflare Pages 上由 public/_worker.js
 * 按同样的口径补回；Vercel 上由 vercel.json 补回 Content-Language，Link 头暂未补回。
 * dev 环境的 proxy 不改写副本本体的响应，这里设置的头在 dev 下直接可见。
 */
function markdownResponse(body: string, lang: Locale, canonicalPath: string): Response {
  const canonical = new URL(canonicalPath, siteConfig.url);
  const index = new URL(localePath(lang, '/llms.txt'), siteConfig.url);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Language': HTML_LANG[lang],
      'Link': `<${canonical}>; rel="canonical", <${index}>; rel="describedby"`,
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

/**
 * Markdown 副本，单路由服务全部语言：
 * - zh（默认语言）：/llms.mdx/quickstart/content.md
 * - 其余语言：/llms.mdx/en/quickstart/content.md（语言段在 /llms.mdx 后）
 * - 首页（保留 slug `index`，见 shared.ts 的 homeSlug）：/llms.mdx/[lang/]index/content.md
 *
 * 文档页只为真实翻译的页面生成（generateStaticParams 与 GET 双重判定）；
 * 回退页内容与 zh 完全一致，复用 zh 副本，不产生重复 URL。
 * 首页在每种语言下都是真实内容，逐语言各生成一份。
 */
export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/[[...slug]]'>) {
  const { slug } = await params;
  if (!slug || slug.at(-1) !== 'content.md') notFound();
  let lang: Locale = DEFAULT_LOCALE;
  let slugs = slug.slice(0, -1);
  if (slugs.length && isLocale(slugs[0]) && slugs[0] !== DEFAULT_LOCALE) {
    lang = slugs[0];
    slugs = slugs.slice(1);
  }

  // 首页分支必须先于文档页查表：首页不在 loader 里，按 slug 查会落空
  if (slugs.length === 1 && slugs[0] === homeSlug) {
    return markdownResponse(createHomeMarkdown(lang), lang, localePath(lang, '/'));
  }

  const page = source.getPage(slugs, lang);
  if (!page || !isTranslatedPage(page, lang)) notFound();

  return markdownResponse(await getLLMText(page), lang, getDocCanonicalUrl(page, lang));
}

export function generateStaticParams() {
  const seen = new Set<string>();
  const params: Array<{ slug: string[] }> = [];
  const push = (slug: string[]) => {
    const key = slug.join('/');
    if (seen.has(key)) return;
    seen.add(key);
    params.push({ slug });
  };

  for (const entry of source.getLanguages()) {
    if (!isLocale(entry.language)) continue;
    const lang: Locale = entry.language;
    for (const page of entry.pages) {
      push(getPageMarkdownUrl(getResourcePage(page, lang)).segments);
    }
  }
  // 首页副本：每种语言的首页都是真实内容，各生成一份
  for (const lang of LOCALES) {
    push(getHomeMarkdownUrl(lang).segments);
  }

  return params;
}
