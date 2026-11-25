import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { siteConfig } from './site';
import { SITE_COPY } from './site-copy';
import { HOME_COPY } from './home-copy';
import { localePath, type Locale } from './i18n';

/**
 * 首页与文档区共用的布局选项：品牌与站外主操作。
 *
 * 顶栏只保留控制台和注册按钮；状态页、额度查询、企业服务都收进侧边栏的
 * 「更多服务 / 平台与计费」分组，避免顶栏被入口塞满、也与侧栏重复。
 */
export function baseOptions(lang: Locale): BaseLayoutProps {
  const copy = SITE_COPY[lang];

  return {
    nav: {
      title: (
        <span className="docs-brand inline-flex items-center gap-2">
          {/* logo 是带深色底的方图，裁成圆形后与主站导航栏的样子一致 */}
          <Image src={siteConfig.logo} alt="" width={24} height={24} className="size-6 rounded-full" />
          {siteConfig.productName}
        </span>
      ),
      // 品牌链接回到当前语言的首页，而不是固定的中文首页
      url: localePath(lang, '/'),
    },
    links: [
      { text: copy.console, url: siteConfig.links.console, external: true },
      { type: 'button', text: HOME_COPY[lang].register, url: siteConfig.links.register, external: true },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
