/**
 * @fileoverview Hook useMediaQuery - Détection responsive
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  // Initialiser synchronously à la valeur actuelle si window.matchMedia existe.
  // Cela évite un rendu initial incorrect (flash) où la variante desktop
  // est affichée avant que l'effet n'ait mis à jour la valeur.
  const getInitial = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia(query).matches;
      }
    } catch (e) {
      // noop - retourner false par défaut
    }
    return false;
  };

  const [matches, setMatches] = useState(getInitial);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}
