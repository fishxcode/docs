import { createLocalizedStatusPages } from '@/components/localized-status-pages';

export const dynamic = 'force-static';
export const dynamicParams = false;

const page = createLocalizedStatusPages('en').model;
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
