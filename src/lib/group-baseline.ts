import type { Locale } from '@/lib/i18n';

/**
 * 在售分组的内置基线：分组名、倍率、归类与各语言的分组说明。
 *
 * 这是文档页分组组件（group-ratio-table.tsx 的 GroupRatioTable /
 * RatioExampleTable / LiveRatio / GroupCount）与首页（home-copy.ts 的
 * HOME_GROUPS）共用的唯一数字来源：页面挂载后会从站内 /api/pricing 反代拉
 * 最新倍率原位替换，拉取失败时回退到这里，因此本清单只在分组结构变化
 * （新增/下线分组）时需要人工核对一次。
 *
 * 说明列各语言手工维护（接口 usable_group 只有中英双语，且部分说明为空串或
 * 非正式文案，直接展示不合适）；zh 页运行时优先展示接口的中文说明，缺失时
 * 回退到这里的译文。
 *
 * 基线数值：2026-11-27 与主站 /api/pricing 对齐。
 */
export type GroupCategory = 'codex' | 'claude' | 'other';

export interface GroupBaselineItem {
  name: string;
  /** 基线倍率，展示时经 formatRatioValue 格式化（去浮点误差、截两位小数） */
  ratio: number;
  category: GroupCategory;
  /** 各语言的分组说明：SSG 初屏展示，接口缺说明时也是回退值 */
  description: Record<Locale, string>;
}

