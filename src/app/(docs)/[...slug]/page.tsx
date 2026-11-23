import { createLocalizedDocPage } from '@/components/localized-doc-page';
import { DEFAULT_LOCALE } from '@/lib/i18n';

const localized = createLocalizedDocPage(DEFAULT_LOCALE);

/**
 * 根路由组只承载默认语言 zh：loader 的 getPages 不传语言会返回全部语言，
 * 必须显式锁定，否则 /quickstart 会被其余语言的同 slug 页面重复生成。
 */
export function generateStaticParams() {
  return localized.generateStaticParams();
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  return localized.generateMetadata(props);
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  return localized.Page(props);
}
