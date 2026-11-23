import { getPageImageUrl, getResourcePage, source } from '@/lib/source';
import { DEFAULT_LOCALE, LOCALES, isLocale, isTranslatedPage, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'takumi-js/response';
import { OgCard, getOgFonts } from '@/lib/og';
import { HOME_COPY } from '@/lib/home-copy';

export const dynamic = 'force-static';

/**
 * 文档页分享图，单路由服务全部语言：
 * - zh（默认语言）：/og/quickstart/image.png
 * - 其余语言：/og/en/quickstart/image.png（语言段由 getPageImageUrl 放在 /og 后）
 * - 首页分享图：/og/home/image.png
 *
 * generateStaticParams 只为 zh 与真实翻译的页面生成——回退页内容与 zh
 * 完全一致，复用 zh 的分享图（getResourcePage 归一到 zh 页），避免 OG 图
 * 数量随语言数翻倍；slug 以 join 后去重。
 */
export async function GET(_req: Request, { params }: RouteContext<'/og/[...slug]'>) {
  const { slug } = await params;
  let lang: Locale = DEFAULT_LOCALE;
  let slugs = slug.slice(0, -1);
  if (slugs.length && isLocale(slugs[0]) && slugs[0] !== DEFAULT_LOCALE) {
    lang = slugs[0];
    slugs = slugs.slice(1);
  }

  if (slug[slug.length - 1] !== 'image.png') notFound();

  // 首页分享图：/og/home/image.png 与 /og/{lang}/home/image.png
  if (slugs.length === 1 && slugs[0] === 'home') {
    return new ImageResponse(
      <OgCard locale={lang} title={HOME_COPY[lang].title} description={HOME_COPY[lang].description} />,
      {
        width: 1200,
        height: 630,
        // PNG 一为兼容微信/IM 卡片渲染（WebP 常被丢弃），二为让 URL 带可识别的扩展名
        format: 'png',
        // takumi 不读系统字体，CJK 字形必须显式注册
        fonts: await getOgFonts(lang),
      },
    );
  }

  const page = source.getPage(slugs, lang);
  if (!page) notFound();

  /*
   * 回退页（en 缺翻译时渲染的其实是 zh 正文）必须用 zh 的内容与字体：
   * getResourcePage 归一到 zh 页，否则卡片会拿 en 的字体去渲染中文标题。
   */
  const contentLocale = isTranslatedPage(page, lang) ? lang : DEFAULT_LOCALE;
  const content = getResourcePage(page, lang);
  const title = content.data.title;

  return new ImageResponse(
    <OgCard locale={contentLocale} title={title} description={content.data.description} />,
    {
      width: 1200,
      height: 630,
      format: 'png',
      fonts: await getOgFonts(contentLocale),
    },
  );
}

export function generateStaticParams() {
  const seen = new Set<string>();
  const params: Array<{ slug: string[] }> = [];

  // 首页分享图：每种语言的首页都有真实内容，全部生成
  params.push({ slug: ['home', 'image.png'] });
  for (const locale of LOCALES) {
    if (locale !== DEFAULT_LOCALE) params.push({ slug: [locale, 'home', 'image.png'] });
  }

  for (const entry of source.getLanguages()) {
    if (!isLocale(entry.language)) continue;
    const lang: Locale = entry.language;
    for (const page of entry.pages) {
      const slug = getPageImageUrl(getResourcePage(page, lang)).segments;
      const key = slug.join('/');
      if (seen.has(key)) continue;
      seen.add(key);
      params.push({ slug });
    }
  }

  return params;
}
