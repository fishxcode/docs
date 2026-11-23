import { DEFAULT_LOCALE, isTranslatedPage, localePath, type Locale } from '@/lib/i18n';
import { docGraph, organizationNode, softwareApplicationNode, websiteNode } from '@/lib/structured-data';
import type { source } from '@/lib/source';

type DocPage = (typeof source)['$inferPage'];

/**
 * JSON-LD 输出。值来自构建期常量与 frontmatter，序列化后把 `<` 转义成
 * Unicode 转义序列：frontmatter 里可能带 HTML 片段，原样输出会提前闭合 <script>。
 */
function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * 站点级结构化数据：Organization + WebSite + SoftwareApplication。
 *
 * 挂载点在各语言的外壳（文档布局、首页）而不是根布局——根布局拿不到当前
 * 语言，会把 /en 页面的 WebSite 声明成 zh-CN。节点上的 `@id` 全站一致，
 * AI 与搜索据此把七个语言版本聚合成同一个站点实体。
 */
export function SiteStructuredData({ lang }: { lang: Locale }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [organizationNode(), websiteNode(lang), softwareApplicationNode(lang)],
      }}
    />
  );
}

/** 文档页结构化数据：TechArticle + BreadcrumbList（+ 正文确有问答/编号流程时的 FAQPage、HowTo）。 */
export function DocStructuredData({ page, lang }: { page: DocPage; lang: Locale }) {
  // 回退页的正文其实是默认语言，描述信息指向该语言的 llms.txt
  const contentLocale = isTranslatedPage(page, lang) ? lang : DEFAULT_LOCALE;

  return (
    <>
      <link rel="describedby" type="text/plain" href={localePath(contentLocale, '/llms.txt')} />
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': docGraph(page, lang) }} />
    </>
  );
}
