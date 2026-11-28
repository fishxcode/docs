import { siteConfig } from './site';
import { docsImageRoute, joinRoute } from './shared';
import { DEFAULT_LOCALE, type Locale } from './i18n';
import { GROUP_BASELINE, baselineRatioLabel, type GroupCategory } from './group-baseline';

/*
 * 首页的全部可见内容都由本文件决定（首页「最近更新」与 sitemap 的 lastmod 都取本文件的
 * 提交时间，见 HOME_COPY_SOURCE），所以语言无关的业务数据也放在这里，不拆到别处。
 */

/** 把文案里的 {name} 占位符替换成实际值；没有对应值的占位符原样保留 */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

// ─────────────────────────────────────────────── 语言无关的业务数据

export type { GroupCategory };

/**
 * 在售分组与倍率的首页基线：由 group-baseline.ts 的 GROUP_BASELINE 派生（同一
 * 数字来源，避免两处倍率漂移）。首页「在售分组与倍率」区块会运行时从
 * /api/pricing 拉最新倍率（见 GroupRatioList），拉取失败时回退到这里；
 * llms 的首页 Markdown 副本（discovery.ts，构建期静态生成）也用这份派生值。
 */
export const HOME_GROUPS: ReadonlyArray<{ name: string; ratio: string; category: GroupCategory }> =
  GROUP_BASELINE.map(({ name, ratio, category }) => ({ name, ratio: baselineRatioLabel(ratio), category }));

/**
 * 首页展示的客户端教程，顺序同侧边栏。path 是文档页路径（渲染时加语言前缀）；
 * 没有 icon 的显示首字母；featured 的出现在首屏图标跑马灯里。
 */
export const HOME_CLIENTS: ReadonlyArray<{ name: string; path: string; icon?: string; featured?: boolean }> = [
  { name: 'Claude Code', path: '/start', icon: '/img/clients/claude-code.png', featured: true },
  { name: 'Claude Desktop', path: '/claude-desktop', icon: '/img/clients/claude-code.png' },
  { name: 'ZCF', path: '/zcf' },
  { name: 'Codex', path: '/codex', icon: '/img/clients/codex.png', featured: true },
  { name: 'Codex Desktop', path: '/codex-desktop', icon: '/img/clients/codex.png' },
  { name: 'Cursor', path: '/cursor', icon: '/img/clients/cursor.png', featured: true },
  { name: 'Roo Code', path: '/roocode', icon: '/img/clients/roo-code.png', featured: true },
  { name: 'Qwen Code', path: '/qwencode', icon: '/img/clients/qwen-code.png', featured: true },
  { name: 'Droid', path: '/droid', icon: '/img/clients/droid.png' },
  { name: 'OpenCode', path: '/opencode', icon: '/img/clients/opencode.png', featured: true },
  { name: 'Hermes', path: '/hermes', icon: '/img/clients/hermes.png' },
  { name: 'OpenClaw', path: '/openclaw', icon: '/img/clients/openclaw.png', featured: true },
  { name: 'WorkBuddy', path: '/workbuddy', icon: '/img/clients/workbuddy.png' },
  { name: 'CodeBuddy', path: '/codebuddy', icon: '/img/clients/codebuddy.png', featured: true },
  { name: 'QClaw', path: '/qclaw' },
];

/** 模型供应商标签：取自定价接口里有在售模型的厂商，统一链接到模型列表页 */
export const HOME_PROVIDERS = ['OpenAI', 'Anthropic Claude', 'Google Gemini', 'xAI Grok', 'Qwen', 'DeepSeek', 'GLM'];

/** 模型列表页（供应商标签的链接目标） */
export const HOME_MODELS_PATH = '/models';

/** 接入地址，与教程一致：Claude Code 等走 Anthropic 端点，Codex 等走 OpenAI 兼容端点 */
export const HOME_ENDPOINTS = {
  anthropic: 'https://api.fishxcode.com',
  openai: 'https://api.fishxcode.com/v1',
} as const;

/** 首屏代码窗口的接入示例：令牌一律从环境变量读取，模型取当前在售型号 */
export const HOME_CODE_SAMPLES: ReadonlyArray<{ label: string; lang: string; code: string }> = [
  {
    label: 'Claude Code',
    lang: 'bash',
    code: `export ANTHROPIC_BASE_URL="${HOME_ENDPOINTS.anthropic}"
export ANTHROPIC_AUTH_TOKEN="$FISHXCODE_API_KEY"

claude`,
  },
  {
    label: 'Codex',
    lang: 'toml',
    code: `# ~/.codex/config.toml
model_provider = "fishxcode"
model = "gpt-6.2-sol"

[model_providers.fishxcode]
name = "FishXCode"
base_url = "${HOME_ENDPOINTS.openai}"
wire_api = "responses"
requires_openai_auth = true`,
  },
  {
    label: 'cURL',
    lang: 'bash',
    code: `curl ${HOME_ENDPOINTS.openai}/chat/completions \\
  -H "Authorization: Bearer $FISHXCODE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-6.2-sol",
    "messages": [
      { "role": "user", "content": "Hello" }
    ]
  }'`,
  },
];

