'use client';

/**
 * 状态页三组主视图：总览、厂商系列、单模型。
 *
 * 静态导出没有服务端接口，页面挂载后从同源公开代理取数；巡检状态与性能/
 * 定价分别来自不同上游，界面始终标注来源与时间，不混成秒级「实时状态」。
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, ArrowLeft, ArrowUpRight, Copy, ExternalLink } from 'lucide-react';
import AppLink from '@/components/app-link';
import { HOME_ENDPOINTS } from '@/lib/home-copy';
import {
  FAMILY_ORDER,
  STATUS_SITE_URL,
  familyOf,
  isFamily,
  type Family,
  type StatusModel,
} from '@/lib/status';
import { statusFamilyLabel } from '@/lib/status-copy';
import { localePath } from '@/lib/i18n';
import { bestGroupRatio, formatRatio, formatUsd, modelPrice, parseBillingTiers } from '@/lib/pricing';
import {
  findPricingModel,
  usePerfData,
  usePricingCatalog,
  useStatusSnapshot,
  type EndpointDefinition,
  type PricingCatalog,
} from './status-data';
import {
  DataSourceNote,
  ErrorState,
  HeartbeatBar,
  HeartbeatLegend,
  LoadingState,
  MetricCard,
  Panel,
  StaleNotice,
  StatePill,
  StatusExplainer,
  formatPercent,
} from './ui';
import { useStatusText } from './use-status-text';

export { DataSourceNote };

const STATE_ORDER = ['ok', 'warn', 'bad', 'unknown'] as const;
/** 定价档位按页面加载时的时段计算；不随每次重渲染跳动 */
const PRICING_NOW = new Date();

function countStates(models: StatusModel[]): Record<(typeof STATE_ORDER)[number], number> {
  const counts = { ok: 0, warn: 0, bad: 0, unknown: 0 };
  for (const model of models) {
    if (model.state in counts) counts[model.state] += 1;
    else counts.unknown += 1;
  }
  return counts;
}

function BackLink() {
  const { s, lang } = useStatusText();
  return (
    <AppLink
      href={localePath(lang, '/status')}
      className="inline-flex items-center gap-1.5 rounded-sm text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {s('模型状态监控')}
    </AppLink>
  );
}

function StatusHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        <Activity aria-hidden="true" className="size-4" />
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance md:text-3xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-pretty text-sm text-fd-muted-foreground md:text-base">{description}</p>
    </header>
  );
}

/** 模型列表行：三张页面共用，避免各自维护一套筛选与心跳条 */
function ModelRows({ models }: { models: StatusModel[] }) {
  const { s, lang, formatNumber } = useStatusText();
  if (models.length === 0) {
    return <p className="py-10 text-center text-sm text-fd-muted-foreground">{s('没有匹配的模型')}</p>;
  }
  return (
    <div className="divide-y divide-fd-border overflow-hidden rounded-xl border border-fd-border">
      {models.map((model) => (
        <div key={model.model} className="grid gap-3 bg-fd-card px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_auto_1fr] md:items-center">
          <div className="min-w-0">
            <AppLink
              href={localePath(lang, `/status/model/${encodeURIComponent(model.model)}`)}
              className="inline-flex max-w-full items-center gap-1 truncate rounded-sm font-mono text-sm font-medium hover:text-brand focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
            >
              <span className="truncate">{model.model}</span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-fd-muted-foreground" />
            </AppLink>
            <p className="mt-1 text-xs text-fd-muted-foreground">
              {s('可用率 {rate} · 延迟 {latency} · PING {ping}', {
                rate: formatPercent(model.successRate),
                latency: formatNumber(model.latency, 'ms'),
                ping: formatNumber(model.ping, 'ms'),
              })}
            </p>
          </div>
          <StatePill state={modelToneForList(model)} />
          <div className="min-w-[140px]">
            <HeartbeatBar points={model.history} slots={32} />
          </div>
        </div>
      ))}
    </div>
  );
}

function modelToneForList(model: StatusModel): 'ok' | 'warn' | 'bad' | 'unknown' {
  return model.state;
}

