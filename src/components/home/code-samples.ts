import { highlight } from 'fumadocs-core/highlight';
import { HOME_CODE_SAMPLES } from '@/lib/home-copy';
import type { CodeTab } from './code-window';

/** 九种语言的首页共用同一组示例：构建时只高亮一次 */
let cached: Promise<CodeTab[]> | undefined;

/**
 * 首屏代码窗口的 Tab：在服务端（静态导出时即构建期）用 Shiki 高亮，浏览器不加载高亮器。
 * 窗口在两种主题下都是深色，主题固定为 github-dark。
 */
export function getHeroCodeTabs(): Promise<CodeTab[]> {
  cached ??= Promise.all(
    HOME_CODE_SAMPLES.map(async (sample) => ({
      label: sample.label,
      code: sample.code,
      node: await highlight(sample.code, { lang: sample.lang, theme: 'github-dark' }),
    })),
  ).catch((error: unknown) => {
    // 失败不缓存，下一次渲染重新高亮
    cached = undefined;
    throw error;
  });
  return cached;
}
