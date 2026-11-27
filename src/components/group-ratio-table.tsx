'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';
import {
  GROUP_BASELINE,
  baselineDescription,
  baselineRatioLabel,
  categoryOf,
  formatRatioValue,
  type GroupCategory,
} from '@/lib/group-baseline';
import { pricingRoute } from '@/lib/shared';

/**
 * /api/pricing 反代返回的分组相关字段。模型列表等其余字段见 model-catalog.tsx。
 */
interface PricingGroupsPayload {
  group_ratio?: Record<string, number>;
  usable_group?: Record<string, string>;
}

/** 页面可见文案，随语言翻译（见 GROUP_TABLE_COPY）。 */
export interface GroupTableCopy {
  tableHead: [string, string, string];
  /** 「分组（倍率）」里的括号：zh/ja 全角、其余半角，随各语言文档既有写法 */
  parens: readonly [string, string];
  liveNote: string;
  exampleHead: [string, string, string];
  exampleUnit: string;
}

/** 各语言的表格文案（表头、括号风格、读屏播报、示例表表头与单位）。 */
export const GROUP_TABLE_COPY: Record<Locale, GroupTableCopy> = {
  zh: {
    tableHead: ['分组', '倍率', '说明'],
    parens: ['（', '）'],
    liveNote: '分组倍率已更新为官网实时数据',
    exampleHead: ['模型基础消耗', '分组', '估算扣除'],
    exampleUnit: '额度',
  },
  'zh-TW': {
    tableHead: ['分組', '倍率', '說明'],
    parens: ['（', '）'],
    liveNote: '分組倍率已更新為官網即時資料',
    exampleHead: ['模型基礎消耗', '分組', '估算扣除'],
    exampleUnit: '額度',
  },
  en: {
    tableHead: ['Group', 'Multiplier', 'Description'],
    parens: ['(', ')'],
    liveNote: 'Group multipliers updated with live platform data',
    exampleHead: ['Model base usage', 'Group', 'Estimated deduction'],
    exampleUnit: 'credits',
  },
  fr: {
    tableHead: ['Groupe', 'Multiplicateur', 'Description'],
    parens: ['(', ')'],
    liveNote: 'Multiplicateurs mis à jour avec les données en temps réel du site',
    exampleHead: ['Consommation de base du modèle', 'Groupe', 'Débit estimé'],
    exampleUnit: 'crédits',
  },
  es: {
    tableHead: ['Grupo', 'Multiplicador', 'Descripción'],
    parens: ['(', ')'],
    liveNote: 'Multiplicadores actualizados con los datos en tiempo real del sitio',
    exampleHead: ['Consumo base del modelo', 'Grupo', 'Descuento estimado'],
    exampleUnit: 'créditos',
  },
  pt: {
    tableHead: ['Grupo', 'Multiplicador', 'Descrição'],
    parens: ['(', ')'],
    liveNote: 'Multiplicadores atualizados com os dados em tempo real do site',
    exampleHead: ['Consumo base do modelo', 'Grupo', 'Dedução estimada'],
    exampleUnit: 'de cota',
  },
  ru: {
    tableHead: ['Группа', 'Коэффициент', 'Описание'],
    parens: ['(', ')'],
    liveNote: 'Коэффициенты обновлены по актуальным данным сайта',
    exampleHead: ['Базовый расход модели', 'Группа', 'Ожидаемое списание'],
    exampleUnit: 'кредитов',
  },
  ja: {
    tableHead: ['グループ', '倍率', '説明'],
    parens: ['（', '）'],
    liveNote: 'グループ倍率をサイトのリアルタイムデータで更新しました',
    exampleHead: ['モデル基本消費', 'グループ', '消費の見積もり'],
    exampleUnit: 'クォータ',
  },
  vi: {
    tableHead: ['Nhóm', 'Hệ số', 'Mô tả'],
    parens: ['(', ')'],
    liveNote: 'Hệ số nhóm đã cập nhật theo dữ liệu thời gian thực trên trang',
    exampleHead: ['Tiêu hao cơ bản của mô hình', 'Nhóm', 'ước tính bị trừ'],
    exampleUnit: 'hạn mức',
  },
};

/** 运行时态的单个分组行 */
type GroupRow = {
  name: string;
  /** 展示串，如 '0.12x' */
  ratio: string;
  category: GroupCategory;
  /** 说明文本；zh 页接口给出更合适的说明时替换基线译文 */
  description: string;
};

/**
 * 同页共享一次 /api/pricing 拉取。billing-groups 页一页渲染多张表与若干行内
 * 倍率，全部等待同一个 Promise。组件仍以 GROUP_BASELINE 为渲染起点（SSG 输出
 * 与水合首帧一致），这里的数据只用于原位覆盖。
 *
 * 只缓存 Promise 本身：失败结果（null）不缓存，SPA 导航回到该页时重试一次。
 */
let liveGroupsPromise: Promise<PricingGroupsPayload | null> | null = null;

