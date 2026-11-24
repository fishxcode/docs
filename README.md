# FishXCode 文档

简体中文 | [English](README.en.md)

FishXCode 的文档站，线上地址 <https://docs.fishxcode.com>。

基于 Next.js 16、React 19 与 Fumadocs 16，支持九种语言，构建时静态导出到 `out/`，
部署在 Vercel 与 Cloudflare Pages。站内搜索使用按语言生成的本地索引，不依赖外部搜索服务；
同时为 AI 客户端提供 Markdown 正文、llms.txt、RSS 与站点地图。

界面组件来自 Fumadocs UI 的 Base UI 版本（`@fumadocs/base-ui`）；`radix-ui` 已安装，
供自定义交互组件使用。

## 环境要求

- Node.js 22.12 或更新版本（CI 使用 Node.js 24）
- pnpm 12.16.1。版本由 `package.json` 的 `packageManager` 字段固定，CI 也按这个字段安装

## 开发

```bash
pnpm install
pnpm dev
```

开发服务器默认在 <http://localhost:3000>。

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm lint` | oxlint 检查 |
| `pnpm types:check` | 生成 Next 路由类型后做 TypeScript 检查，不构建 |
| `pnpm build` | 静态导出到 `out/` |
| `pnpm preview` | 用 Wrangler 在本地运行 `out/`，包含与 Cloudflare Pages 相同的 Worker（需先 `pnpm build`） |
| `pnpm deploy:cf` | 构建并发布到 Cloudflare Pages 的生产环境 |
| `pnpm indexnow` | 列出站点地图里将提交给 IndexNow 的地址；加 `-- --submit` 才真正提交（需先 `pnpm build`） |

依赖管理有两点要注意：

- 升级 pnpm 时改 `packageManager` 后要跑一次 `pnpm install`，把 `pnpm-lock.yaml` 开头记录
  pnpm 自身版本的那一段一并更新，否则 CI 的 `pnpm install --frozen-lockfile` 会失败。
- `wrangler` 依赖的 `esbuild`、`workerd` 带安装脚本，已在 `pnpm-workspace.yaml` 的
  `allowBuilds` 中放行。新增带安装脚本的依赖时也要在那里登记，否则 `pnpm install` 会失败。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `content/docs/` | 文档正文（MDX）。顶层是简体中文，其余语言在 `content/docs/{lang}/` |
| `src/app/` | 路由。`(home)`、`(docs)` 是简体中文，`en/`、`fr/` 等目录是各语言的薄壳 |
| `src/components/` | 页面与布局的共用实现（`localized-*.tsx`），各语言的薄壳只负责传入语言 |
| `src/lib/` | 站点配置、国际化、内容加载、搜索索引，以及 RSS、llms、分享图的生成 |
| `public/_worker.js` | Cloudflare Pages 的边缘 Worker：定价接口转发、地址跳转、Markdown 内容协商 |
| `public/_routes.json` | 声明哪些路径经过 Worker，哪些直接按静态资源返回 |
| `vercel.json` | Vercel 的路由规则：定价接口转发、地址跳转、`.md` 后缀与响应头 |

## 写文档

在 `content/docs/` 下新建 `.mdx` 文件，文件路径就是页面地址：`content/docs/quickstart.mdx`
对应 `/quickstart`。Front matter 写 `title` 和 `description`，后者会用在搜索结果、分享图
和 SEO 信息里。正文写法见 [Fumadocs 的 Markdown 说明](https://fumadocs.dev/docs/next/markdown)，
目录的排序与分组见[页面约定](https://fumadocs.dev/docs/next/page-conventions)。

- 站内链接写站内绝对路径，其余语言带上语言前缀，例如英文页面里写 `/en/quickstart`。
- `content/docs/` 根目录不要放 `index.mdx`：它的地址是 `/`，会和首页冲突。
- 标题较长时用 `navTitle` 指定侧边栏里的短标题，例如标题「在 Cursor 中接入 FishXCode」、
  `navTitle: Cursor`。各语言目录下的 `meta.json` 决定侧边栏的分组与顺序。
- 提示块用 `<Callout type="idea|info|warn|error" title="…">`，折叠块用
  `<Accordions type="single"><Accordion title="…">`，多平台命令写成相邻的代码块并加
  `tab="标签"`（如 ```` ```bash tab="macOS" ````），会自动合成一组分页。
