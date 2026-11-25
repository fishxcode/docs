import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

const ORIGIN = siteConfig.url.replace(/\/$/, '');

function absolute(path: string): string {
  return `${ORIGIN}${path}`;
}

/**
 * /.well-known/api-catalog：RFC 9727 的 API catalog document。
 *
 * 同时包含两种表示：
 * - `linkset` 数组：isitagentready 扫描器当前识别的结构，按 API 分组；
 * - `linkset` 对象：RFC 9264 Linkset 的标准结构，供遵循 RFC 9727 的代理消费。
 */
const CATALOG = {
  linkset: [
    {
      anchor: absolute('/api/pricing'),
      'service-desc': [
        {
          href: absolute('/api/pricing'),
          type: 'application/json',
          title: 'FishXCode live model pricing API',
        },
      ],
      'service-doc': [
        {
          href: absolute('/models'),
          type: 'text/html',
          title: 'FishXCode model pricing documentation',
        },
      ],
      status: [
        {
          href: absolute('/status'),
          type: 'text/html',
          title: 'FishXCode service status',
        },
      ],
    },
    {
      anchor: absolute('/api/status-data/status'),
      'service-desc': [
        {
          href: absolute('/api/status-data/status'),
          type: 'application/json',
          title: 'FishXCode status data API',
        },
      ],
      'service-doc': [
        {
          href: absolute('/status'),
          type: 'text/html',
          title: 'FishXCode service status documentation',
        },
      ],
      status: [
        {
          href: absolute('/status'),
          type: 'text/html',
          title: 'FishXCode service status',
        },
      ],
    },
  ],
  'linkset-object': {
    [ORIGIN]: [
      {
        href: '/api/pricing',
        rel: 'service-desc',
        type: 'application/json',
      },
      {
        href: '/models',
        rel: 'service-doc',
        type: 'text/html',
      },
      {
        href: '/status',
        rel: 'status',
        type: 'text/html',
      },
    ],
  },
};

export function GET() {
  return new Response(JSON.stringify(CATALOG), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/linkset+json; charset=utf-8',
    },
  });
}
