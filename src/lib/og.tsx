import { HTML_LANG, type Locale } from './i18n';
import { createMemo } from './memo';
import { siteConfig } from './site';

/**
 * 文档页分享图的渲染层：卡片排版 + 各语言字体。
 *
 * 硬约束：takumi **从不读取系统字体**，内置的 Geist 只覆盖拉丁字形。不显式
 * 注册字体时，中文标题会整体渲染成方框——这正是本文件存在的原因。
 * 中文按语言加载 Noto Sans 对应子集。
 */

/** 界面配色与站点主题保持一致（深色底 + 青色强调） */
const COLORS = {
  background: 'linear-gradient(140deg, #09090b 0%, #0c1a24 100%)',
  title: '#fafafa',
  description: 'rgba(240,240,240,0.72)',
  accent: '#38bdf8',
  accentBorder: 'rgba(56,189,248,0.38)',
} as const;

/**
 * 各语言的内容字体。中文与日文各自需要一份 CJK 子集，越语需要带声调符号的
 * 拉丁扩展；其余（en/fr/ru）用 Noto Sans 即可覆盖。回退链末尾统一挂
 * Noto Sans，保证拉丁字母与数字不会落回只含 Geist 的默认字体。
 */
const FONT_FAMILY: Record<Locale, string> = {
  zh: 'Noto Sans SC',
  'zh-TW': 'Noto Sans SC',
  ja: 'Noto Sans JP',
  en: 'Noto Sans',
  fr: 'Noto Sans',
  ru: 'Noto Sans',
  vi: 'Noto Sans',
};

/**
 * 标题与描述的字号档位。
 *
 * takumi 没有自动缩字号的 `text-fit` 等价物，固定大字号遇到长标题会溢出
 * 卡片边界并压到描述段落。按显示宽度分档后，短标题仍然醒目，长标题自动降级。
 */
const TITLE_SIZE = [
  { max: 14, size: 82 },
  { max: 24, size: 64 },
  { max: 36, size: 52 },
] as const;
const TITLE_MIN_SIZE = 44;

/** 描述最多两行，超出截断；避免长 description 顶掉页脚 */
const DESCRIPTION_MAX = 76;

/** 页脚展示的站点域名：取自站点配置，换域名时不必再来这里改一份字面量 */
const SITE_HOST = new URL(siteConfig.url).host;

const memoFonts = createMemo<Awaited<ReturnType<typeof loadFonts>>>();

/**
 * `googleFonts` 需要网络：运行环境没有外网时返回空数组，
 * 渲染退化为内置 Geist（拉丁可读、CJK 变方框），但不让页面渲染失败——
 * 单张分享图缺字远好于文档站整体报错。
 */
async function loadFonts(family: string) {
  try {
    const { googleFonts } = await import('takumi-js/helpers');
    // 只用两档字重：标题 700、描述 400，减少下载与注册的子集数量
    return await googleFonts([
      { name: family, weight: [700, 400] },
      // 拉丁字母 / 数字 / 标点始终由 Noto Sans 兜底，CJK 字体缺字时也不会断行
      { name: 'Noto Sans', weight: [700, 400] },
    ]);
  } catch (error) {
    console.warn(
      `[og] 加载分享图字体失败（${family}），本次渲染的分享图将缺少字形：`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/** 同一语言的所有页面共用一次字体下载 */
export function getOgFonts(locale: Locale) {
  const family = FONT_FAMILY[locale];
  return memoFonts(family, () => loadFonts(family));
}

/** 按显示宽度估算自适应字号所用的 CJK/全角判定 */
const WIDE_CHAR = /[⺀-鿿가-힯豈-﫿＀-￯]/;

/**
 * 按显示宽度估算：拉丁字符按半宽计（0.55 个汉字），CJK 与全角标点按 1 计；
 * 这比按字符数估算更接近实际排版宽度——「Claude Code」只占约 6 个汉字的宽度。
 */
function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += WIDE_CHAR.test(char) ? 1 : 0.55;
  }
  return width;
}

function titleSizeFor(title: string): number {
  const width = displayWidth(title);
  for (const tier of TITLE_SIZE) {
    if (width <= tier.max) return tier.size;
  }
  return TITLE_MIN_SIZE;
}

/** 按显示宽度截断，超出部分用省略号收尾（中文不加空格） */
function truncate(text: string, max: number): string {
  if (displayWidth(text) <= max) return text;
  let width = 0;
  let result = '';
  for (const char of text) {
    width += WIDE_CHAR.test(char) ? 1 : 0.55;
    if (width > max - 1) break;
    result += char;
  }
  return `${result.trimEnd()}…`;
}

interface OgCardProps {
  locale: Locale;
  title: string;
  description?: string;
  /** 目录名（如「快速开始」），从侧边栏 meta 取，天然多语言 */
  section?: string;
}

export function OgCard({ locale, title, description, section }: OgCardProps) {
  const size = titleSizeFor(title);

  const sectionStyle = {
    margin: 0,
    fontSize: 26,
    letterSpacing: 2,
    color: COLORS.accent,
    borderBottom: `2px solid ${COLORS.accentBorder}`,
    paddingBottom: 20,
  } as const;

  const titleStyle = {
    margin: 0,
    marginTop: 40,
    fontSize: size,
    fontWeight: 700,
    lineHeight: 1.25,
  } as const;

  const descriptionStyle = {
    margin: 0,
    marginTop: 28,
    fontSize: 30,
    lineHeight: 1.5,
    color: COLORS.description,
  } as const;

  const footerStyle = {
    margin: 0,
    marginTop: 'auto',
    fontSize: 28,
    fontWeight: 600,
    color: COLORS.accent,
  } as const;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: COLORS.background,
        padding: '72px',
        fontFamily: FONT_FAMILY[locale],
        color: COLORS.title,
      }}
    >
      <p style={sectionStyle}>{section ?? 'FishXcode Docs'}</p>
      <p style={titleStyle}>{title}</p>
      {description ? (
        <p style={descriptionStyle}>{truncate(description, DESCRIPTION_MAX)}</p>
      ) : null}
      <p style={footerStyle}>{`${SITE_HOST} · ${HTML_LANG[locale]}`}</p>
    </div>
  );
}
