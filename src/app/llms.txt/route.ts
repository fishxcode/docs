import { createLlmsIndex } from '@/lib/discovery';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-static';

export function GET() {
  return createLlmsIndex(DEFAULT_LOCALE);
}
