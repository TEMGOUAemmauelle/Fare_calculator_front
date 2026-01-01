/**
 * @fileoverview EstimatePage - Router responsive
 * 
 * Affiche automatiquement :
 * - EstimatePageMobile sur mobile (< 768px)
 * - Redirige vers HomePageDesktop sur desktop (>= 768px)
 *   car l'estimation desktop est intégrée à la page d'accueil
 */

import { useEffect } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useAppNavigate } from '../hooks/useAppNavigate';
import EstimatePageMobile from './EstimatePageMobile';

export default function EstimatePage() {
  const isMobile = useIsMobile();
  const navigate = useAppNavigate();

  // Sur desktop, rediriger vers la home car l'estimation y est intégrée
  useEffect(() => {
    if (!isMobile) {
      navigate('/', { replace: true });
    }
  }, [isMobile, navigate]);

  // Sur mobile, afficher la page d'estimation mobile
  if (isMobile) {
    return <EstimatePageMobile />;
  }

  // Fallback pendant la redirection
  return null;
}
