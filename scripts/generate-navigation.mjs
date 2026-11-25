/**
 * 生成文档站侧边栏导航。
 *
 * 单一事实源是本文件里的 GROUPS：分组、顺序、URL 归属都只写一次。
 * 各语言条目的文字与图标从现有 meta.json 继承（按 URL 匹配），
 * 新增条目才需要写进 NEW_ITEMS 的翻译表。
 *
 * 用法：node scripts/generate-navigation.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONTENT = 'content/docs';
const LOCALES = ['zh', 'en', 'fr', 'es', 'pt', 'ru', 'ja', 'vi', 'zh-TW'];

/** 分组目录用括号包裹：Fumadocs 不会把它写进页面 slug，URL 保持不变。 */
const GROUPS = [
  { key: 'getting-started', icon: 'Rocket', defaultOpen: true, urls: [
    '/account', '/start', '/claude-desktop', '/zcf',
  ] },
  { key: 'plans', icon: 'CreditCard', defaultOpen: true, urls: ['/subscription-plans'] },
  { key: 'tools', icon: 'Bot', defaultOpen: false, urls: [
    '/codex', '/codex-desktop', '/cursor', '/roocode', '/qwencode',
    '/droid', '/opencode', '/hermes', '/openclaw', '/workbuddy', '/codebuddy', '/qclaw',
  ] },
  // clients 的条目由「剩余 URL」自动生成，无需在这里列举。
  { key: 'clients', icon: 'AppWindow', defaultOpen: false, urls: [] },
  { key: 'reference', icon: 'Book', defaultOpen: true, urls: [
    '/platform', '/compare', '/models', '/status',
    '/billing-groups', '/group-health', '/error-logs', '/gpt-image-2',
  ] },
  { key: 'help', icon: 'CircleQuestionMark', defaultOpen: false, urls: [
    '/faq', '/changelog', '/terms', '/refund', '/privacy',
  ] },
  { key: 'services', icon: 'ExternalLink', defaultOpen: false, urls: ['__quota__', '__enterprise__'] },
];

const GROUP_ICONS = {
  clients: 'Bot',
};

const GROUP_TITLES = {
  zh: ['快速开始', '订阅套餐', '工具接入', '客户端接入', '平台与计费', '帮助与政策', '更多服务'],
  en: ['Get started', 'Plans', 'Tool integrations', 'Client integrations', 'Platform & billing', 'Help & policies', 'More services'],
  fr: ['Démarrage', 'Abonnements', 'Intégrations d’outils', 'Intégrations clientes', 'Plateforme et facturation', 'Aide et politiques', 'Plus de services'],
  es: ['Inicio', 'Planes', 'Integraciones de herramientas', 'Integraciones de clientes', 'Plataforma y facturación', 'Ayuda y políticas', 'Más servicios'],
  pt: ['Início', 'Planos', 'Integrações de ferramentas', 'Integrações de clientes', 'Plataforma e cobrança', 'Ajuda e políticas', 'Mais serviços'],
  ru: ['Начало работы', 'Тарифы', 'Интеграции инструментов', 'Интеграции клиентов', 'Платформа и оплата', 'Помощь и политика', 'Другие сервисы'],
  ja: ['はじめに', 'サブスクリプション', 'ツール連携', 'クライアント連携', 'プラットフォームと課金', 'ヘルプとポリシー', 'その他のサービス'],
  vi: ['Bắt đầu', 'Gói dịch vụ', 'Tích hợp công cụ', 'Tích hợp khách hàng', 'Nền tảng và thanh toán', 'Trợ giúp và chính sách', 'Dịch vụ khác'],
  'zh-TW': ['快速開始', '訂閱套餐', '工具接入', '用戶端接入', '平臺與計費', '説明與政策', '更多服務'],
};

/** 既有 meta 里没有的条目：套餐页 + 从顶栏移下来的两个站外服务。 */
const NEW_ITEMS = {
  '/subscription-plans': {
    icon: 'PackageOpen',
    name: {
      zh: 'Codex Pro 月包', en: 'Codex Pro monthly plan',
      fr: 'Forfait mensuel Codex Pro', es: 'Plan mensual Codex Pro',
      pt: 'Plano mensal Codex Pro', ru: 'Месячный план Codex Pro',
      ja: 'Codex Pro 月間プラン', vi: 'Gói tháng Codex Pro', 'zh-TW': 'Codex Pro 月包',
    },
  },
  __quota__: {
    icon: 'CreditCard',
    url: 'https://api-key-tool.fishxcode.com',
    external: true,
    name: {
      zh: '额度查询', en: 'Credit Balance', fr: 'Vérifier le solde',
      es: 'Consultar saldo', pt: 'Verificar saldo', ru: 'Проверка баланса',
      ja: '残高照会', vi: 'Tra cứu số dư', 'zh-TW': '額度查詢',
    },
  },
  __enterprise__: {
    icon: 'Building',
    url: 'https://enterprise.fishxcode.com/',
    external: true,
    name: {
      zh: '企业服务', en: 'Enterprise', fr: 'Entreprises', es: 'Empresas',
      pt: 'Empresas', ru: 'Для бизнеса', ja: '法人向け',
      vi: 'Doanh nghiệp', 'zh-TW': '企業服務',
    },
  },
};

