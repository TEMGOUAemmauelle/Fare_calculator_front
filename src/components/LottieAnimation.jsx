/**
 * @fileoverview Composant LottieAnimation - Wrapper Lottie React
 * 
 * Affiche des animations Lottie JSON de manière simplifiée.
 * 
 * Props:
 * - animationData: Objet JSON animation (import depuis assets/lotties/)
 * - loop: Boucle infinie (défaut: true)
 * - autoplay: Lecture auto (défaut: true)
 * - width: Largeur (défaut: "100%")
 * - height: Hauteur (défaut: "auto")
 * - className: Classes CSS additionnelles
 */

import Lottie from 'lottie-react';

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  width = '100%',
  height = 'auto',
  className = '',
  speed = 1,
}) {
  if (!animationData) {
    console.warn('[LottieAnimation] animationData manquant');
    return null;
  }

  return (
    <div className={`lottie-wrapper ${className}`} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        speed={speed}
      />
    </div>
  );
}
