import { createLocalizedHomePage } from '@/components/localized-home-page';

const home = createLocalizedHomePage('zh-TW');

export const generateMetadata = home.generateMetadata;

export default home.Page;
