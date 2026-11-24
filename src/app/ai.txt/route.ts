import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * /ai.txt：面向 AI 爬虫与 AI 应用的简短说明，与 robots.txt 的
 * Content-Signal 口径一致（ai-train=yes, search=yes, ai-input=yes）。
 */
export function GET() {
  const body = [
    `${siteConfig.productName} Docs (${siteConfig.url}): notes for AI crawlers and AI applications.`,
    '',
    'AI crawlers may crawl, index, and cite the documentation on this site.',
    'The documentation may be used for AI training; please attribute the source and link to the original page.',
    `See the documentation index: ${new URL('/llms.txt', siteConfig.url).toString()}`,
    '',
    'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
