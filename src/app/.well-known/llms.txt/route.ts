import { createLlmsIndex } from '@/lib/discovery';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-static';

/** /.well-known/llms.txt：与根路径 /llms.txt 内容完全相同，复用同一份生成逻辑。 */
export function GET() {
  return createLlmsIndex(DEFAULT_LOCALE);
}
