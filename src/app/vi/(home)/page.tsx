import { createLocalizedHomePage } from '@/components/localized-home-page';

const home = createLocalizedHomePage('vi');

export const generateMetadata = home.generateMetadata;

export default home.Page;
