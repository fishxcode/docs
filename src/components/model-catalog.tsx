'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { cn } from '@/lib/cn';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';
import { pricingRoute } from '@/lib/shared';
import { siteConfig } from '@/lib/site';

/** 主站定价接口的返回，只声明本组件用到的字段 */
interface PricingModel {
  model_name: string;
  description?: string;
  /** 逗号分隔的标签串 */
  tags?: string;
  vendor_id: number;
  /** 0：按 token 倍率计费；1：按次计费，单价见 model_price（美元） */
  quota_type?: number;
  model_ratio: number;
  model_price?: number;
  completion_ratio: number;
  cache_ratio?: number;
  create_cache_ratio?: number;
  enable_groups?: string[];
  supported_endpoint_types?: string[];
}

interface PricingVendor {
  id: number;
  name: string;
}

interface PricingResponse {
  success: boolean;
  data?: PricingModel[];
  vendors?: PricingVendor[];
  group_ratio?: Record<string, number>;
}

interface Catalog {
  models: PricingModel[];
  vendorNames: Map<number, string>;
  groupRatio: Record<string, number>;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; catalog: Catalog };

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

const ALL = 'all';
const PRICING_PAGE_URL = `${siteConfig.productUrl}/pricing`;
/** 本站主要服务 Claude Code 与 Codex：Anthropic、OpenAI 排在最前（与旧站一致），其余按模型数排序 */
const FEATURED_VENDOR_IDS = [1, 13];
const REQUEST_TIMEOUT_MS = 15_000;
const COPIED_RESET_MS = 1600;

interface CatalogCopy {
  loading: string;
  loadFailed: string;
  retry: string;
  helper: string;
  total: string;
  shown: string;
  pricingPage: string;
  searchPlaceholder: string;
  reset: string;
  vendors: string;
  tags: string;
  groups: string;
  endpoints: string;
  all: string;
  empty: string;
  copy: string;
  copied: string;
  details: string;
  close: string;
  noDescription: string;
  untagged: string;
  pricing: string;
  modelRatio: string;
  completionRatio: string;
  cacheRatio: string;
  cacheWriteRatio: string;
  perCall: string;
  perCallUnit: string;
  none: string;
}