- `<ModelCatalog />` 是实时模型目录，数据来自主站的定价接口。
- 首页的文案与业务数据（月包价格、分组倍率、教程清单、接入示例）都在 `src/lib/home-copy.ts`，
  区块组件在 `src/components/home/`。改月包价格或分组倍率时，`subscription-plans/index.mdx`、
  `billing-groups.mdx` 与 `home-copy.ts` 要一起改。
- 首页右下角的在线客服是腾讯 TRTC 的 SDK，接入标识与联系方式在 `src/lib/site.ts` 的 `support`。

## 多语言

| 语言 | 代码 | 地址前缀 |
| --- | --- | --- |
| 简体中文（默认） | `zh` | 无 |
| English | `en` | `/en` |
| Français | `fr` | `/fr` |
| Español | `es` | `/es` |
| Português (Brasil) | `pt` | `/pt` |
| Русский | `ru` | `/ru` |
| 日本語 | `ja` | `/ja` |
| Tiếng Việt | `vi` | `/vi` |
| 繁體中文 | `zh-TW` | `/zh-TW` |

- 九种语言都有完整正文。中文是原文，其余语言的翻译放在 `content/docs/{lang}/` 下，
  与中文版保持相同的相对路径；改了中文页面后要同步各语言的译文。
- 某种语言缺了某页的译文时，该页回退显示中文正文，canonical 指回中文版，并且不进入该语言的
  站点地图、RSS、llms.txt 和 hreflang。
- 访问站点根路径时按浏览器语言跳转到对应语言；用户手动切换过语言后，以用户的选择为准。
- 新增语言的完整步骤写在 `src/lib/i18n.ts` 顶部的注释里。其中 `public/_worker.js` 与
  `vercel.json` 里的语言清单不受类型检查保护，最容易漏。

## 搜索

搜索完全在浏览器内完成。构建时按语言各生成一份索引（`/static.json/zh`、`/static.json/en` 等），
页面只加载当前语言的那一份。按语言拆分是因为 Cloudflare Pages 的单个文件不能超过 25 MiB。
建索引与查询共用 `src/lib/cjk-tokenizer.ts` 里的分词器，修改分词规则时两边自动保持一致。

## 给 AI 客户端的入口

| 地址 | 内容 |
| --- | --- |
| `/llms.txt`、`/{lang}/llms.txt` | 该语言的文档索引；`/.well-known/llms.txt` 与 `/llms.txt` 相同 |
| `/llms-full.txt`、`/{lang}/llms-full.txt` | 该语言全部文档的 Markdown 正文 |
| 页面地址加 `.md`，如 `/start.md` | 该页的 Markdown 正文 |
| 页面地址，请求头带 `Accept: text/markdown` | 同上，由内容协商返回，首页同样支持；仅 Cloudflare Pages |
| `/rss.xml`、`/{lang}/rss.xml` | 更新订阅 |
| `/sitemap.xml`、`/robots.txt`、`/ai.txt` | 站点地图与抓取声明 |

