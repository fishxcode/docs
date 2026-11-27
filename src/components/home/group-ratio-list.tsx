'use client';

import { useEffect, useMemo, useState } from 'react';
import { pricingRoute } from '@/lib/shared';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import type { GroupCategory } from '@/lib/home-copy';

/**
 * 首页「在售分组与倍率」的运行时数据：分组名 → 倍率字符串。
 * 初始值是内置基线（home-copy.ts 的 HOME_GROUPS），接口可达时被最新值替换。
 */
export type GroupRatioItem = {
  name: string;
  ratio: string;
  category: GroupCategory;
  /** 悬停提示：接口 usable_group 的分组说明（按当前语言取中/英段），基线阶段为空 */
  description?: string;
};

interface PricingPayload {
  /** 分组名 → 消费倍率，如 { china: 0.8, claude: 1.5 } */
  group_ratio?: Record<string, number>;
  /** 分组名 → 官方说明，如 { claude: 'Claude Max 20 正价 满血版 ' }；可能缺项或为空串 */
  usable_group?: Record<string, string>;
}

/**
 * 接口倍率格式化：与 home-copy.ts 的 multiplier 同一显示口径——去掉浮点误差并
 * 截断到两位小数（0.12000001 → 0.12x）。无效值直接跳过，保留基线倍率。
 */
function formatRatio(value: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return `${Number(value.toFixed(2))}x`;
}

/**
 * 接口说明是「中文｜English」的双语串，也可能只有单语。按页面语言取段：
 * zh 取「｜」前的部分，其余语言取「｜」后的部分（无分隔符时原文返回）。
 * 说明可能缺项、空串或纯空白（如 tencent-china），一律视为无说明，返回 null。
 */
function pickDescription(raw: string | undefined, lang: Locale): string | null {
  if (typeof raw !== 'string') return null;
  const segments = raw.split('｜');
  const text = (lang === DEFAULT_LOCALE ? segments[0] : segments.slice(1).join('｜') || segments[0]).trim();
  return text || null;
}

/**
 * 接口只给 name→ratio，分类沿用内置基线；基线里没有的分组按名称推断：
 * codex- 前缀进 Codex 系列，claude 系进 Claude 系列，其余进「其他模型」。
 */
function categoryOf(name: string, baseline: Map<string, GroupCategory>): GroupCategory {
  const known = baseline.get(name);
  if (known) return known;
  if (name.startsWith('codex-')) return 'codex';
  if (name === 'claude' || name.startsWith('claude-') || name.startsWith('claudemax')) return 'claude';
  return 'other';
}

/**
 * 在售分组倍率列表：SSG 首页的动态窗口。
 *
 * 静态构建时渲染内置基线（无 JS 也能看到完整内容），挂载后从文档站自己的
 * /api/pricing 反代拉一次最新数据，成功则原位替换——主站调价或调整分组说明后
 * 首页自动跟随，不需要改代码发版。拉取失败（离线、接口不可达、超时）静默保持
 * 基线：首页不该出现报错块，基线数值本身就是最近一次人工核对的结果。
 */
export function GroupRatioList({
  groups,
  categories,
  categoryLabels,
  lang,
  copy,
}: {
  groups: ReadonlyArray<GroupRatioItem>;
  /** 分类渲染顺序，与首页 PricingSection 的三个 dt 一致 */
  categories: ReadonlyArray<GroupCategory>;
  categoryLabels: Record<GroupCategory, string>;
  /** 页面语言：决定接口双语说明取中文段还是英文段 */
  lang: Locale;
  /** 读屏播报文案（实时倍率加载完成后播报），随页面语言传入 */
  copy: { liveNote: string };
}) {
  const [live, setLive] = useState<ReadonlyArray<GroupRatioItem>>(groups);
  // 接口新补、基线里没有的分组只应出现一次；同一次响应里的更新原位生效
  const [merged, setMerged] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    // 反代链路（Cloudflare Worker / Vercel rewrite）实测几秒内返回；10 秒足够，
    // 超时按失败处理——用户看到的是基线数值而不是转圈
    const timeout = setTimeout(() => controller.abort(), 10_000);

    fetch(pricingRoute, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<PricingPayload>;
      })
      .then((payload) => {
        const ratios = payload.group_ratio;
        if (!ratios || typeof ratios !== 'object') return;
        const descriptions = payload.usable_group;

        const baseline = new Map(groups.map((group) => [group.name, group.category]));
        const next: GroupRatioItem[] = groups.map((group) => {
          const ratio = formatRatio(ratios[group.name]);
          const description = descriptions ? pickDescription(descriptions[group.name], lang) ?? undefined : undefined;
          if (ratio === group.ratio && !description) return group;
          return { ...group, ...(ratio !== group.ratio && ratio ? { ratio } : {}), ...(description ? { description } : {}) };
        });
        let added = false;
        for (const [name, value] of Object.entries(ratios)) {
          // default 是用户默认分组，控制台语义，不在官网首页展示
          if (name === 'default' || baseline.has(name)) continue;
          const ratio = formatRatio(value);
          if (!ratio) continue;
          next.push({
            name,
            ratio,
            category: categoryOf(name, baseline),
            description: descriptions ? pickDescription(descriptions[name], lang) ?? undefined : undefined,
          });
          added = true;
        }
        if (added) next.sort((a, b) => a.name.localeCompare(b.name));
        setLive(next);
        setMerged(true);
      })
      .catch(() => {
        // 静默失败：基线已经渲染在页面上，无需任何处理
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // groups 来自服务端组件的模块级常量，每次渲染相同；lang 在语言路由里闭包固定，
    // 两者都不会在组件生命周期内变化，不会触发重复请求
  }, [groups, lang]);

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        groups: live.filter((group) => group.category === category),
      })),
    [categories, live],
  );

  return (
    <dl className="mt-4 border-t border-fd-foreground/80">
      {grouped.map(({ category, groups: items }) => (
        <div key={category} className="grid gap-3 border-b border-fd-border py-4 sm:grid-cols-[7.5rem_1fr]">
          <dt className="text-sm font-semibold">{categoryLabels[category]}</dt>
          <dd>
            <ul className="flex flex-wrap gap-1.5">
              {items.map((group) => (
                <li
                  key={group.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-paper px-2 py-0.5 font-mono text-xs"
                >
                  {/* 说明来自接口 usable_group，缺省时 title 为空即不显示 tooltip */}
                  <span title={group.description ?? undefined}>{group.name}</span>
                  <span className="text-brand">{group.ratio}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
      {/* 与 code-window 相同的无障碍播报：实时倍率加载完成后告知读屏，视觉上无额外元素 */}
      <span aria-live="polite" className="sr-only">
        {merged ? copy.liveNote : ''}
      </span>
    </dl>
  );
}