export const GROUP_BASELINE: ReadonlyArray<GroupBaselineItem> = [
  {
    name: 'codex-plus',
    ratio: 0.2,
    category: 'codex',
    description: {
      zh: 'Codex Plus 官方正价系列号池，低倍率、稳定可用，适合日常调用',
      'zh-TW': 'Codex Plus 官方正價系列號池，低倍率、穩定可用，適合日常呼叫',
      en: 'Codex Plus official full-price account pool; low multiplier, stable, suited to daily calls',
      fr: 'Pool de comptes officiel au prix plein Codex Plus ; multiplicateur bas, stable, adapté aux appels quotidiens',
      es: 'Pool oficial de precio completo Codex Plus; multiplicador bajo, estable, ideal para llamadas diarias',
      pt: 'Pool de contas da série oficial a preço cheio do Codex Plus; multiplicador baixo, estável e disponível, adequado para uso diário',
      ru: 'Пул официальных аккаунтов серии Codex Plus, оплаченных по полной цене: низкий коэффициент и стабильная работа, подходит для повседневных вызовов',
      ja: 'Codex Plus の公式正価格シリーズのアカウントプール。低倍率で安定して利用でき、日常的な呼び出しに適しています',
      vi: 'Pool tài khoản chính thức dòng Codex Plus mua theo giá gốc; hệ số thấp, ổn định, phù hợp để gọi hằng ngày',
    },
  },
  {
    name: 'codex-pro',
    ratio: 0.4,
    category: 'codex',
    description: {
      zh: 'Codex Pro 官方正价系列资源，性能稳定，适合团队与企业',
      'zh-TW': 'Codex Pro 官方正價系列資源，效能穩定，適合團隊與企業',
      en: 'Codex Pro official full-price resources; stable performance, suited to teams and enterprises',
      fr: 'Ressources officielles au prix plein Codex Pro ; performances stables, adapté aux équipes et entreprises',
      es: 'Recursos oficiales de precio completo Codex Pro; rendimiento estable, ideal para equipos y empresas',
      pt: 'Recursos da série oficial a preço cheio do Codex Pro; desempenho estável, adequado para equipes e empresas',
      ru: 'Официальные ресурсы серии Codex Pro, оплаченные по полной цене: стабильная производительность, подходит для команд и компаний',
      ja: 'Codex Pro の公式正価格シリーズのリソース。性能が安定しており、チームや企業向け',
      vi: 'Tài nguyên chính thức dòng Codex Pro mua theo giá gốc; hiệu năng ổn định, phù hợp với đội nhóm và doanh nghiệp',
    },
  },
  {
    name: 'codex-team',
    ratio: 0.12,
    category: 'codex',
    description: {
      zh: 'Codex Team 官方系列共享号池，低倍率共享资源',
      'zh-TW': 'Codex Team 官方系列共享號池，低倍率共享資源',
      en: 'Codex Team official shared account pool; low-multiplier shared resources',
      fr: 'Pool partagé officiel de la série Codex Team ; ressources partagées à multiplicateur bas',
      es: 'Pool compartido oficial de la serie Codex Team; recursos compartidos con multiplicador bajo',
      pt: 'Pool de contas compartilhado da série oficial Codex Team; recursos compartilhados com multiplicador baixo',
      ru: 'Общий пул официальных аккаунтов серии Codex Team: совместно используемые ресурсы по низкому коэффициенту',
      ja: 'Codex Team の公式シリーズ共有アカウントプール。低倍率の共有リソース',
      vi: 'Pool tài khoản dùng chung chính thức dòng Codex Team; tài nguyên dùng chung với hệ số thấp',
    },
  },
  {
    name: 'codex-ultrafast',
    ratio: 0.4,
    category: 'codex',
    description: {
      zh: 'codex-pro 号池的 ultrafast 模式，无限制，稳定性优先',
      'zh-TW': 'codex-pro 號池的 ultrafast 模式，無限制，穩定性優先',
      en: 'ultrafast mode of the codex-pro pool; unlimited, stability-first',
      fr: "Mode ultrafast du pool codex-pro ; sans limite, priorité stabilité",
      es: 'Modo ultrafast del pool codex-pro; sin límites, prioriza estabilidad',
      pt: 'Modo ultrafast do pool codex-pro; sem limites, prioriza estabilidade',
      ru: 'Режим ultrafast пула codex-pro: без ограничений, приоритет стабильности',
      ja: 'codex-pro プールの ultrafast モード。無制限、安定性重視',
      vi: 'Chế độ ultrafast của pool codex-pro; không giới hạn, ưu tiên ổn định',
    },
  },
  {
    name: 'codex-officially',
    ratio: 2,
    category: 'codex',
    description: {
      zh: 'OpenAI 官方 API Key 资源，官方直连，稳定可靠',
      'zh-TW': 'OpenAI 官方 API Key 資源，官方直連，穩定可靠',
      en: 'OpenAI official API Key resources; direct official connection, stable and reliable',
      fr: 'Ressources de clé API officielle OpenAI ; connexion officielle directe, stable et fiable',
      es: 'Recursos de API Key oficial de OpenAI; conexión oficial directa, estable y fiable',
      pt: 'Recursos de API Key oficial da OpenAI; conexão direta oficial, estável e confiável',
      ru: 'Ресурсы официальных API Key OpenAI: прямое подключение, стабильно и надёжно',
      ja: 'OpenAI 公式 API Key のリソース。公式直接続で安定・信頼性が高い',
      vi: 'Tài nguyên API Key chính thức của OpenAI; kết nối trực tiếp chính thức, ổn định và đáng tin cậy',
    },
  },
  {
    name: 'claude',
    ratio: 1.5,
    category: 'claude',
    description: {
      zh: 'Claude Max 20 官方正价号池，满血性能，稳定直连',
      'zh-TW': 'Claude Max 20 官方正價號池，滿血效能，穩定直連',
      en: 'Official full-price Claude Max 20 account pool; full performance with a stable direct connection',
      fr: 'Pool de comptes officiel au prix plein Claude Max 20 ; performances complètes et connexion directe stable',
      es: 'Pool oficial de precio completo Claude Max 20; pleno rendimiento y conexión directa estable',
      pt: 'Pool de contas oficial a preço cheio do Claude Max 20; desempenho pleno, conexão direta estável',
      ru: 'Пул официальных аккаунтов Claude Max 20, оплаченных по полной цене: полная производительность, стабильное прямое подключение',
      ja: 'Claude Max 20 の公式正価格アカウントプール。フルスペックの性能で安定した直接続',
      vi: 'Pool tài khoản chính thức Claude Max 20 mua theo giá gốc; hiệu năng đầy đủ, kết nối trực tiếp ổn định',
    },
  },
  {
    name: 'claudemax',
    ratio: 2.6,
    category: 'claude',
    description: {
      zh: 'Claude Max 20 千级号池，高速接入、只读管理，支持人工溯源',
      'zh-TW': 'Claude Max 20 千級號池，高速接入、唯讀管理，支援人工溯源',
      en: 'Claude Max 20 pool of thousands of accounts; high-speed access, read-only management, manual traceability supported',
      fr: 'Pool de milliers de comptes Claude Max 20 ; accès à haute vitesse, gestion en lecture seule, traçabilité manuelle',
      es: 'Pool de miles de cuentas Claude Max 20; acceso de alta velocidad, gestión de solo lectura y trazabilidad manual',
      pt: 'Pool de contas com milhares de contas do Claude Max 20; acesso de alta velocidade, gestão somente leitura, com rastreamento manual disponível',
      ru: 'Пул из тысяч аккаунтов Claude Max 20: быстрое подключение, управление в режиме только для чтения, поддерживается ручная трассировка запросов',
      ja: 'Claude Max 20 の千規模アカウントプール。高速アクセス・読み取り専用管理で、手動でのトレース対応に対応',
      vi: 'Pool hàng nghìn tài khoản Claude Max 20; kết nối tốc độ cao, quản lý chỉ đọc, hỗ trợ truy vết thủ công',
    },
  },
  {
    name: 'kiro-svip',
    ratio: 0.2,
    category: 'other',
    description: {
      zh: 'Kiro 官方正价号池，稳定接入，低倍率',
      'zh-TW': 'Kiro 官方正價號池，穩定接入，低倍率',
      en: 'Official full-price Kiro account pool; stable access, low multiplier',
      fr: 'Pool de comptes officiel au prix plein de Kiro ; accès stable, multiplicateur bas',
      es: 'Pool oficial de precio completo de Kiro; acceso estable, multiplicador bajo',
      pt: 'Pool de contas oficial a preço cheio do Kiro; conexão estável, multiplicador baixo',
      ru: 'Пул официальных аккаунтов Kiro, оплаченных по полной цене: стабильное подключение, низкий коэффициент',
      ja: 'Kiro の公式正価格アカウントプール。安定した接続で低倍率',
      vi: 'Pool tài khoản chính thức Kiro mua theo giá gốc; kết nối ổn định, hệ số thấp',
    },
  },
  {
    name: 'china',
    ratio: 0.8,
    category: 'other',
    description: {
      zh: '国产主流模型合集，官方 API 直连',
      'zh-TW': '國產主流模型合輯，官方 API 直連',
      en: 'Collection of mainstream Chinese models, official API direct connection',
      fr: 'Collection de modèles nationaux majeurs, connexion directe par API officielle',
      es: 'Conjunto de modelos nacionales principales, conexión directa por API oficial',
      pt: 'Conjunto dos principais modelos chineses; conexão direta via API oficial',
      ru: 'Подборка популярных китайских моделей, прямое подключение к официальному API',
      ja: '中国産主要モデルのコレクション。公式 API 直接続',
      vi: 'Tổng hợp các mô hình phổ biến của Trung Quốc, kết nối trực tiếp API chính thức',
    },
  },
  {
    name: 'gemini',
    ratio: 0.8,
    category: 'other',
    description: {
      zh: 'Gemini 系列全模型分组',
      'zh-TW': 'Gemini 系列全模型分組',
      en: 'Full Gemini model series',
      fr: 'Série complète de modèles Gemini',
      es: 'Serie completa de modelos Gemini',
      pt: 'Série completa de modelos Gemini',
      ru: 'Полная серия моделей Gemini',
      ja: 'Gemini シリーズ全モデルのグループ',
      vi: 'Nhóm toàn bộ mô hình dòng Gemini',
    },
  },
  {
    name: 'grok',
    ratio: 0.5,
    category: 'other',
    description: {
      zh: 'xAI Grok 模型专属分组，低倍率体验 Grok 能力',
      'zh-TW': 'xAI Grok 模型專屬分組，低倍率體驗 Grok 能力',
      en: 'Dedicated group for xAI Grok models; experience Grok at a low multiplier',
      fr: "Groupe dédié aux modèles xAI Grok ; découvrez Grok à multiplicateur bas",
      es: 'Grupo exclusivo de los modelos xAI Grok; prueba Grok con multiplicador bajo',
      pt: 'Grupo exclusivo dos modelos xAI Grok; experimente o Grok com multiplicador baixo',
      ru: 'Выделенная группа для моделей xAI Grok: возможности Grok по низкому коэффициенту',
      ja: 'xAI Grok モデル専用グループ。低倍率で Grok の能力を体験できます',
      vi: 'Nhóm dành riêng cho mô hình xAI Grok, trải nghiệm khả năng của Grok với hệ số thấp',
    },
  },
  {
    name: 'fishxlab',
    ratio: 2,
    category: 'other',
    description: {
      zh: '音频、视频、图像等多模态模型，覆盖生成与创作场景',
      'zh-TW': '音訊、影片、影像等多模態模型，涵蓋生成與創作情境',
      en: 'Multimodal models for audio, video, and images, covering generation and creation scenarios',
      fr: "Modèles multimodaux pour l'audio, la vidéo et l'image, couvrant génération et création",
      es: 'Modelos multimodales de audio, vídeo e imagen, para generación y creación',
      pt: 'Modelos multimodais como áudio, vídeo e imagem; cobre cenários de geração e criação',
      ru: 'Мультимодальные модели для аудио, видео, изображений и других данных; охватывают сценарии генерации и создания контента',
      ja: '音声、動画、画像などのマルチモーダルモデル。生成・創作シーンをカバー',
      vi: 'Các mô hình đa phương thức như âm thanh, video, hình ảnh, bao quát các tình huống tạo nội dung và sáng tạo',
    },
  },
  {
    name: 'tencent-china',
    ratio: 0.1,
    category: 'other',
    description: {
      zh: '腾讯云国产模型分组，当前倍率最低',
      'zh-TW': '騰訊雲國產模型分組，當前倍率最低',
      en: 'Tencent Cloud Chinese models; currently the lowest multiplier',
      fr: 'Modèles chinois de Tencent Cloud ; multiplicateur le plus bas actuel',
      es: 'Modelos chinos de Tencent Cloud; el multiplicador más bajo actual',
      pt: 'Modelos chineses da Tencent Cloud; menor multiplicador atual',
      ru: 'Китайские модели Tencent Cloud; самый низкий коэффициент на данный момент',
      ja: 'Tencent Cloud の中国系モデルグループ。現時点で最も低い倍率',
      vi: 'Mô hình Trung Quốc của Tencent Cloud; hệ số thấp nhất hiện tại',
    },
  },
];

/** 页面语言下某分组的基线说明 */
export function baselineDescription(group: string, lang: Locale): string {
  const item = GROUP_BASELINE.find((entry) => entry.name === group);
  return item?.description[lang] ?? '';
}

/**
 * 接口倍率格式化：与首页同一显示口径——去掉浮点误差并截断到两位小数
 * （0.12000001 → 0.12x）。无效值返回 null，调用方保留基线倍率。
 */
export function formatRatioValue(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${Number(value.toFixed(2))}x`;
}

/** 基线倍率 → 展示串（0.12 → '0.12x'），与 formatRatioValue 同一口径 */
export const baselineRatioLabel = (ratio: number): string => `${Number(ratio.toFixed(2))}x`;

/**
 * 接口只给 name→ratio，基线里没有的分组按名称推断归类：
 * codex- 前缀进 Codex 系列，claude 系进 Claude 系列，其余进「其他模型」。
 */
export function categoryOf(name: string, known?: GroupCategory): GroupCategory {
  if (known) return known;
  if (name.startsWith('codex-')) return 'codex';
  if (name === 'claude' || name.startsWith('claude-') || name.startsWith('claudemax')) return 'claude';
  return 'other';
}
