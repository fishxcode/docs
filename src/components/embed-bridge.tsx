'use client';

import { useEffect } from 'react';
import { useTheme } from 'fumadocs-ui/provider/base';

declare global {
  interface Window {
    /** 根布局首帧脚本收下的平台主题（见 layout.tsx），尚未收到时为 undefined */
    __embedTheme?: 'light' | 'dark';
    /** 根布局首帧脚本收下的平台语言代码（主站 i18next 值），尚未收到时为 undefined */
    __embedLang?: string;
  }
}

/** 首帧脚本给 <html> 加的类；iframe 内的主题/语言同步以此为准 */
function inPlatformFrame(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('in-iframe');
}

/**
 * 平台内嵌时的明暗主题同步。
 *
 * 主站（new-api）在 iframe 加载完成、以及用户切换主题时 postMessage
 * `{ themeMode }`。消息由根布局首帧脚本接收（React 水合前就可能到达），
 * 存到 window.__embedTheme 并派发 `fishxcode:embed-theme`；这里在挂载时
 * 补读一次已到达的值，之后跟随事件更新。不透明源下主题只在本页生效。
 */
export function EmbedThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!inPlatformFrame()) return;
    const apply = () => {
      if (window.__embedTheme) setTheme(window.__embedTheme);
    };
    apply();
    window.addEventListener('fishxcode:embed-theme', apply);
    return () => window.removeEventListener('fishxcode:embed-theme', apply);
  }, [setTheme]);

  return null;
}

/** 主站 i18next 语言代码 → 本站 URL 前缀。未支持的语言保持当前页面。 */
const LOCALE_BY_PARENT_LANG: Record<string, string> = {
  zhCN: 'zh',
  'zh-CN': 'zh',
  zh: 'zh',
  en: 'en',
  fr: 'fr',
  es: 'es',
  pt: 'pt',
  ru: 'ru',
  ja: 'ja',
  vi: 'vi',
  zhTW: 'zh-TW',
  'zh-TW': 'zh-TW',
};

/** 本站已有的非默认语言前缀；顺序与 src/lib/i18n.ts 的 LOCALES 一致 */
const PREFIXES = ['en', 'fr', 'es', 'pt', 'ru', 'ja', 'vi', 'zh-TW'];

/**
 * 主站 iframe 的语言跟随：整页导航到对应语言前缀，避免不透明源下的
 * 客户端路由 RSC 请求。当前已是目标语言或用户手动切过语言时不干预。
 * 根路径的浏览器语言探测在 in-iframe 下会跳过，避免两者来回跳转。
 */
export function EmbedLocaleSync() {
  useEffect(() => {
    if (!inPlatformFrame()) return;
    const apply = () => {
      const rawLang = window.__embedLang;
      if (!rawLang) return;
      const locale = LOCALE_BY_PARENT_LANG[rawLang];
      if (!locale) return;
      try {
        if (localStorage.getItem('docs-lang')) return;
      } catch {
        // 隐私模式下 localStorage 不可用，仍按平台语言跳转
      }

      const segments = location.pathname.split('/').filter(Boolean);
      const current = PREFIXES.includes(segments[0]) ? segments[0] : 'zh';
      if (current === locale) return;
      const rest = current === 'zh' ? segments : segments.slice(1);
      const path = `/${[locale === 'zh' ? '' : locale, ...rest].filter(Boolean).join('/')}`;
      const target = `${path}${location.search}${location.hash}`;
      if (target !== `${location.pathname}${location.search}${location.hash}`) location.assign(target);
    };

    apply();
    window.addEventListener('fishxcode:embed-lang', apply);
    return () => window.removeEventListener('fishxcode:embed-lang', apply);
  }, []);

  return null;
}
