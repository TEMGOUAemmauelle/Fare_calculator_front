/**
 * @fileoverview Service Worker Registration
 * 
 * Enregistrement et gestion du Service Worker pour la PWA.
 * - Enregistrement automatique au chargement
 * - Détection des mises à jour
 * - Gestion du cycle de vie
 * - Notifications utilisateur
 */

/**
 * Enregistrer le Service Worker
 */
export async function register() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 PWA: Enregistrement du Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      
      console.log('✅ PWA: Service Worker enregistré:', registration.scope);
      
      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update();
        console.log('🔄 PWA: Vérification des mises à jour...');
      }, 60 * 60 * 1000);
      
      // Écouter les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🆕 PWA: Nouvelle version détectée');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ PWA: Nouvelle version prête');
            
            // Notifier l'utilisateur qu'une mise à jour est disponible
            if (window.confirm('Une nouvelle version est disponible ! Recharger maintenant ?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('❌ PWA: Erreur enregistrement Service Worker:', error);
    }
  } else {
    console.warn('⚠️ PWA: Service Workers non supportés par ce navigateur');
  }
}

/**
 * Désenregistrer le Service Worker
 */
export async function unregister() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('✅ PWA: Service Worker désenregistré');
    } catch (error) {
      console.error('❌ PWA: Erreur désenregistrement:', error);
    }
  }
}

/**
 * Vider le cache
 */
export async function clearCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('fare-calculator-'))
          .map(name => caches.delete(name))
      );
      console.log('✅ PWA: Cache vidé');
    } catch (error) {
      console.error('❌ PWA: Erreur vidage cache:', error);
    }
  }
}

/**
 * Vérifier si l'app est installée
 */
export function isInstalled() {
  // PWA installée en mode standalone
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');
}

/**
 * Obtenir les infos du Service Worker
 */
export async function getServiceWorkerInfo() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      return {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
        active: !!registration.active,
        waiting: !!registration.waiting,
        installing: !!registration.installing,
      };
    }
  }
  
  return null;
}

export default {
  register,
  unregister,
  clearCache,
  isInstalled,
  getServiceWorkerInfo,
};
