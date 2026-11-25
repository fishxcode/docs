import { HTML_LANG } from '@/lib/i18n';
import { AUTH_MD } from '@/lib/machine-copy';

export const dynamic = 'force-static';

export function GET() {
  return new Response(AUTH_MD["zh-TW"], {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Language': HTML_LANG["zh-TW"],
    },
  });
}
