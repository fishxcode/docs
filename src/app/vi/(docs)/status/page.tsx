import { createLocalizedStatusPages } from '@/components/localized-status-pages';

export const dynamic = 'force-static';

const page = createLocalizedStatusPages('vi').overview;
export const generateMetadata = page.generateMetadata;
export default page.Page;
