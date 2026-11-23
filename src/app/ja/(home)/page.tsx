import { createLocalizedHomePage } from '@/components/localized-home-page';

const home = createLocalizedHomePage('ja');

export const generateMetadata = home.generateMetadata;

export default home.Page;
