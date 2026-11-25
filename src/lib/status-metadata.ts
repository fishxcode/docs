import type { Metadata } from 'next';
import { docAlternates, localePath, LOCALES, OG_LOCALE, type Locale } from './i18n';
import { siteConfig } from './site';
import { statusText, type StatusVars } from './status-copy';

/**
 * 状态页的元数据工厂。
 *
 * 总览、厂商系列、单模型三套路由在所有语言下都真实存在，
 * 因此 hreflang 覆盖全部语言，不套用文档页的「未翻译回退」规则。
 */
export function statusMetadata(
  lang: Locale,
  slugs: readonly string[],
  titleSource: string,
  descriptionSource: string,
  vars?: StatusVars,
): Metadata {
  const title = statusText(lang, titleSource, vars);
  const description = statusText(lang, descriptionSource, vars);
  const path = `/${slugs.join('/')}`;
  const url = localePath(lang, path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: docAlternates(slugs, LOCALES),
    },
    openGraph: {
      type: 'article',
      title: `${title} | ${siteConfig.productName}`,
      description,
      url,
      locale: OG_LOCALE[lang],
    },
  };
}
