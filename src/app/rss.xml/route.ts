import { createRssFeed } from '@/lib/rss-feed';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-static';

export function GET() {
  return createRssFeed(DEFAULT_LOCALE);
}