// ─────────────────────────────────────────────── 各语言文案

export type HomeCopy = {
  /** 页面 <title>、分享卡片、页脚品牌与结构化数据里的站点名 */
  title: string;
  /** meta description；页脚、RSS 与结构化数据也用它介绍本站 */
  description: string;
  /** 主按钮：注册（站外，地址见 siteConfig.links.register） */
  register: string;
  /** 次按钮：进入文档（HOME_START_PATH） */
  docs: string;
  /** 「为什么选择」区块的四张卡片；首页 Markdown 副本也逐条列出 */
  features: ReadonlyArray<{ title: string; details: string }>;
  updated: string;
};

/**
 * 首页与全站共用的文案：首页、首页 Markdown 副本、分享图、页脚、导航注册按钮、RSS 与
 * 结构化数据都会读。按当前业务定位撰写：一站式 AI 模型接入与账号服务平台。
 * 新增语言在此补充一项即可。zh 为原文，其余语言为译文。
 */
export const HOME_COPY: Record<Locale, HomeCopy> = {
  zh: {
    title: `${siteConfig.productName} - 一站式 AI 模型接入平台`,
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
        details: '余额按量计费，用多少扣多少，按实际用量控制成本。',
      },
      { title: '支持企业接入，批量定制', details: '团队与企业批量调用、定制化方案与专属技术支持。' },
    ],
    updated: '文档持续更新中 · 最近更新 ',
  },
  en: {
    title: `${siteConfig.productName} - One-Stop AI Model Access`,
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
          'Groups for Codex, Claude, Kiro, Grok, Chinese and multimodal models. Pick the pool and multiplier for each job.',
      },
      {
        title: 'Cost-effective, pay as you go',
        details: 'Pay from your balance for what you use, keeping costs tied to actual usage.',
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
          'Des groupes pour Codex, Claude, Kiro, Grok, les modèles chinois et multimodaux : choisissez le pool et le multiplicateur selon l’usage.',
      },
      {
        title: 'Économique, à la demande',
        details:
          'Payez à l’usage depuis votre solde : les coûts suivent la consommation réelle.',
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
          'Grupos para Codex, Claude, Kiro, Grok, modelos chinos y multimodales: elige el pool y el multiplicador según tu caso.',
      },
      {
        title: 'Económico, pago por uso',
        details:
          'Paga desde tu saldo solo por lo que usas: el coste sigue a tu consumo real.',
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
          'Grupos para Codex, Claude, Kiro, Grok, modelos chineses e multimodais: escolha o pool e o multiplicador para cada caso.',
      },
      {
        title: 'Econômico, pague pelo uso',
        details:
          'Pague pelo saldo apenas o que usar: o custo acompanha o consumo real.',
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
          'Оплачивайте с баланса только то, что используете: затраты следуют фактическому потреблению.',
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
        details: '残高から使った分だけ従量課金。実際の使用量に応じてコストを管理できます。',
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
        details: 'Trừ số dư theo mức dùng thực tế, chi phí gắn với mức tiêu thụ thật.',
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
        details: '餘額按量計費，用多少扣多少，按實際用量控制成本。',
      },
      { title: '支援企業接入，批量客製', details: '團隊與企業批量呼叫、客製化方案與專屬技術支援。' },
    ],
    updated: '文件持續更新中 · 最近更新 ',
  },
};

type StepCopy = { title: string; description: string };

/**
 * 首页各区块的文案（只在首页与首页 Markdown 副本里用），区块顺序与 localized-home-page.tsx 一致。
 * 占位符：{count} 教程数量。
 * zh 为原稿；zh-TW 由 OpenCC 从 zh 转换后人工校对；其余语言为译文。
 */
export type HomePageCopy = {
  hero: {
    /** 两行大标题，第二行用品牌色 */
    title: readonly [string, string];
    description: string;
    /** 三条要点，依次链接到计费规则、服务状态、企业站 */
    points: readonly [string, string, string];
    /** 代码窗口的无障碍名称、复制按钮文字与复制结果提示 */
    codeLabel: string;
    copy: string;
    copied: string;
    copyFailed: string;
  };
  providers: { title: string; note: string };
  why: { title: string; description: string };
  pricing: {
    title: string;
    description: string;
    groupsTitle: string;
    categories: Record<GroupCategory, string>;
    groupsNote: string;
    groupsCta: string;
    /** 实时倍率加载完成后的读屏播报（视觉隐藏），如「已更新为实时倍率」 */
    groupsLiveNote: string;
  };
  clients: { title: string; description: string };
  steps: { title: string; description: string; items: readonly [StepCopy, StepCopy, StepCopy]; cta: string };
  cta: {
    title: string;
    description: string;
    enterprise: string;
    supportTitle: string;
    supportBody: string;
    email: string;
    wechat: string;
  };
};

