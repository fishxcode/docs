import { createLocalizedStatusPages } from '@/components/localized-status-pages';

export const dynamic = 'force-static';
export const dynamicParams = false;

const page = createLocalizedStatusPages('fr').family;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
