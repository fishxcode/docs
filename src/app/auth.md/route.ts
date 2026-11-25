import { HTML_LANG } from '@/lib/i18n';
import { AUTH_MD } from '@/lib/machine-copy';

export const dynamic = 'force-static';

/** 根路径为默认语言（zh）；各语言版本见 src/app/{lang}/auth.md/route.ts */
export function GET() {
  return new Response(AUTH_MD.zh, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Language': HTML_LANG.zh,
    },
  });
}
