import type { Metadata } from 'next';
import { DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { FamilyStatusClient } from '@/components/status/status-pages';
import { FAMILY_LABELS, FAMILY_ORDER, isFamily, type Family } from '@/lib/status';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** 静态导出下只能生成白名单里的厂商 slug；未知 slug 直接 404 */
export function generateStaticParams(): Array<{ fam: Family }> {
  return FAMILY_ORDER.map((fam) => ({ fam }));
}

export async function generateMetadata(props: {
  params: Promise<{ fam: string }>;
}): Promise<Metadata> {
  const { fam } = await props.params;
  if (!isFamily(fam)) return {};
  const title = `${FAMILY_LABELS[fam]}模型状态`;
  const description = `${FAMILY_LABELS[fam]}系列在测模型的可用性、响应延迟、巡检心跳与端点 PING。`;
  return {
    title,
    description,
    alternates: { canonical: `/status/${fam}` },
    openGraph: {
      title: `${title} | ${siteConfig.productName}`,
      description,
      url: `/status/${fam}`,
    },
  };
}

export default async function FamilyStatusPage(props: { params: Promise<{ fam: string }> }) {
  const { fam } = await props.params;
  if (!isFamily(fam)) notFound();

  return (
    <DocsPage full>
      <FamilyStatusClient fam={fam} />
    </DocsPage>
  );
}
