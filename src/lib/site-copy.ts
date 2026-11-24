import type { Locale } from './i18n';

type SiteCopy = {
  /** 页脚两列、首页 Markdown 副本两个小节的标题 */
  docs: string;
  resources: string;
  /** 导航栏的站外入口（地址见 siteConfig.links），zh / en / fr / es / pt 沿用旧文档站的叫法 */
  console: string;
  status: string;
  quota: string;
};

/**
 * 站点外壳的各语言文案：页脚、首页 Markdown 副本与导航栏共用，
 * 同一个概念在全站只保留一种译法。
 * 新增语言补一项，Record<Locale> 会在编译期拦住遗漏。
 * ru / ja / vi / zh-TW 的条目是按语义直译的草稿，上线前建议由母语者过一遍。
 */
export const SITE_COPY: Record<Locale, SiteCopy> = {
  zh: { docs: '文档', resources: '机器可读资源', console: '控制台', status: '服务状态', quota: '额度查询' },
  en: {
    docs: 'Documentation',
    resources: 'Machine-readable resources',
    console: 'Console',
    status: 'Service Status',
    quota: 'Credit Balance',
  },
  fr: {
    docs: 'Documentation',
    resources: 'Ressources lisibles par machine',
    console: 'Console',
    status: 'État du service',
    quota: 'Vérifier le solde',
  },
  es: {
    docs: 'Documentación',
    resources: 'Recursos legibles por máquina',
    console: 'Consola',
    status: 'Estado del servicio',
    quota: 'Consultar saldo',
  },
  pt: {
    docs: 'Documentação',
    resources: 'Recursos legíveis por máquina',
    console: 'Console',
    status: 'Status do serviço',
    quota: 'Verificar saldo',
  },
  ru: {
    docs: 'Документация',
    resources: 'Ресурсы для машин',
    console: 'Консоль',
    status: 'Статус сервиса',
    quota: 'Проверка баланса',
  },
  ja: {
    docs: 'ドキュメント',
    resources: '機械可読リソース',
    console: 'コンソール',
    status: 'サービス状況',
    quota: '残高照会',
  },
  vi: {
    docs: 'Tài liệu',
    resources: 'Tài nguyên máy đọc',
    console: 'Bảng điều khiển',
    status: 'Trạng thái dịch vụ',
    quota: 'Tra cứu số dư',
  },
  'zh-TW': { docs: '文件', resources: '機器可讀資源', console: '控制台', status: '服務狀態', quota: '額度查詢' },
};
