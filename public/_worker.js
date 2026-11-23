/**
 * Cloudflare Pages 边缘 Worker：为静态导出的站点提供 Markdown 内容协商。
 *
 * Next 静态导出不运行 proxy，页面的 HTML 与 Markdown 副本是两份独立静态文件，
 * 「同一 URL 按 Accept 返回不同表示」只能在这一层完成：
 * - 客户端更偏好 Markdown（Accept 协商）→ 改取 `/llms.mdx/<页面路径>/content.md`
 * - 首页没有源文件，映射到保留 slug：`/llms.mdx/<lang>/index/content.md`
 * - `.md` 便捷后缀（/introduction.md）→ 同一副本，不看 Accept
 * - 未翻译的回退页没有自己语言的副本 → 取默认语言的副本（与页面渲染的内容一致）
 * - Markdown 副本本体 → 补回静态导出丢失的 Content-Language / Link 头
 *
 * 映射规则与协商判定必须与 src/proxy.ts（dev 生效）保持一致，两处需同步修改：
 * 只处理读请求、忽略路径结尾的斜杠、带扩展名的文件不参与协商（`.md` 后缀除外）。
 * LOCALES 与 src/lib/i18n.ts 的非默认语言保持一致，HOME_SLUG 与 src/lib/shared.ts 保持一致。
 */
const CONTENT_ROUTE = '/llms.mdx';
const LOCALES = new Set(['en', 'fr', 'ru', 'ja', 'vi', 'zh-TW']);
/**
 * 首页副本的保留 slug。首页是 React 组件而不是 .mdx 文档，副本由
 * src/lib/discovery.ts 生成，挂在 /llms.mdx/<lang?>/index/content.md。
 */
const HOME_SLUG = 'index';
/** 匹配副本路径开头的语言段：/llms.mdx/<lang>/... */
const LOCALE_PREFIX_RE = new RegExp(`^${CONTENT_ROUTE}/(?:${[...LOCALES].join('|')})/`);
/** 默认语言（URL 无前缀）的 BCP 47 标签；其余语言的标签与其前缀相同 */
const DEFAULT_CONTENT_LANGUAGE = 'zh-CN';
/** 与 fumadocs-core/negotiation 的默认 Markdown 媒体类型一致 */
const MARKDOWN_MEDIA_TYPES = new Set(['text/plain', 'text/markdown', 'text/x-markdown']);

/**
 * 与 fumadocs-core/negotiation 的 isMarkdownPreferred 同一套判定：
 * 取 Markdown 类与 HTML 类各自的最高 q 值，Markdown 不低于 HTML 即视为偏好。
 */
function acceptsMarkdown(request) {
  const header = request.headers.get('Accept');
  if (!header) return false;

  let markdown = 0;
  let html = 0;
  for (const part of header.split(',')) {
    const [rawMediaType, ...parameters] = part.split(';');
    const mediaType = rawMediaType.trim().toLowerCase();
    if (!mediaType) continue;

    let quality = 1;
    for (const parameter of parameters) {
      const separator = parameter.indexOf('=');
      if (separator === -1 || parameter.slice(0, separator).trim().toLowerCase() !== 'q') continue;
      const parsed = Number.parseFloat(parameter.slice(separator + 1));
      if (!Number.isNaN(parsed)) quality = parsed;
    }
    if (quality <= 0) continue;

    if (MARKDOWN_MEDIA_TYPES.has(mediaType)) markdown = Math.max(markdown, quality);
    else if (mediaType === 'text/html' || mediaType === 'text/*' || mediaType === '*/*') {
      html = Math.max(html, quality);
    }
  }
  return markdown > 0 && markdown >= html;
}

/**
 * 页面 URL → Markdown 副本路径。副本与页面路径一一镜像，只是挂到 /llms.mdx
 * 下并以 content.md 结尾，语言前缀原样保留：
 *   /introduction      → /llms.mdx/introduction/content.md
 *   /en/introduction   → /llms.mdx/en/introduction/content.md
 * 首页没有对应的源文件，映射到保留 slug：
 *   /                  → /llms.mdx/index/content.md
 *   /en                → /llms.mdx/en/index/content.md
 *
 * 返回 null 表示该路径不参与协商（副本本体、带扩展名的静态文件）。
 */
function markdownPath(pathname) {
  if (pathname === CONTENT_ROUTE || pathname.startsWith(`${CONTENT_ROUTE}/`)) return null;

  // 便捷后缀：/introduction.md、/en/introduction.md、/index.md
  if (pathname.endsWith('.md')) return `${CONTENT_ROUTE}${pathname.slice(0, -3)}/content.md`;

  const segments = pathname.split('/').filter(Boolean);
  const [first] = segments;
  // 首页：/ 与各语言首页
  if (!first) return `${CONTENT_ROUTE}/${HOME_SLUG}/content.md`;
  if (segments.length === 1 && LOCALES.has(first)) {
    return `${CONTENT_ROUTE}/${first}/${HOME_SLUG}/content.md`;
  }

  // Next 可能以 .html 后缀直出同一页面，按无后缀处理；其余带扩展名的是静态文件/路由产物
  const last = segments[segments.length - 1];
  if (last.includes('.')) {
    if (!/\.html?$/i.test(last)) return null;
    segments[segments.length - 1] = last.replace(/\.html?$/i, '');
  }

  return `${CONTENT_ROUTE}/${segments.join('/')}/content.md`;
}

