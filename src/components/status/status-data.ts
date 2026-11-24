/**
 * 模型状态页的客户端数据入口。
 *
 * 静态导出没有服务端：所有健康与性能数据都在浏览器挂载后从同源公开代理读取，
 * 生产代理见 public/_worker.js / vercel.json，dev 代理见 src/proxy.ts。
 * 状态站巡检与真实调用性能是两套独立数据，页面分别标注时间，不混成「实时状态」。
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  STATUS_DATA_ROUTES,
  toSnapshot,
  type PerfDetailResponse,
  type PerfSummaryResponse,
  type StatusSnapshot,
} from '@/lib/status';
import type { PricingModel } from '@/lib/pricing';

const STATUS_POLL_MS = 5 * 60 * 1000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

export interface EndpointDefinition {
  path: string;
  method: string;
}

export interface PricingCatalog {
  models: PricingModel[];
  groupRatio: Record<string, number>;
  endpoints: Record<string, EndpointDefinition>;
  vendors: Map<number, string>;
}

interface PricingResponse {
  success?: boolean;
  data?: PricingModel[] | Record<string, PricingModel>;
  group_ratio?: Record<string, number>;
  supported_endpoint?: Record<string, EndpointDefinition>;
  vendors?: Array<{ id: number; name: string }>;
}

interface PublicStatusPayload extends StatusSnapshot {
  error?: never;
}

/** 状态站代理可能直接转发原始响应，也可能返回压缩后的快照，这里统一收敛 */
function normalizeStatus(payload: unknown): StatusSnapshot {
  if (payload && typeof payload === 'object' && 'models' in payload && 'stale' in payload) {
    return payload as PublicStatusPayload;
  }
  const snapshot = toSnapshot(payload, Date.now());
  if (!snapshot) throw new Error('状态数据格式异常');
  return snapshot;
}

async function readJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

function normalizePricing(payload: unknown): PricingCatalog {
  if (!payload || typeof payload !== 'object') throw new Error('定价数据格式异常');
  const response = payload as PricingResponse;
  if (response.success === false) throw new Error('定价接口返回失败');
  const rawModels = Array.isArray(response.data)
    ? response.data
    : Object.values(response.data ?? {});
  const models = rawModels.filter(
    (model): model is PricingModel =>
      !!model && typeof model.model_name === 'string' && model.model_name.length > 0,
  );
  if (models.length === 0) throw new Error('定价模型清单为空');

  return {
    models,
    groupRatio: response.group_ratio ?? {},
    endpoints: response.supported_endpoint ?? {},
    vendors: new Map((response.vendors ?? []).map((vendor) => [vendor.id, vendor.name])),
  };
}

export interface StatusDataState {
  snapshot: StatusSnapshot | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * 巡检快照：每 5 分钟最多取一次，页面隐藏时不请求；连续失败指数退避，
 * 切回前台立即刷新。状态站本身每小时检测一次，更密集的轮询没有收益。
 */
export function useStatusSnapshot(): StatusDataState {
  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const failuresRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const load = useCallback(async (): Promise<void> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const data = normalizeStatus(await readJson(STATUS_DATA_ROUTES.overview, controller.signal));
      if (cancelledRef.current || controller.signal.aborted) return;
      setSnapshot(data);
      setError(null);
      failuresRef.current = 0;
    } catch (cause) {
      if (cancelledRef.current || controller.signal.aborted) return;
      failuresRef.current += 1;
      setError(cause instanceof Error ? cause.message : '获取状态数据失败');
    } finally {
      window.clearTimeout(timeout);
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  const runCycle = useCallback(async function cycle(): Promise<void> {
    if (cancelledRef.current) return;
    if (document.visibilityState === 'visible') await load();
    if (cancelledRef.current) return;
    const delay = Math.min(STATUS_POLL_MS * 2 ** failuresRef.current, MAX_BACKOFF_MS);
    clearTimer();
    // 具名函数表达式可以在自身初始化完成后递归引用，避免依赖外部变量引用
    timerRef.current = setTimeout(() => { void cycle(); }, delay);
  }, [clearTimer, load]);

  useEffect(() => {
    cancelledRef.current = false;
    void runCycle();

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelledRef.current) void load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelledRef.current = true;
      document.removeEventListener('visibilitychange', onVisible);
      clearTimer();
      abortRef.current?.abort();
    };
  }, [clearTimer, load, runCycle]);

  const refresh = useCallback(async () => {
    setLoading(true);
    failuresRef.current = 0;
    clearTimer();
    await load();
    if (!cancelledRef.current) {
      clearTimer();
      timerRef.current = setTimeout(() => void runCycle(), STATUS_POLL_MS);
    }
  }, [clearTimer, load, runCycle]);

  return { snapshot, error, loading, refresh };
}

export interface PricingDataState {
  catalog: PricingCatalog | null;
  error: string | null;
  loading: boolean;
}

export function usePricingCatalog(): PricingDataState {
  const [state, setState] = useState<PricingDataState>({
    catalog: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    readJson(STATUS_DATA_ROUTES.pricing, controller.signal)
      .then((payload) => {
        if (!cancelled) setState({ catalog: normalizePricing(payload), error: null, loading: false });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setState({
          catalog: null,
          error: cause instanceof Error ? cause.message : '获取定价数据失败',
          loading: false,
        });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return state;
}

export interface PerfDataState {
  detail: PerfDetailResponse['data'] | null;
  summary: PerfSummaryResponse['data'] | null;
  error: string | null;
  loading: boolean;
}

/** 性能 tab 才拉数：单模型与全站 24 小时汇总并行，URL 参数固定白名单 */
export function usePerfData(name: string, enabled: boolean): PerfDataState {
  const [state, setState] = useState<PerfDataState>({
    detail: null,
    summary: null,
    error: null,
    loading: enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const modelQuery = `?model=${encodeURIComponent(name)}&hours=24`;

    setState({ detail: null, summary: null, error: null, loading: true });
    Promise.all([
      readJson(`${STATUS_DATA_ROUTES.perfModel}${modelQuery}`, controller.signal) as Promise<PerfDetailResponse>,
      readJson(`${STATUS_DATA_ROUTES.perfSummary}?hours=24`, controller.signal) as Promise<PerfSummaryResponse>,
    ])
      .then(([detail, summary]) => {
        if (cancelled) return;
        setState({
          detail: detail.data ?? null,
          summary: summary.data ?? null,
          error: detail.success === false || summary.success === false ? '性能接口返回失败' : null,
          loading: false,
        });
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setState({
          detail: null,
          summary: null,
          error: cause instanceof Error ? cause.message : '获取性能数据失败',
          loading: false,
        });
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [enabled, name]);

  return state;
}

export function findPricingModel(catalog: PricingCatalog | null, name: string): PricingModel | null {
  return catalog?.models.find((model) => model.model_name === name) ?? null;
}
