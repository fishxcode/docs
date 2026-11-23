import type { MetadataRoute } from 'next';
import { getTranslatedLocales, source } from '@/lib/source';
import { getContentDates, getRepoDates } from '@/lib/content-dates';
import {
  docAlternates,
  isLocale,
  isTranslatedPage,
  LOCALES,
  localePath,
  type Locale,
} from '@/lib/i18n';
import { siteConfig } from '@/lib/site';
import { HOME_COPY_SOURCE } from '@/lib/home-copy';

/** XML 站点地图不会应用 metadataBase，语言版本地址必须显式转为绝对 URL。 */
function absoluteAlternates(slugs: readonly string[], locales: readonly Locale[] = LOCALES) {
  return Object.fromEntries(
    Object.entries(docAlternates(slugs, locales)).map(([lang, path]) => [
      lang,
      new URL(path, siteConfig.url).toString(),
    ]),
  );
}

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * 首页没有 MDX 源文件，它变不变取决于首页文案文件。取该文件的提交时间：
   * 改了文案就是内容更新，没改就沿用上次的日期。页面上的「最近更新」
   * 读的也是同一个文件，两处不会对同一次更新给出不同日期。
   */
  const homeLastModified = getRepoDates(HOME_COPY_SOURCE)?.modified;
  const homeEntries: MetadataRoute.Sitemap = LOCALES.map((lang) => ({
    url: new URL(localePath(lang, '/'), siteConfig.url).toString(),
    ...(homeLastModified ? { lastModified: homeLastModified } : {}),
    changeFrequency: 'weekly' as const,
    priority: 1,
    alternates: { languages: absoluteAlternates([]) },
  }));

  /**
   * 文档页按语言展开，每条带 hreflang 语言簇；zh 条目的 URL 本就无前缀。
   *
   * 未翻译的回退页（`/{lang}/xxx` 渲染的还是中文）不单独收录：它的 canonical
   * 已指向中文版，收录只会浪费抓取预算，并在 Search Console 里堆出大量
   * "已提交但未被选为规范页"。真实翻译页才作为该语言的独立条目出现。
   */
  const docPages: MetadataRoute.Sitemap = source.getLanguages().flatMap((entry) => {
    if (!isLocale(entry.language)) return [];
    const lang = entry.language;

    return entry.pages
      .filter((page) => isTranslatedPage(page, lang))
      .map((page) => {
        // 逐页真实提交时间；拿不到就省略该字段，不用构建时间冒充内容更新
        const dates = getContentDates(page.path);

        return {
          url: new URL(page.url, siteConfig.url).toString(),
          ...(dates ? { lastModified: dates.modified } : {}),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          alternates: {
            languages: absoluteAlternates(page.slugs, getTranslatedLocales(page.slugs)),
          },
        };
      });
  });

  const entries: MetadataRoute.Sitemap = [...homeEntries, ...docPages];

  // 存在 / 与 /introduction 等指向同一内容的情况，统一去重
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const normalized = entry.url.replace(/\/$/, '');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
