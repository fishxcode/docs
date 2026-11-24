/**
 * 状态页的数据契约与轻量适配层。
 *
 * 公开数据源：
 * - https://status.fishxcode.com/api/v1/status：70 个探测模型、60 个历史点、可用性巡检；
 * - https://fishxcode.com/api/perf-metrics/summary?hours=24：真实调用的 24 小时性能汇总；
 * - https://fishxcode.com/api/perf-metrics?model=<name>&hours=24：单模型真实调用性能。
 *
 * 主站与状态站都不允许浏览器跨域读取，生产环境由 public/_worker.js / vercel.json
 * 转发到同源公开路径，dev 下由 src/proxy.ts 转发。所有页面均显示数据的最后检测时间，
 * 不把新旧不同来源的数字混成「实时状态」。
 */

export const STATUS_SITE_URL = 'https://status.fishxcode.com';
export const STATUS_API_BASE = '/api/status-data';

/** 厂商页固定顺序；厂商名按模型前缀与探测名推断，未知归 other */
export const FAMILY_ORDER = ['claude', 'openai', 'gemini', 'grok', 'deepseek', 'qwen', 'zhipu', 'moonshot', 'minimax', 'xiaomi', 'other'] as const;
export type Family = (typeof FAMILY_ORDER)[number];

export const FAMILY_LABELS: Record<Family, string> = {
  claude: 'Claude / Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini / Google',
  grok: 'Grok / xAI',
  deepseek: 'DeepSeek',
  qwen: 'Qwen',
  zhipu: 'Zhipu / GLM',
  moonshot: 'Moonshot / Kimi',
  minimax: 'MiniMax',
  xiaomi: 'Xiaomi',
  other: '其他模型',
};

export function isFamily(value: string): value is Family {
  return (FAMILY_ORDER as readonly string[]).includes(value);
}

/** 模型名 → 厂商系列；含版本后缀与别名时也尽量归类 */
export function familyOf(model: string): Family {
  const name = model.toLowerCase();
  const rules: Array<[Family, RegExp]> = [
    ['claude', /(^|[-_])claude|^anthropic|^opus|^sonnet|^haiku/],
    ['openai', /(^|[-_])gpt|^o[13456](?:[-_]|$)|^codex|^chatgpt/],
    ['gemini', /(^|[-_])gemini|^gemma/],
    ['grok', /(^|[-_])grok|^xai/],
    ['deepseek', /(^|[-_])deepseek/],
    ['qwen', /(^|[-_])qwen|^qwen/],
    ['zhipu', /(^|[-_])glm|^zhipu/],
    ['moonshot', /(^|[-_])kimi|^moonshot/],
    ['minimax', /(^|[-_])minimax/],
    ['xiaomi', /(^|[-_])mimo|^xiaomi/],
  ];
  return rules.find(([, pattern]) => pattern.test(name))?.[0] ?? 'other';
}

export interface StatusCheck {
  status: string;
  latencyMs: number | null;
  pingLatencyMs: number | null;
  checkedAt: string;
  message?: string;
}

export interface StatusStatistics {
  totalChecks: number;
  operationalCount: number;
  degradedCount: number;
  failedCount: number;
  validationFailedCount: number;
  successRate: number;
  avgLatencyMs: number | null;
  minLatencyMs: number | null;
  maxLatencyMs: number | null;
}

export interface StatusProvider {
  id: string;
  name: string;
  type: string;
  model: string;
  group: string | null;
  endpoint: string;
  latest: StatusCheck;
  statistics: StatusStatistics;
  timeline: StatusCheck[];
}

export interface StatusResponse {
  providers: StatusProvider[];
  summary: {
    total: number;
    operational: number;
    degraded: number;
    failed: number;
    validationFailed: number;
    maintenance: number;
    avgLatencyMs: number | null;
  };
  metadata: {
    generatedAt: string;
    pollIntervalMs: number;
    pollIntervalLabel?: string;
    filters?: Record<string, unknown>;
  };
}

export type HistoryPoint = {
  /** Unix 毫秒；心跳条按时间正序展示 */
  ts: number;
  ok: boolean;
  latency: number | null;
  ping: number | null;
  status: string;
  message?: string;
};

