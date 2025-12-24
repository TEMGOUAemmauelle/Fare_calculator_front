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
import { useTranslation } from 'react-i18next';
import { X, Download, Smartphone, Zap, MapPin, TrendingUp } from 'lucide-react';

export default function PWAInstallPrompt() {
  const { t } = useTranslation();
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

    // Afficher le prompt custom à chaque visite (fallback si beforeinstallprompt non émis)
    setShowPrompt(true);

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
      // Pas d'API beforeinstallprompt (ou non émis) : afficher instructions manuelles
      // Sur Android/Chrome : Menu (⋮) → "Ajouter à l'écran d'accueil"
      alert(t('pwa.manual_instruction'));
      return;
    }

    // Android/Chrome - installation automatique
    try {
      console.log('📱 Lancement installation PWA...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`🎯 Résultat installation: ${outcome}`);
      if (outcome === 'accepted') {
        console.log('✅ PWA installée avec succès!');
      }
    } catch (e) {
      console.warn('❌ Erreur installation PWA:', e);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
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
          {/* Transparent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 bg-linear-to-b from-transparent to-black/20 backdrop-blur-[2px] z-9998"
            onClick={handleDismiss}
          />

          {/* Pure Minimalist Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[380px] z-9999"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/10 border border-gray-100/50 overflow-hidden flex flex-col items-center text-center">
              
              {/* Top Visual - Ultra Clean */}
              <div className="pt-10 pb-6 w-full flex flex-col items-center">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                  className="w-16 h-16 bg-[#f3cd08] rounded-3xl shadow-xl shadow-yellow-500/20 flex items-center justify-center mb-6"
                >
                  <Smartphone className="w-8 h-8 text-black" />
                </motion.div>

                <h3 className="text-xl font-black text-[#141414] uppercase tracking-tighter italic px-8">
                  {t('pwa.install_title')}
                </h3>
              </div>

              {/* Description */}
              <div className="px-10 pb-8 space-y-6">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {t('pwa.install_description')}
                </p>

                {/* Main Action */}
                <div className="space-y-4">
                  {isIOS && !deferredPrompt ? (
                    <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100 flex flex-col items-center gap-3">
                      <p className="text-[#141414] font-black text-[9px] uppercase tracking-widest leading-normal">
                        {t('pwa.ios_instruction')}
                      </p>
                      <div className="flex items-center gap-3 text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                         <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <X className="w-3 h-3 rotate-45 text-blue-500" /> {/* Symbolizing Share icon roughly or use real icon */}
                         </div>
                         <span>→</span>
                         <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <Download className="w-3 h-3 text-[#141414]" />
                         </div>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstallClick}
                      className="w-full bg-[#141414] text-white font-black py-5 px-8 rounded-3xl shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-3 group"
                    >
                      <Download className="w-4 h-4 text-[#f3cd08] group-hover:animate-bounce" />
                      <span className="text-[10px] uppercase tracking-[0.2em]">{t('pwa.install_btn')}</span>
                    </motion.button>
                  )}

                  <button
                    onClick={handleDismiss}
                    className="text-gray-300 hover:text-gray-900 font-black text-[9px] uppercase tracking-widest transition-colors py-2"
                  >
                    {t('pwa.later')}
                  </button>
                </div>
              </div>

              {/* Dismiss X button - Subtle */}
              <button
                onClick={handleDismiss}
                className="absolute top-6 right-6 p-2 text-gray-200 hover:text-gray-900 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
