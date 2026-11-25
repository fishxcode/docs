import { HTML_LANG } from '@/lib/i18n';
import { AI_TXT } from '@/lib/machine-copy';

export const dynamic = 'force-static';

export function GET() {
  return new Response(AI_TXT["vi"], {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Language': HTML_LANG["vi"],
    },
  });
}
