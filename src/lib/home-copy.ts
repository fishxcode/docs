import { siteConfig } from './site';
import { docsImageRoute, joinRoute } from './shared';
import { DEFAULT_LOCALE, type Locale } from './i18n';

type HomeCopy = {
  /** 页面 <title>、分享卡片、页脚品牌与结构化数据里的站点名 */
  title: string;
  /** 首页大标题（品牌名）下的一句话定位 */
  headline: string;
  /** 定位下方的说明 */
  tagline: string;
  /** meta description；页脚、RSS 与结构化数据也用它介绍本站 */
  description: string;
  /** 主按钮：注册（站外，地址见 siteConfig.links.register） */
  register: string;
  /** 次按钮：进入文档（HOME_START_PATH） */
  docs: string;
  features: ReadonlyArray<{ title: string; details: string }>;
  updated: string;
};

/**
 * 各语言首页文案（纯数据，零组件依赖），按当前业务定位撰写：一站式 AI 模型接入与账号服务平台。
 * localized-home-page.tsx、首页 Markdown 副本、分享图、页脚与结构化数据共用，
 * 新增语言在此补充一项即可。zh 为原文，其余语言为译文。
 */
export const HOME_COPY: Record<Locale, HomeCopy> = {
  zh: {
    title: `${siteConfig.productName} - 一站式 AI 模型接入平台`,
    headline: '主流 AI 模型一网打尽',
    tagline: '覆盖 Claude、Codex、Kiro、Grok、国产模型与多模态模型，满足开发、创作与企业级应用需求',
    description: siteConfig.description,
    register: '立即注册',
    docs: '使用文档',
    features: [
      {
        title: '官方资源，稳定直连',
        details: 'Claude Max、Codex Pro / Plus / Team 官方号池与 OpenAI 官方 API Key 资源直连。',
      },
      {
        title: '多分组覆盖，灵活选择',
        details: 'Codex、Claude、Kiro、Grok、国产与多模态模型分组，按场景选择资源池与倍率。',
      },
      {
        title: '高性价比，按需使用',
        details: '余额按量计费，用多少扣多少；高频 Codex 开发可选固定额度的号池月包。',
      },
      { title: '支持企业接入，批量定制', details: '团队与企业批量调用、定制化方案与专属技术支持。' },
    ],
    updated: '文档持续更新中 · 最近更新 ',
  },
  en: {
    title: `${siteConfig.productName} - One-Stop AI Model Access`,
    headline: 'All mainstream AI models in one place',
    tagline:
      'Claude, Codex, Kiro, Grok, Chinese and multimodal models for development, creative work and enterprise applications',
    description:
      'A one-stop platform for AI model access and accounts: Claude, Codex, Kiro, Grok, Chinese and multimodal models. Stable, cost-effective and ready to use.',
    register: 'Register Now',
    docs: 'Documentation',
    features: [
      {
        title: 'Official resources, direct connections',
        details:
          'Direct access to official Claude Max and Codex Pro, Plus and Team pools, plus official OpenAI API keys.',
      },
      {
        title: 'Many groups, flexible choice',
        details:
          'Groups for Codex, Claude, Kiro, Grok, Chinese and multimodal models. Pick the pool and ratio for each job.',
      },
      {
        title: 'Cost-effective, pay as you go',
        details: 'Pay from your balance for what you use, or pick a fixed-quota pool plan for heavy Codex work.',
      },
      {
        title: 'Built for teams and enterprises',
        details: 'Bulk access for teams and enterprises, custom solutions and dedicated technical support.',
      },
    ],
    updated: 'Continuously updated · Last updated ',
  },
  fr: {
    title: `${siteConfig.productName} - Accès unifié aux modèles d'IA`,
    headline: "Tous les grands modèles d'IA au même endroit",
    tagline:
      'Claude, Codex, Kiro, Grok, modèles chinois et multimodaux pour le développement, la création et les usages en entreprise',
    description:
      "Plateforme unifiée d'accès aux modèles d'IA et de gestion de comptes : Claude, Codex, Kiro, Grok, modèles chinois et multimodaux. Stable, économique et prête à l'emploi.",
    register: "S'inscrire",
    docs: 'Documentation',
    features: [
      {
        title: 'Ressources officielles, connexion directe',
        details:
          'Accès direct aux pools officiels Claude Max et Codex Pro, Plus et Team, ainsi qu’aux clés API officielles OpenAI.',
      },
      {
        title: 'De nombreux groupes au choix',
        details:
          'Des groupes pour Codex, Claude, Kiro, Grok, les modèles chinois et multimodaux : choisissez le pool et le ratio selon l’usage.',
      },
      {
        title: 'Économique, à la demande',
        details:
          'Payez à l’usage depuis votre solde, ou choisissez un forfait mensuel à quota fixe pour un usage intensif de Codex.',
      },
      {
        title: 'Pensé pour les équipes et les entreprises',
        details:
          'Accès en volume pour les équipes et les entreprises, solutions sur mesure et support technique dédié.',
      },
    ],
    updated: 'Mis à jour en continu · Dernière mise à jour le ',
  },
  es: {
    title: `${siteConfig.productName} - Acceso unificado a modelos de IA`,
    headline: 'Todos los grandes modelos de IA en un solo lugar',
    tagline:
      'Claude, Codex, Kiro, Grok, modelos chinos y multimodales para desarrollo, creación y aplicaciones empresariales',
    description:
      'Plataforma integral de acceso a modelos de IA y gestión de cuentas: Claude, Codex, Kiro, Grok, modelos chinos y multimodales. Estable, económica y lista para usar.',
    register: 'Registrarse',
    docs: 'Documentación',
    features: [
      {
        title: 'Recursos oficiales, conexión directa',
        details:
          'Acceso directo a los pools oficiales de Claude Max y Codex Pro, Plus y Team, además de claves API oficiales de OpenAI.',
      },
      {
        title: 'Muchos grupos para elegir',
        details:
          'Grupos para Codex, Claude, Kiro, Grok, modelos chinos y multimodales: elige el pool y el ratio según tu caso.',
      },
      {
        title: 'Económico, pago por uso',
        details:
          'Paga desde tu saldo solo por lo que usas, o elige un plan mensual de cuota fija para uso intensivo de Codex.',
      },
      {
        title: 'Para equipos y empresas',
        details: 'Acceso por volumen para equipos y empresas, soluciones a medida y soporte técnico dedicado.',
      },
    ],
    updated: 'Actualizada continuamente · Última actualización: ',
  },
  pt: {
    title: `${siteConfig.productName} - Acesso unificado a modelos de IA`,
    headline: 'Todos os principais modelos de IA em um só lugar',
    tagline:
      'Claude, Codex, Kiro, Grok, modelos chineses e multimodais para desenvolvimento, criação e aplicações empresariais',
    description:
      'Plataforma completa de acesso a modelos de IA e gestão de contas: Claude, Codex, Kiro, Grok, modelos chineses e multimodais. Estável, econômica e pronta para usar.',
    register: 'Cadastrar',
    docs: 'Documentação',
    features: [
      {
        title: 'Recursos oficiais, conexão direta',
        details:
          'Acesso direto aos pools oficiais Claude Max e Codex Pro, Plus e Team, além de chaves de API oficiais da OpenAI.',
      },
      {
        title: 'Vários grupos para escolher',
        details:
          'Grupos para Codex, Claude, Kiro, Grok, modelos chineses e multimodais: escolha o pool e a proporção para cada caso.',
      },
      {
        title: 'Econômico, pague pelo uso',
        details:
          'Pague pelo saldo apenas o que usar, ou escolha um plano mensal de cota fixa para uso intenso do Codex.',
      },
      {
        title: 'Para equipes e empresas',
        details: 'Acesso em volume para equipes e empresas, soluções sob medida e suporte técnico dedicado.',
      },
    ],
    updated: 'Atualizada continuamente · Última atualização: ',
  },
  ru: {
    title: `${siteConfig.productName} - единый доступ к моделям ИИ`,
    headline: 'Все ведущие модели ИИ в одном месте',
    tagline:
      'Claude, Codex, Kiro, Grok, китайские и мультимодальные модели для разработки, творчества и корпоративных задач',
    description:
      'Единая платформа доступа к моделям ИИ и аккаунтам: Claude, Codex, Kiro, Grok, китайские и мультимодальные модели. Стабильно, выгодно и сразу готово к работе.',
    register: 'Зарегистрироваться',
    docs: 'Документация',
    features: [
      {
        title: 'Официальные ресурсы, прямое подключение',
        details:
          'Прямой доступ к официальным пулам Claude Max и Codex Pro, Plus и Team, а также к официальным API-ключам OpenAI.',
      },
      {
        title: 'Множество групп на выбор',
        details:
          'Группы для Codex, Claude, Kiro, Grok, китайских и мультимодальных моделей: выбирайте пул и коэффициент под задачу.',
      },
      {
        title: 'Выгодно, оплата по факту',
        details:
          'Оплачивайте с баланса только то, что используете, или выберите месячный пакет с фиксированной квотой для активной работы с Codex.',
      },
      {
        title: 'Для команд и компаний',
        details: 'Массовый доступ для команд и компаний, индивидуальные решения и выделенная техническая поддержка.',
      },
    ],
    updated: 'Документация постоянно обновляется · Последнее обновление ',
  },
  ja: {
    title: `${siteConfig.productName} - AI モデルのワンストップ接続`,
    headline: '主要な AI モデルをひとつの場所で',
    tagline:
      'Claude・Codex・Kiro・Grok・中国系モデル・マルチモーダルモデルに対応し、開発・制作・企業利用のニーズに応えます',
    description:
      'AI モデル接続とアカウントサービスのワンストッププラットフォーム。Claude・Codex・Kiro・Grok・中国系モデル・マルチモーダルモデルに対応し、安定・高コスパ・すぐに使えます。',
    register: '今すぐ登録',
    docs: 'ドキュメント',
    features: [
      {
        title: '公式リソースに直接接続',
        details: 'Claude Max、Codex Pro・Plus・Team の公式プールと、OpenAI 公式 API Key のリソースに直接接続します。',
      },
      {
        title: '豊富なグループから選べる',
        details:
          'Codex・Claude・Kiro・Grok・中国系モデル・マルチモーダルモデルのグループから、用途に合うリソースプールと倍率を選べます。',
      },
      {
        title: '高コスパ、使った分だけ',
        details: '残高から使った分だけ従量課金。Codex を多用するなら固定枠の月額プランも選べます。',
      },
      {
        title: '法人・チーム利用に対応',
        details: 'チーム・法人向けの一括利用、カスタマイズ提案、専任の技術サポートを提供します。',
      },
    ],
    updated: '継続的に更新中 · 最終更新 ',
  },
  vi: {
    title: `${siteConfig.productName} - Truy cập mô hình AI một điểm`,
    headline: 'Mọi mô hình AI chủ lưu ở một nơi',
    tagline:
      'Claude, Codex, Kiro, Grok, các mô hình Trung Quốc và đa phương thức cho phát triển, sáng tạo và doanh nghiệp',
    description:
      'Nền tảng truy cập mô hình AI và tài khoản một điểm: Claude, Codex, Kiro, Grok, các mô hình Trung Quốc và đa phương thức. Ổn định, tiết kiệm và dùng được ngay.',
    register: 'Đăng ký ngay',
    docs: 'Tài liệu',
    features: [
      {
        title: 'Tài nguyên chính thức, kết nối trực tiếp',
        details:
          'Kết nối trực tiếp tới pool chính thức Claude Max, Codex Pro, Plus, Team và API Key chính thức của OpenAI.',
      },
      {
        title: 'Nhiều nhóm để lựa chọn',
        details:
          'Nhóm cho Codex, Claude, Kiro, Grok, mô hình Trung Quốc và đa phương thức; chọn pool và hệ số theo nhu cầu.',
      },
      {
        title: 'Tiết kiệm, dùng bao nhiêu trả bấy nhiêu',
        details: 'Trừ số dư theo mức dùng thực tế, hoặc chọn gói tháng hạn mức cố định khi dùng Codex nhiều.',
      },
      {
        title: 'Hỗ trợ đội nhóm và doanh nghiệp',
        details: 'Truy cập số lượng lớn cho đội nhóm và doanh nghiệp, giải pháp tùy chỉnh và hỗ trợ kỹ thuật riêng.',
      },
    ],
    updated: 'Tài liệu được cập nhật liên tục · Cập nhật lần cuối ',
  },
  'zh-TW': {
    title: `${siteConfig.productName} - 一站式 AI 模型接入平台`,
    headline: '主流 AI 模型一網打盡',
    tagline: '涵蓋 Claude、Codex、Kiro、Grok、國產模型與多模態模型，滿足開發、創作與企業級應用需求',
    description:
      '一站式 AI 模型接入與帳號服務平台，涵蓋 Claude、Codex、Kiro、Grok、國產模型與多模態模型，穩定、高性價比、即開即用。',
    register: '立即註冊',
    docs: '使用文件',
    features: [
      {
        title: '官方資源，穩定直連',
        details: 'Claude Max、Codex Pro / Plus / Team 官方號池與 OpenAI 官方 API Key 資源直連。',
      },
      {
        title: '多分組覆蓋，靈活選擇',
        details: 'Codex、Claude、Kiro、Grok、國產與多模態模型分組，依場景選擇資源池與倍率。',
      },
      {
        title: '高性價比，按需使用',
        details: '餘額按量計費，用多少扣多少；高頻 Codex 開發可選固定額度的號池月包。',
      },
      { title: '支援企業接入，批量客製', details: '團隊與企業批量呼叫、客製化方案與專屬技術支援。' },
    ],
    updated: '文件持續更新中 · 最近更新 ',
  },
};