const LINK = /^(?<external>external:)?(?:\[(?<icon>[^\]]+)\])?\[(?<name>[^\]]+)\]\((?<url>[^)]+)\)$/;
const STATUS_PATH = new RegExp(`^/(?:(?:${LOCALES.filter((l) => l !== 'zh').join('|')})/)?status$`);

/** 各语言生成的 status 链接不同，读回来时统一收敛到 /status，避免重新生成时重复。 */
function canonicalUrl(url) {
  return STATUS_PATH.test(url) ? '/status' : url;
}

/** 状态页已本地化，侧栏链接要指向当前语言的路由。 */
function localizedHref(url, lang) {
  if (url === '/status') return lang === 'zh' ? '/status' : `/${lang}/status`;
  return url;
}
const metaPath = (lang) =>
  lang === 'zh' ? join(CONTENT, 'meta.json') : join(CONTENT, lang, 'meta.json');
const groupDir = (lang, key) => join(CONTENT, lang === 'zh' ? '' : lang, `(${key})`);

async function readItems(lang) {
  // 先读根 meta（首次生成时条目都在里面），再读分组 meta（后续重新生成时条目在里面），
  // 这样脚本可以反复执行而不会把导航清空。
  const paths = [
    metaPath(lang),
    ...GROUPS.map((group) => join(groupDir(lang, group.key), 'meta.json')),
  ];
  const items = new Map();
  for (const path of paths) {
    const text = await readFile(path, 'utf8').catch(() => null);
    if (!text) continue;
    for (const line of JSON.parse(text).pages) {
      const match = LINK.exec(line);
      if (!match) continue;
      const url = canonicalUrl(match.groups.url);
      // 重复 URL 只保留第一次出现的条目；Fumadocs 不允许同一 URL 在页树里出现两次。
      if (!items.has(url)) items.set(url, { ...match.groups, url });
    }
  }
  return items;
}

function formatLink(url, item, lang) {
  const def = NEW_ITEMS[url];
  const icon = def?.icon ?? item?.icon;
  const name = def?.name?.[lang] ?? item?.name;
  if (!name) throw new Error(`缺少 ${lang} 的导航文字：${url}`);
  const external = def?.external ?? Boolean(item?.external);
  const href = def?.url ?? localizedHref(url, lang);
  return `${external ? 'external:' : ''}${icon ? `[${icon}]` : ''}[${name}](${href})`;
}

const titlesByLang = Object.fromEntries(LOCALES.map((lang) => [lang, GROUP_TITLES[lang]]));
for (const lang of LOCALES) {
  if (titlesByLang[lang].length !== GROUPS.length) {
    throw new Error(`${lang} 的分组标题数量与 GROUPS 不一致`);
  }
}

const assigned = new Set(GROUPS.flatMap((group) => group.urls));
// 站外服务的实际 URL 在第二次生成时会从 services/meta.json 读回来，
// 也要算作「已归属」，否则会被误收进 clients 分组。
for (const def of Object.values(NEW_ITEMS)) if (def.url) assigned.add(def.url);
for (const lang of LOCALES) {
  const items = await readItems(lang);

  // 客户端列表 = 原导航里未归入其他分组的条目，按原顺序；重复 URL 已被 readItems 去掉。
  const urls = new Set();
  for (const group of GROUPS) {
    const list = group.key === 'clients'
      ? [...items.keys()].filter((url) => !assigned.has(url))
      : group.urls;
    for (const url of list) urls.add(url);

    const pages = list.map((url) => formatLink(url, items.get(url), lang));
    const index = GROUPS.indexOf(group);
    const meta = {
      title: titlesByLang[lang][index],
      icon: GROUP_ICONS[group.key] ?? group.icon,
      defaultOpen: group.defaultOpen,
      pages,
    };
    const dir = groupDir(lang, group.key);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  }

  const root = { pages: GROUPS.map((group) => `(${group.key})`) };
  await writeFile(metaPath(lang), `${JSON.stringify(root, null, 2)}\n`);
  console.log(`${lang}: ${GROUPS.length} 组 / ${urls.size} 项`);
}
