import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { docPageMetadata, getPageMarkdownUrl, getResourcePage, source } from '@/lib/source';
import { contentDir, gitConfig } from '@/lib/shared';
import { ContentUpdated } from '@/components/content-updated';
import { DocStructuredData } from '@/components/doc-structured-data';
import type { Locale } from '@/lib/i18n';

/**
 * 各语言文档页的路由工厂。
 *
 * 语言目录是静态段（src/app/{lang}/(docs)/[...slug]），不存在 [lang] 动态段
 * 与根 catch-all 抢路由的问题；语言在工厂里闭包固定，路由文件只做薄壳
 * 转发。params 里只有 slug（语言已在静态段里）。
 */
export function createLocalizedDocPage(lang: Locale) {
  return {
    async generateStaticParams() {
      // 未翻译页也生成（回退 zh 内容），保证 /{lang}/quickstart 可达
      return source.getPages(lang).map((page) => ({ slug: page.slugs }));
    },

    async generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
      const { slug } = await props.params;
      const page = source.getPage(slug, lang);
      if (!page) notFound();

      return docPageMetadata(page, lang);
    },

    async Page(props: { params: Promise<{ slug: string[] }> }) {
      const { slug } = await props.params;
      const page = source.getPage(slug, lang);
      if (!page) notFound();

      const MDX = page.data.body;
      // 回退页的 Markdown 副本指向 zh 路由（og/llms.mdx 只为真实翻译生成）
      const markdownUrl = getPageMarkdownUrl(getResourcePage(page, lang)).url;

      return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
          {/* 文档级 JSON-LD（TechArticle / 面包屑）与 rel=describedby 声明 */}
          <DocStructuredData page={page} lang={lang} />
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
          <ContentUpdated page={page} lang={lang} />
          <div className="flex flex-row gap-2 items-center border-b pb-6">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            {/* page.path 是存储键：回退页保持 zh 文件路径，编辑入口指向中文源文件 */}
            <ViewOptionsPopover
              markdownUrl={markdownUrl}
              githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${contentDir}/${encodeURI(page.path)}`}
            />
          </div>
          <DocsBody>
            <MDX
              components={getMDXComponents({
                // this allows you to link to other pages with relative file paths
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>
        </DocsPage>
      );
    },
  };
}
