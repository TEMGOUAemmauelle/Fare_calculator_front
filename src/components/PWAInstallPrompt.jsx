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
          {/* Overlay semi-transparent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-9998"
            onClick={handleDismiss}
          />

          {/* Prompt Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[420px] z-9999"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header avec dégradé jaune */}
              <div className="bg-linear-to-br from-yellow-400 via-yellow-500 to-amber-500 px-6 py-8 relative overflow-hidden">
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label={t('common.close') || 'Fermer'}
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Icône et titre - Minimalist */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-3 text-[#f3cd08]"
                  >
                    <Smartphone className="w-6 h-6 fill-current" />
                  </motion.div>

                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-0.5">
                    {t('pwa.install_title')}
                  </h3>
                </div>
              </div>

              {/* Contenu - Plus clean et direct */}
              <div className="px-6 py-5 bg-white">
                <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
                  {t('pwa.install_description')}
                </p>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  {isIOS && !deferredPrompt ? (
                    // Instructions iOS simplifiées
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-900 font-bold text-xs mb-2 text-center">
                        {t('pwa.ios_instruction')}
                      </p>
                      <div className="flex justify-center items-center gap-2 text-xs text-gray-600">
                        <span>{t('pwa.ios_share')}</span>
                        <div className="px-2 py-0.5 bg-gray-200 rounded text-[10px]">⎙</div>
                        <span>→</span>
                        <span>{t('pwa.ios_add_home')}</span>
                        <div className="px-2 py-0.5 bg-gray-200 rounded text-[10px]">+</div>
                      </div>
                    </div>
                  ) : (
                    // Bouton installation Android/Chrome - Premium
                    <button
                      onClick={handleInstallClick}
                      className="w-full bg-[#0a0a0a] text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wide">{t('pwa.install_btn')}</span>
                    </button>
                  )}

                  <button
                    onClick={handleDismiss}
                    className="w-full text-gray-400 hover:text-gray-900 font-semibold py-2 text-xs uppercase tracking-wider transition-colors"
                  >
                    {t('pwa.later')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
