import type { Locale } from './i18n';

/**
 * 站点外壳的各语言小标题：页脚的两列、首页 Markdown 副本的两个小节共用，
 * 同一个概念在全站只保留一种译法。
 * 新增语言补一项，Record<Locale> 会在编译期拦住遗漏。
 * zh / en 以外的条目是按语义直译的草稿，上线前建议由母语者过一遍。
 */
export const SITE_COPY: Record<Locale, { docs: string; resources: string }> = {
  zh: { docs: '文档', resources: '机器可读资源' },
  en: { docs: 'Documentation', resources: 'Machine-readable resources' },
  fr: { docs: 'Documentation', resources: 'Ressources lisibles par machine' },
  ru: { docs: 'Документация', resources: 'Ресурсы для машин' },
  ja: { docs: 'ドキュメント', resources: '機械可読リソース' },
  vi: { docs: 'Tài liệu', resources: 'Tài nguyên máy đọc' },
  'zh-TW': { docs: '文件', resources: '機器可讀資源' },
};
