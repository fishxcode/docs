import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * 自定义 robots.txt（替代 Next 的 robots.ts 约定，以输出 Content-Signal 声明）。
 * 文档与 LLM 全文允许抓取，排除搜索接口。
 */
export function GET() {
  const body = [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
    '',
    `Host: ${new URL(siteConfig.url).host}`,
    `Sitemap: ${new URL('/sitemap.xml', siteConfig.url).toString()}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
