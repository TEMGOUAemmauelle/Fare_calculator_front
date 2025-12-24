
import { useIsDesktop } from '../hooks/useMediaQuery';
import HomePage from './HomePage';
import HomePageDesktop from './HomePageDesktop';

export default function HomePageRouter() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <HomePageDesktop /> : <HomePage />;
}
