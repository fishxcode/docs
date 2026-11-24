import Image from 'next/image';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { siteConfig } from './site';
import { SITE_COPY } from './site-copy';
import { HOME_COPY } from './home-copy';
import { localePath, type Locale } from './i18n';

/**
 * 首页与文档区共用的布局选项：品牌、导航入口与 GitHub 链接。
 * 入口依次是控制台、站内服务状态、额度查询、企业服务与「立即注册」按钮，文字跟随页面语言。
 */
export function baseOptions(lang: Locale): BaseLayoutProps {
  const copy = SITE_COPY[lang];

  return {
    nav: {
      title: (
        <>
          {/* logo 是带深色底的方图，裁成圆形后与主站导航栏的样子一致 */}
          <Image src={siteConfig.logo} alt="" width={24} height={24} className="size-6 rounded-full" />
          {siteConfig.productName}
        </>
      ),
      // 品牌链接回到当前语言的首页，而不是固定的中文首页
      url: localePath(lang, '/'),
    },
    links: [
      { text: copy.console, url: siteConfig.links.console, external: true },
      // 状态页仅提供默认语言版本，所有语言的导航都指向同一个中文页面
      { text: copy.status, url: siteConfig.links.status, active: 'nested-url' },
      { text: copy.quota, url: siteConfig.links.quota, external: true },
      { text: copy.enterprise, url: siteConfig.links.enterprise, external: true },
      { type: 'button', text: HOME_COPY[lang].register, url: siteConfig.links.register, external: true },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
