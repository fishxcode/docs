import { HTML_LANG } from '@/lib/i18n';
import { AI_TXT } from '@/lib/machine-copy';

export const dynamic = 'force-static';

/** 根路径为默认语言（zh）；各语言版本见 src/app/{lang}/ai.txt/route.ts */
export function GET() {
  return new Response(AI_TXT.zh, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': HTML_LANG.zh,
    },
  });
}