export const HOME_PAGE_COPY: Record<Locale, HomePageCopy> = {
  zh: {
    hero: {
      title: ['主流 AI 模型', '一网打尽'],
      description:
        '覆盖 Claude、Codex、Kiro、Grok、国产模型与多模态模型，一个账号接入你常用的编程工具，满足开发、创作与企业级应用需求。',
      points: ['官方号池，稳定直连', '服务状态公开可查', '企业接入，专属支持'],
      codeLabel: '接入示例',
      copy: '复制代码',
      copied: '已复制',
      copyFailed: '复制失败，请手动选中代码复制',
    },
    providers: {
      title: '已接入的模型供应商',
      note: '可用模型、分组与价格以模型列表为准。',
    },
    why: {
      title: '一个账号，接入主流 AI 模型',
      description: '官方资源直连，按场景选择分组，余额按量计费，个人开发与团队协作都适用。',
    },
    pricing: {
      title: '按量计费',
      description: '余额按模型价格乘以分组倍率扣费，用多少扣多少。',
      groupsTitle: '在售分组与倍率',
      categories: {
        codex: 'Codex 系列',
        claude: 'Claude 系列',
        other: '其他模型',
      },
      groupsNote: '倍率越低，同一请求扣得越少；以站内实时信息为准。',
      groupsCta: '计费规则与分组',
      groupsLiveNote: '分组倍率已更新为官网实时数据',
    },
    clients: {
      title: '接入你正在用的工具',
      description:
        '{count} 款编程工具与 Agent 的分步教程：Claude Code 走 Anthropic 端点，Codex 等工具走 OpenAI 兼容端点。',
    },
    steps: {
      title: '三步发出第一个请求',
      description: '注册后在控制台充值、创建令牌，再把接入地址和令牌填进客户端。',
      items: [
        {
          title: '注册并充值',
          description: '创建 FishXCode 账号，按需充值余额。',
        },
        {
          title: '创建令牌，选对分组',
          description: '在控制台「令牌管理」新建令牌，分组决定可用模型与扣费倍率。',
        },
        {
          title: '配置客户端',
          description: '把接入地址与令牌填入客户端，即可开始调用。',
        },
      ],
      cta: '查看完整教程',
    },
    cta: {
      title: '从你的下一个想法开始',
      description: '注册账号，创建一个令牌，让熟悉的工具连接更多模型。',
      enterprise: '企业服务',
      supportTitle: '需要帮助？',
      supportBody: '迁移、额度、令牌或接入问题，可以通过在线客服、邮件或微信联系我们。',
      email: '邮箱',
      wechat: '微信',
    },
  },
  en: {
    hero: {
      title: ['Every major AI model,', 'in one place'],
      description:
        'Claude, Codex, Kiro, Grok, Chinese and multimodal models through one account, ready for the coding tools you already use, for development, creative work and enterprise applications.',
      points: ['Official pools, direct connections', 'Public service status', 'Enterprise onboarding and support'],
      codeLabel: 'Integration examples',
      copy: 'Copy code',
      copied: 'Copied',
      copyFailed: 'Copy failed. Select the code and copy it manually.',
    },
    providers: {
      title: 'Connected model providers',
      note: 'See the model list for current availability, groups and pricing.',
    },
    why: {
      title: 'One account for mainstream AI models',
      description:
        'Official resources, a group for every scenario, and pay-as-you-go billing, for individual developers and teams alike.',
    },
    pricing: {
      title: 'Pay as you go',
      description:
        'Your balance pays the model price times the group multiplier, only for what you use. ',
      groupsTitle: 'Groups on sale and their multipliers',
      categories: {
        codex: 'Codex',
        claude: 'Claude',
        other: 'Other models',
      },
      groupsNote: 'A lower multiplier deducts less for the same request. Live values on the platform prevail.',
      groupsCta: 'Billing rules and groups',
      groupsLiveNote: 'Group ratios updated with live data from the platform',
    },
    clients: {
      title: 'Connect the tools you already use',
      description:
        'Step-by-step guides for {count} coding tools and agents. Claude Code uses the Anthropic endpoint; Codex and the others use the OpenAI-compatible endpoint.',
    },
    steps: {
      title: 'Your first request in three steps',
      description:
        'Sign up, then top up and create a token in the console, and put the endpoint and token into your client.',
      items: [
        {
          title: 'Sign up and top up',
          description: 'Create a FishXCode account, then top up your balance.',
        },
        {
          title: 'Create a token in the right group',
          description:
            'Create a token under Token Management in the console. Its group decides the available models and the multiplier.',
        },
        {
          title: 'Configure your client',
          description: 'Enter the endpoint and token in your client and start making requests.',
        },
      ],
      cta: 'Read the full guide',
    },
    cta: {
      title: 'Start with your next idea',
      description: 'Create an account and a token, and bring more models to the tools you know.',
      enterprise: 'Enterprise',
      supportTitle: 'Need a hand?',
      supportBody:
        'For migration, balance, token or integration questions, reach us through live chat, email or WeChat.',
      email: 'Email',
      wechat: 'WeChat',
    },
  },
  fr: {
    hero: {
      title: ["Les grands modèles d'IA,", 'tous au même endroit'],
      description:
        'Claude, Codex, Kiro, Grok, modèles chinois et multimodaux, réunis sur un seul compte et accessibles depuis vos outils de programmation habituels, que ce soit pour le développement, la création ou les usages en entreprise.',
      points: [
        'Pools officiels, connexion directe et stable',
        'État du service consultable par tous',
        'Accès entreprise, support dédié',
      ],
      codeLabel: "Exemples d'intégration",
      copy: 'Copier le code',
      copied: 'Copié',
      copyFailed: 'Échec de la copie. Sélectionnez le code et copiez-le manuellement.',
    },
    providers: {
      title: 'Fournisseurs de modèles pris en charge',
      note: 'Disponibilité, groupes et prix à jour : consultez la liste des modèles.',
    },
    why: {
      title: "Un seul compte pour les grands modèles d'IA",
      description:
        "Ressources officielles en connexion directe, un groupe pour chaque besoin, paiement à l'usage depuis votre solde : idéal pour développer en solo comme en équipe.",
    },
    pricing: {
      title: "Payez à l'usage",
      description:
        'Votre solde est débité selon votre consommation réelle : prix du modèle × multiplicateur du groupe.',
      groupsTitle: 'Groupes disponibles et leurs multiplicateurs',
      categories: {
        codex: 'Série Codex',
        claude: 'Série Claude',
        other: 'Autres modèles',
      },
      groupsNote:
        'Plus le multiplicateur est bas, moins la même requête coûte cher. Les informations en temps réel du site font foi.',
      groupsCta: 'Règles de facturation et groupes',
      groupsLiveNote: 'Multiplicateurs mis à jour avec les données en temps réel de la plateforme',
    },
    clients: {
      title: 'Connectez les outils que vous utilisez déjà',
      description:
        "Des guides pas à pas pour {count} outils de programmation et agents. Claude Code passe par l'endpoint Anthropic ; Codex et les autres outils, par l'endpoint compatible OpenAI.",
    },
    steps: {
      title: 'Votre première requête en trois étapes',
      description:
        "Inscrivez-vous, rechargez votre solde et créez un token dans la console, puis renseignez l'endpoint et le token dans votre client.",
      items: [
        {
          title: 'Inscrivez-vous et rechargez',
          description:
            'Créez votre compte FishXCode, puis rechargez votre solde selon vos besoins.',
        },
        {
          title: 'Créez un token dans le bon groupe',
          description:
            'Ajoutez un token depuis « Gestion des tokens » dans la console : son groupe détermine les modèles disponibles et le multiplicateur de facturation.',
        },
        {
          title: 'Configurez votre client',
          description: "Saisissez l'endpoint et le token dans votre client, puis lancez vos premiers appels.",
        },
      ],
      cta: 'Voir le guide complet',
    },
    cta: {
      title: 'Tout commence par votre prochaine idée',
      description: 'Créez un compte et un token, puis connectez vos outils habituels à davantage de modèles.',
      enterprise: 'Entreprises',
      supportTitle: "Besoin d'aide ?",
      supportBody:
        'Migration, crédit, tokens ou intégration : contactez-nous par chat en ligne, par e-mail ou sur WeChat.',
      email: 'E-mail',
      wechat: 'WeChat',
    },
  },
  es: {
    hero: {
      title: ['Los grandes modelos de IA,', 'todos en un solo lugar'],
      description:
        'Claude, Codex, Kiro, Grok, modelos chinos y multimodales con una sola cuenta y directamente desde tus herramientas de programación habituales, ya sea para desarrollo, creación o aplicaciones empresariales.',
      points: [
        'Pools oficiales, conexión directa y estable',
        'Estado del servicio visible para todos',
        'Acceso empresarial, soporte dedicado',
      ],
      codeLabel: 'Ejemplos de integración',
      copy: 'Copiar código',
      copied: 'Copiado',
      copyFailed: 'No se pudo copiar. Selecciona el código y cópialo manualmente.',
    },
    providers: {
      title: 'Proveedores de modelos integrados',
      note: 'Disponibilidad, grupos y precios vigentes: consulta la lista de modelos.',
    },
    why: {
      title: 'Una sola cuenta para los grandes modelos de IA',
      description:
        'Conexión directa a recursos oficiales, un grupo para cada necesidad, pago por uso con saldo: ideal tanto para desarrolladores individuales como para equipos.',
    },
    pricing: {
      title: 'Paga por uso',
      description:
        'Del saldo se descuenta el precio del modelo por el multiplicador del grupo: pagas solo lo que usas.',
      groupsTitle: 'Grupos a la venta y sus multiplicadores',
      categories: {
        codex: 'Serie Codex',
        claude: 'Serie Claude',
        other: 'Otros modelos',
      },
      groupsNote:
        'A menor multiplicador, menos se descuenta por la misma solicitud. Prevalece la información en tiempo real del sitio.',
      groupsCta: 'Reglas de facturación y grupos',
      groupsLiveNote: 'Multiplicadores actualizados con datos en tiempo real de la plataforma',
    },
    clients: {
      title: 'Conecta las herramientas que ya usas',
      description:
        'Guías paso a paso para {count} herramientas de programación y agentes. Claude Code usa el endpoint de Anthropic; Codex y las demás herramientas, el endpoint compatible con OpenAI.',
    },
    steps: {
      title: 'Tu primera solicitud en tres pasos',
      description:
        'Regístrate, recarga saldo y crea un token en la consola; luego configura el endpoint y el token en tu cliente.',
      items: [
        {
          title: 'Regístrate y recarga',
          description:
            'Crea tu cuenta en FishXCode y recarga saldo según lo que necesites.',
        },
        {
          title: 'Crea un token en el grupo adecuado',
          description:
            'Agrega un token en «Gestión de tokens» de la consola: el grupo determina los modelos disponibles y el multiplicador de cobro.',
        },
        {
          title: 'Configura tu cliente',
          description: 'Introduce el endpoint y el token en tu cliente y empieza a hacer llamadas.',
        },
      ],
      cta: 'Ver la guía completa',
    },
    cta: {
      title: 'Todo empieza con tu próxima idea',
      description: 'Crea una cuenta y un token, y conecta tus herramientas de siempre a más modelos.',
      enterprise: 'Empresas',
      supportTitle: '¿Necesitas ayuda?',
      supportBody:
        'Para dudas sobre migración, crédito, tokens o integración, escríbenos por el chat en línea, por correo o por WeChat.',
      email: 'Correo',
      wechat: 'WeChat',
    },
  },
  pt: {
    hero: {
      title: ['Os principais modelos de IA,', 'todos em um só lugar'],
      description:
        'Claude, Codex, Kiro, Grok, modelos chineses e multimodais em uma só conta, direto nas ferramentas de programação que você já usa, seja para desenvolvimento, criação ou aplicações empresariais.',
      points: [
        'Pools oficiais, conexão direta e estável',
        'Status do serviço visível para todos',
        'Acesso empresarial, suporte dedicado',
      ],
      codeLabel: 'Exemplos de integração',
      copy: 'Copiar código',
      copied: 'Copiado',
      copyFailed: 'Não foi possível copiar. Selecione o código e copie manualmente.',
    },
    providers: {
      title: 'Provedores de modelos integrados',
      note: 'Disponibilidade, grupos e preços atuais: consulte a lista de modelos.',
    },
    why: {
      title: 'Uma só conta para os principais modelos de IA',
      description:
        'Conexão direta com recursos oficiais, um grupo para cada necessidade, pagamento por uso com saldo: ideal tanto para quem desenvolve sozinho quanto para equipes.',
    },
    pricing: {
      title: 'Pague pelo uso',
      description:
        'Do saldo é descontado o preço do modelo vezes o multiplicador do grupo: você paga só pelo que usa.',
      groupsTitle: 'Grupos à venda e seus multiplicadores',
      categories: {
        codex: 'Série Codex',
        claude: 'Série Claude',
        other: 'Outros modelos',
      },
      groupsNote:
        'Quanto menor o multiplicador, menos é descontado pela mesma requisição. Prevalecem as informações em tempo real do site.',
      groupsCta: 'Regras de cobrança e grupos',
      groupsLiveNote: 'Multiplicadores atualizados com dados em tempo real da plataforma',
    },
    clients: {
      title: 'Conecte as ferramentas que você já usa',
      description:
        'Guias passo a passo para {count} ferramentas de programação e agentes. O Claude Code usa o endpoint da Anthropic; o Codex e as demais ferramentas, o endpoint compatível com OpenAI.',
    },
    steps: {
      title: 'Sua primeira requisição em três passos',
      description:
        'Cadastre-se, recarregue o saldo e crie um token no console; depois configure o endpoint e o token no seu cliente.',
      items: [
        {
          title: 'Cadastre-se e recarregue',
          description:
            'Crie sua conta no FishXCode e recarregue o saldo conforme precisar.',
        },
        {
          title: 'Crie um token no grupo certo',
          description:
            'Adicione um token em “Gerenciamento de tokens” no console: o grupo define os modelos disponíveis e o multiplicador de cobrança.',
        },
        {
          title: 'Configure seu cliente',
          description: 'Insira o endpoint e o token no seu cliente e comece a fazer chamadas.',
        },
      ],
      cta: 'Ver o guia completo',
    },
    cta: {
      title: 'Tudo começa com a sua próxima ideia',
      description: 'Crie uma conta e um token e conecte suas ferramentas de sempre a mais modelos.',
      enterprise: 'Empresas',
      supportTitle: 'Precisa de ajuda?',
      supportBody:
        'Para dúvidas sobre migração, crédito, tokens ou integração, fale com a gente pelo chat de atendimento, por e-mail ou pelo WeChat.',
      email: 'E-mail',
      wechat: 'WeChat',
    },
  },
  ru: {
    hero: {
      title: ['Все ведущие модели ИИ', 'в одном месте'],
      description:
        'Claude, Codex, Kiro, Grok, китайские и мультимодальные модели через один аккаунт — прямо в привычных инструментах для программирования. Подходит для разработки, творчества и корпоративных задач.',
      points: [
        'Официальные пулы, прямое подключение',
        'Статус сервиса в открытом доступе',
        'Корпоративное подключение и поддержка',
      ],
      codeLabel: 'Примеры подключения',
      copy: 'Копировать код',
      copied: 'Скопировано',
      copyFailed: 'Не удалось скопировать. Выделите код и скопируйте вручную.',
    },
    providers: {
      title: 'Подключённые провайдеры моделей',
      note: 'Актуальные модели, группы и цены смотрите в списке моделей.',
    },
    why: {
      title: 'Один аккаунт для ведущих моделей ИИ',
      description:
        'Прямое подключение к официальным ресурсам, группы под разные задачи, оплата по факту с баланса — для индивидуальных разработчиков и команд.',
    },
    pricing: {
      title: 'Оплата по факту',
      description:
        'Цена модели умножается на коэффициент группы и списывается с баланса — вы платите только за то, что используете.',
      groupsTitle: 'Доступные группы и коэффициенты',
      categories: {
        codex: 'Серия Codex',
        claude: 'Серия Claude',
        other: 'Другие модели',
      },
      groupsNote:
        'Чем ниже коэффициент, тем меньше спишется за тот же запрос. Окончательными считаются актуальные данные на сайте.',
      groupsCta: 'Правила тарификации и группы',
      groupsLiveNote: 'Коэффициенты обновлены по актуальным данным платформы',
    },
    clients: {
      title: 'Подключите инструменты, которыми уже пользуетесь',
      description:
        'Пошаговые инструкции для {count} инструментов разработки и агентов: Claude Code подключается через эндпоинт Anthropic, а Codex и остальные — через OpenAI-совместимый эндпоинт.',
    },
    steps: {
      title: 'Первый запрос — за три шага',
      description:
        'Зарегистрируйтесь, пополните баланс и создайте токен в консоли, затем укажите адрес API и токен в клиенте.',
      items: [
        {
          title: 'Зарегистрируйтесь и пополните баланс',
          description:
            'Создайте аккаунт FishXCode и, в зависимости от задач, пополните баланс.',
        },
        {
          title: 'Создайте токен в нужной группе',
          description:
            'Создать токен можно в консоли, в разделе «Управление токенами». От группы зависят доступные модели и коэффициент списания.',
        },
        {
          title: 'Настройте клиент',
          description: 'Укажите адрес API и токен в клиенте — и можно отправлять запросы.',
        },
      ],
      cta: 'Открыть полную инструкцию',
    },
    cta: {
      title: 'Начните со своей следующей идеи',
      description: 'Зарегистрируйтесь, создайте токен — и подключите больше моделей к привычным инструментам.',
      enterprise: 'Для бизнеса',
      supportTitle: 'Нужна помощь?',
      supportBody:
        'По вопросам миграции, баланса, токенов или подключения пишите нам в онлайн-чат, на почту или в WeChat.',
      email: 'Эл. почта',
      wechat: 'WeChat',
    },
  },
  ja: {
    hero: {
      title: ['主要な AI モデルを', 'ひとつの場所で'],
      description:
        'Claude・Codex・Kiro・Grok・中国系モデル・マルチモーダルモデルに対応。ひとつのアカウントで使い慣れたコーディングツールにそのまま接続でき、開発・制作・企業利用のニーズに応えます。',
      points: ['公式プールに安定して直接接続', 'サービス状況を公開中', '法人導入に対応、専任サポート付き'],
      codeLabel: '接続例',
      copy: 'コードをコピー',
      copied: 'コピーしました',
      copyFailed: 'コピーできませんでした。コードを選択して手動でコピーしてください。',
    },
    providers: {
      title: '対応しているモデルプロバイダー',
      note: '利用できるモデル・グループ・価格は、モデル一覧の表示が優先されます。',
    },
    why: {
      title: 'ひとつのアカウントで、主要な AI モデルに接続',
      description:
        '公式リソースに直接接続し、用途に合わせてグループを選べます。残高からの従量課金で、個人開発にもチーム開発にも対応します。',
    },
    pricing: {
      title: '従量課金',
      description:
        '使った分だけ、モデル価格にグループ倍率を掛けた額を残高から差し引きます。',
      groupsTitle: '販売中のグループと倍率',
      categories: {
        codex: 'Codex シリーズ',
        claude: 'Claude シリーズ',
        other: 'その他のモデル',
      },
      groupsNote:
        '倍率が低いほど、同じリクエストでの差し引き額は少なくなります。サイト上のリアルタイム情報が優先されます。',
      groupsCta: '課金ルールとグループ',
      groupsLiveNote: 'グループ倍率をサイトのリアルタイムデータで更新しました',
    },
    clients: {
      title: 'お使いのツールにそのまま接続',
      description:
        '{count} 種類のコーディングツールとエージェントの接続手順をステップごとに解説。Claude Code は Anthropic エンドポイント、Codex などは OpenAI 互換エンドポイントを使います。',
    },
    steps: {
      title: '最初のリクエストまで 3 ステップ',
      description:
        '登録後、コンソールでチャージしてトークンを作成し、ベース URL とトークンをクライアントに設定します。',
      items: [
        {
          title: '登録してチャージ',
          description:
            'FishXCode のアカウントを作成し、必要に応じて残高をチャージします。',
        },
        {
          title: '適切なグループでトークンを作成',
          description:
            'コンソールの「トークン管理」で新しいトークンを作成します。グループによって、使えるモデルと課金倍率が決まります。',
        },
        {
          title: 'クライアントを設定',
          description: 'ベース URL とトークンをクライアントに入力すれば、すぐに呼び出しを始められます。',
        },
      ],
      cta: '詳しい手順を見る',
    },
    cta: {
      title: '次のアイデアから始めましょう',
      description: 'アカウントを登録してトークンを作成すれば、使い慣れたツールでもっと多くのモデルを使えます。',
      enterprise: '法人向け',
      supportTitle: 'お困りですか？',
      supportBody:
        '移行、残高、トークン、接続に関するご質問は、チャットサポート・メール・WeChat でお問い合わせください。',
      email: 'メール',
      wechat: 'WeChat',
    },
  },
  vi: {
    hero: {
      title: ['Mọi mô hình AI chủ lưu', 'ở một nơi'],
      description:
        'Claude, Codex, Kiro, Grok, các mô hình Trung Quốc và đa phương thức trong một tài khoản, kết nối ngay với công cụ lập trình bạn quen dùng, đáp ứng nhu cầu phát triển, sáng tạo và ứng dụng doanh nghiệp.',
      points: [
        'Pool chính thức, kết nối trực tiếp ổn định',
        'Trạng thái dịch vụ công khai',
        'Tích hợp doanh nghiệp, hỗ trợ riêng',
      ],
      codeLabel: 'Ví dụ kết nối',
      copy: 'Sao chép mã',
      copied: 'Đã sao chép',
      copyFailed: 'Không sao chép được. Hãy chọn đoạn mã và sao chép thủ công.',
    },
    providers: {
      title: 'Các nhà cung cấp mô hình đã kết nối',
      note: 'Mô hình khả dụng, nhóm và giá căn cứ theo danh sách mô hình.',
    },
    why: {
      title: 'Một tài khoản, kết nối các mô hình AI chủ lưu',
      description:
        'Kết nối trực tiếp tài nguyên chính thức, chọn nhóm theo tình huống sử dụng, trả theo mức dùng từ số dư, phù hợp cho cả phát triển cá nhân lẫn cộng tác nhóm.',
    },
    pricing: {
      title: 'Trả theo mức dùng',
      description:
        'Số dư được trừ theo giá mô hình nhân hệ số nhóm, dùng bao nhiêu trừ bấy nhiêu.',
      groupsTitle: 'Các nhóm đang mở bán và hệ số',
      categories: {
        codex: 'Dòng Codex',
        claude: 'Dòng Claude',
        other: 'Mô hình khác',
      },
      groupsNote:
        'Hệ số càng thấp thì cùng một yêu cầu bị trừ càng ít; căn cứ theo thông tin thời gian thực trên trang.',
      groupsCta: 'Quy tắc tính phí và nhóm',
      groupsLiveNote: 'Hệ số nhóm đã được cập nhật theo dữ liệu thời gian thực trên trang',
    },
    clients: {
      title: 'Kết nối công cụ bạn đang dùng',
      description:
        'Hướng dẫn từng bước cho {count} công cụ lập trình và agent: Claude Code dùng endpoint Anthropic, Codex và các công cụ khác dùng endpoint tương thích OpenAI.',
    },
    steps: {
      title: 'Gửi yêu cầu đầu tiên chỉ với ba bước',
      description:
        'Sau khi đăng ký, hãy nạp tiền và tạo token trong bảng điều khiển, rồi điền địa chỉ API và token vào client.',
      items: [
        {
          title: 'Đăng ký và nạp tiền',
          description: 'Tạo tài khoản FishXCode, nạp số dư tùy nhu cầu.',
        },
        {
          title: 'Tạo token, chọn đúng nhóm',
          description:
            'Tạo token mới tại mục “Quản lý token” trong bảng điều khiển; nhóm quyết định mô hình khả dụng và hệ số trừ phí.',
        },
        {
          title: 'Cấu hình client',
          description: 'Điền địa chỉ API và token vào client là có thể bắt đầu gửi yêu cầu.',
        },
      ],
      cta: 'Xem hướng dẫn đầy đủ',
    },
    cta: {
      title: 'Bắt đầu từ ý tưởng tiếp theo của bạn',
      description: 'Đăng ký tài khoản, tạo một token và để những công cụ quen thuộc kết nối với nhiều mô hình hơn.',
      enterprise: 'Doanh nghiệp',
      supportTitle: 'Cần hỗ trợ?',
      supportBody:
        'Nếu có thắc mắc về chuyển đổi nền tảng, số dư, token hoặc kết nối, hãy liên hệ chúng tôi qua chat trực tuyến, email hoặc WeChat.',
      email: 'Email',
      wechat: 'WeChat',
    },
  },
  'zh-TW': {
    hero: {
      title: ['主流 AI 模型', '一網打盡'],
      description:
        '覆蓋 Claude、Codex、Kiro、Grok、國產模型與多模態模型，一個帳號接入你常用的程式設計工具，滿足開發、創作與企業級應用需求。',
      points: ['官方號池，穩定直連', '服務狀態公開可查', '企業接入，專屬支援'],
      codeLabel: '接入示例',
      copy: '複製程式碼',
      copied: '已複製',
      copyFailed: '複製失敗，請手動選取程式碼複製',
    },
    providers: {
      title: '已接入的模型供應商',
      note: '可用模型、分組與價格以模型列表為準。',
    },
    why: {
      title: '一個帳號，接入主流 AI 模型',
      description: '官方資源直連，按場景選擇分組，餘額按量計費，個人開發與團隊協作都適用。',
    },
    pricing: {
      title: '按量計費',
      description: '餘額按模型價格乘以分組倍率扣費，用多少扣多少。',
      groupsTitle: '在售分組與倍率',
      categories: {
        codex: 'Codex 系列',
        claude: 'Claude 系列',
        other: '其他模型',
      },
      groupsNote: '倍率越低，同一請求扣得越少；以站內即時資訊為準。',
      groupsCta: '計費規則與分組',
      groupsLiveNote: '分組倍率已更新為官網即時資料',
    },
    clients: {
      title: '接入你正在用的工具',
      description:
        '{count} 款程式設計工具與 Agent 的分步教程：Claude Code 走 Anthropic 端點，Codex 等工具走 OpenAI 相容端點。',
    },
    steps: {
      title: '三步發出第一個請求',
      description: '註冊後在控制台充值、建立令牌，再把接入地址和令牌填進客戶端。',
      items: [
        {
          title: '註冊並充值',
          description: '建立 FishXCode 帳號，按需充值餘額。',
        },
        {
          title: '建立令牌，選對分組',
          description: '在控制台「令牌管理」新建令牌，分組決定可用模型與扣費倍率。',
        },
        {
          title: '配置客戶端',
          description: '把接入地址與令牌填入客戶端，即可開始呼叫。',
        },
      ],
      cta: '檢視完整教程',
    },
    cta: {
      title: '從你的下一個想法開始',
      description: '註冊帳號，建立一個令牌，讓熟悉的工具連線更多模型。',
      enterprise: '企業服務',
      supportTitle: '需要幫助？',
      supportBody: '遷移、額度、令牌或接入問題，可以透過線上客服、郵件或微信聯絡我們。',
      email: '電子郵件',
      wechat: '微信',
    },
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
