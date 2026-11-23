/**
 * 站点 i18n 的单一事实源：语言清单、URL 拼接、语言探测。
 *
 * URL 策略：
 * - 默认语言 zh 不带前缀（`/quickstart`）；
 * - 其余语言走 `/{lang}/...` 前缀，由 `src/app/{lang}/` 静态路由段承载；
 * - loader 侧对应 `hideLocale: 'default-locale'`（见 src/lib/source.ts）。
 *
 * 新增语言要动五处。第 1、4 两处漏了不会有任何报错，务必逐项核对：
 * 1. 本文件的 LOCALES / LOCALE_ITEMS / HTML_LANG / OG_LOCALE 各加一项
 *    （LOCALE_ITEMS 是数组，漏了只是语言切换器与 hreflang 里静默缺一项）；
 * 2. 各张按语言维护的文案表补一项：translations.ts、home-copy.ts、site-copy.ts、
 *    discovery.ts、rss-feed.ts、content-dates.ts、og.tsx——它们都是
 *    `Record<Locale, …>`，漏了 tsc 会直接报错；
 * 3. 把 `src/app/en/` 复制为 `src/app/{lang}/`，并把其中的 'en' 换成新语言；
 * 4. `public/_worker.js` 的 LOCALES 加上新语言——它是不经打包的纯 JS，无法 import
 *    本文件。漏了线上该语言的首页与未翻译页面拿不到 Markdown 副本，已翻译页面的
 *    Content-Language 也会标成中文；
 * 5. 正文放进 `content/docs/{lang}/`，尚未翻译的页面自动回退显示中文。
 *
 * 其余（sitemap、RSS、llms.txt、hreflang、搜索索引、浏览器语言探测）自动跟随。
 */

export const DEFAULT_LOCALE = 'zh';

/** 顺序即语言切换下拉的展示顺序 */
export const LOCALES = ['zh', 'en', 'fr', 'ru', 'ja', 'vi', 'zh-TW'] as const;

export type Locale = (typeof LOCALES)[number];

/** 语言切换下拉的展示项 */
export const LOCALE_ITEMS: ReadonlyArray<{ name: string; locale: Locale }> = [
  { name: '简体中文', locale: 'zh' },
  { name: 'English', locale: 'en' },
  { name: 'Français', locale: 'fr' },
  { name: 'Русский', locale: 'ru' },
  { name: '日本語', locale: 'ja' },
  { name: 'Tiếng Việt', locale: 'vi' },
  { name: '繁體中文', locale: 'zh-TW' },
];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** <html lang> 与 RSS <language> 用的 BCP 47 标签 */
export const HTML_LANG: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
  fr: 'fr',
  ru: 'ru',
  ja: 'ja',
  vi: 'vi',
  'zh-TW': 'zh-TW',
};

/** openGraph.locale 用的下划线格式 */
export const OG_LOCALE: Record<Locale, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  fr: 'fr_FR',
  ru: 'ru_RU',
  ja: 'ja_JP',
  vi: 'vi_VN',
  'zh-TW': 'zh_TW',
};

/**
 * 站内相对链接按语言拼路径。zh 无前缀；`/` 在其余语言下省略，
 * 避免 `/en//` 这类双斜杠。
 */
export function localePath(lang: Locale, path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LOCALE) return withSlash;
  return withSlash === '/' ? `/${lang}` : `/${lang}${withSlash}`;
}

/** 去掉路径上的语言前缀（zh 页面本就无前缀，原样返回） */
export function stripLocalePrefix(pathname: string): { lang: Locale; path: string } {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length && isLocale(segments[0]) && segments[0] !== DEFAULT_LOCALE) {
    return { lang: segments[0], path: `/${segments.slice(1).join('/')}` };
  }
  return { lang: DEFAULT_LOCALE, path: pathname };
}

/**
 * 该页面是否**真实存在**当前语言的翻译。
 *
 * fumadocs 存储键会剥掉语言目录：zh 文件是 `quickstart`，en 文件是
 * `en/quickstart`；而回退页（en 缺该文件时继承 zh 存储）拿到的仍是
 * zh 的存储键。因此回退页虽然 `locale` 是 en，`path` 却不带 `en/` 前缀。
 * 这是判断"真翻译 vs 回退渲染"的唯一可靠依据。
 */
export function isTranslatedPage(page: { path: string }, lang: Locale): boolean {
  return lang === DEFAULT_LOCALE || page.path.startsWith(`${lang}/`);
}

/**
 * 文档页的 hreflang 互指。
 *
 * ⚠️ 只为**真实存在翻译**的语言生成条目。fumadocs 的 fallbackLanguage 机制
 * 让每个 slug 在全部语言下都有 URL（未翻译时回退渲染中文），若照此无条件
 * 声明全部语言，Google 会忽略语言与内容不符的声明，并把回退页判为重复内容。
 * 语言清单由调用方算好传入（本文件是零依赖纯函数模块，不能反向 import
 * `source.ts` 去查页面索引）。
 *
 * `x-default` 指向中文；若该页尚无中文版（只存在于非默认语言），退回可用
 * 语言中的第一个，保证 x-default 始终落在真实存在的 URL 上。
 */
export function docAlternates(
  slugs: readonly string[],
  translatedLocales: readonly Locale[] = LOCALES,
): Record<string, string> {
  const path = `/${slugs.join('/')}`;

  // 保持 LOCALE_ITEMS 的顺序（即语言切换下拉的顺序），而不是入参顺序
  let available = LOCALE_ITEMS.filter(({ locale }) => translatedLocales.includes(locale));
  // 防御：清单为空（理论上不会发生）时至少保留中文，避免生成空语言簇
  if (available.length === 0) {
    available = LOCALE_ITEMS.filter(({ locale }) => locale === DEFAULT_LOCALE);
  }

  const entry = available.map(({ locale }) => {
    const tag = HTML_LANG[locale];
    return [tag, localePath(locale, path)] as const;
  });

  const xDefault = available.some(({ locale }) => locale === DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : available[0].locale;

  return { ...Object.fromEntries(entry), 'x-default': localePath(xDefault, path) };
}