export interface StatusModel {
  model: string;
  family: Family;
  state: 'ok' | 'warn' | 'bad' | 'unknown';
  latency: number | null;
  ping: number | null;
  checkedAt: string;
  successRate: number | null;
  history: HistoryPoint[];
}

export interface StatusSnapshot {
  generatedAt: string;
  lastCheckedAt: string;
  stale: boolean;
  summary: StatusResponse['summary'];
  models: StatusModel[];
}

export interface PerfSummary {
  avg_latency_ms: number;
  success_rate: number;
  avg_tps: number;
}

export interface PerfModel {
  model_name: string;
  avg_latency_ms: number;
  success_rate: number;
  avg_tps: number;
  recent_success_series?: Array<{ ts: number; success_rate: number }>;
}

export interface PerfSummaryResponse {
  success: boolean;
  data?: {
    summary: PerfSummary;
    window_start: string;
    window_end: string;
    models: PerfModel[];
  };
}

export interface PerfPoint {
  ts: number;
  avg_ttft_ms: number;
  avg_latency_ms: number;
  success_rate: number;
  avg_tps: number;
}

export interface PerfDetailResponse {
  success: boolean;
  data?: {
    model_name: string;
    series_schema?: string;
    summary: PerfSummary | null;
    series: PerfPoint[];
    window_start: string;
    window_end: string;
    groups: Array<PerfPoint & { group: string; series: PerfPoint[] }>;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** 只读解析状态站响应；上游结构意外变化时返回 null，页面显示「暂不可用」而不是崩溃 */
export function parseStatusResponse(payload: unknown): StatusResponse | null {
  if (!isRecord(payload) || !Array.isArray(payload.providers) || !isRecord(payload.summary) || !isRecord(payload.metadata)) {
    return null;
  }
  const providers = payload.providers.filter(isRecord).flatMap((item) => {
    if (typeof item.model !== 'string' || !item.model || !isRecord(item.latest)) return [];
    const timeline = Array.isArray(item.timeline) ? item.timeline.filter(isRecord) : [];
    const provider: StatusProvider = {
      id: typeof item.id === 'string' ? item.id : item.model,
      name: typeof item.name === 'string' ? item.name : item.model,
      type: typeof item.type === 'string' ? item.type : '',
      model: item.model,
      group: typeof item.group === 'string' ? item.group : null,
      endpoint: typeof item.endpoint === 'string' ? item.endpoint : '',
      latest: {
        status: typeof item.latest.status === 'string' ? item.latest.status : 'unknown',
        latencyMs: numberOrNull(item.latest.latencyMs),
        pingLatencyMs: numberOrNull(item.latest.pingLatencyMs),
        checkedAt: typeof item.latest.checkedAt === 'string' ? item.latest.checkedAt : '',
        message: typeof item.latest.message === 'string' ? item.latest.message : undefined,
      },
      statistics: isRecord(item.statistics)
        ? {
            totalChecks: numberOrNull(item.statistics.totalChecks) ?? 0,
            operationalCount: numberOrNull(item.statistics.operationalCount) ?? 0,
            degradedCount: numberOrNull(item.statistics.degradedCount) ?? 0,
            failedCount: numberOrNull(item.statistics.failedCount) ?? 0,
            validationFailedCount: numberOrNull(item.statistics.validationFailedCount) ?? 0,
            successRate: numberOrNull(item.statistics.successRate) ?? 0,
            avgLatencyMs: numberOrNull(item.statistics.avgLatencyMs),
            minLatencyMs: numberOrNull(item.statistics.minLatencyMs),
            maxLatencyMs: numberOrNull(item.statistics.maxLatencyMs),
          }
        : { totalChecks: 0, operationalCount: 0, degradedCount: 0, failedCount: 0, validationFailedCount: 0, successRate: 0, avgLatencyMs: null, minLatencyMs: null, maxLatencyMs: null },
      timeline: timeline.map((point) => ({
        status: typeof point.status === 'string' ? point.status : 'unknown',
        latencyMs: numberOrNull(point.latencyMs),
        pingLatencyMs: numberOrNull(point.pingLatencyMs),
        checkedAt: typeof point.checkedAt === 'string' ? point.checkedAt : '',
        message: typeof point.message === 'string' ? point.message : undefined,
      })),
    };
    return [provider];
  });

  return {
    providers,
    summary: {
      total: numberOrNull(payload.summary.total) ?? providers.length,
      operational: numberOrNull(payload.summary.operational) ?? 0,
      degraded: numberOrNull(payload.summary.degraded) ?? 0,
      failed: numberOrNull(payload.summary.failed) ?? 0,
      validationFailed: numberOrNull(payload.summary.validationFailed) ?? 0,
      maintenance: numberOrNull(payload.summary.maintenance) ?? 0,
      avgLatencyMs: numberOrNull(payload.summary.avgLatencyMs),
    },
    metadata: {
      generatedAt: typeof payload.metadata.generatedAt === 'string' ? payload.metadata.generatedAt : '',
      pollIntervalMs: numberOrNull(payload.metadata.pollIntervalMs) ?? 3_600_000,
      pollIntervalLabel: typeof payload.metadata.pollIntervalLabel === 'string' ? payload.metadata.pollIntervalLabel : undefined,
      filters: isRecord(payload.metadata.filters) ? payload.metadata.filters : undefined,
    },
  };
}

/** 上游 timeline 是倒序，页面心跳条统一改为时间正序 */
export function toSnapshot(payload: unknown, now = Date.now()): StatusSnapshot | null {
  const response = parseStatusResponse(payload);
  if (!response) return null;

  const checkedTimes = response.providers
    .map((provider) => Date.parse(provider.latest.checkedAt))
    .filter((time) => Number.isFinite(time));
  const lastCheckedAt = checkedTimes.length > 0 ? new Date(Math.max(...checkedTimes)).toISOString() : '';
  // 状态站的巡检若超过两个轮询周期没有新点，页面必须显著提示数据陈旧
  const stale = lastCheckedAt === '' || now - Date.parse(lastCheckedAt) > response.metadata.pollIntervalMs * 2;

  const models = response.providers.map<StatusModel>((provider) => {
    const history = [...provider.timeline]
      .map((point) => ({
        ts: Date.parse(point.checkedAt),
        ok: point.status === 'operational',
        latency: point.latencyMs,
        ping: point.pingLatencyMs,
        status: point.status,
        message: point.message,
      }))
      .filter((point) => Number.isFinite(point.ts))
      .sort((a, b) => a.ts - b.ts);
    const failed = provider.latest.status === 'failed' || provider.latest.status === 'error' || provider.latest.status === 'validation_failed';
    const warn = provider.latest.status === 'degraded' || (provider.latest.latencyMs ?? 0) > 12_000;
    return {
      model: provider.model,
      family: familyOf(provider.model),
      state: failed ? 'bad' : warn ? 'warn' : provider.latest.status === 'operational' ? 'ok' : 'unknown',
      latency: provider.latest.latencyMs,
      ping: provider.latest.pingLatencyMs,
      checkedAt: provider.latest.checkedAt,
      successRate: provider.statistics.successRate,
      history,
    };
  }).sort((a, b) => a.model.localeCompare(b.model));

  return {
    generatedAt: response.metadata.generatedAt,
    lastCheckedAt,
    stale,
    summary: response.summary,
    models,
  };
}

/** 状态站原始响应过大（~640KB）；代理只回传页面需要的字段，减小浏览器解析和传输成本 */
export function toPublicStatusPayload(payload: unknown): StatusSnapshot | { error: string } {
  const snapshot = toSnapshot(payload);
  return snapshot ?? { error: 'invalid upstream status payload' };
}

export function statusDataUrl(path: string, search = ''): string {
  const suffix = path.replace(/^\/+/, '');
  return `${STATUS_API_BASE}/${suffix}${search}`;
}

export const STATUS_DATA_ROUTES = {
  overview: '/api/status-data/status',
  perfSummary: '/api/status-data/perf-summary',
  perfModel: '/api/status-data/perf-model',
  pricing: '/api/status-data/pricing',
} as const;
