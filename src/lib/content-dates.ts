import { execFileSync } from 'node:child_process';
import type { Locale } from './i18n';
import { contentDir } from './shared';

/**
 * 逐页内容日期：唯一来源是 git 提交记录。
 *
 * 不读 frontmatter 里的手写日期——那需要每改一次文件手动同步一次，早晚会
 * 忘记，最后变成一堆假日期。也不取构建时间——静态导出每次部署都会重建，
 * 用它会让全站 lastmod 永远等于"今天"，等于告诉搜索引擎内容天天变，反而
 * 稀释抓取优先级。
 *
 * git 不可用时（例如 CI 浅克隆被裁成单提交、或源码以压缩包形式部署）返回
 * null，调用方直接省略字段，绝不退回到一个编出来的日期。
 */
export interface ContentDates {
  /** 最近一次提交时间，ISO 8601 带时区，对应 schema.org dateModified */
  modified: string;
  /** 最早一次提交时间，对应 schema.org datePublished */
  published: string;
}

/** 构建期每个文件只查一次 git：sitemap、JSON-LD、页面正文会反复取值 */
const cache = new Map<string, ContentDates | null>();

/** 只认 git 能输出的 ISO 8601 时间戳，防止日志里的杂行混进来 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)$/;

/**
 * @param pagePath fumadocs 的存储键，相对 contentDir（如 `quickstart.mdx`、
 *   `en/quickstart.mdx`）。回退页保留的是 zh 源文件路径，日期因此跟着真实正文。
 */
export function getContentDates(pagePath: string): ContentDates | null {
  // git 只认相对仓库根的路径：存储键是相对内容目录的，必须补上目录前缀
  const repoPath = `${contentDir}/${pagePath}`;
  const cached = cache.get(repoPath);
  if (cached !== undefined) return cached;

  const dates = readGitDates(repoPath);
  cache.set(repoPath, dates);
  return dates;
}

/**
 * 仓库内任意文件的日期，用于没有源 MDX 的页面（如首页）。
 *
 * 取"真正决定页面内容的那个文件"的提交时间，而不是构建时间。
 *
 * @param relativePath 相对仓库根的路径（如 `src/lib/home-copy.ts`）
 */
export function getRepoDates(relativePath: string): ContentDates | null {
  const cached = cache.get(relativePath);
  if (cached !== undefined) return cached;

  const dates = readGitDates(relativePath);
  cache.set(relativePath, dates);
  return dates;
}

function readGitDates(repoPath: string): ContentDates | null {
  let output: string;
  try {
    output = execFileSync(
      'git',
      // --follow 让文件重命名（如目录调整）沿用同一段历史，否则改名当天
      // 会被当成"首次发布"，datePublished 突然变成最新日期。
      ['log', '--follow', '--format=%cI', '--', repoPath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
  } catch {
    return null;
  }

  // git log 默认新的在前：首行是最新提交，末行是最早提交
  const commits = output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => ISO_DATE.test(line));

  if (commits.length === 0) return null;
  return { modified: commits[0], published: commits[commits.length - 1] };
}

/** 页面上展示的粒度：日期比对到秒没有意义，也与 JSON-LD 保持同一天 */
export function formatContentDate(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * 文档页页头「最后更新于」的标签，冒号随各语言排版一起写死：中日文用全角
 * 冒号且其后不留空格，西文的冒号后接不换行空格（\u00a0）——日期不会单独
 * 折到下一行。新增语言补一项，Record<Locale> 会在编译期拦住遗漏。
 */
const UPDATED_LABEL: Record<Locale, string> = {
  zh: '最后更新于：',
  'zh-TW': '最後更新於：',
  ja: '最終更新：',
  en: 'Last updated:\u00a0',
  fr: 'Dernière mise à jour\u00a0:\u00a0',
  ru: 'Обновлено:\u00a0',
  vi: 'Cập nhật lần cuối:\u00a0',
};

export function updatedLabel(locale: Locale): string {
  return UPDATED_LABEL[locale];
}
