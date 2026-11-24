'use client';

import { useEffect } from 'react';

/** 平台主站入口域名；父页面命中其一才视为平台内嵌环境。 */
const PLATFORM_HOSTS = new Set(['fishxcode.com', 'www.fishxcode.com']);

/**
 * 判定本页是否被平台主站 iframe 内嵌。
 *
 * 跨域读不到 parent.location，直接父级来源按能力获取：
 * Chromium/Safari 用 location.ancestorOrigins 的最后一项；Firefox 退回
 * document.referrer。结果在同一文档内不会变化，服务端恒为 false。
 */
let embeddedInPlatform: boolean | undefined;

export function isEmbeddedInPlatform(): boolean {
  if (typeof window === 'undefined') return false;
  embeddedInPlatform ??= detectEmbeddedInPlatform();
  return embeddedInPlatform;
}

function detectEmbeddedInPlatform(): boolean {
  try {
    if (window.self === window.top) return false;
  } catch {
    // self/top 比较被拒本身就说明处于跨域 iframe
  }

  const ancestors = (
    window.location as unknown as { ancestorOrigins?: ArrayLike<string> }
  ).ancestorOrigins;
  if (ancestors && ancestors.length > 0) {
    try {
      return PLATFORM_HOSTS.has(new URL(ancestors[ancestors.length - 1]).host);
    } catch {
      return false;
    }
  }

  try {
    if (document.referrer) return PLATFORM_HOSTS.has(new URL(document.referrer).host);
  } catch {
    // referrer 可能不是合法 URL，按未命中处理
  }
  return false;
}

/**
 * 平台内嵌时的链接导航：主站域名在当前标签页最外层打开，其余 http(s)
 * 链接统一新标签页打开，避免 iframe 被导航走。与 AppLink 的不透明源回退
 * 互为兜底；capture 阶段只改写 target，不阻止浏览器默认行为。
 */
export function IframeLinkGuard() {
  useEffect(() => {
    if (!isEmbeddedInPlatform()) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      const anchor = (
        target instanceof Element ? target.closest('a[href]') : null
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href);
      } catch {
        return;
      }
      if (destination.protocol !== 'https:' && destination.protocol !== 'http:') return;

      if (PLATFORM_HOSTS.has(destination.host)) {
        anchor.target = '_top';
        return;
      }

      // 同页锚点（只变 hash）不弹新页
      if (
        destination.origin === window.location.origin &&
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }
      anchor.target = '_blank';
      anchor.relList.add('noopener', 'noreferrer');
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