/**
 * 首页文案的源文件（相对仓库根）。首页「最近更新」与 sitemap 的 lastmod
 * 都取它的提交时间：改了文案就是内容更新，两处必须同源，否则页面与
 * sitemap 会对同一次更新给出不同的日期。
 */
export const HOME_COPY_SOURCE = 'src/lib/home-copy.ts';

/** 首页「使用文档」按钮与首页 Markdown 副本共用的入口文档（旧站同样指向 Claude Code 上手页） */
export const HOME_START_PATH = '/start';

/**
 * 首页分享图（og 路由为每种语言的首页各渲染一张）：zh 为 /og/home/image.png，
 * 其余语言 /og/{lang}/home/image.png。
 *
 * 页面一旦定义 openGraph，Next 会整体替换根布局的同名字段，所以首页
 * metadata 必须自带图片，否则分享卡片只剩标题。
 */
export function getHomeImage(lang: Locale) {
  const segments = [...(lang === DEFAULT_LOCALE ? [] : [lang]), 'home', 'image.png'];

  return {
    url: joinRoute(docsImageRoute, segments),
    width: 1200,
    height: 630,
    // 显式声明类型：微信等抓取器不总能从 URL 推断，缺 type 时可能拒绝预取
    type: 'image/png',
    alt: HOME_COPY[lang].title,
  };
}
