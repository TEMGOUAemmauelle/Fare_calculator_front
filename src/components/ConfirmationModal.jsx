/**
 * @fileoverview ConfirmationModal - Modal succès avec Lottie
 * 
 * Modal élégant pour confirmer actions avec :
 * - Animation Lottie de succès
 * - Overlay backdrop blur
 * - Design moderne responsive
 * - Actions configurables
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LottieAnimation from './LottieAnimation';
import CarouselAds from './CarouselAds';

// Import des animations Lottie
import makingMoneyAnimation from '../assets/lotties/Making Money.json';

export default function ConfirmationModal({
  isOpen = false,
  onClose,
  title,
  message,
  lottieAnimation = makingMoneyAnimation,
  buttonText,
  onButtonClick,
  showCloseButton = false,
  autoClose = false,
  autoCloseDelay = 3000,
}) {
  const { t } = useTranslation();
  
  // Default values localized
  const modalTitle = title || t('common.thank_you');
  const modalMessage = message || t('common.success_message') || t('common.done');
  const modalButtonText = buttonText || t('common.done');
  // Auto-fermeture optionnelle
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.5 
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Close button (optionnel) */}
              {showCloseButton && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}

              {/* Content container */}
              <div className="text-center">

                {/* ADS / PARTNERS (NEW) - Elegant Footer Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gray-50/50 p-6 border-t border-gray-100 text-left"
                >
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                         <Sparkles className="w-3 h-3 text-[#f3cd08]" />
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('partners.special_offer')}</span>
                      </div>
                      <a href="/services" className="text-[8px] font-black text-[#f3cd08] uppercase tracking-widest hover:underline">
                         {t('common.see_all')}
                      </a>
                   </div>
                   <div className="rounded-3xl overflow-hidden shadow-sm border border-white">
                      <CarouselAds />
                   </div>
                </motion.div>
                {/* Upper section with animation and message */}
                <div className="px-8 pt-2 pb-6">
                  {/* Lottie animation - Compacted */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.2, 
                      type: 'spring', 
                      damping: 15,
                      stiffness: 200 
                    }}
                    className="w-32 h-32 mx-auto mb-4"
                  >
                    <LottieAnimation
                      animationData={lottieAnimation}
                      loop={false}
                      autoplay={true}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight italic"
                  >
                    {modalTitle}
                  </motion.h2>

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-500 text-xs font-bold uppercase tracking-wider leading-relaxed mb-6 max-w-xs mx-auto opacity-70"
                  >
                    {modalMessage}
                  </motion.p>

                  {/* Action button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleButtonClick}
                    className="w-full py-4 bg-[#f3cd08] hover:bg-[#e2bd07] text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/20 transition-all"
                  >
                    {modalButtonText}
                  </motion.button>
                </div>

                
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Variantes prédéfinies du modal
 */

export function SuccessModal(props) {
  const { t } = useTranslation();
  return (
    <ConfirmationModal
      title={t('common.success')}
      lottieAnimation={makingMoneyAnimation}
      {...props}
    />
  );
}

export function TrajetAddedModal(props) {
  const { t } = useTranslation();
  return (
    <ConfirmationModal
      title={t('add.success_title')}
      message={t('add.success_message')}
      lottieAnimation={makingMoneyAnimation}
      buttonText={t('common.done')}
      autoClose={false}
      {...props}
    />
  );
}
