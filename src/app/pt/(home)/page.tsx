import { createLocalizedHomePage } from '@/components/localized-home-page';

const home = createLocalizedHomePage('pt');

export const generateMetadata = home.generateMetadata;

export default home.Page;
