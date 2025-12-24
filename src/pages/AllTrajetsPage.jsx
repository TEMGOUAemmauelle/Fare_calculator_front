
import { useIsDesktop } from '../hooks/useMediaQuery';
import AllTrajetsPageMobile from './AllTrajetsPageMobile';
import AllTrajetsPageDesktop from './AllTrajetsPageDesktop';

const AllTrajetsPage = () => {
  const isDesktop = useIsDesktop();
  return isDesktop ? <AllTrajetsPageDesktop /> : <AllTrajetsPageMobile />;
};

export default AllTrajetsPage;
