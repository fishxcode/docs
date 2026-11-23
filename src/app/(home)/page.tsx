import { createLocalizedHomePage } from '@/components/localized-home-page';
import { DEFAULT_LOCALE } from '@/lib/i18n';

const home = createLocalizedHomePage(DEFAULT_LOCALE);

export const generateMetadata = home.generateMetadata;

export default home.Page;
