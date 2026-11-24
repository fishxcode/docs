/**
 * 主站 /api/pricing 的展示口径。
 *
 * 与 new-api 的 web/src/features/pricing/lib/price.ts、dynamic-price.ts 对齐：
 * quota_display_type 是 USD，默认单位为 1M tokens；普通按量模型以
 * model_ratio × 2 为输入单价，动态计费模型以 billing_expr 的 p 系数为输入单价；
 * 未选分组时取该模型可用分组里最低的 group_ratio（模型广场展示最优价）。
 * model_ratio=37.5 是动态计费的兼容占位值，不能直接当成价格。
 */

export interface PricingModel {
  model_name: string;
  description?: string;
  /** 逗号分隔的标签串 */
  tags?: string;
  vendor_id: number;
  /** 0：按 token 计费；1：按次计费，单价见 model_price（美元） */
  quota_type?: number;
  model_ratio: number;
  model_price?: number;
  completion_ratio: number;
  cache_ratio?: number | null;
  create_cache_ratio?: number | null;
  /** 动态计费表达式；billing_mode 为 tiered_expr 时优先按表达式取真实单价 */
  billing_mode?: 'ratio' | 'tiered_expr' | null;
  billing_expr?: string | null;
  enable_groups?: string[];
  supported_endpoint_types?: string[];
}

/** 动态计费表达式的一档价格，单位均为 USD / 1M tokens */
export interface PricingTier {
  label: string;
  condition?: string;
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
}

export interface ModelPrice {
  kind: 'call' | 'token' | 'dynamic';
  /** 按次：USD / 次；其余：USD / 1M tokens 的输入单价 */
  input: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  cacheWrite1h?: number;
  tiers?: PricingTier[];
}

const PRICE_VARIABLES: Record<string, keyof Omit<PricingTier, 'label' | 'condition'>> = {
  p: 'input',
  c: 'output',
  cr: 'cacheRead',
  cc: 'cacheWrite',
  cc1h: 'cacheWrite1h',
};

/** 未选分组：取可用分组中最低倍率，与模型广场的「最低可用价」一致 */
export function bestGroupRatio(model: PricingModel, groupRatio: Record<string, number>): number {
  const ratios = (model.enable_groups ?? [])
    .map((group) => groupRatio[group])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  return ratios.length > 0 ? Math.min(...ratios) : 1;
}

/** 主站的 USD 金额格式：>=1 最多 4 位小数，<1 最多 6 位，去掉尾随 0 */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const digits = Math.abs(value) >= 1 ? 4 : 6;
  const minimum = Math.pow(10, -digits);
  const adjusted = value > 0 && value < minimum ? minimum : value;
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(adjusted)}`;
}

/** 主站倍率显示同样去浮点误差；0、null 等无效值显示占位符 */
export function formatRatio(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${Number.parseFloat(value.toPrecision(6))}x` : '—';
}

/** 把 tier("名称", p * 10 + c * 50 + …) 解析成可读档位，不执行表达式 */
export function parseBillingTiers(expr: string | null | undefined): PricingTier[] {
  if (!expr?.includes('tier(')) return [];
  const pattern = /tier\(\s*"([^"]*)"\s*,\s*([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
  const tiers: PricingTier[] = [];
  for (const match of expr.matchAll(pattern)) {
    const tier: PricingTier = { label: match[1] || 'default' };
    for (const [variable, field] of Object.entries(PRICE_VARIABLES)) {
      const coefficient = match[2].match(new RegExp(`\\b${variable}\\s*\\*\\s*([0-9.]+)`));
      if (coefficient) tier[field] = Number.parseFloat(coefficient[1]);
    }
    if (typeof tier.input === 'number' && typeof tier.output === 'number') tiers.push(tier);
  }
  return tiers;
}

/**
 * 从主站 /api/pricing 精确取价。普通按量模型按 ratio 乘出四项价格；
 * 动态模型按表达式首档（时段模型按 Asia/Shanghai 当前时段选择）；
 * 表达式无法解析时退回「动态计费」，不拿 37.5 冒充单价。
 */
