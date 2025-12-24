
import { useIsDesktop } from '../hooks/useMediaQuery';
import ServicesPageMobile from './ServicesPageMobile';
import ServicesPageDesktop from './ServicesPageDesktop';

export default function ServicesPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <ServicesPageDesktop /> : <ServicesPageMobile />;
}
