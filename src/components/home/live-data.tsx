'use client';

import { useEffect, useMemo, useState } from 'react';
import type { HomeRedesignCopy } from '@/lib/home-redesign-copy';
import { localePath, type Locale } from '@/lib/i18n';
import { statusFamilyLabel } from '@/lib/status-copy';
import { FAMILY_ORDER, STATUS_DATA_ROUTES, toSnapshot, type StatusModel } from '@/lib/status';
import { container, Eyebrow, narrowHeadingClass, Phrases, TextLink } from './primitives';

interface PricingResponse {
  data?: unknown[] | Record<string, unknown>;
  vendors?: Array<{ id: number; name?: string }>;
}

interface PerfResponse {
  data?: {
    summary?: {
      avg_latency_ms?: number;
      success_rate?: number;
      avg_tps?: number;
    };
  };
}

interface LiveData {
  modelCount: number | null;
  vendorCount: number | null;
  successRate: number | null;
  avgLatencyMs: number | null;
  avgTps: number | null;
  models: StatusModel[];
}

const EMPTY: LiveData = {
  modelCount: null,
  vendorCount: null,
  successRate: null,
  avgLatencyMs: null,
  avgTps: null,
  models: [],
};

const STATE_ORDER = ['ok', 'warn', 'bad', 'unknown'] as const;
type ModelState = (typeof STATE_ORDER)[number];

const STATE_COLOR: Record<ModelState, string> = {
  ok: 'bg-[#1D9E75]',
  warn: 'bg-[#BA7517]',
  bad: 'bg-[#E24B4A]',
  unknown: 'bg-fd-border',
};

function countStates(models: StatusModel[]): Record<ModelState, number> {
  const counts: Record<ModelState, number> = { ok: 0, warn: 0, bad: 0, unknown: 0 };
  for (const model of models) counts[model.state in counts ? model.state : 'unknown'] += 1;
  return counts;
}

async function readJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

function formatLatency(ms: number | null, lang: Locale): string {
  if (ms === null || !Number.isFinite(ms)) return '—';
  if (ms >= 1000) return `${new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(ms / 1000)}s`;
  return `${Math.round(ms)}ms`;
}

/** 首屏数据带与可靠性区块：全部从公开接口读取，失败时显示占位符而不写死假数据 */
export function LiveMetricsSections({ lang, redesign }: { lang: Locale; redesign: HomeRedesignCopy }) {
  const [data, setData] = useState<LiveData>(EMPTY);
  const [active, setActive] = useState<StatusModel | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      readJson<PricingResponse>(STATUS_DATA_ROUTES.pricing, signal),
      readJson<unknown>(STATUS_DATA_ROUTES.overview, signal),
      readJson<PerfResponse>(`${STATUS_DATA_ROUTES.perfSummary}?hours=24`, signal),
    ])
      .then(([pricing, statusPayload, perf]) => {
        const models = Array.isArray(pricing.data)
          ? pricing.data
          : pricing.data && typeof pricing.data === 'object'
            ? Object.values(pricing.data)
            : [];
        const vendorIds = new Set(
          models
            .map((model) => (model as { vendor_id?: number }).vendor_id)
            .filter((id): id is number => typeof id === 'number'),
        );
        const snapshot = toSnapshot(statusPayload, Date.now());
        const liveModels = snapshot?.models ?? [];
        setData({
          modelCount: models.length || null,
          vendorCount: pricing.vendors?.length || vendorIds.size || null,
          successRate: perf.data?.summary?.success_rate ?? null,
          avgLatencyMs: perf.data?.summary?.avg_latency_ms ?? null,
          avgTps: perf.data?.summary?.avg_tps ?? null,
          models: liveModels,
        });
        setActive(liveModels[0] ?? null);
      })
      .catch(() => {
        if (!signal.aborted) {
          setData(EMPTY);
          setActive(null);
        }
      });

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => countStates(data.models), [data.models]);
  const families = useMemo(
    () =>
      FAMILY_ORDER.map((family) => ({
        family,
        models: data.models.filter((model) => model.family === family),
      })).filter((entry) => entry.models.length > 0),
    [data.models],
  );

  const { stats, reliability, status } = redesign;
  const values = [
    data.modelCount === null ? '—' : new Intl.NumberFormat(lang).format(data.modelCount),
    data.vendorCount === null ? '—' : new Intl.NumberFormat(lang).format(data.vendorCount),
    data.successRate === null ? '—' : `${data.successRate.toFixed(2)}%`,
    formatLatency(data.avgLatencyMs, lang),
  ];

  const activeIndex = active ? STATE_ORDER.indexOf(active.state as ModelState) : -1;
  const activeLabel = activeIndex >= 0 ? status.legend[activeIndex] : '';
  const activeDetail = active
    ? `${active.model} · ${activeLabel} · 24h ${active.successRate === null ? '—' : `${active.successRate.toFixed(0)}%`} · ${formatLatency(active.latency, lang)}`
    : status.note;

  return (
    <>
      <section className="bg-ink text-white">
        <div className={`${container} grid grid-cols-2 divide-x divide-y divide-white/15 md:grid-cols-4 md:divide-y-0`}>
          {stats.map((stat, index) => (
            <div key={stat.label} className="px-6 py-8">
              <p className="text-xs text-white/60">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{values[index]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-5">
            <Eyebrow>{reliability.eyebrow}</Eyebrow>
            <h2 className={narrowHeadingClass}>
              <Phrases text={reliability.title} />
            </h2>
            <p className="mt-5 text-pretty text-fd-muted-foreground md:text-lg">{reliability.description}</p>
            <div className="mt-8">
              <TextLink href={localePath(lang, '/status')}>{reliability.linkLabel}</TextLink>
            </div>
          </div>

          <div className="rounded-xl border border-fd-border bg-paper p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">{status.title}</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
                {status.legend.map((item, index) => {
                  const key = STATE_ORDER[index];
                  return (
                    <li key={item} className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${STATE_COLOR[key]}`}
                      />
                      {item} {new Intl.NumberFormat(lang).format(counts[key])}
                    </li>
                  );
                })}
              </ul>
            </div>

            {families.length > 0 ? (
              <div className="mt-6 space-y-3">
                {families.map(({ family, models: list }) => (
                  <div key={family} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3">
                    <span className="truncate text-xs text-fd-muted-foreground">
                      {statusFamilyLabel(lang, family)}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((model) => {
                        const index = STATE_ORDER.indexOf(model.state as ModelState);
                        const label = index >= 0 ? status.legend[index] : '';
                        return (
                          <span
                            key={model.model}
                            title={`${model.model} · ${label} · ${formatLatency(model.latency, lang)}`}
                            onMouseEnter={() => setActive(model)}
                            className={`size-2.5 rounded-sm transition-opacity ${STATE_COLOR[model.state as ModelState] ?? STATE_COLOR.unknown} ${active?.model === model.model ? 'ring-1 ring-fd-foreground' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 h-24 animate-pulse rounded-lg bg-fd-muted/50" />
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-fd-border pt-4">
              <p className="text-xs text-fd-muted-foreground">{activeDetail}</p>
              <TextLink href={localePath(lang, '/status')}>{reliability.linkLabel}</TextLink>
            </div>
            {data.avgTps !== null ? (
              <p className="mt-2 text-xs text-fd-muted-foreground">
                {new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(data.avgTps)} TPS
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