export function modelPrice(
  model: PricingModel,
  groupRatio: Record<string, number>,
  now = new Date(),
): ModelPrice {
  const ratio = bestGroupRatio(model, groupRatio);

  if (model.quota_type === 1) {
    return { kind: 'call', input: (model.model_price ?? 0) * ratio };
  }

  if (model.billing_mode === 'tiered_expr' && model.billing_expr) {
    const tiers = parseBillingTiers(model.billing_expr);
    const tier = currentTier(model.billing_expr, tiers, now);
    if (tier) {
      return {
        kind: 'dynamic',
        input: (tier.input ?? 0) * ratio,
        output: typeof tier.output === 'number' ? tier.output * ratio : undefined,
        cacheRead: typeof tier.cacheRead === 'number' ? tier.cacheRead * ratio : undefined,
        cacheWrite: typeof tier.cacheWrite === 'number' ? tier.cacheWrite * ratio : undefined,
        cacheWrite1h: typeof tier.cacheWrite1h === 'number' ? tier.cacheWrite1h * ratio : undefined,
        tiers,
      };
    }
    return { kind: 'dynamic', input: Number.NaN, tiers };
  }

  const input = model.model_ratio * 2 * ratio;
  return {
    kind: 'token',
    input,
    output: input * model.completion_ratio,
    cacheRead: typeof model.cache_ratio === 'number' ? input * model.cache_ratio : undefined,
    cacheWrite: typeof model.create_cache_ratio === 'number' ? input * model.create_cache_ratio : undefined,
  };
}

/** 卡片上的价格：动态模型以输入价为起点；分档/时段另行在详情里说明 */
export function priceLabel(model: PricingModel, groupRatio: Record<string, number>, copy: { dynamic: string; perCallUnit: string }, now = new Date()): string {
  const price = modelPrice(model, groupRatio, now);
  if (!Number.isFinite(price.input)) return copy.dynamic;
  const amount = formatUsd(price.input);
  return price.kind === 'call' ? `${amount} / ${copy.perCallUnit}` : `${amount} / 1M`;
}

/**
 * 选择当前时段档位。表达式里的 hour/weekday 均按 Asia/Shanghai 计算；
 * 多档长度条件以首档（标准上下文）为卡片基准；后缀乘数按当前工作日时段生效。
 */
function currentTier(expr: string, tiers: PricingTier[], now: Date): PricingTier | undefined {
  if (tiers.length === 0) return undefined;
  let tier = tiers[0];
  if (/hour\(/.test(expr) && tiers.length > 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      parts.find((part) => part.type === 'weekday')?.value ?? '',
    );
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
    const peak = weekday >= 1 && weekday <= 5 && ((hour >= 9 && hour < 12) || (hour >= 14 && hour < 18));
    tier = tierByPeak(tiers, peak);
  }

  const multipliers = [...expr.matchAll(/\(\s*weekday\([^)]*\)\s*>=?\s*1[\s\S]*?\?\s*([0-9.]+)\s*:\s*([0-9.]+)\s*\)/g)];
  if (multipliers.length > 0) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      weekday: 'short',
      hour: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      parts.find((part) => part.type === 'weekday')?.value ?? '',
    );
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
    let factor = 1;
    for (const match of multipliers) {
      const inWindow = /hour\([^)]*\)\s*>=\s*9/.test(match[0])
        ? weekday >= 1 && weekday <= 5 && hour >= 9 && hour < 12
        : weekday >= 1 && weekday <= 5 && hour >= 14 && hour < 18;
      factor *= inWindow ? Number.parseFloat(match[1]) : Number.parseFloat(match[2]);
    }
    return scaleTier(tier, factor);
  }
  return tier;
}

function tierByPeak(tiers: PricingTier[], peak: boolean): PricingTier {
  const index = tiers.findIndex((tier) => /peak/i.test(tier.label) === peak);
  return index >= 0 ? tiers[index] : tiers[0];
}

function scaleTier(tier: PricingTier, factor: number): PricingTier {
  const scaled: PricingTier = { ...tier };
  for (const key of Object.values(PRICE_VARIABLES)) {
    const value = tier[key];
    if (typeof value === 'number') scaled[key] = value * factor;
  }
  return scaled;
}
