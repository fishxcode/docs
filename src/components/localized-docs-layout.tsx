import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { AppI18nProvider } from '@/components/app-i18n-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteStructuredData } from '@/components/doc-structured-data';
import type { Locale } from '@/lib/i18n';

/**
 * 文档区外壳：语言上下文 + 站点级结构化数据 + DocsLayout + 页脚。
 *
 * 各语言的静态路由目录（src/app/{lang}/(docs)/layout.tsx）与根分组的
 * 中文文档布局共用这一份，避免每语言一份复制。嵌套的 AppI18nProvider
 * 覆盖根布局的 zh 默认值（I18nProvider 是纯 context，嵌套即覆盖）。
 */
export function LocalizedDocsLayout({ lang, children }: { lang: Locale; children: ReactNode }) {
  return (
    <AppI18nProvider lang={lang}>
      {/* 站点级 JSON-LD 按页面语言输出；放在外壳而非 page 里，
          不走文档工厂的页面也能带上 */}
      <SiteStructuredData lang={lang} />
      {/* 根布局的 <body> 是纵向 flex 容器（min-h-screen）：这一层撑满剩余高度，
          页脚才会贴在短页面的底部；结构化数据与页脚都必须留在 DocsLayout 之外，
          它的 children 会被渲染进「侧边栏 / 正文 / 目录」的多列网格 */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <DocsLayout tree={source.getPageTree(lang)} {...baseOptions(lang)}>
            {children}
          </DocsLayout>
        </div>
        <SiteFooter lang={lang} />
      </div>
    </AppI18nProvider>
  );
}
