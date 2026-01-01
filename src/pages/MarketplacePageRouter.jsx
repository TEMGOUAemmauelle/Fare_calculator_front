/**
 * @fileoverview MarketplacePageRouter - Router Desktop/Mobile pour Marketplace
 * 
 * Routeur intelligent qui affiche la version Desktop ou Mobile
 * selon la taille de l'écran.
 */

import React from 'react';
import { useIsDesktop } from '../hooks/useMediaQuery';
import MarketplacePageDesktop from './MarketplacePageDesktop';
import MarketplacePageMobile from './MarketplacePageMobile';

export default function MarketplacePageRouter() {
  const isDesktop = useIsDesktop();
  
  return isDesktop ? <MarketplacePageDesktop /> : <MarketplacePageMobile />;
}
