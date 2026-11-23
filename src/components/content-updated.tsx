import { formatContentDate, getContentDates, updatedLabel } from '@/lib/content-dates';
import type { Locale } from '@/lib/i18n';
import type { source } from '@/lib/source';

type DocPage = (typeof source)['$inferPage'];

/**
 * 文档页页头的「最后更新于」。
 *
 * 日期由 content-dates.ts 在构建期从 git 提交记录读取，与 JSON-LD 的
 * dateModified 是同一个时间戳：机器读到的日期和访客看到的日期必须一致，
 * 否则搜索引擎看到一个"从未更新"的 TechArticle，而页面上写着最近改过。
 *
 * 只在服务端渲染（依赖 git 命令，不能进客户端包）。拿不到日期（浅克隆、
 * 非 git 部署）就什么都不输出，不留一个空标签或空段落。
 */
export function ContentUpdated({ page, lang }: { page: DocPage; lang: Locale }) {
  const dates = getContentDates(page.path);
  if (!dates) return null;

  const day = formatContentDate(dates.modified);

  // 负上边距：这一行紧贴在描述下方，与下一行的操作按钮拉开层次
  return (
    <p className="mb-0 -mt-2 text-xs text-fd-muted-foreground">
      <span data-content-updated={day}>
        {/* 标签自带冒号与其后的空白（随语言排版变化），这里不再拼接空格 */}
        {updatedLabel(lang)}
        <time dateTime={dates.modified}>{day}</time>
      </span>
    </p>
  );
}
