import { createRssFeed } from '@/lib/rss-feed';

export const dynamic = 'force-static';

export function GET() {
  return createRssFeed('pt');
}
