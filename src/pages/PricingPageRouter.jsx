/**
 * @fileoverview PricingPageRouter - Router Desktop/Mobile pour Pricing
 * 
 * Routeur intelligent qui affiche la version Desktop ou Mobile
 * selon la taille de l'écran.
 */

import React from 'react';
import { useIsDesktop } from '../hooks/useMediaQuery';
import PricingPageDesktop from './PricingPageDesktop';
import PricingPageMobile from './PricingPageMobile';

export default function PricingPageRouter() {
  const isDesktop = useIsDesktop();
  
  return isDesktop ? <PricingPageDesktop /> : <PricingPageMobile />;
}
