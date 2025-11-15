/**
 * @fileoverview Composant PWA Install Prompt
 * 
 * Magnifique prompt d'invitation à installer l'application PWA.
 * - Détection automatique de la disponibilité PWA
 * - Animation fluide d'apparition/disparition
 * - Design moderne avec thème jaune
 * - Gestion du rejet (ne plus afficher)
 * - Compatible iOS Safari et autres navigateurs
 * 
 * Utilisé par : App.jsx (global)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Zap, MapPin, TrendingUp } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Ne pas afficher si déjà installé
    if (isInStandaloneMode) {
      console.log('✅ PWA: Application déjà installée');
      return;
    }

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log('💾 PWA installable détecté');
      setDeferredPrompt(e);
      setShowPrompt(true); // Afficher immédiatement
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Pour iOS, afficher immédiatement si pas encore installé
    if (iOS && !isInStandaloneMode) {
      console.log('📱 PWA: iOS détecté - Affichage prompt');
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS - instructions manuelles
      return;
    }

    // Android/Chrome - installation automatique
    console.log('📱 Lancement installation PWA...');
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`🎯 Résultat installation: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('✅ PWA installée avec succès!');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    console.log('❌ Installation PWA fermée');
    setShowPrompt(false);
  };

  // Ne rien afficher si déjà installé
  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Overlay semi-transparent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={handleDismiss}
          />

          {/* Prompt Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[420px] z-[9999]"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header avec dégradé jaune */}
              <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 px-6 py-8 relative overflow-hidden">
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Icône et titre */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4"
                  >
                    <Smartphone className="w-8 h-8 text-yellow-600" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Installez l'application
                  </h3>
                  <p className="text-white/90 text-sm">
                    Accédez rapidement à vos estimations de taxi
                  </p>
                </div>
              </div>

              {/* Contenu */}
              <div className="px-6 py-5">
                {/* Avantages */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Accès instantané</p>
                      <p className="text-gray-600 text-xs">Lancez l'app depuis votre écran d'accueil</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Fonctionne hors ligne</p>
                      <p className="text-gray-600 text-xs">Consultez vos trajets sans connexion</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Léger et rapide</p>
                      <p className="text-gray-600 text-xs">Moins de 5 Mo, performances optimales</p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-2">
                  {isIOS && !deferredPrompt ? (
                    // Instructions iOS
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-900 font-semibold text-sm mb-2">
                        📱 Sur iOS Safari :
                      </p>
                      <ol className="text-blue-800 text-xs space-y-1 list-decimal list-inside">
                        <li>Appuyez sur le bouton Partager <span className="inline-block">⎙</span></li>
                        <li>Sélectionnez "Sur l'écran d'accueil"</li>
                        <li>Confirmez l'ajout</li>
                      </ol>
                    </div>
                  ) : (
                    // Bouton installation Android/Chrome
                    <button
                      onClick={handleInstallClick}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Installer maintenant
                    </button>
                  )}

                  <button
                    onClick={handleDismiss}
                    className="w-full text-gray-600 hover:text-gray-900 font-medium py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                  >
                    Plus tard
                  </button>
                </div>

                {/* Note légale */}
                <p className="text-center text-gray-400 text-xs mt-4">
                  Gratuit • Sans publicité • Données sécurisées
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