/** zh / en / fr / es / pt 沿用旧站组件的叫法，其余语言为译文 */
const COPY: Record<Locale, CatalogCopy> = {
  zh: {
    loading: '正在加载模型列表…',
    loadFailed: '模型列表加载失败',
    retry: '重试',
    helper: '按供应商、标签、分组或端点筛选，点击「复制」即可拿到模型 ID；完整计费信息请查看定价页面。',
    total: '模型总数',
    shown: '当前结果',
    pricingPage: '查看定价页面',
    searchPlaceholder: '搜索模型名称、描述或标签',
    reset: '重置筛选',
    vendors: '供应商',
    tags: '标签',
    groups: '可用分组',
    endpoints: '端点类型',
    all: '全部',
    empty: '没有匹配的模型',
    copy: '复制',
    copied: '已复制',
    details: '详情',
    close: '关闭',
    noDescription: '暂无描述',
    untagged: '通用',
    pricing: '价格',
    modelRatio: '模型倍率',
    completionRatio: '补全倍率',
    cacheRatio: '缓存命中倍率',
    cacheWriteRatio: '缓存创建倍率',
    perCall: '按次计费',
    perCallUnit: '次',
    none: '无',
  },
  en: {
    loading: 'Loading models…',
    loadFailed: 'Failed to load models',
    retry: 'Retry',
    helper:
      'Filter by provider, tag, group or endpoint, and click "Copy" to grab a model ID. See the pricing page for full billing details.',
    total: 'Total models',
    shown: 'Showing',
    pricingPage: 'Open pricing page',
    searchPlaceholder: 'Search model names, descriptions or tags',
    reset: 'Reset filters',
    vendors: 'Providers',
    tags: 'Tags',
    groups: 'Groups',
    endpoints: 'Endpoint types',
    all: 'All',
    empty: 'No matching models',
    copy: 'Copy',
    copied: 'Copied',
    details: 'Details',
    close: 'Close',
    noDescription: 'No description available',
    untagged: 'General',
    pricing: 'Pricing',
    modelRatio: 'Model ratio',
    completionRatio: 'Completion ratio',
    cacheRatio: 'Cache hit ratio',
    cacheWriteRatio: 'Cache write ratio',
    perCall: 'Per-request pricing',
    perCallUnit: 'request',
    none: 'None',
  },
  fr: {
    loading: 'Chargement des modèles…',
    loadFailed: 'Échec du chargement des modèles',
    retry: 'Réessayer',
    helper:
      "Filtrez par fournisseur, étiquette, groupe ou point de terminaison, puis cliquez sur « Copier » pour obtenir l'ID du modèle. Consultez la page tarifaire pour la facturation complète.",
    total: 'Total des modèles',
    shown: 'Résultats',
    pricingPage: 'Ouvrir la page tarifaire',
    searchPlaceholder: 'Rechercher un nom, une description ou une étiquette',
    reset: 'Réinitialiser',
    vendors: 'Fournisseurs',
    tags: 'Étiquettes',
    groups: 'Groupes',
    endpoints: 'Types de point de terminaison',
    all: 'Tous',
    empty: 'Aucun modèle correspondant',
    copy: 'Copier',
    copied: 'Copié',
    details: 'Détails',
    close: 'Fermer',
    noDescription: 'Aucune description disponible',
    untagged: 'Général',
    pricing: 'Tarification',
    modelRatio: 'Ratio du modèle',
    completionRatio: 'Ratio de complétion',
    cacheRatio: 'Ratio cache (lecture)',
    cacheWriteRatio: 'Ratio cache (écriture)',
    perCall: 'Facturation à la requête',
    perCallUnit: 'requête',
    none: 'Aucun',
  },
  es: {
    loading: 'Cargando modelos…',
    loadFailed: 'Error al cargar los modelos',
    retry: 'Reintentar',
    helper:
      'Filtra por proveedor, etiqueta, grupo o endpoint y pulsa «Copiar» para obtener el ID del modelo. Abre la página de precios para ver la facturación completa.',
    total: 'Modelos totales',
    shown: 'Resultados',
    pricingPage: 'Abrir página de precios',
    searchPlaceholder: 'Buscar por nombre, descripción o etiqueta',
    reset: 'Restablecer filtros',
    vendors: 'Proveedores',
    tags: 'Etiquetas',
    groups: 'Grupos',
    endpoints: 'Tipos de endpoint',
    all: 'Todos',
    empty: 'No hay modelos coincidentes',
    copy: 'Copiar',
    copied: 'Copiado',
    details: 'Detalles',
    close: 'Cerrar',
    noDescription: 'Sin descripción disponible',
    untagged: 'General',
    pricing: 'Precios',
    modelRatio: 'Ratio del modelo',
    completionRatio: 'Ratio de finalización',
    cacheRatio: 'Ratio de caché (lectura)',
    cacheWriteRatio: 'Ratio de caché (escritura)',
    perCall: 'Cobro por solicitud',
    perCallUnit: 'solicitud',
    none: 'Ninguno',
  },
  pt: {
    loading: 'Carregando modelos…',
    loadFailed: 'Falha ao carregar os modelos',
    retry: 'Tentar novamente',
    helper:
      'Filtre por provedor, tag, grupo ou endpoint e clique em “Copiar” para obter o ID do modelo. Abra a página de preços para ver a cobrança completa.',
    total: 'Total de modelos',
    shown: 'Resultados',
    pricingPage: 'Abrir página de preços',
    searchPlaceholder: 'Buscar por nome, descrição ou tag',
    reset: 'Redefinir filtros',
    vendors: 'Provedores',
    tags: 'Tags',
    groups: 'Grupos',
    endpoints: 'Tipos de endpoint',
    all: 'Todos',
    empty: 'Nenhum modelo correspondente',
    copy: 'Copiar',
    copied: 'Copiado',
    details: 'Detalhes',
    close: 'Fechar',
    noDescription: 'Sem descrição disponível',
    untagged: 'Geral',
    pricing: 'Preços',
    modelRatio: 'Proporção do modelo',
    completionRatio: 'Proporção de conclusão',
    cacheRatio: 'Proporção de cache (leitura)',
    cacheWriteRatio: 'Proporção de cache (gravação)',
    perCall: 'Cobrança por requisição',
    perCallUnit: 'requisição',
    none: 'Nenhum',
  },
  ru: {
    loading: 'Загрузка моделей…',
    loadFailed: 'Не удалось загрузить список моделей',
    retry: 'Повторить',
    helper:
      'Фильтруйте по поставщику, метке, группе или эндпоинту и нажмите «Копировать», чтобы получить ID модели. Полные тарифы — на странице цен.',
    total: 'Всего моделей',
    shown: 'Показано',
    pricingPage: 'Открыть страницу цен',
    searchPlaceholder: 'Поиск по названию, описанию или меткам',
    reset: 'Сбросить фильтры',
    vendors: 'Поставщики',
    tags: 'Метки',
    groups: 'Группы',
    endpoints: 'Типы эндпоинтов',
    all: 'Все',
    empty: 'Подходящих моделей нет',
    copy: 'Копировать',
    copied: 'Скопировано',
    details: 'Подробнее',
    close: 'Закрыть',
    noDescription: 'Описание отсутствует',
    untagged: 'Общее',
    pricing: 'Цены',
    modelRatio: 'Коэффициент модели',
    completionRatio: 'Коэффициент вывода',
    cacheRatio: 'Коэффициент чтения кеша',
    cacheWriteRatio: 'Коэффициент записи кеша',
    perCall: 'Оплата за запрос',
    perCallUnit: 'запрос',
    none: 'Нет',
  },
  ja: {
    loading: 'モデル一覧を読み込み中…',
    loadFailed: 'モデル一覧の読み込みに失敗しました',
    retry: '再試行',
    helper:
      'プロバイダー・タグ・グループ・エンドポイントで絞り込み、「コピー」でモデル ID を取得できます。詳しい料金は料金ページをご覧ください。',
    total: 'モデル総数',
    shown: '表示中',
    pricingPage: '料金ページを開く',
    searchPlaceholder: 'モデル名・説明・タグで検索',
    reset: 'フィルターをリセット',
    vendors: 'プロバイダー',
    tags: 'タグ',
    groups: 'グループ',
    endpoints: 'エンドポイント',
    all: 'すべて',
    empty: '一致するモデルがありません',
    copy: 'コピー',
    copied: 'コピーしました',
    details: '詳細',
    close: '閉じる',
    noDescription: '説明はありません',
    untagged: '汎用',
    pricing: '料金',
    modelRatio: 'モデル倍率',
    completionRatio: '補完倍率',
    cacheRatio: 'キャッシュヒット倍率',
    cacheWriteRatio: 'キャッシュ作成倍率',
    perCall: 'リクエスト課金',
    perCallUnit: '回',
    none: 'なし',
  },
  vi: {
    loading: 'Đang tải danh sách mô hình…',
    loadFailed: 'Không tải được danh sách mô hình',
    retry: 'Thử lại',
    helper:
      'Lọc theo nhà cung cấp, nhãn, nhóm hoặc endpoint, bấm "Sao chép" để lấy ID mô hình. Xem trang giá để biết đầy đủ cách tính phí.',
    total: 'Tổng số mô hình',
    shown: 'Đang hiển thị',
    pricingPage: 'Mở trang giá',
    searchPlaceholder: 'Tìm theo tên, mô tả hoặc nhãn',
    reset: 'Đặt lại bộ lọc',
    vendors: 'Nhà cung cấp',
    tags: 'Nhãn',
    groups: 'Nhóm',
    endpoints: 'Loại endpoint',
    all: 'Tất cả',
    empty: 'Không có mô hình phù hợp',
    copy: 'Sao chép',
    copied: 'Đã sao chép',
    details: 'Chi tiết',
    close: 'Đóng',
    noDescription: 'Chưa có mô tả',
    untagged: 'Chung',
    pricing: 'Giá',
    modelRatio: 'Hệ số mô hình',
    completionRatio: 'Hệ số hoàn thành',
    cacheRatio: 'Hệ số đọc cache',
    cacheWriteRatio: 'Hệ số ghi cache',
    perCall: 'Tính phí theo lượt',
    perCallUnit: 'lượt',
    none: 'Không có',
  },
  'zh-TW': {
    loading: '正在載入模型列表…',
    loadFailed: '模型列表載入失敗',
    retry: '重試',
    helper: '依供應商、標籤、群組或端點篩選，點擊「複製」即可取得模型 ID；完整計費資訊請查看定價頁面。',
    total: '模型總數',
    shown: '目前結果',
    pricingPage: '查看定價頁面',
    searchPlaceholder: '搜尋模型名稱、描述或標籤',
    reset: '重設篩選',
    vendors: '供應商',
    tags: '標籤',
    groups: '可用群組',
    endpoints: '端點類型',
    all: '全部',
    empty: '沒有符合的模型',
    copy: '複製',
    copied: '已複製',
    details: '詳細',
    close: '關閉',
    noDescription: '暫無描述',
    untagged: '通用',
    pricing: '價格',
    modelRatio: '模型倍率',
    completionRatio: '補全倍率',
    cacheRatio: '快取命中倍率',
    cacheWriteRatio: '快取建立倍率',
    perCall: '按次計費',
    perCallUnit: '次',
    none: '無',
  },
};

