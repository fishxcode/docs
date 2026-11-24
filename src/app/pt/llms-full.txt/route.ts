import { createLlmsFull } from '@/lib/discovery';

export const dynamic = 'force-static';

export async function GET() {
  return createLlmsFull('pt');
}
