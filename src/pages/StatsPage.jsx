
import { useIsDesktop } from '../hooks/useMediaQuery';
import StatsPageMobile from './StatsPageMobile';
import StatsPageDesktop from './StatsPageDesktop';

export default function StatsPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <StatsPageDesktop /> : <StatsPageMobile />;
}

