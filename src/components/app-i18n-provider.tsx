'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'fumadocs-core/framework';
import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import {
  DEFAULT_LOCALE,
  LOCALE_ITEMS,
  isLocale,
  stripLocalePrefix,
  type Locale,
} from '@/lib/i18n';
import { uiTranslations } from '@/lib/translations';

/**
 * 站点语言上下文。RootProvider 不传 i18n（词表/语言清单都由这里下发），
 * 根布局以 zh 挂一份，{lang} 路由组再嵌套一份覆盖为当前语言——
 * I18nProvider 是纯 context，嵌套即覆盖，不会产生重复的全局 Provider。
 *
 * onLocaleChange 覆盖 fumadocs 的默认实现：记住用户选择
 * （localStorage['docs-lang']，供根路径语言探测优先采用），
 * 按当前路径的对应语言页跳转；无对应语言页时兜底到该语言首页。
 */
export function AppI18nProvider({ lang, children }: { lang: Locale; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const onLocaleChange = (next: string) => {
    try {
      localStorage.setItem('docs-lang', next);
    } catch {
      // 隐私模式下 localStorage 不可用，仅影响下次访问的默认语言
    }

    const { path } = stripLocalePrefix(pathname ?? '/');
    const rest = path.replace(/^\//, '');
    // 首页与未本地化的区块（如后续 /status 状态页）：切语言落到对应语言首页
    if (rest === '') {
      router.push(next === DEFAULT_LOCALE ? '/' : `/${next}`);
      return;
    }
    router.push(next === DEFAULT_LOCALE ? `/${rest}` : `/${next}/${rest}`);
  };

  return (
    <I18nProvider
      locale={lang}
      locales={LOCALE_ITEMS.map(({ name, locale }) => ({ name, locale }))}
      translations={uiTranslations[lang]}
      onLocaleChange={(next) => {
        if (isLocale(next)) onLocaleChange(next);
      }}
    >
      {children}
    </I18nProvider>
  );
}
