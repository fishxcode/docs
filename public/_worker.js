/**
 * Cloudflare Pages 边缘 Worker。静态导出没有服务端，下面这些只能在这一层完成：
 *
 * 1. 定价接口转发：模型目录组件请求同源 `/api/pricing`，这里原样转发到主站同一路径
 *    （主站接口不带 CORS 头，浏览器跨域取不到）。dev 下由 src/proxy.ts 转发。
 * 2. 旧文档站（VitePress）的地址兼容：订阅地址 /feed.xml、/feed.atom 永久转到 /rss.xml。
 *    只在生产环境生效。
 * 3. Markdown 内容协商——页面的 HTML 与 Markdown 副本是两份独立静态文件，
 *    「同一 URL 按 Accept 返回不同表示」：
 *    - 客户端更偏好 Markdown（Accept 协商）→ 改取 `/llms.mdx/<页面路径>/content.md`
 *    - 首页没有源文件，映射到保留 slug：`/llms.mdx/<lang>/index/content.md`
 *    - `.md` 便捷后缀（/start.md）→ 同一副本，不看 Accept
 *    - 未翻译的回退页没有自己语言的副本 → 取默认语言的副本（与页面渲染的内容一致）
 *    - Markdown 副本本体 → 补回静态导出丢失的 Content-Language / Link 头
 *
 * 协商的映射规则与判定必须与 src/proxy.ts（dev 生效）保持一致，两处需同步修改：
 * 只处理读请求、忽略路径结尾的斜杠、带扩展名的文件不参与协商（`.md` 后缀除外）。
 * LOCALES 与 src/lib/i18n.ts 的非默认语言保持一致，HOME_SLUG、PRICING_PATH 与
 * src/lib/shared.ts 保持一致（本文件不经打包，无法 import）。
 */

const PRICING_PATH = '/api/pricing';
const PRICING_UPSTREAM = 'https://fishxcode.com/api/pricing';
/** 回传给浏览器的上游响应头：只放行与内容相关的几项，Set-Cookie、cf-* 等一律不带 */
const PRICING_RESPONSE_HEADERS = ['content-type', 'cache-control', 'etag', 'last-modified'];

/** 旧站订阅地址 → 新地址（永久） */
const LEGACY_REDIRECTS = new Map([
  ['/feed.xml', '/rss.xml'],
  ['/feed.atom', '/rss.xml'],
]);

const CONTENT_ROUTE = '/llms.mdx';
const LOCALES = new Set(['en', 'fr', 'es', 'pt', 'ru', 'ja', 'vi', 'zh-TW']);
/**
 * 首页副本的保留 slug。首页是 React 组件而不是 .mdx 文档，副本由
 * src/lib/discovery.ts 生成，挂在 /llms.mdx/<lang?>/index/content.md。
 */
const HOME_SLUG = 'index';
/** 匹配副本路径开头的语言段：/llms.mdx/<lang>/... */
const LOCALE_PREFIX_RE = new RegExp(`^${CONTENT_ROUTE}/(?:${[...LOCALES].join('|')})/`);
/** 默认语言（URL 无前缀）的 BCP 47 标签 */
const DEFAULT_CONTENT_LANGUAGE = 'zh-CN';
/**
 * BCP 47 标签与 URL 前缀不同的语言（与 src/lib/i18n.ts 的 HTML_LANG 一致）；
 * 不在这里的语言，标签就是前缀本身。
 */
const CONTENT_LANGUAGE_TAGS = new Map([['pt', 'pt-BR']]);
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
 *   /start             → /llms.mdx/start/content.md
 *   /en/start          → /llms.mdx/en/start/content.md
 * 首页没有对应的源文件，映射到保留 slug：
 *   /                  → /llms.mdx/index/content.md
 *   /en                → /llms.mdx/en/index/content.md
 *
 * 返回 null 表示该路径不参与协商（副本本体、带扩展名的静态文件）。
 */
function markdownPath(pathname) {
  if (pathname === CONTENT_ROUTE || pathname.startsWith(`${CONTENT_ROUTE}/`)) return null;

  // 便捷后缀：/start.md、/en/start.md、/index.md
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
    contentLanguage: locale ? (CONTENT_LANGUAGE_TAGS.get(locale) ?? locale) : DEFAULT_CONTENT_LANGUAGE,
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

/**
 * 定价接口转发：只允许读请求，查询串原样带上；上游连不上时返回 502 JSON，
 * 让页面上的模型目录显示「加载失败 / 重试」，而不是拿到一个 HTML 错误页。
 */
async function proxyPricing(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const upstreamUrl = new URL(PRICING_UPSTREAM);
  upstreamUrl.search = url.search;

  let upstream;
  try {
    // 主站接口只接受 GET（HEAD 会得到 404）；HEAD 照样向上游发 GET，回给浏览器时去掉响应体
    upstream = await fetch(upstreamUrl, { headers: { Accept: 'application/json' } });
  } catch {
    return Response.json(
      { success: false, message: 'pricing upstream unavailable' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const headers = new Headers();
  for (const name of PRICING_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  // 价格随时可能变化：上游没给缓存策略时，也不让浏览器与 CDN 缓存
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');

  if (request.method === 'HEAD') {
    await upstream.body?.cancel();
    return new Response(null, { status: upstream.status, headers });
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

/** 旧文档站地址的跳转（永久，保留查询串）；不属于旧地址时返回 null */
function legacyRedirect(url) {
  const target = LEGACY_REDIRECTS.get(url.pathname);
  return target ? Response.redirect(new URL(`${target}${url.search}`, url).toString(), 301) : null;
}

async function handle(request, env) {
  const url = new URL(request.url);

  if (url.pathname === PRICING_PATH) return proxyPricing(request, url);

  const redirect = legacyRedirect(url);
  if (redirect) return redirect;

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
