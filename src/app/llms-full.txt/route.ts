import { createLlmsFull } from '@/lib/discovery';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-static';

export async function GET() {
  return createLlmsFull(DEFAULT_LOCALE);
}
