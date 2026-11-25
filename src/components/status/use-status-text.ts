'use client';

/**
 * 状态页的语言入口。
 *
 * 状态页在三套路由（总览 / 厂商 / 单模型）中共用一套文案，语言从
 * AppI18nProvider 的上下文读取，路由文件不需要逐层传 locale。
 * 数字与日期按当前语言格式化，文案缺失时回退简体中文原文。
 */

import { useCallback } from 'react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { DEFAULT_LOCALE, HTML_LANG, isLocale, type Locale } from '@/lib/i18n';
import { statusText, type StatusVars } from '@/lib/status-copy';

export function useStatusText() {
  const { locale } = useI18n();
  const lang: Locale = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  const bcp47 = HTML_LANG[lang];

  // 钩子会作为 effect 依赖，函数引用必须随语言而非渲染次数变化
  const s = useCallback(
    (source: string, vars?: StatusVars): string => statusText(lang, source, vars),
    [lang],
  );

  const formatNumber = useCallback(
    (value: number | null | undefined, suffix = ''): string => {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
      return `${new Intl.NumberFormat(bcp47, { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(value)}${suffix}`;
    },
    [bcp47],
  );

  const formatTime = useCallback(
    (value: string | number | null | undefined): string => {
      if (value === null || value === undefined || value === '') return '—';
      // 性能接口的 ts/window 是 Unix 秒；状态站的 checkedAt 是 ISO 字符串
      const date = new Date(typeof value === 'number' ? value * 1000 : value);
      if (Number.isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat(bcp47, {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    },
    [bcp47],
  );

  return { lang, s, formatNumber, formatTime };
}