// ---------------------------------------------------------------------------
// 数据
// ---------------------------------------------------------------------------

function parseTags(tags?: string): string[] {
  return (tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/** 接口里的倍率是浮点数，去掉浮点误差后加上 x 后缀：37.5x */
function formatRatio(value: number): string {
  return `${Number.parseFloat(value.toPrecision(6))}x`;
}

/** 按次计费（quota_type 为 1）的模型倍率恒为 0，真正的价格在 model_price */
function isPerCall(model: PricingModel): boolean {
  return model.quota_type === 1;
}

function priceLabel(model: PricingModel, copy: CatalogCopy): string {
  return isPerCall(model)
    ? `$${Number.parseFloat((model.model_price ?? 0).toPrecision(6))} / ${copy.perCallUnit}`
    : formatRatio(model.model_ratio);
}

/** 统计每个取值出现在多少个模型上，按次数降序、同次数按名称排序 */
function countOptions(values: string[][]): FilterOption[] {
  const counts = new Map<string, number>();
  for (const list of values) {
    for (const value of new Set(list)) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
    .map(([value, count]) => ({ value, label: value, count }));
}

async function fetchCatalog(signal: AbortSignal): Promise<Catalog> {
  const response = await fetch(pricingRoute, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const payload = (await response.json()) as PricingResponse;
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Invalid response');

  return {
    // 缺少模型名或供应商的条目无法展示，直接丢弃（其余字段缺失时各处都有兜底）
    models: payload.data.filter(
      (model) => typeof model?.model_name === 'string' && model.model_name !== '' && Number.isFinite(model.vendor_id),
    ),
    vendorNames: new Map((payload.vendors ?? []).map((vendor) => [vendor.id, vendor.name])),
    groupRatio: payload.group_ratio ?? {},
  };
}

// ---------------------------------------------------------------------------
// 组件
// ---------------------------------------------------------------------------

/**
 * 模型目录：从主站定价接口实时拉取全部模型，支持按供应商 / 标签 / 分组 / 端点筛选、
 * 关键词搜索、复制模型 ID，以及查看倍率与可用分组的详情。旧文档站同名组件的 React 版本。
 *
 * 旧组件只展示 Anthropic 与 OpenAI 两节，其余供应商的模型（Gemini、Grok 等）计入总数却不显示；
 * 这里按接口实际返回的供应商分节，总数与列表一致。
 */
export function ModelCatalog() {
  const { locale } = useI18n();
  const copy = COPY[locale && isLocale(locale) ? locale : DEFAULT_LOCALE];

  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [vendor, setVendor] = useState(ALL);
  const [tag, setTag] = useState(ALL);
  const [group, setGroup] = useState(ALL);
  const [endpoint, setEndpoint] = useState(ALL);
  const [selected, setSelected] = useState<PricingModel | null>(null);
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  // attempt 变化即重新请求（「重试」按钮）；初始状态与重试时都已是 loading
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // 超时也走 abort：fetch 以 AbortError 失败，落进下面的错误分支
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    fetchCatalog(controller.signal)
      .then((catalog) => {
        if (!cancelled) setState({ status: 'ready', catalog });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const timedOut = error instanceof DOMException && error.name === 'AbortError';
        setState({ status: 'error', message: timedOut ? 'timeout' : error instanceof Error ? error.message : String(error) });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  };

  const copyResetTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyResetTimer.current), []);

  const copyModelId = useCallback(async (modelName: string) => {
    try {
      await navigator.clipboard.writeText(modelName);
    } catch {
      // 非安全上下文或用户拒绝授权时无法写剪贴板，按钮保持原样即可
      return;
    }
    setCopiedModel(modelName);
    window.clearTimeout(copyResetTimer.current);
    copyResetTimer.current = window.setTimeout(() => setCopiedModel(null), COPIED_RESET_MS);
  }, []);

  const catalog = state.status === 'ready' ? state.catalog : null;

  const options = useMemo(() => {
    if (!catalog) return null;
    const vendorName = (id: number) => catalog.vendorNames.get(id) ?? `#${id}`;
    const featuredRank = (id: number) => {
      const rank = FEATURED_VENDOR_IDS.indexOf(id);
      return rank === -1 ? FEATURED_VENDOR_IDS.length : rank;
    };

    return {
      vendorName,
      // 重点供应商在前，其余按模型数降序、同数量按名称
      vendors: countOptions(catalog.models.map((model) => [String(model.vendor_id)]))
        .map((option) => ({ ...option, label: vendorName(Number(option.value)) }))
        .sort(
          (a, b) =>
            featuredRank(Number(a.value)) - featuredRank(Number(b.value)) ||
            b.count - a.count ||
            a.label.localeCompare(b.label),
        ),
      tags: countOptions(catalog.models.map((model) => parseTags(model.tags))),
      groups: countOptions(catalog.models.map((model) => model.enable_groups ?? [])),
      endpoints: countOptions(catalog.models.map((model) => model.supported_endpoint_types ?? [])),
    };
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return catalog.models.filter((model) => {
      const tags = parseTags(model.tags);
      const groups = model.enable_groups ?? [];
      const endpoints = model.supported_endpoint_types ?? [];
      if (vendor !== ALL && String(model.vendor_id) !== vendor) return false;
      if (tag !== ALL && !tags.includes(tag)) return false;
      if (group !== ALL && !groups.includes(group)) return false;
      if (endpoint !== ALL && !endpoints.includes(endpoint)) return false;
      if (terms.length === 0) return true;

      const haystack = [model.model_name, model.description ?? '', ...tags, ...groups, ...endpoints]
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [catalog, query, vendor, tag, group, endpoint]);

  const sections = useMemo(() => {
    if (!options) return [];
    return options.vendors
      .map((option) => ({
        id: option.value,
        title: option.label,
        models: filtered
          .filter((model) => String(model.vendor_id) === option.value)
          .sort((a, b) => b.model_ratio - a.model_ratio || a.model_name.localeCompare(b.model_name)),
      }))
      .filter((section) => section.models.length > 0);
  }, [filtered, options]);

  const resetFilters = () => {
    setQuery('');
    setVendor(ALL);
    setTag(ALL);
    setGroup(ALL);
    setEndpoint(ALL);
  };

  if (state.status === 'loading') {
    return (
      <div role="status" className="not-prose my-6 rounded-xl border bg-fd-card p-6 text-sm text-fd-muted-foreground">
        {copy.loading}
      </div>
    );
  }

  if (state.status === 'error' || !catalog || !options) {
    return (
      <div role="alert" className="not-prose my-6 flex flex-wrap items-center gap-3 rounded-xl border bg-fd-card p-6 text-sm">
        <span>{copy.loadFailed}</span>
        {state.status === 'error' ? (
          <code className="text-xs text-fd-muted-foreground">{state.message}</code>
        ) : null}
        <button type="button" className={buttonClass} onClick={retry}>
          {copy.retry}
        </button>
        <a href={PRICING_PAGE_URL} target="_blank" rel="noreferrer noopener" className={buttonClass}>
          {copy.pricingPage} ↗
        </a>
      </div>
    );
  }

  return (
    <div className="not-prose my-6 space-y-6">
      <div className="space-y-4 rounded-xl border bg-fd-card p-4 sm:p-5">
        <p className="text-sm text-fd-muted-foreground">{copy.helper}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span>
            {copy.total} <strong className="font-semibold">{catalog.models.length}</strong>
          </span>
          <span>
            {copy.shown} <strong className="font-semibold">{filtered.length}</strong>
          </span>
          <a
            href={PRICING_PAGE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-fd-primary underline-offset-4 hover:underline"
          >
            {copy.pricingPage} ↗
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="min-w-0 flex-1 rounded-lg border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
          />
          <button type="button" className={buttonClass} onClick={resetFilters}>
            {copy.reset}
          </button>
        </div>
        <FilterRow label={copy.vendors} allLabel={copy.all} total={catalog.models.length} options={options.vendors} value={vendor} onChange={setVendor} />
        <FilterRow label={copy.tags} allLabel={copy.all} options={options.tags} value={tag} onChange={setTag} />
        <FilterRow label={copy.groups} allLabel={copy.all} options={options.groups} value={group} onChange={setGroup} />
        <FilterRow label={copy.endpoints} allLabel={copy.all} options={options.endpoints} value={endpoint} onChange={setEndpoint} />
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-6 text-sm text-fd-muted-foreground">
          {copy.empty}
          <button type="button" className={buttonClass} onClick={resetFilters}>
            {copy.reset}
          </button>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.id} aria-labelledby={`model-vendor-${section.id}`} className="space-y-3">
            <h3 id={`model-vendor-${section.id}`} className="flex items-baseline gap-2 text-lg font-semibold">
              {section.title}
              <span className="text-sm font-normal text-fd-muted-foreground">{section.models.length}</span>
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {section.models.map((model) => (
                <li key={model.model_name} className="flex flex-col rounded-xl border bg-fd-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <code className="break-all font-mono text-sm font-semibold">{model.model_name}</code>
                    <span className="shrink-0 rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs font-medium text-fd-primary">
                      {priceLabel(model, copy)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-fd-muted-foreground">
                    {model.description || copy.noDescription}
                  </p>
                  <Chips items={parseTags(model.tags)} fallback={copy.untagged} className="mt-3" />
                  <div className="mt-auto flex gap-2 pt-4">
                    <button type="button" className={buttonClass} onClick={() => void copyModelId(model.model_name)}>
                      {copiedModel === model.model_name ? copy.copied : copy.copy}
                    </button>
                    <button type="button" className={buttonClass} onClick={() => setSelected(model)}>
                      {copy.details}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {/* 读屏器播报复制结果 */}
      <p aria-live="polite" className="sr-only">
        {copiedModel ? `${copy.copied}: ${copiedModel}` : ''}
      </p>

      <ModelDialog
        model={selected}
        vendorName={selected ? options.vendorName(selected.vendor_id) : ''}
        groupRatio={catalog.groupRatio}
        copy={copy}
        copied={selected !== null && copiedModel === selected.model_name}
        onCopy={copyModelId}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

const buttonClass =
  'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary';

function FilterRow({
  label,
  allLabel,
  total,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  /** 「全部」后显示的数量；缺省时不显示 */
  total?: number;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-full text-xs font-medium text-fd-muted-foreground sm:w-auto sm:min-w-20">{label}</span>
      <FilterPill active={value === ALL} onClick={() => onChange(ALL)} count={total}>
        {allLabel}
      </FilterPill>
      {options.map((option) => (
        <FilterPill
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
          count={option.count}
        >
          {option.label}
        </FilterPill>
      ))}
    </div>
  );
}

function FilterPill({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary',
        active
          ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
          : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
      )}
    >
      {children}
      {count === undefined ? null : <span className="opacity-70">{count}</span>}
    </button>
  );
}

function Chips({ items, fallback, className }: { items: string[]; fallback: string; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {(items.length > 0 ? items : [fallback]).map((item) => (
        <li key={item} className="rounded-md bg-fd-muted px-2 py-0.5 text-xs text-fd-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * 模型详情。用原生 <dialog> 的模态模式：焦点限制、Esc 关闭与背景遮罩由浏览器负责；
 * 打开期间锁住页面滚动，点击遮罩关闭。
 */
function ModelDialog({
  model,
  vendorName,
  groupRatio,
  copy,
  copied,
  onCopy,
  onClose,
}: {
  model: PricingModel | null;
  vendorName: string;
  groupRatio: Record<string, number>;
  copy: CatalogCopy;
  copied: boolean;
  onCopy: (modelName: string) => Promise<void>;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !model) return;

    dialog.showModal();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [model]);

  const groups = model?.enable_groups ?? [];
  const endpoints = model?.supported_endpoint_types ?? [];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="model-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // 点在对话框内容之外（遮罩）时，事件目标是 dialog 本身
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="not-prose m-auto w-[min(36rem,calc(100vw-2rem))] rounded-xl border bg-fd-popover p-0 text-fd-popover-foreground shadow-lg backdrop:bg-black/50"
    >
      {model ? (
        <div className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fd-muted font-semibold">
              {vendorName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-fd-muted-foreground">{vendorName}</p>
              <h3 id="model-dialog-title" className="break-all font-mono text-base font-semibold">
                {model.model_name}
              </h3>
            </div>
            <button type="button" className={buttonClass} onClick={() => void onCopy(model.model_name)}>
              {copied ? copy.copied : copy.copy}
            </button>
            <button type="button" className={buttonClass} aria-label={copy.close} onClick={() => dialogRef.current?.close()}>
              ×
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm">{model.description || copy.noDescription}</p>
            <Chips items={parseTags(model.tags)} fallback={copy.untagged} />
          </div>

          <DialogSection title={copy.endpoints}>
            <Chips items={endpoints} fallback={copy.none} />
          </DialogSection>

          <DialogSection title={copy.pricing}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {isPerCall(model) ? (
                <Stat label={copy.perCall} value={priceLabel(model, copy)} />
              ) : (
                <>
                  <Stat label={copy.modelRatio} value={formatRatio(model.model_ratio)} />
                  <Stat label={copy.completionRatio} value={formatRatio(model.completion_ratio)} />
                  {model.cache_ratio ? <Stat label={copy.cacheRatio} value={formatRatio(model.cache_ratio)} /> : null}
                  {model.create_cache_ratio ? (
                    <Stat label={copy.cacheWriteRatio} value={formatRatio(model.create_cache_ratio)} />
                  ) : null}
                </>
              )}
            </dl>
          </DialogSection>

          <DialogSection title={copy.groups}>
            {/* 分组后附该分组的倍率（接口的 group_ratio），与模型倍率相乘即实际计费倍率 */}
            <Chips
              items={groups.map((name) => (name in groupRatio ? `${name} ×${groupRatio[name]}` : name))}
              fallback={copy.none}
            />
          </DialogSection>
        </div>
      ) : null}
    </dialog>
  );
}

function DialogSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-medium text-fd-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-fd-muted px-3 py-2">
      <dt className="text-xs text-fd-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
