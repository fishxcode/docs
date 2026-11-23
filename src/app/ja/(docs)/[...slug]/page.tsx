import { createLocalizedDocPage } from '@/components/localized-doc-page';

const localized = createLocalizedDocPage('ja');

export function generateStaticParams() {
  return localized.generateStaticParams();
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }) {
  return localized.generateMetadata(props);
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  return localized.Page(props);
}
