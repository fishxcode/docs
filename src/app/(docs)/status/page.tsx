import type { Metadata } from 'next';
import { DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { siteConfig } from '@/lib/site';
import { StatusOverviewClient } from '@/components/status/status-pages';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '模型状态监控',
  description: '查看 FishXCode 在测模型的可用性、响应延迟、端点 PING、价格与真实调用性能。',
  alternates: { canonical: '/status' },
  openGraph: {
    title: `模型状态监控 | ${siteConfig.productName}`,
    description: '查看在测模型的可用性、响应延迟、端点 PING 与真实调用性能。',
    url: '/status',
  },
};

export default function StatusPage() {
  return (
    <DocsPage full>
      <StatusOverviewClient />
    </DocsPage>
  );
}