Markdown 内容协商有两份实现，**修改时必须两处一起改**：Cloudflare Pages 上是 `public/_worker.js`
（运行在 Cloudflare 边缘），本地开发是 `src/proxy.ts`。两者有一处已知差异：请求的页面没有 Markdown
副本时（例如尚未翻译的页面），Cloudflare Pages 会回退到中文版的副本或原页面，本地开发直接返回 404。
Vercel 上没有内容协商，只能用 `.md` 后缀，原因见[部署](#部署)。

## 部署

同一份代码发布到两个平台，正式域名 `docs.fishxcode.com`（以及 `doc.fishxcode.com`）指向 Vercel：

| 平台 | 发布方式 | 边缘配置 |
| --- | --- | --- |
| Vercel，项目 `docs` | 项目连接了本仓库，推送 `main` 后自动构建发布 | `vercel.json` |
| Cloudflare Pages，项目 `fishxcode-docs` | `.github/workflows/deploy.yml`，地址 `fishxcode-docs.pages.dev` | `public/_worker.js`、`public/_headers`、`public/_routes.json` |

两边的配置互不通用，改接口转发、地址跳转或响应头时要两边一起改。Vercel 不运行 `_worker.js`，
也不读 `_headers`、`_routes.json`（这几个文件在 Vercel 上只是普通静态文件）。`vercel.json`
覆盖了定价接口转发、旧地址跳转、`.md` 后缀与响应头；`Accept: text/markdown` 协商、未翻译页面的
副本回退在 Vercel 上做不到——Vercel 先查静态文件再应用 rewrites，已存在的页面地址无法按请求头改写。
Markdown 副本的 `Link` 头在 Vercel 上暂未补回。

站点地址写在 `src/lib/site.ts` 的 `siteConfig.url`，canonical、站点地图、RSS、llms.txt 和
分享图里的地址都由它生成。整站换域名时改这一处，或在构建时设置环境变量
`NEXT_PUBLIC_SITE_URL`（完整地址，不带结尾斜杠）。

### Vercel

构建设置在 Vercel 项目里配置，`vercel.json` 只放路由规则。规则写错时要到部署阶段才报错，
改完可以先用 [`@vercel/routing-utils`](https://www.npmjs.com/package/@vercel/routing-utils)
的 `getTransformedRoutes` 在本地解析一遍：Vercel 用的就是这个库，规则无法解析时它会返回错误。

### Cloudflare Pages

#### 首次配置

1. 创建 Pages 项目。wrangler 4 默认会把新项目转交给 Workers 创建，对本项目会失败，
   必须加 `--force` 直接建成 Pages 项目（只在创建时需要）：

   ```bash
   pnpm exec wrangler pages project create fishxcode-docs --production-branch main --force
   ```

2. （正式域名现在指向 Vercel，要把域名切回 Cloudflare Pages 时才做这一步）在 Cloudflare 控制台
   进入 Workers & Pages → `fishxcode-docs` → Custom domains → Set up a domain，添加
   `docs.fishxcode.com`。域名托管在 Cloudflare 时 DNS 记录会自动创建；否则按提示到域名服务商处
   添加一条 CNAME，把 `docs` 指向 `fishxcode-docs.pages.dev`。必须先在控制台添加域名：只配 CNAME
   而不在控制台关联，访问会得到 522 错误。
3. 在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加两个 secret：
   - `CLOUDFLARE_API_TOKEN`：权限选 Account → Cloudflare Pages → Edit
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID

#### 发布

- **自动**：推送到 `main` 后由 `.github/workflows/deploy.yml` 构建并发布，随后对这次部署做
  冒烟检查：首页返回 HTML，带 `Accept: text/markdown` 时返回 Markdown。检查请求的是这次部署
  在 `pages.dev` 下的专属地址；如果给预览部署开启了 Cloudflare Access，这一步会失败。
- **手动**：本地执行 `pnpm deploy:cf`。需要先 `pnpm exec wrangler login`，或设置上面两个
  同名的环境变量。

`public/_worker.js` 与 `public/_routes.json` 会随静态文件一起进入 `out/`，发布时必须包含。
`_routes.json` 的 `exclude` 里列出的路径不经过 Worker，直接按静态资源返回。

## CI

`.github/workflows/ci.yml` 在推送到 `main` 和提交 PR 时运行 lint 与类型检查；PR 上额外做一次
完整构建，用来发现只有静态导出才会暴露的问题。部署工作流与 CI 相互独立，发布不等待 CI 的结果。

## 维护提示

- 文档的更新日期取自 git 提交记录，部署工作流因此使用完整克隆（`fetch-depth: 0`）；
  浅克隆下页面的更新日期会丢失。
- `src/lib/source.ts` 里 `defineDocs` 的 `dir` 必须是字符串字面量。修改同一处的 `postprocess`
  选项后要重启 `pnpm dev`，否则 Markdown 正文接口会返回 500。
- `next start` 在静态导出模式下不可用，本地查看构建结果用 `pnpm preview`。
