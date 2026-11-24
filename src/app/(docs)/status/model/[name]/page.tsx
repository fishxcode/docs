import type { Metadata } from 'next';
import { DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { ModelDetailClient } from '@/components/status/status-pages';
import { siteConfig } from '@/lib/site';
import statusModels from '@/lib/status-models.json';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** 静态导出必须枚举模型路由；清单取定价与状态站模型名的离线并集 */
export function generateStaticParams(): Array<{ name: string }> {
  return statusModels.map((name) => ({ name }));
}

export async function generateMetadata(props: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await props.params;
  const modelName = decodeURIComponent(name);
  const title = `${modelName} 价格、可用率与性能`;
  const description = `查看 ${modelName} 的可用性、响应延迟、定价、24 小时真实调用性能与 API 接入方式。`;
  return {
    title,
    description,
    alternates: { canonical: `/status/model/${encodeURIComponent(modelName)}` },
    openGraph: {
      title: `${title} | ${siteConfig.productName}`,
      description,
      url: `/status/model/${encodeURIComponent(modelName)}`,
      type: 'article',
    },
  };
}

export default async function ModelStatusPage(props: { params: Promise<{ name: string }> }) {
  const { name } = await props.params;
  const modelName = decodeURIComponent(name);
  if (!modelName) notFound();

  return (
    <DocsPage full>
      <ModelDetailClient name={modelName} />
    </DocsPage>
  );
}
