import { createLlmsIndex } from '@/lib/discovery';

export const dynamic = 'force-static';

export function GET() {
  return createLlmsIndex('pt');
}