function fetchLiveGroups(): Promise<PricingGroupsPayload | null> {
  liveGroupsPromise ??= (async () => {
    const controller = new AbortController();
    // 反代链路（Cloudflare Worker / Vercel rewrite）实测几秒内返回；超时按失败
    // 处理，页面保持基线数值而不是转圈
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(pricingRoute, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as PricingGroupsPayload;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  })();
  return liveGroupsPromise;
}

/**
 * 接口 usable_group 是「中文｜English」双语串（也可能只有单语或空串）。
 * zh 页取「｜」前段，其余语言取「｜」后段（无分隔符时原文返回）。
 */
function pickApiDescription(raw: unknown, lang: Locale): string | null {
  if (typeof raw !== 'string') return null;
  const segments = raw.split('｜');
  const text = (lang === DEFAULT_LOCALE ? segments[0] : segments.slice(1).join('｜') || segments[0]).trim();
  return text || null;
}

/**
 * 基线 → 基线 + 接口覆盖（倍率、zh 说明、新增分组）。接口不可达或响应缺
 * group_ratio 时原样返回基线——文档页不出现报错块。
 */
function mergeBaseline(payload: PricingGroupsPayload | null, lang: Locale): ReadonlyArray<GroupRow> {
  const rows: GroupRow[] = GROUP_BASELINE.map(({ name, ratio, category }) => ({
    name,
    ratio: baselineRatioLabel(ratio),
    category,
    description: baselineDescription(name, lang),
  }));
  if (!payload?.group_ratio || typeof payload.group_ratio !== 'object') return rows;

  const ratios = payload.group_ratio;
  const descriptions = typeof payload.usable_group === 'object' && payload.usable_group ? payload.usable_group : {};
  const zhPage = lang === DEFAULT_LOCALE;

  for (const row of rows) {
    // 接口倍率覆盖基线；无效值（0、负数、缺项）保留基线
    row.ratio = formatRatioValue(ratios[row.name]) ?? row.ratio;
    // 只有 zh 页采用接口说明（其余语言接口只有英文段，保留本地化基线译文）
    if (zhPage) {
      const apiText = pickApiDescription(descriptions[row.name], lang);
      if (apiText) row.description = apiText;
    }
  }

  // 接口新补、基线里没有的分组：按名称推断归类追加到对应表
  const known = new Set(rows.map((row) => row.name));
  const added: GroupRow[] = [];
  for (const [name, value] of Object.entries(ratios)) {
    // default 是用户默认分组，控制台语义，不在官网文档展示
    if (name === 'default' || known.has(name)) continue;
    const ratio = formatRatioValue(value);
    if (!ratio) continue;
    added.push({
      name,
      ratio,
      category: categoryOf(name),
      description: pickApiDescription(descriptions[name], lang) ?? '',
    });
  }
  if (added.length > 0) rows.push(...added.sort((a, b) => a.name.localeCompare(b.name)));
  return rows;
}

/**
 * 示例表与建议表的小数格式：中文系用点号（1.2），es/fr/pt/ru/vi 用逗号
 * （1,2），与各语言文档正文既有写法一致。
 */
function decimalSeparator(lang: Locale): ',' | '.' {
  return lang === 'es' || lang === 'fr' || lang === 'pt' || lang === 'ru' || lang === 'vi' ? ',' : '.';
}

/** 12 → '12'，1.2 → '1.2'（es/fr/pt/ru/vi 为 '1,2'）；去浮点误差 */
function formatAmount(value: number, lang: Locale): string {
  const text = Number(value.toFixed(4)).toString();
  return decimalSeparator(lang) === ',' ? text.replace('.', ',') : text;
}

/** 单元格/正文里的分组名，与静态文档一致的 inline code 样式 */
function GroupName({ name }: { name: string }) {
  return <code className="relative rounded-sm bg-fd-muted px-[0.3rem] py-[0.15rem] font-mono text-[0.85em]">{name}</code>;
}

/** `分组（0.2x）`：分组名 + 按语言风格的括号倍率，建议表与正文共用 */
function GroupWithRatio({ name, ratio, parens }: { name: string; ratio: string; parens: readonly [string, string] }) {
  return (
    <>
      <GroupName name={name} />
      {parens[0]}
      {ratio}
      {parens[1]}
    </>
  );
}

/**
 * 表格容器。裸 table 由 DocsBody 的 prose 排版接管样式（圆角卡片、边框），
 * 与静态 MDX 表格观感一致；读屏播报放在表格容器之外（span 不能直接作
 * tbody 子元素，浏览器会把它挪出表格破坏水合）。
 */
function TableShell({ head, liveNote, children }: { head: readonly string[]; liveNote?: string; children: ReactNode }) {
  return (
    <>
      <div className="relative my-6 overflow-auto" tabIndex={0}>
        <table>
          <thead>
            <tr>
              {head.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {/* 与首页 GroupRatioList 相同的无障碍播报：实时数据加载完成后告知读屏 */}
      {liveNote ? (
        <span aria-live="polite" className="sr-only">
          {liveNote}
        </span>
      ) : null}
    </>
  );
}

/** 基线里某分类的初始行（SSG/水合首帧渲染的表格内容） */
function baselineRows(category: GroupCategory, lang: Locale): GroupRow[] {
  return GROUP_BASELINE.filter((group) => group.category === category).map(({ name, ratio }) => ({
    name,
    ratio: baselineRatioLabel(ratio),
    category,
    description: baselineDescription(name, lang),
  }));
}

/**
 * 在售分组表（billing-groups「在售分组」一节）。category 选择渲染哪个系列；
 * 构建时渲染基线（无 JS 可读、SEO 可收录），水合后从站内 /api/pricing 反代拉
 * 最新倍率与 zh 说明原位替换，接口新增分组自动追加到对应系列表尾——主站调价
 * 不再需要改文档发版。拉取失败静默保持基线。同页多个组件共享一次请求。
 */
export function GroupRatioTable({ category }: { category: GroupCategory }) {
  const { locale } = useI18n();
  const lang: Locale = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  const copy = GROUP_TABLE_COPY[lang];

  const [rows, setRows] = useState<ReadonlyArray<GroupRow>>(() => baselineRows(category, lang));

  useEffect(() => {
    let cancelled = false;
    fetchLiveGroups().then((payload) => {
      if (cancelled) return;
      setRows(mergeBaseline(payload, lang).filter((row) => row.category === category));
    });
    return () => {
      cancelled = true;
    };
    // lang 由语言路由闭包固定、category 是字面量 prop，均不会在生命周期内变化
  }, [category, lang]);

  return <TableShell head={copy.tableHead} liveNote={copy.liveNote}>
    {rows.map((row) => (
      <tr key={row.name}>
        <td>
          <GroupName name={row.name} />
        </td>
        <td>{row.ratio}</td>
        <td>{row.description}</td>
      </tr>
    ))}
  </TableShell>;
}

/**
 * 倍率换算示例表（billing-groups「倍率怎么算」一节）。base 是模型基础消耗，
 * 估算扣除 = base × 分组倍率，水合后随实时倍率自动重算。
 */
export function RatioExampleTable({ base, groups }: {
  /** 模型基础消耗，如 10 */
  base: number;
  /** 参与示例的分组名，按展示顺序 */
  groups: readonly string[];
}) {
  const { locale } = useI18n();
  const lang: Locale = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  const copy = GROUP_TABLE_COPY[lang];

  const [liveRatios, setLiveRatios] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveGroups().then((payload) => {
      if (cancelled || !payload?.group_ratio) return;
      const next: Record<string, string> = {};
      for (const name of groups) {
        const ratio = formatRatioValue(payload.group_ratio[name]);
        if (ratio) next[name] = ratio;
      }
      setLiveRatios(next);
    });
    return () => {
      cancelled = true;
    };
    // groups 是 MDX 属性里的字面量数组（每页固定），lang 路由固定
  }, [groups, lang]);

  const tableRows = useMemo(
    () =>
      groups.map((name) => {
        const ratioLabel =
          liveRatios?.[name] ?? baselineRatioLabel(GROUP_BASELINE.find((group) => group.name === name)?.ratio ?? 1);
        const value = Number.parseFloat(ratioLabel);
        return { name, ratioLabel, deduction: Number.isFinite(value) ? base * value : null };
      }),
    [base, groups, liveRatios],
  );

  return (
    <TableShell head={copy.exampleHead}>
      {tableRows.map(({ name, ratioLabel, deduction }) => (
        <tr key={name}>
          <td>
            {formatAmount(base, lang)} {copy.exampleUnit}
          </td>
          <td>
            <GroupWithRatio name={name} ratio={ratioLabel} parens={copy.parens} />
          </td>
          <td>{deduction === null ? '—' : `${formatAmount(deduction, lang)} ${copy.exampleUnit}`}</td>
        </tr>
      ))}
    </TableShell>
  );
}

