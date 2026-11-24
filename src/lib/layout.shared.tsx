import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { siteConfig } from './site';
import { SITE_COPY } from './site-copy';
import { HOME_COPY } from './home-copy';
import { localePath, type Locale } from './i18n';

/**
 * 首页与文档区共用的布局选项：品牌、站外入口与 GitHub 链接。
 * 站外入口与旧文档站的导航一致（控制台、服务状态、额度查询、立即注册），文字跟随页面语言。
 */
export function baseOptions(lang: Locale): BaseLayoutProps {
  const copy = SITE_COPY[lang];

  return {
    nav: {
      title: (
        <>
          <Image src={siteConfig.logo} alt="" width={24} height={24} className="size-6" />
          {siteConfig.productName}
        </>
      ),
      // 品牌链接回到当前语言的首页，而不是固定的中文首页
      url: localePath(lang, '/'),
    },
    links: [
      { text: copy.console, url: siteConfig.links.console, external: true },
      { text: copy.status, url: siteConfig.links.status, external: true },
      { text: copy.quota, url: siteConfig.links.quota, external: true },
      { type: 'button', text: HOME_COPY[lang].register, url: siteConfig.links.register, external: true },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
