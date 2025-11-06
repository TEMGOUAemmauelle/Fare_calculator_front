/**
 * @fileoverview EstimatePage - Router responsive
 * 
 * Affiche automatiquement :
 * - EstimatePageMobile sur mobile (< 768px)
 * - EstimatePage (desktop) sur tablette/PC (>= 768px)
 */

import { useIsMobile } from '../hooks/useMediaQuery';
import EstimatePageDesktop from './EstimatePageDesktop';
import EstimatePageMobile from './EstimatePageMobile';

export default function EstimatePage() {
  const isMobile = useIsMobile();

  return isMobile ? <EstimatePageMobile /> : <EstimatePageDesktop />;
}
