import { searchServer } from '@/lib/search-server';
import { isLocale, LOCALES } from '@/lib/i18n';

export const dynamic = 'force-static';

/**
 * 站内搜索索引，按语言拆分为独立文件（/static.json/zh、/static.json/en …）。
 *
 * 不合成单个 /static.json：索引体积随语言数线性增长，Cloudflare Pages 对
 * 单个文件有 25 MiB 上限；拆开后客户端也只加载当前语言，首屏开销随之下降。
 *
 * 每种语言在路径上一视同仁（zh 也带前缀 /static.json/zh）：搜索索引没有
 * 「默认语言」语义，显式写出可以省掉客户端的特判分支。
 *
 * 输出是单库格式（不再套 i18n 外包装），staticClient 会自动按单库加载。
 */

/**
 * searchServer 的导出每次调用都会重建全部语言的索引，代价不低。静态导出时
 * Next 会为每个 locale 各调用一次 GET，这里把 export 的结果缓存住，
 * 全部请求共用同一次构建产物。
 */
let exported: Promise<Record<string, unknown>> | undefined;

function getLocaleIndex(locale: string) {
  exported ??= searchServer.staticGET().then(async (res) => {
    const body = (await res.json()) as { data: Record<string, unknown> };
    return body.data;
  });

  return exported.then((data) => data[locale]);
}

export async function GET(_req: Request, { params }: RouteContext<'/static.json/[locale]'>) {
  const { locale } = await params;

  // 语言段大小写敏感，URL 必须与 LOCALES 完全一致（zh-TW 保持大写）。
  const index = isLocale(locale) ? await getLocaleIndex(locale) : undefined;
  if (!index) {
    return new Response('unknown locale', { status: 404 });
  }

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}
