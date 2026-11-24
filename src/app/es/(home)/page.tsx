import { createLocalizedHomePage } from '@/components/localized-home-page';

const home = createLocalizedHomePage('es');

export const generateMetadata = home.generateMetadata;

export default home.Page;
