
import { useIsDesktop } from '../hooks/useMediaQuery';
import AddTrajetPageMobile from './AddTrajetPageMobile';
import AddTrajetPageDesktop from './AddTrajetPageDesktop';

/**
 * @fileoverview AddTrajetPageRouter - Switch entre Mobile et Desktop
 */
export default function AddTrajetPage() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <AddTrajetPageDesktop /> : <AddTrajetPageMobile />;
}
