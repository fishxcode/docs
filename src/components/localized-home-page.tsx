import Link from 'next/link';
import type { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AppI18nProvider } from '@/components/app-i18n-provider';
import { SiteStructuredData } from '@/components/doc-structured-data';
import { SiteFooter } from '@/components/site-footer';
import { docAlternates, localePath, OG_LOCALE, type Locale } from '@/lib/i18n';
import { getRepoDates } from '@/lib/content-dates';
import { getHomeMarkdownUrl } from '@/lib/discovery';
import { machineResourceTypes } from '@/lib/machine-resources';
import { HOME_COPY, HOME_COPY_SOURCE, HOME_START_PATH, getHomeImage } from '@/lib/home-copy';
import { siteConfig } from '@/lib/site';

/**
 * 各语言首页的路由工厂（与 localized-doc-page 同一模式）。
 *
 * 语言目录是静态段（src/app/{lang}/(home)/page.tsx），语言在工厂里闭包
 * 固定，路由文件只做薄壳转发。外壳（语言上下文 + HomeLayout）也收在这里，
 * 各语言无需再各放一份 (home)/layout.tsx。
 * 文案表见 src/lib/home-copy.ts，新增语言补一行。
 */
export function createLocalizedHomePage(lang: Locale) {
  return {
    generateMetadata(): Metadata {
      const copy = HOME_COPY[lang];
      // og 路由为每种语言的首页各渲染一张分享图（zh /og/home/image.png，
      // 其余 /og/{lang}/home/image.png），lang 在工厂里闭包，每种语言拿自己那张
      const image = getHomeImage(lang);

      return {
        // absolute：根布局的标题模板会拼成「FishXcode 文档 | FishXcode」，首页自带站名无需再套
        title: { absolute: copy.title },
        description: copy.description,
        alternates: {
          // 首页在每个语言下都是真实内容（非回退），语言簇覆盖全部语言
          canonical: localePath(lang, '/'),
          languages: docAlternates([]),
          types: {
            ...machineResourceTypes(lang),
            // 首页的 Markdown 副本：Accept: text/markdown 访问首页时拿到的就是这一份
            'text/markdown': [{ url: getHomeMarkdownUrl(lang).url, title: `${copy.title} · Markdown` }],
          },
        },
        // 页面一旦定义 openGraph / twitter，Next 会整体替换根布局的同名字段
        // （不逐项合并），所以这里必须写全，不能指望继承根布局的兜底值
        openGraph: {
          type: 'website',
          locale: OG_LOCALE[lang],
          url: localePath(lang, '/'),
          siteName: siteConfig.name,
          title: copy.title,
          description: copy.description,
          images: [image],
        },
        twitter: {
          card: 'summary_large_image',
          title: copy.title,
          description: copy.description,
          images: [image],
        },
      };
    },

    Page() {
      const copy = HOME_COPY[lang];
      // 首页可见文案全部来自 home-copy.ts，它就是"决定首页内容的文件"；
      // sitemap 的首页 lastmod 也取它（HOME_COPY_SOURCE），两处同源
      const lastModified = getRepoDates(HOME_COPY_SOURCE)?.modified;

      return (
        <AppI18nProvider lang={lang}>
          {/* 站点级 JSON-LD（Organization / WebSite / SoftwareApplication）按页面语言输出，
              url 与 inLanguage 跟随语言版本。HomeLayout 的根节点是 flex-1 的 <main>，
              页脚因此贴在短页面的底部 */}
          <SiteStructuredData lang={lang} />
          {/* 告诉机器客户端：本站的 llms.txt 在哪（文档页有同样的声明） */}
          <link rel="describedby" type="text/plain" href={localePath(lang, '/llms.txt')} />
          <HomeLayout {...baseOptions()}>
            <div className="flex flex-col justify-center flex-1 px-6 py-24">
              <div className="mx-auto w-full max-w-3xl text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-5">{copy.title}</h1>
                <p className="text-lg text-fd-muted-foreground mb-10">{copy.description}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href={localePath(lang, HOME_START_PATH)}
                    className="rounded-lg bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground transition-colors hover:opacity-90"
                  >
                    {copy.start}
                  </Link>
                  <a
                    href={siteConfig.productUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-lg border border-fd-border px-6 py-3 font-medium transition-colors hover:bg-fd-accent"
                  >
                    {copy.console}
                  </a>
                </div>
                {lastModified ? (
                  <p className="mt-16 text-xs text-fd-muted-foreground">
                    {copy.updated}
                    {lastModified.slice(0, 10)}
                  </p>
                ) : null}
              </div>
            </div>
          </HomeLayout>
          <SiteFooter lang={lang} />
        </AppI18nProvider>
      );
    },
  };
}
