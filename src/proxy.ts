import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { docsContentRoute, homeSlug } from '@/lib/shared';
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n';

/**
 * 仅 dev 模式生效的 Markdown 内容协商。静态导出（next build）不运行 proxy，
 * 生产环境由 public/_worker.js 承担同样的职责。
 *
 * 两处的规则一一对应，修改任意一处都必须同步另一处：
 * 1. Markdown 副本本体（/llms.mdx/...）直接放行；
 * 2. `.md` 便捷后缀：/introduction.md → 副本，不看 Accept；
 * 3. 读请求且客户端更偏好 Markdown 时：页面路径 → 副本；
 * 4. 首页映射到保留 slug（/ → /llms.mdx/index/content.md，
 *    /en → /llms.mdx/en/index/content.md）；其余带扩展名的静态文件不参与协商；
 * 5. 映射判定前忽略路径结尾的斜杠。
 *
 * Markdown 副本与页面路径一一镜像，只是挂到 /llms.mdx 下并以 content.md 结尾，
 * 语言前缀原样保留（/en/introduction → /llms.mdx/en/introduction/content.md）。
 * 首页没有 .mdx 源文件，副本由 src/lib/discovery.ts 按首页文案生成。
 *
 * 与生产环境的已知差异：未翻译的回退页（如 /fr/introduction，正文回退为默认语言）
 * 在这里被改写到 /llms.mdx/fr/introduction/content.md，但该语言的副本并不存在，
 * route handler 会返回 404；worker 则会改取默认语言的副本。proxy 拿不到页面的
 * 翻译状态，这一差异只影响 dev 下用 Markdown 客户端访问回退页的场景。
 */

/**
 * 与 _worker.js 的 markdownPath 一致：页面路径 → Markdown 副本路径，
 * 带扩展名的文件返回 null（不参与协商）。
 */
function markdownPath(pathname: string): string | null {
  // 便捷后缀：/introduction.md、/en/introduction.md、/index.md
  if (pathname.endsWith('.md')) return `${docsContentRoute}${pathname.slice(0, -3)}/content.md`;

  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  // 首页：/ 与各语言首页。/zh 不算语言首页（默认语言没有前缀段），
  // 与 worker 的 LOCALES（不含 zh）口径一致
  if (!first) return `${docsContentRoute}/${homeSlug}/content.md`;
  if (
    segments.length === 1 &&
    first !== DEFAULT_LOCALE &&
    LOCALES.some((locale) => locale === first)
  ) {
    return `${docsContentRoute}/${first}/${homeSlug}/content.md`;
  }

  // 其余带扩展名的是静态文件 / 路由产物；Next 以 .html 后缀直出的同一页面除外
  const last = segments.at(-1)!;
  if (last.includes('.')) {
    if (!/\.html?$/i.test(last)) return null;
    segments[segments.length - 1] = last.replace(/\.html?$/i, '');
  }
  return `${docsContentRoute}/${segments.join('/')}/content.md`;
}

export default function proxy(request: NextRequest) {
  // 结尾斜杠不参与映射判定（与 _worker.js 一致）
  const pathname = request.nextUrl.pathname.replace(/\/+$/, '') || '/';

  // Markdown 副本本体：直接放行，避免被后缀规则再次改写
  if (pathname === docsContentRoute || pathname.startsWith(`${docsContentRoute}/`)) {
    return NextResponse.next();
  }

  const target = markdownPath(pathname);
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  // `.md` 便捷后缀不看 Accept：浏览器直接打开后缀地址时 Accept 仍是 HTML
  const prefersMarkdown = pathname.endsWith('.md') || isMarkdownPreferred(request);
  if (!target || !isRead || !prefersMarkdown) return NextResponse.next();

  return NextResponse.rewrite(new URL(target, request.nextUrl), {
    // 同一 URL 有两种表示，由 Accept 选择
    headers: { Vary: 'Accept' },
  });
}
