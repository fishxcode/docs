'use client';

/**
 * 状态页共用的小型展示组件。
 *
 * 所有数据都在客户端从同源代理读取；这里只做格式化与展示，不改动接口返回的数值。
 * 「延迟」沿用状态站的口径：单次成功但响应超过 12 秒。
 */

import type { ReactNode } from 'react';
import { Activity, CircleAlert, CircleCheck, Clock, Loader2, RefreshCw } from 'lucide-react';
import { STATUS_SITE_URL, type HistoryPoint, type StatusModel } from '@/lib/status';

export function formatNumber(value: number | null | undefined, suffix = ''): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(value)}${suffix}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${Number(value.toFixed(2))}%`;
}

export function formatTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  // 性能接口的 ts/window 是 Unix 秒；状态站的 checkedAt 是 ISO 字符串
  const date = new Date(typeof value === 'number' ? value * 1000 : value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function modelTone(model: StatusModel): 'ok' | 'warn' | 'bad' | 'unknown' {
  return model.state;
}

export function pointTone(point: HistoryPoint): 'ok' | 'warn' | 'bad' | 'unknown' {
  if (!point.ok) return 'bad';
  if ((point.latency ?? 0) > 12_000) return 'warn';
  return 'ok';
}

const TONE_LABEL: Record<'ok' | 'warn' | 'bad' | 'unknown', string> = {
  ok: '正常',
  warn: '延迟',
  bad: '故障',
  unknown: '未知',
};

const TONE_CLASS: Record<'ok' | 'warn' | 'bad' | 'unknown', string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-rose-500',
  unknown: 'bg-fd-border',
};

export function StatePill({ state }: { state: 'ok' | 'warn' | 'bad' | 'unknown' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        state === 'ok'
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : state === 'warn'
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            : state === 'bad'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-fd-muted text-fd-muted-foreground'
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${TONE_CLASS[state]}`} />
      {TONE_LABEL[state]}
    </span>
  );
}

/** Uptime Kuma 风格心跳条：每个格子是一次巡检，左侧补灰格表示无数据 */
export function HeartbeatBar({ points, slots = 48 }: { points: HistoryPoint[]; slots?: number }) {
  const sampled =
    points.length <= slots
      ? points
      : Array.from({ length: slots }, (_, index) => points[Math.floor(((index + 1) * points.length) / slots) - 1]);
  const cells = sampled.map((point) => {
    const tone = pointTone(point);
    return {
      cls: TONE_CLASS[tone],
      title: `${formatTime(point.ts)} · ${TONE_LABEL[tone]} · ${formatNumber(point.latency, 'ms')}`,
    };
  });
  while (cells.length < slots) cells.unshift({ cls: TONE_CLASS.unknown, title: '暂无数据' });

  return (
    <div className="flex items-end gap-[3px]" role="img" aria-label="各次检测结果">
      {cells.map((cell, index) => (
        <span
          // 心跳格没有稳定 ID，按下标渲染即可；title 承载悬浮说明
          key={index}
          title={cell.title}
          className={`h-5 w-full min-w-[3px] rounded-[2px] ${cell.cls}`}
        />
      ))}
    </div>
  );
}

export function HeartbeatLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
      {(['ok', 'warn', 'bad', 'unknown'] as const).map((state) => (
        <span key={state} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2.5 rounded-[2px] ${TONE_CLASS[state]}`} />
          {state === 'unknown' ? '无数据' : TONE_LABEL[state]}
        </span>
      ))}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-4">
      <p className="text-xs text-fd-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-fd-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Panel({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-fd-border bg-fd-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {extra}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function LoadingState({ label = '正在获取数据…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-fd-border py-12 text-sm text-fd-muted-foreground">
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/5 p-6 text-sm text-rose-600 dark:text-rose-400">
      <CircleAlert aria-hidden="true" className="size-4" />
      <span>获取失败：{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-current px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
        >
          <RefreshCw aria-hidden="true" className="size-3.5" />
          重试
        </button>
      ) : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = '搜索模型名称',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none placeholder:text-fd-muted-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
    />
  );
}

/** 数据陈旧的醒目提示：巡检时间不代表页面生成时间，也不是当前秒级状态 */
export function StaleNotice({
  lastCheckedAt,
  generatedAt,
  stale,
}: {
  lastCheckedAt: string;
  generatedAt: string;
  stale: boolean;
}) {
  if (!stale) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-fd-border bg-fd-card px-4 py-3 text-xs text-fd-muted-foreground">
        <Clock aria-hidden="true" className="size-4" />
        最后检测：{formatTime(lastCheckedAt)}
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
      <p className="flex items-center gap-2 font-medium">
        <CircleAlert aria-hidden="true" className="size-4" />
        巡检数据陈旧，并非当前实时状态
      </p>
      <p className="mt-2 text-xs">
        最后检测：{formatTime(lastCheckedAt)}；数据生成：{formatTime(generatedAt)}。
        状态站巡检暂停或数据未更新时仍会显示旧结果，请以原站为准。
      </p>
    </div>
  );
}

export function StatusExplainer({ className }: { className?: string } = {}) {
  return (
    <section className={className ? className : "rounded-2xl border border-fd-border bg-fd-card p-5 md:p-6"}>
      <h2 className="text-base font-semibold">看懂这些指标</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">正常 / 延迟 / 故障</dt>
          <dd className="mt-1 text-fd-muted-foreground">
            单次巡检成功且响应在 12 秒内记为正常；成功但超过 12 秒记为延迟；请求失败记为故障。
            图像、视频类模型本身耗时较长，更容易落入「延迟」。
          </dd>
        </div>
        <div>
          <dt className="font-medium">可用率与延迟</dt>
          <dd className="mt-1 text-fd-muted-foreground">
            可用率是巡检窗口内成功的比例；响应延迟包含模型推理，端点 PING 只测网络往返，
            可用来区分网络问题与上游变慢。
          </dd>
        </div>
        <div>
          <dt className="font-medium">两套数据来源</dt>
          <dd className="mt-1 text-fd-muted-foreground">
            可用性来自状态站周期性巡检，性能来自主站真实调用。两者采集时间不同，
            页面分别标注，不混成秒级实时状态。
          </dd>
        </div>
        <div>
          <dt className="font-medium">为什么模型数会变</dt>
          <dd className="mt-1 text-fd-muted-foreground">
            面板只列出当前在测的模型；上游下架或巡检停测后，模型会暂时消失。
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function DataSourceNote() {
  return (
    <p className="text-center text-xs text-fd-muted-foreground">
      巡检数据来源{' '}
      <a
        href={STATUS_SITE_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="text-brand underline-offset-4 hover:underline"
      >
        status.fishxcode.com
      </a>
      。数据可能陈旧，若长时间没有新检测点，请直接访问原站确认。
    </p>
  );
}

export const STATUS_ICON = Activity;
export const CHECK_ICON = CircleCheck;
