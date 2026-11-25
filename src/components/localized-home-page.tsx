import type { Metadata } from 'next';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AppI18nProvider } from '@/components/app-i18n-provider';
import { SiteStructuredData } from '@/components/doc-structured-data';
import { SiteFooter } from '@/components/site-footer';
import { SupportWidget } from '@/components/support-widget';
import { getHeroCodeTabs } from '@/components/home/code-samples';
import {
  BottomCta,
  ClientsSection,
  HeroSection,
  PricingSection,
  ProvidersStrip,
  ReliabilitySection,
  StatsSection,
  StepsSection,
  WhySection,
} from '@/components/home/sections';
import { docAlternates, localePath, OG_LOCALE, type Locale } from '@/lib/i18n';
import { getRepoDates } from '@/lib/content-dates';
import { getHomeMarkdownUrl } from '@/lib/discovery';
import { machineResourceTypes } from '@/lib/machine-resources';
import { HOME_COPY, HOME_COPY_SOURCE, HOME_PAGE_COPY, getHomeImage } from '@/lib/home-copy';
import { HOME_REDESIGN_COPY } from '@/lib/home-redesign-copy';
import { siteConfig } from '@/lib/site';

/**
 * 各语言首页的路由工厂（与 localized-doc-page 同一模式）。
 *
 * 语言目录是静态段（src/app/{lang}/(home)/page.tsx），语言在工厂里闭包
 * 固定，路由文件只做薄壳转发。外壳（语言上下文 + HomeLayout）也收在这里，
 * 各语言无需再各放一份 (home)/layout.tsx。
 * 区块组件在 src/components/home/，文案与业务数据都在 src/lib/home-copy.ts，新增语言补一项。
 */
export function createLocalizedHomePage(lang: Locale) {
  return {
    generateMetadata(): Metadata {
      const copy = HOME_COPY[lang];
      // og 路由为每种语言的首页各渲染一张分享图（zh /og/home/image.png，
      // 其余 /og/{lang}/home/image.png），lang 在工厂里闭包，每种语言拿自己那张
      const image = getHomeImage(lang);

      return {
        // absolute：首页标题本身已含站名，不再套用根布局的「xxx | 站名」模板
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

    async Page() {
      const shared = HOME_COPY[lang];
      const copy = HOME_PAGE_COPY[lang];
      const redesign = HOME_REDESIGN_COPY[lang];
      const codeTabs = await getHeroCodeTabs();
      // 首页可见内容全部来自 home-copy.ts，它就是「决定首页内容的文件」；
      // sitemap 的首页 lastmod 也取它（HOME_COPY_SOURCE），两处同源
      const lastModified = getRepoDates(HOME_COPY_SOURCE)?.modified;
      const sectionProps = { lang, shared, copy };

      return (
        <AppI18nProvider lang={lang}>
          {/* 站点级 JSON-LD（Organization / WebSite / SoftwareApplication）按页面语言输出，
              url 与 inLanguage 跟随语言版本 */}
          <SiteStructuredData lang={lang} />
          {/* 告诉机器客户端：本站的 llms.txt 在哪（文档页有同样的声明） */}
          <link rel="describedby" type="text/plain" href={localePath(lang, '/llms.txt')} />
          {/* HomeLayout 的根节点就是 flex-1 的 <main>，区块直接放进去；页脚因此贴在短页面的底部 */}
          <HomeLayout {...baseOptions(lang)}>
            <div className="home-motion flex flex-1 flex-col">
              <HeroSection {...sectionProps} redesign={redesign} codeTabs={codeTabs} />
              <StatsSection redesign={redesign} />
              <ReliabilitySection lang={lang} redesign={redesign} />
              <ProvidersStrip {...sectionProps} />
              <WhySection {...sectionProps} />
              <PricingSection {...sectionProps} />
              <ClientsSection {...sectionProps} lastModified={lastModified} />
              <StepsSection {...sectionProps} />
              <BottomCta {...sectionProps} />
            </div>
          </HomeLayout>
          <SiteFooter lang={lang} />
          {/* 在线客服只在首页：页面加载完、浏览器空闲时才加载 SDK，嵌在 iframe 里时不加载 */}
          <SupportWidget />
        </AppI18nProvider>
      );
    },
  };
}
