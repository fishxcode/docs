/**
 * 文档挂在站点根路径下（如 `/quickstart`），不再是 `/docs/quickstart`。
 * 改这里要同步确认 `src/app/(docs)/` 的目录位置，两处必须一致。
 */
export const docsRoute = '/';

/** 文档页的社交分享图路由 */
export const docsImageRoute = '/og';

/**
 * 文档的 Markdown 源码路由（llms.txt 生态用）。
 * public/_worker.js、public/_headers 与 vercel.json 无法 import 本文件，都写死了这个路径，改路由时一起改。
 */
export const docsContentRoute = '/llms.mdx';

/**
 * 文档内容目录（相对项目根）。git 日期查询与「在 GitHub 上编辑」的文件地址
 * 用这一个值：fumadocs 的存储键相对该目录，而 git 要的是相对仓库根的路径，
 * 两边若各写一份字面量，改目录时漏掉任何一处，页面日期与编辑链接都会静默失效。
 *
 * ⚠️ source.ts 的 `defineDocs({ dir })` 用不了它——fumadocs-mdx 宏要求 dir 是
 * 字符串字面量，所以那里还有一份字面量。改目录时两处必须一起改。
 */
export const contentDir = 'content/docs';

/**
 * 把路由前缀与路径段拼成站内绝对路径，空段自动丢弃：
 * joinRoute('/og', ['en', 'quickstart', 'image.png']) → /og/en/quickstart/image.png。
 * 分享图、Markdown 副本这类"挂在某个路由下的资源地址"都从这里出。
 */
export function joinRoute(route: string, segments: readonly string[]): string {
  return '/' + [...route.split('/'), ...segments].filter(Boolean).join('/');
}

/**
 * 首页 Markdown 副本的保留 slug。首页是 React 组件而不是 .mdx 文档，它的副本
 * 挂在 /llms.mdx/{本值}/content.md（其余语言 /llms.mdx/{lang}/{本值}/content.md）。
 * contentDir 根目录下不要放同名文档页——它本来也会和首页路由 / 冲突。
 * public/_worker.js 与 vercel.json 不经打包、无法 import 本文件：worker 里有一份同名常量，
 * vercel.json 的 Link 规则里写死了这个值。
 */
export const homeSlug = 'index';

/**
 * 模型目录（ModelCatalog）在浏览器里请求的同源定价接口。主站的同名接口不带 CORS 头，
 * 跨域取不到，转发到主站同一路径：Cloudflare Pages 上是 public/_worker.js，Vercel 上是
 * vercel.json 的 rewrites，dev 下是 src/proxy.ts。前两者无法 import 本文件，各有一份字面量。
 */
export const pricingRoute = '/api/pricing';

export const gitConfig = {
  user: 'fishxcode',
  repo: 'docs',
  branch: 'main',
};
