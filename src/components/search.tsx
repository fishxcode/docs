'use client';

import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useStaticSearch } from 'fumadocs-core/search/client/orama-static';
import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import { usePathname } from 'fumadocs-core/framework';
import { create as createDb } from 'zbsearch';
import { createCjkTokenizer } from '@/lib/cjk-tokenizer';
import { stripLocalePrefix, type Locale } from '@/lib/i18n';
import { uiTranslations } from '@/lib/translations';

// 索引 schema 必须与 fumadocs 服务端的 advancedSchema 一致，否则 load 会失败。
const SCHEMA = {
  content: 'string',
  page_id: 'string',
  type: 'string',
  breadcrumbs: 'string[]',
  tags: 'enum[]',
  url: 'string',
  locale: 'enum',
  embeddings: 'vector[512]',
} as const;

/**
 * 多语言搜索弹窗。
 *
 * RootProvider 渲染的搜索弹窗与页面里的 AppI18nProvider 是兄弟节点，
 * 无法通过 context 拿到路由语言；这里从路径前缀独立恢复语言上下文，
 * 并在弹窗内重挂 I18nProvider（词表 + locale）。
 *
 * 搜索完全在浏览器内完成：索引由 src/app/static.json/[locale]/route.ts 在
 * 构建期按语言导出，这里只加载当前语言那一份，不依赖任何运行时接口。
 */
export default function SearchDialogWithLocale(props: SharedProps) {
  const { lang } = stripLocalePrefix(usePathname() ?? '/');

  return (
    <I18nProvider locale={lang} translations={uiTranslations[lang]}>
      <LocalizedSearchDialog key={lang} locale={lang} {...props} />
    </I18nProvider>
  );
}

function LocalizedSearchDialog({ locale, ...props }: SharedProps & { locale: Locale }) {
  // 索引文件是「单库」格式（不套 i18n 外包装），所以不把 locale 传给 staticClient——
  // 传了它会去找名为该 locale 的分库，找不到就退回第一份并打印警告。
  // 分词器与 src/lib/search-server.ts 成对使用，保证查询与建索引按同一规则切分。
  const search = useStaticSearch({
    from: `/static.json/${locale}`,
    initDB: () => createDb({ schema: SCHEMA, components: { tokenizer: createCjkTokenizer() } }),
  });

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
    </SearchDialog>
  );
}