/**
 * Markdown 副本的源路径 → 所在语言与对应 HTML 页面。
 *
 * 语义与 src/app/llms.mdx/[[...slug]]/route.ts 输出的 Link / Content-Language 一致，
 * 但 Link 的写法不同：route.ts 用 siteConfig.url 拼绝对地址，这里用相对引用
 * （RFC 8288 允许），免得在 worker 里再抄一份站点地址。
 */
function describeMarkdown(markdownPathname) {
  const segments = markdownPathname.slice(CONTENT_ROUTE.length + 1, -'/content.md'.length).split('/');
  const [first] = segments;
  const locale = LOCALES.has(first) ? first : undefined;
  const slugs = locale ? segments.slice(1) : segments;
  // 首页副本还原成首页地址：canonical 不能是不存在的 /index、/en/index
  const isHome = slugs.length === 1 && slugs[0] === HOME_SLUG;

  return {
    contentLanguage: locale ?? DEFAULT_CONTENT_LANGUAGE,
    htmlPath: isHome ? (locale ? `/${locale}` : '/') : `/${segments.join('/')}`,
    llmsPath: locale ? `/${locale}/llms.txt` : '/llms.txt',
  };
}

function withHeaders(response, mutate) {
  const headers = new Headers(response.headers);
  mutate(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** 两种表示共用同一 URL，缓存必须按 Accept 区分 */
function withVaryAccept(response) {
  return withHeaders(response, (headers) => {
    const vary = headers.get('Vary');
    if (!vary) headers.set('Vary', 'Accept');
    else if (!vary.split(',').some((value) => value.trim().toLowerCase() === 'accept')) {
      headers.set('Vary', `${vary}, Accept`);
    }
  });
}

/** 静态导出不保留 route handler 设置的响应头，这里补回 */
function asMarkdownResponse(response, markdownPathname) {
  const { contentLanguage, htmlPath, llmsPath } = describeMarkdown(markdownPathname);

  return withHeaders(withVaryAccept(response), (headers) => {
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Content-Language', contentLanguage);
    headers.set('Link', `<${htmlPath}>; rel="canonical", <${llmsPath}>; rel="describedby"`);
  });
}

/**
 * 取 Markdown 副本。未翻译的回退页没有自己语言的副本，但页面渲染的就是默认语言
 * 的内容（loader 的 fallbackLanguage），副本同样回退到默认语言那一份——
 * describeMarkdown 以实际取到的路径为准，canonical/Content-Language 自然指向
 * 默认语言页面，与该页 HTML 的 canonical 一致。
 */
async function fetchMarkdown(env, request, url, target) {
  const tryFetch = async (pathname) => {
    if (!pathname) return null;
    const assetUrl = new URL(pathname, url);
    assetUrl.search = url.search;
    // 只带上必要的信息：面向 HTML 实体的条件请求头（If-None-Match 等）不应作用到副本上
    const asset = await env.ASSETS.fetch(
      new Request(assetUrl, { method: request.method, headers: { Accept: '*/*' } }),
    );
    return asset.ok ? { asset, pathname } : null;
  };

  return (
    (await tryFetch(target)) ??
    // 语言副本不存在时去掉语言段，改取默认语言的副本
    (await tryFetch(target.replace(LOCALE_PREFIX_RE, `${CONTENT_ROUTE}/`)))
  );
}

async function handle(request, env) {
  const url = new URL(request.url);
  // 映射判定统一忽略结尾斜杠（与 src/proxy.ts 一致）；交给静态资源的仍是原始请求
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  // Markdown 副本本体：直出，仅补回静态导出丢失的响应头
  if (pathname === CONTENT_ROUTE || pathname.startsWith(`${CONTENT_ROUTE}/`)) {
    const asset = await env.ASSETS.fetch(request);
    return asset.ok ? asMarkdownResponse(asset, pathname) : asset;
  }

  const target = markdownPath(pathname);
  // 协商只对读请求有意义；不参与协商的路径直接交给静态资源
  const isRead = request.method === 'GET' || request.method === 'HEAD';
  if (!target || !isRead) return env.ASSETS.fetch(request);

  // `.md` 便捷后缀不看 Accept：浏览器直接打开后缀地址时 Accept 仍是 HTML
  if (pathname.endsWith('.md') || acceptsMarkdown(request)) {
    const markdown = await fetchMarkdown(env, request, url, target);
    if (markdown) return asMarkdownResponse(markdown.asset, markdown.pathname);
  }

  // 客户端更偏好 HTML：返回页面本身
  return withVaryAccept(await env.ASSETS.fetch(request));
}

export default {
  fetch: handle,
};
