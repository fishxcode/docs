import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { siteConfig } from '@/lib/site';
import { getHomeImage } from '@/lib/home-copy';
import { machineResourceTypes } from '@/lib/machine-resources';
import { AppI18nProvider } from '@/components/app-i18n-provider';
import { FrameworkLink } from '@/components/app-link';
import { IframeLinkGuard } from '@/components/iframe-link-guard';
import { EmbedLocaleSync, EmbedThemeSync } from '@/components/embed-bridge';
import SearchDialogWithLocale from '@/components/search';
import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from '@/lib/i18n';

// Inter 只覆盖拉丁字形，中文等由系统字体兜底。
// next/font 只生成 --font-inter 变量，必须有样式消费它才生效：字体栈定义在
// global.css 的 @theme { --font-sans }，两处配套修改。
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.productName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.productName,
  alternates: {
    canonical: '/',
    types: machineResourceTypes(DEFAULT_LOCALE),
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    // 兜底分享图：首页工厂与文档页都自带 openGraph（会整体替换这里的同名字段），
    // 这张图实际只会落在没有自定义 metadata 的页面上（如 404）
    images: [getHomeImage(DEFAULT_LOCALE)],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [getHomeImage(DEFAULT_LOCALE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * 下方三段内联脚本是纯字符串，无法 import：语言数据在这里由 i18n.ts 序列化注入，
 * 新增语言时脚本自动跟随，避免出现第二份手写的语言清单。
 * 平台入口域名由 siteConfig.productUrl 派生，避免再抄一份域名。
 */
const LOCALES_JSON = JSON.stringify(LOCALES);
const DEFAULT_LOCALE_JSON = JSON.stringify(DEFAULT_LOCALE);
const HTML_LANG_JSON = JSON.stringify(
  // 默认语言的 <html lang> 由根布局直接输出，只需列出其余语言
  Object.fromEntries(
    LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => [locale, HTML_LANG[locale]]),
  ),
);
const product = new URL(siteConfig.productUrl);
const PLATFORM_ORIGINS_JSON = JSON.stringify([product.origin, `https://www.${product.hostname}`]);

/**
 * 平台 iframe 内嵌：首帧给 <html> 加 in-iframe（偏移样式见 global.css），
 * 不透明源下预置 Cloudflare 统计信标的「已加载」标记以免 /cdn-cgi/rum 的预检失败；
 * 主站在 iframe onLoad 与偏好变化时 postMessage `{ themeMode }` / `{ lang }`，
 * React 往往还没水合，先在这里收下并派发事件，再由 embed-bridge.tsx 消费。
 * 只认直接父窗口与产品主站的两个入口域名。
 */
const IFRAME_SCRIPT = `(function(){var d=document.documentElement,f=false;try{f=window.self!==window.top}catch(e){f=true}if(!f)return;d.classList.add('in-iframe');if(window.origin==='null')window.__cfBeacon={load:'single'};var O=${PLATFORM_ORIGINS_JSON};window.addEventListener('message',function(e){var m=e.data;if(e.source!==window.parent||!m||typeof m!=='object'||O.indexOf(e.origin)<0)return;if(m.themeMode==='light'||m.themeMode==='dark'){window.__embedTheme=m.themeMode;window.dispatchEvent(new Event('fishxcode:embed-theme'))}if(typeof m.lang==='string'){window.__embedLang=m.lang;window.dispatchEvent(new Event('fishxcode:embed-lang'))}})})();`;

/**
 * 浏览器语言探测：只在站点根路径触发（已带语言前缀的路径不干预）。
 * 平台 iframe 内不按浏览器语言跳转：语言由父页面 postMessage 决定，
 * 避免根路径探测与父站语言来回拉扯。
 * 用户手动切换过语言（localStorage['docs-lang']）则优先采用；否则按
 * navigator.languages 顺序匹配——zh-TW/HK/MO/Hant 归繁体，其余 zh 归简体，
 * 其他语言按前缀匹配；找不到就留在默认语言。
 */
const LOCALE_DETECTION_SCRIPT = `(function(){try{if(document.documentElement.classList.contains('in-iframe'))return;var L=${LOCALES_JSON},def=${DEFAULT_LOCALE_JSON},seg=location.pathname.split('/').filter(Boolean);if(seg.length&&L.indexOf(seg[0])>=0)return;if(location.pathname!=='/'&&location.pathname!=='')return;var pick=null;try{var s=localStorage.getItem('docs-lang');if(s&&L.indexOf(s)>=0)pick=s}catch(e){}if(!pick){var list=navigator.languages||[navigator.language||''];for(var i=0;i<list.length&&!pick;i++){var t=String(list[i]).toLowerCase().replace('_','-');if(t.indexOf('zh')===0){pick=/tw|hk|mo|hant/.test(t)&&L.indexOf('zh-TW')>=0?'zh-TW':L.indexOf('zh')>=0?'zh':null;continue}for(var j=0;j<L.length;j++){if(L[j]!==def&&t.indexOf(L[j].toLowerCase())===0){pick=L[j];break}}}}if(pick&&pick!==def)location.replace('/'+pick+'/'+location.search+location.hash)}catch(e){}})();`;

/** 静态导出下根布局无法按路由设置 <html lang>，首帧前按路径前缀同步 */
const HTML_LANG_SCRIPT = `(function(){try{var m=${HTML_LANG_JSON},s=location.pathname.split('/').filter(Boolean)[0];if(s&&m[s])document.documentElement.lang=m[s]}catch(e){}})();`;

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang={siteConfig.lang} className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* 三段脚本都排在页面内容之前：在解析正文前同步执行，
            iframe 偏移、语言探测的跳转与 <html lang> 的修正都不会让用户看到闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: IFRAME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_DETECTION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: HTML_LANG_SCRIPT }} />
        <RootProvider search={{ SearchDialog: SearchDialogWithLocale }} components={{ Link: FrameworkLink }}>
          {/* 根布局固定以默认语言挂上下文；{lang} 路由组内再嵌套一层
              AppI18nProvider 覆盖为页面语言（I18nProvider 是纯 context） */}
          <AppI18nProvider lang={DEFAULT_LOCALE}>{children}</AppI18nProvider>
          <IframeLinkGuard />
          <EmbedThemeSync />
          <EmbedLocaleSync />
        </RootProvider>
      </body>
    </html>
  );
}