/**
 * 行内实时倍率（正文与建议表里的 `分组`（0.2x））。构建时渲染基线，水合后随
 * 实时倍率原位更新；分组下线（接口缺项）时保留基线值。
 */
export function LiveRatio({ name }: { name: string }) {
  const { locale } = useI18n();
  const lang: Locale = locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
  const parens = GROUP_TABLE_COPY[lang].parens;

  const [ratio, setRatio] = useState(() => baselineRatioLabel(GROUP_BASELINE.find((group) => group.name === name)?.ratio ?? 1));

  useEffect(() => {
    let cancelled = false;
    fetchLiveGroups().then((payload) => {
      if (cancelled) return;
      const value = formatRatioValue(payload?.group_ratio?.[name]);
      if (value) setRatio(value);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return <GroupWithRatio name={name} ratio={ratio} parens={parens} />;
}

/**
 * 在售分组总数（正文里的「13 个分组」）。构建时渲染基线数量，水合后随接口
 * 实际返回数量更新（default 控制台分组不计）。
 */
export function GroupCount() {
  const [count, setCount] = useState(GROUP_BASELINE.length);

  useEffect(() => {
    let cancelled = false;
    fetchLiveGroups().then((payload) => {
      if (cancelled || !payload?.group_ratio) return;
      const total = Object.keys(payload.group_ratio).filter((name) => name !== 'default').length;
      if (total > 0) setCount(total);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{count}</>;
}
