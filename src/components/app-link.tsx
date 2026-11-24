'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * 页面是否运行在不透明源（opaque origin）里。
 *
 * 主站（new-api）用 sandbox iframe 嵌入文档站，且 sandbox 不含
 * allow-same-origin——此时 window.origin 为字符串 "null"，页面发往
 * docs.fishxcode.com 自身的请求也全部按跨域处理（请求头 Origin: null）。
 * 同一文档内不会变化；服务端恒为 false。
 */
export const isOpaqueOrigin = typeof window !== 'undefined' && window.origin === 'null';

/** 只收 <a> 属性 + 字符串 href + prefetch，不透明源下才能无损退回原生 <a> */
type LinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  prefetch?: boolean | 'auto' | null;
};

/**
 * 不透明源下的站内链接：原生 <a>，走普通的文档导航。
 *
 * Next 的客户端路由（预取与点击跳转）都要拉 RSC 数据，跨域会触发
 * OPTIONS 预检；静态站点不处理预检，DevTools 里会出现满屏 CORS 错误。
 * 原生 <a> 不受 CORS 约束，且输出的 DOM 与 next/link 一致。
 */
function PlainAnchor({ href, prefetch: _prefetch, ...props }: LinkProps) {
  return <a {...props} href={href} />;
}

/** 站内链接的统一出口，全站替代 next/link */
export default function AppLink(props: LinkProps) {
  return isOpaqueOrigin ? <PlainAnchor {...props} /> : <NextLink {...props} />;
}

/**
 * 注入 RootProvider 的版本（Fumadocs 的导航、侧栏、目录等内部链接都走这里）。
 * href 可缺省——与 fumadocs-core/link 一致回退为 '#'。
 */
export function FrameworkLink({ href = '#', ...props }: Omit<LinkProps, 'href'> & { href?: string }) {
  return isOpaqueOrigin ? <PlainAnchor {...props} href={href} /> : <NextLink {...props} href={href} />;
}
