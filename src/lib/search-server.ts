import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';
import { createCjkTokenizer } from '@/lib/cjk-tokenizer';
import { LOCALES } from '@/lib/i18n';

/**
 * ZBSearch 站点搜索索引。构建时由 `src/app/static.json/[locale]/route.ts`
 * 按语言分别导出为静态 JSON，浏览器端只加载当前语言那一份，
 * 不依赖任何外部服务或密钥。
 *
 * 传入 localeMap 后，createFromSource 按 locale 分库建索引，导出格式为
 * { type: 'i18n', data: { zh: …, en: … } }：每种语言可以独立配分词器，路由层
 * 再按语言拆成独立文件——单个文件不随语言数线性增长（Cloudflare Pages
 * 单文件上限 25 MiB），客户端也只加载当前语言那一份。
 * 正文尚未翻译的语言同样有索引：loader 的回退机制会把默认语言的页面以
 * 该语言的 locale 与 URL 前缀提供出来（如 /fr/introduction）。
 *
 * 分词器与浏览器端 src/components/search.tsx 成对使用，保证建索引与查询按
 * 同一规则切分。实测（zbsearch 4.0.4）默认分词器同样能命中中文查询、结果与
 * 排序一致，自定义分词器会让索引原始体积增加约四分之一；这里保留它是为了
 * 不依赖默认分词器的内部实现，属于取舍而非必需。
 */
export const searchServer = createFromSource(source, {
  localeMap: Object.fromEntries(
    LOCALES.map((locale) => [locale, { tokenizer: createCjkTokenizer() }]),
  ),
});
