'use client';

import { useEffect, useState } from 'react';
import { STATUS_DATA_ROUTES } from '@/lib/status';
import type { HomeRedesignCopy } from '@/lib/home-redesign-copy';
import { localePath, type Locale } from '@/lib/i18n';
import { container, Eyebrow, narrowHeadingClass, Phrases, TextLink } from './primitives';

type ProviderStatus = 'operational' | 'degraded' | 'failed' | 'unknown';

interface StatusProvider {
  model?: string;
  name?: string;
  latest?: { status?: string };
  statistics?: { successRate?: number };
}

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
  statuses: ProviderStatus[];
}

const EMPTY: LiveData = {
  modelCount: null,
  vendorCount: null,
  successRate: null,
  avgLatencyMs: null,
  avgTps: null,
  statuses: [],
};

function normalizeStatus(value: string | undefined): ProviderStatus {
  if (value === 'operational') return 'operational';
  if (value === 'degraded' || value === 'validation_failed') return 'degraded';
  if (value === 'failed' || value === 'down') return 'failed';
  return 'unknown';
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

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      readJson<PricingResponse>(STATUS_DATA_ROUTES.pricing, signal),
      readJson<{ providers?: StatusProvider[] }>(STATUS_DATA_ROUTES.overview, signal),
      readJson<PerfResponse>(`${STATUS_DATA_ROUTES.perfSummary}?hours=24`, signal),
    ])
      .then(([pricing, status, perf]) => {
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
        setData({
          modelCount: models.length || null,
          vendorCount: pricing.vendors?.length || vendorIds.size || null,
          successRate: perf.data?.summary?.success_rate ?? null,
          avgLatencyMs: perf.data?.summary?.avg_latency_ms ?? null,
          avgTps: perf.data?.summary?.avg_tps ?? null,
          statuses: (status.providers ?? []).map((provider) => normalizeStatus(provider.latest?.status)),
        });
      })
      .catch(() => {
        if (!signal.aborted) setData(EMPTY);
      });

    return () => controller.abort();
  }, []);

  const { stats, reliability, status } = redesign;
  const values = [
    data.modelCount === null ? '—' : new Intl.NumberFormat(lang).format(data.modelCount),
    data.vendorCount === null ? '—' : new Intl.NumberFormat(lang).format(data.vendorCount),
    data.successRate === null ? '—' : `${data.successRate.toFixed(2)}%`,
    formatLatency(data.avgLatencyMs, lang),
  ];

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
                {status.legend.map((item, index) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${['bg-brand', 'bg-[#BA7517]', 'bg-[#A32D2D]'][index]}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="mt-6 grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
              aria-hidden="true"
            >
              {Array.from({ length: 54 }, (_, index) => {
                const value = data.statuses[index];
                return (
                  <span
                    key={index}
                    className={`h-2 rounded-sm ${
                      value === 'operational'
                        ? 'bg-brand/70'
                        : value === 'degraded'
                          ? 'bg-[#BA7517]'
                          : value === 'failed'
                            ? 'bg-[#A32D2D]'
                            : 'bg-fd-border'
                    }`}
                  />
                );
              })}
            </div>
            <p className="mt-5 text-xs text-fd-muted-foreground">{status.note}</p>
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
