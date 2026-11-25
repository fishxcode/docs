import Link from '@/components/app-link';
import { source } from '@/lib/source';
import { HOME_COPY } from '@/lib/home-copy';
import { SITE_COPY } from '@/lib/site-copy';
import { localePath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';

/** `staticFile`：TXT / XML 等静态文件，不是页面，必须走浏览器原生导航 */
type FooterLink = { label: string; href: string; staticFile?: boolean };

/**
 * 页脚「文档」一列最多列出的入口数。它只是侧边栏的补充导航，
 * 文档变多时整棵树放进来会把页脚撑得很长。
 */
const MAX_DOC_LINKS = 6;

const linkClass =
  'rounded-sm text-sm text-fd-muted-foreground transition-colors hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary';

/** 侧边栏的顶层入口（页面，或目录的首页）：页脚跟着各语言页树走，不手写路径。 */
function docLinks(lang: Locale): FooterLink[] {
  return source
    .getPageTree(lang)
    .children.flatMap((node) => {
      // 分组目录只有链接节点、没有 index 页，取第一个可点页面作为页脚入口
      const candidate =
        node.type === 'folder'
          ? (node.index ?? node.children.find((child) => child.type === 'page'))
          : undefined;
      const entry = node.type === 'page' ? node : candidate;
      return entry?.type === 'page' && typeof node.name === 'string'
        ? [{ label: node.name, href: entry.url }]
        : [];
    })
    .slice(0, MAX_DOC_LINKS);
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-fd-foreground">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.staticFile ? (
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 站点公共底部。首页与文档布局共用这一份，避免两边各写一套、改一处漏一处。
 *
 * 只放三类能从本仓库确认的东西：品牌与一句话介绍、文档入口（随页树生成）、
 * 机器可读资源。平台功能页（控制台、密钥、钱包等）属于主站，不在这里重复。
 */
export function SiteFooter({ lang }: { lang: Locale }) {
  const copy = SITE_COPY[lang];
  const lp = (path: string) => localePath(lang, path);
  const docs = docLinks(lang);

  const resources: FooterLink[] = [
    { label: 'llms.txt', href: lp('/llms.txt'), staticFile: true },
    { label: 'llms-full.txt', href: lp('/llms-full.txt'), staticFile: true },
    { label: 'RSS', href: lp('/rss.xml'), staticFile: true },
    { label: 'sitemap.xml', href: '/sitemap.xml', staticFile: true },
  ];

  return (
    <footer className="border-t border-fd-border bg-fd-card/40">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-12">
        {/* 手机单列；sm 起两列；md 起品牌块占宽、两列链接并排 */}
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href={lp('/')}
              className="text-base font-semibold text-fd-foreground transition-colors hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary"
            >
              {HOME_COPY[lang].title}
            </Link>
            <p className="mt-4 max-w-xs text-pretty text-sm text-fd-muted-foreground">
              {HOME_COPY[lang].description}
            </p>
          </div>

          {docs.length > 0 ? <LinkColumn title={copy.docs} links={docs} /> : null}
          <LinkColumn title={copy.resources} links={resources} />
        </div>

        {/* 年份在构建期取值：静态导出后不会在浏览器里跨年变化，重新部署即更新 */}
        <p className="mt-12 border-t border-fd-border pt-6 text-xs text-fd-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.productName}
        </p>
      </div>
    </footer>
  );
}