function StateFilter({
  value,
  onChange,
}: {
  value: 'all' | 'ok' | 'warn' | 'bad';
  onChange: (value: 'all' | 'ok' | 'warn' | 'bad') => void;
}) {
  const { s } = useStatusText();
  const options = [
    { key: 'all' as const, label: s('全部') },
    { key: 'ok' as const, label: s('正常') },
    { key: 'warn' as const, label: s('延迟') },
    { key: 'bad' as const, label: s('故障') },
  ];
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-fd-border bg-fd-card p-1">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          aria-pressed={value === option.key}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none ${
            value === option.key
              ? 'bg-fd-primary text-fd-primary-foreground'
              : 'text-fd-muted-foreground hover:bg-fd-accent'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function filterModels(models: StatusModel[], query: string, state: 'all' | 'ok' | 'warn' | 'bad'): StatusModel[] {
  const needle = query.trim().toLowerCase();
  return models.filter(
    (model) => (state === 'all' || model.state === state) && (!needle || model.model.toLowerCase().includes(needle)),
  );
}

/** 状态总览：巡检计数、按厂商分组、模型搜索与明细 */
export function StatusOverviewClient() {
  const { s, lang } = useStatusText();
  const { snapshot, error, loading, refresh } = useStatusSnapshot();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'all' | 'ok' | 'warn' | 'bad'>('all');

  const models = useMemo(() => snapshot?.models ?? [], [snapshot]);
  const counts = useMemo(() => countStates(models), [models]);
  const families = useMemo(
    () =>
      FAMILY_ORDER.map((family) => {
        const list = models.filter((model) => model.family === family);
        return { family, models: list, counts: countStates(list) };
      }).filter((entry) => entry.models.length > 0),
    [models],
  );
  const filtered = useMemo(() => filterModels(models, query, state), [models, query, state]);

  return (
    <div className="space-y-8">
      <StatusHeader
        eyebrow={s('Model Health')}
        title={s('模型状态监控')}
        description={s('周期性巡检展示在测模型的可用性、响应延迟与端点可达性。状态站当前巡检数据可能陈旧，页面会明确标出最后检测时间。')}
      />

      {loading && !snapshot ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}

      {snapshot ? (
        <>
          <StaleNotice
            lastCheckedAt={snapshot.lastCheckedAt}
            generatedAt={snapshot.generatedAt}
            stale={snapshot.stale}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={s('在测模型')} value={models.length} hint={s('状态站当前列出的探测目标')} />
            <MetricCard label={s('正常')} value={counts.ok} />
            <MetricCard label={s('延迟')} value={counts.warn} hint={s('成功但响应超过 12 秒')} />
            <MetricCard label={s('故障')} value={counts.bad} />
          </div>

          <Panel title={s('按厂商查看')} extra={<HeartbeatLegend />}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {families.map(({ family, models: list, counts: familyCounts }) => (
                <AppLink
                  key={family}
                  href={localePath(lang, `/status/${family}`)}
                  className="rounded-xl border border-fd-border bg-fd-background p-4 transition-colors hover:border-brand/50 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
                >
                  <p className="font-medium">{statusFamilyLabel(lang, family)}</p>
                  <p className="mt-2 text-xs text-fd-muted-foreground">
                    {s('{count} 个模型 · 正常 {ok} / 延迟 {warn} / 故障 {bad}', {
                      count: list.length,
                      ok: familyCounts.ok,
                      warn: familyCounts.warn,
                      bad: familyCounts.bad,
                    })}
                  </p>
                  <div className="mt-3">
                    <HeartbeatBar points={list.flatMap((model) => model.history.slice(-6))} slots={24} />
                  </div>
                </AppLink>
              ))}
            </div>
          </Panel>

          <Panel
            title={s('模型明细')}
            extra={
              <span className="text-xs text-fd-muted-foreground">
                {s('显示 {shown} / {total}', { shown: filtered.length, total: models.length })}
              </span>
            }
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={s('搜索模型名称')}
                aria-label={s('搜索模型名称')}
                className="min-w-[220px] flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              />
              <StateFilter value={state} onChange={setState} />
            </div>
            <ModelRows models={filtered} />
          </Panel>
        </>
      ) : null}

      <StatusExplainer />
      <DataSourceNote />
    </div>
  );
}

/** 厂商系列页：Vercel 静态导出只生成 FAMILY_ORDER 中的固定 slug */
export function FamilyStatusClient({ fam }: { fam: Family }) {
  const { s, lang } = useStatusText();
  const { snapshot, error, loading, refresh } = useStatusSnapshot();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<'all' | 'ok' | 'warn' | 'bad'>('all');
  const family = isFamily(fam) ? fam : 'other';

  const models = useMemo(
    () =>
      (snapshot?.models ?? []).filter(
        (model) => model.family === family || familyOf(model.model) === family,
      ),
    [family, snapshot],
  );
  const counts = useMemo(() => countStates(models), [models]);
  const filtered = useMemo(() => filterModels(models, query, state), [models, query, state]);

  return (
    <div className="space-y-8">
      <BackLink />
      <StatusHeader
        eyebrow={s('Model Family')}
        title={s('{label} 模型状态', { label: statusFamilyLabel(lang, family) })}
        description={s('共 {total} 个在测模型：正常 {ok}、延迟 {warn}、故障 {bad}。点击模型查看状态、定价、性能与接入方式。', {
          total: models.length,
          ok: counts.ok,
          warn: counts.warn,
          bad: counts.bad,
        })}
      />

      {loading && !snapshot ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
      {snapshot ? (
        <>
          <StaleNotice
            lastCheckedAt={snapshot.lastCheckedAt}
            generatedAt={snapshot.generatedAt}
            stale={snapshot.stale}
          />
          <Panel title={s('模型明细')}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={s('搜索本系列模型')}
                aria-label={s('搜索本系列模型')}
                className="min-w-[220px] flex-1 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
              />
              <StateFilter value={state} onChange={setState} />
            </div>
            <ModelRows models={filtered} />
          </Panel>
        </>
      ) : null}

      <StatusExplainer />
      <DataSourceNote />
    </div>
  );
}

type ModelTab = 'overview' | 'perf' | 'api';

/** 静态导出下不用 useSearchParams，按浏览器 URL 直接读取/改写 tab 查询串 */
function useModelTab(): [ModelTab, (tab: ModelTab) => void] {
  const [tab, setTab] = useState<ModelTab>('overview');
  useEffect(() => {
    const read = () => {
      const raw = new URLSearchParams(window.location.search).get('tab');
      setTab(raw === 'perf' || raw === 'api' ? raw : 'overview');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  const select = useCallback((next: ModelTab) => {
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', next);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setTab(next);
  }, []);

  return [tab, select];
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const { s } = useStatusText();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
    >
      <Copy aria-hidden="true" className="size-3.5" />
      {copied ? s('已复制') : (label ?? s('复制'))}
    </button>
  );
}

function OverviewPanel({
  name,
  model,
  catalog,
  loadError,
}: {
  name: string;
  model: StatusModel | null;
  catalog: PricingCatalog | null;
  loadError: string | null;
}) {
  const { s, formatNumber, formatTime } = useStatusText();
  const pricing = findPricingModel(catalog, name);
  const now = PRICING_NOW;
  const price = pricing ? modelPrice(pricing, catalog?.groupRatio ?? {}, now) : null;
  const groupRatio = pricing ? bestGroupRatio(pricing, catalog?.groupRatio ?? {}) : 1;
  const tiers = pricing ? parseBillingTiers(pricing.billing_expr) : [];
  const enabledGroups = pricing?.enable_groups ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={s('当前巡检')} value={model ? <StatePill state={model.state} /> : '—'} />
        <MetricCard label={s('可用率')} value={formatPercent(model?.successRate)} />
        <MetricCard label={s('响应延迟')} value={formatNumber(model?.latency, 'ms')} />
        <MetricCard label={s('端点 PING')} value={formatNumber(model?.ping, 'ms')} />
      </div>
      <Panel title={s('巡检心跳')} extra={<HeartbeatLegend />}>
        {model ? <HeartbeatBar points={model.history} slots={48} /> : <LoadingState label={s('该模型暂无巡检记录')} />}
        <p className="mt-3 text-xs text-fd-muted-foreground">
          {s('最后检测：{time}。状态站巡检可能已停止，此处不代表当前秒级状态。', { time: formatTime(model?.checkedAt) })}
        </p>
      </Panel>
      <Panel
        title={s('定价')}
        extra={
          <a
            href={`${STATUS_SITE_URL}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
          >
            {s('原状态站')} <ExternalLink aria-hidden="true" className="size-3" />
          </a>
        }
      >
        {pricing && price ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">{formatUsd(price.input)}</span>
              <span className="text-fd-muted-foreground">
                {price.kind === 'call' ? s('/ 次') : s('/ 1M tokens（输入价起算）')}
              </span>
            </div>
            {price.kind === 'call' ? null : (
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-fd-muted-foreground">{s('输出')}</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(price.output ?? NaN)}</dd>
                </div>
                <div>
                  <dt className="text-fd-muted-foreground">{s('缓存读取')}</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(price.cacheRead ?? NaN)}</dd>
                </div>
                <div>
                  <dt className="text-fd-muted-foreground">{s('缓存写入')}</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(price.cacheWrite ?? NaN)}</dd>
                </div>
                <div>
                  <dt className="text-fd-muted-foreground">{s('缓存写入 (1h)')}</dt>
                  <dd className="font-medium tabular-nums">{formatUsd(price.cacheWrite1h ?? NaN)}</dd>
                </div>
              </dl>
            )}
            <p className="text-xs text-fd-muted-foreground">
              {s('USD 计价；未选分组时按最低可用分组 {ratio} 计算。价格随分组与上下文变化，以主站模型广场为准。', { ratio: formatRatio(groupRatio) })}
            </p>
            {pricing.description ? <p className="text-sm text-fd-muted-foreground">{pricing.description}</p> : null}
            {enabledGroups.length > 0 ? (
              <p className="text-xs text-fd-muted-foreground">
                {s('可用分组：')}{enabledGroups.map((group) => <code key={group} className="mr-1 rounded bg-fd-muted px-1 py-0.5">{group}</code>)}
              </p>
            ) : null}
            {tiers.length > 0 ? (
              <div className="rounded-lg border border-fd-border p-3">
                <p className="font-medium">{s('计费档位（USD / 1M tokens）')}</p>
                <ul className="mt-2 space-y-1 text-xs text-fd-muted-foreground">
                  {tiers.map((tier, index) => (
                    <li key={`${tier.label}-${index}`}>
                      {tier.label} · {s('输入')} {formatUsd((tier.input ?? 0) * groupRatio)} · {s('输出')}{' '}
                      {formatUsd((tier.output ?? 0) * groupRatio)}
                    </li>
                  ))}
                </ul>
                {pricing.billing_expr ? (
                  <p className="mt-2 break-all font-mono text-[11px] text-fd-muted-foreground">
                    {s('表达式：')}{pricing.billing_expr}
                  </p>
                ) : null}
              </div>
            ) : null}
            {pricing.billing_mode === 'ratio' ? (
              <p className="text-xs text-fd-muted-foreground">{s('模型倍率：')}{formatRatio(pricing.model_ratio)}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-fd-muted-foreground">
            {loadError ? s('定价数据暂不可用：{error}', { error: loadError }) : s('该模型暂无定价信息，可能已下架或不在当前定价表中。')}
          </p>
        )}
      </Panel>
    </div>
  );
}

/** 极简折线图：直接使用接口真实数据点，样本不足时不画假曲线 */
function Sparkline({
  points,
  label,
  formatValue,
}: {
  points: Array<{ ts: number; value: number }>;
  label: string;
  formatValue: (value: number) => string;
}) {
  const { s } = useStatusText();
  const valid = points.filter((point) => Number.isFinite(point.value));
  if (valid.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-fd-border p-4 text-xs text-fd-muted-foreground">
        {s('{label}：该窗口真实调用样本较少，暂无可绘制趋势。', { label })}
      </div>
    );
  }
  const min = Math.min(...valid.map((point) => point.value));
  const max = Math.max(...valid.map((point) => point.value));
  const span = max - min || 1;
  const coords = valid.map((point, index) => {
    const x = valid.length === 1 ? 0 : (index / (valid.length - 1)) * 100;
    const y = 100 - ((point.value - min) / span) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return (
    <div>
      <p className="mb-2 text-xs text-fd-muted-foreground">
        {label} · {formatValue(min)} — {formatValue(max)}
      </p>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full" role="img" aria-label={label}>
        <polyline points={coords.join(' ')} fill="none" stroke="var(--color-brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function PerfPanel({ name, enabled }: { name: string; enabled: boolean }) {
  const { s, formatNumber, formatTime } = useStatusText();
  const { detail, summary, error, loading } = usePerfData(name, enabled);
  if (!enabled) return null;
  if (loading && !detail) return <LoadingState label={s('正在获取 24 小时性能数据…')} />;
  if (error) return <ErrorState message={error} />;
  if (!detail?.summary) return <p className="text-sm text-fd-muted-foreground">{s('该模型在最近 24 小时内没有真实调用记录。')}</p>;

  const latencySeries = detail.series.map((point) => ({ ts: point.ts, value: point.avg_latency_ms }));
  const tpsSeries = detail.series.map((point) => ({ ts: point.ts, value: point.avg_tps }));
  const sameModel = summary?.models.find((model) => model.model_name === name);
  const ttft = detail.series.some((point) => point.avg_ttft_ms > 0)
    ? formatNumber(Math.max(...detail.series.map((point) => point.avg_ttft_ms)), 'ms')
    : '—';

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={s('24h 平均延迟')} value={formatNumber(detail.summary.avg_latency_ms, 'ms')} />
        <MetricCard label={s('24h 成功率')} value={formatPercent(detail.summary.success_rate)} />
        <MetricCard label={s('24h 平均 TPS')} value={formatNumber(detail.summary.avg_tps)} />
        <MetricCard label={s('首 Token 延迟')} value={ttft} hint={s('接口未采集时显示 —')} />
      </div>
      <p className="text-xs text-fd-muted-foreground">
        {s('统计窗口：{start} — {end}。数据来自主站真实调用。', {
          start: formatTime(detail.window_start),
          end: formatTime(detail.window_end),
        })}
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={s('延迟趋势')}>
          <Sparkline points={latencySeries} label={s('响应延迟')} formatValue={(value) => formatNumber(value, 'ms')} />
        </Panel>
        <Panel title={s('TPS 趋势')}>
          <Sparkline points={tpsSeries} label={s('生成速度')} formatValue={(value) => formatNumber(value)} />
        </Panel>
      </div>
      {detail.groups.length > 0 ? (
        <Panel title={s('按分组')}>
          <div className="space-y-2 text-sm">
            {detail.groups.map((group, index) => (
              <div key={`${group.group}-${index}`} className="flex flex-wrap justify-between gap-2 rounded-lg border border-fd-border p-3">
                <code className="font-mono text-xs">{group.group}</code>
                <span className="text-xs text-fd-muted-foreground">
                  {s('延迟 {latency} · 成功率 {rate} · TPS {tps}', {
                    latency: formatNumber(group.avg_latency_ms, 'ms'),
                    rate: formatPercent(group.success_rate),
                    tps: formatNumber(group.avg_tps),
                  })}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
      {sameModel ? (
        <p className="text-xs text-fd-muted-foreground">
          {s('全站汇总中的本模型记录：延迟 {latency} · 成功率 {rate} · TPS {tps}', {
            latency: formatNumber(sameModel.avg_latency_ms, 'ms'),
            rate: formatPercent(sameModel.success_rate),
            tps: formatNumber(sameModel.avg_tps),
          })}
        </p>
      ) : null}
    </div>
  );
}

function buildEndpointUrl(type: string, endpoint: EndpointDefinition | undefined): string | null {
  if (!endpoint?.path) return null;
  const base = type.startsWith('anthropic') ? HOME_ENDPOINTS.anthropic : HOME_ENDPOINTS.openai;
  const path = type.startsWith('anthropic')
    ? endpoint.path
    : endpoint.path.startsWith('/v1/')
      ? endpoint.path.slice(3)
      : endpoint.path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function ApiPanel({ name, catalog }: { name: string; catalog: PricingCatalog | null }) {
  const { s } = useStatusText();
  const pricing = findPricingModel(catalog, name);
  const types = pricing?.supported_endpoint_types ?? [];
  const entries = types
    .map((type) => ({ type, endpoint: catalog?.endpoints[type] }))
    .filter((entry): entry is { type: string; endpoint: EndpointDefinition } => !!entry.endpoint?.path);

  const curl = entries[0]
    ? (() => {
        const url = buildEndpointUrl(entries[0].type, entries[0].endpoint);
        if (!url) return s('# 暂无可用端点');
        const isAnthropic = entries[0].type.startsWith('anthropic');
        const headers = isAnthropic
          ? `-H "x-api-key: $FISHXCODE_API_KEY"\n  -H "anthropic-version: 2023-06-01"`
          : `-H "Authorization: Bearer $FISHXCODE_API_KEY"`;
        const body = isAnthropic
          ? `{\\n  "model": "${name}",\\n  "max_tokens": 64,\\n  "messages": [{ "role": "user", "content": "Hello" }]\\n}`
          : `{\\n  "model": "${name}",\\n  "messages": [{ "role": "user", "content": "Hello" }]\\n}`;
        return `curl ${url} \\\n  ${headers} \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`;
      })()
    : s('# 暂无可用端点');

  return (
    <div className="space-y-5">
      <Panel title={s('可用端点')}>
        {entries.length === 0 ? (
          <p className="text-sm text-fd-muted-foreground">{s('该模型暂无公开的端点定义，请查看模型广场或联系客服。')}</p>
        ) : (
          <div className="space-y-2">
            {entries.map(({ type, endpoint }) => {
              const url = buildEndpointUrl(type, endpoint);
              return (
                <div key={type} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-fd-border p-3 text-xs">
                  <code className="font-mono font-medium">{type}</code>
                  <span className="text-fd-muted-foreground">
                    {endpoint.method} {url}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <Panel title={s('请求示例')} extra={<CopyButton text={curl} />}>
        <pre className="overflow-x-auto rounded-lg bg-fd-muted p-4 text-xs leading-relaxed">
          <code>{curl}</code>
        </pre>
        <p className="mt-3 text-xs text-fd-muted-foreground">
          {s('密钥从环境变量 {key} 读取，请勿把密钥写进代码或提交到仓库。', { key: 'FISHXCODE_API_KEY' })}
        </p>
      </Panel>
    </div>
  );
}

/** 单模型详情：概览 / 性能 / API 三个 tab，默认概览不写查询串 */
export function ModelDetailClient({ name }: { name: string }) {
  const { s, lang } = useStatusText();
  const [tab, selectTab] = useModelTab();
  const { snapshot } = useStatusSnapshot();
  const { catalog, error: pricingError } = usePricingCatalog();
  const pricing = findPricingModel(catalog, name);
  const model = useMemo(() => snapshot?.models.find((item) => item.model === name) ?? null, [name, snapshot]);
  const family = pricing ? familyOf(name) : familyOf(name);

  return (
    <div className="space-y-6">
      <BackLink />
      <StatusHeader
        eyebrow={s('Model Detail')}
        title={name}
        description={
          pricing?.description ??
          s('查看该模型的巡检状态、可用分组、真实调用性能与 API 接入方式。巡检与性能数据的时间窗口不同。')
        }
      />
      <p className="text-xs text-fd-muted-foreground">
        {s('所属系列：')}
        <AppLink href={localePath(lang, `/status/${family}`)} className="text-brand underline-offset-4 hover:underline">
          {statusFamilyLabel(lang, family)}
        </AppLink>
      </p>

      <div role="tablist" aria-label={s('模型详情分区')} className="flex flex-wrap gap-1 rounded-xl border border-fd-border bg-fd-card p-1">
        {([
          { key: 'overview' as const, label: s('概览') },
          { key: 'perf' as const, label: s('性能') },
          { key: 'api' as const, label: 'API' },
        ]).map((item) => {
          const selected = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`model-panel-${item.key}`}
              onClick={() => selectTab(item.key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none ${
                selected
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`model-panel-${tab}`} className="min-w-0">
        {tab === 'overview' ? (
          <OverviewPanel name={name} model={model} catalog={catalog} loadError={pricingError} />
        ) : null}
        {tab === 'perf' ? <PerfPanel name={name} enabled /> : null}
        {tab === 'api' ? <ApiPanel name={name} catalog={catalog} /> : null}
      </div>

      <StatusExplainer />
      <DataSourceNote />
    </div>
  );
}

/** 页面外壳：由服务端路由使用 DocsPage 包裹，提供 main/article 网格定位 */
export function StatusPageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full min-w-0 max-w-[1168px] px-4 py-6 md:px-6 md:pt-8 xl:px-8 xl:pt-14">{children}</div>;
}
