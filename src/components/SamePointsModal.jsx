/**
 * @fileoverview SamePointsModal - Modal élégant pour points identiques
 * 
 * Modal doux et non-effrayant pour informer l'utilisateur que
 * les points de départ et d'arrivée sont identiques.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SamePointsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop léger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenu */}
              <div className="p-6 text-center">
                {/* Icône animée */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-[#f39908]/10 rounded-full flex items-center justify-center mb-4"
                >
                  <div className="relative">
                    <MapPin className="w-7 h-7 text-[#f39908]" />
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -right-3 top-1/2 -translate-y-1/2"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </motion.div>
                    <motion.div
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -right-8 top-1/2 -translate-y-1/2"
                    >
                      <MapPin className="w-5 h-5 text-[#f39908]/50" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Titre */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t('same_points_modal.title', 'Points identiques')}
                </h3>
                
                {/* Message */}
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  {t('same_points_modal.message', 'Le point de départ et le point d\'arrivée sont identiques. Veuillez choisir une destination différente.')}
                </p>

                {/* Bouton */}
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#141414] text-white rounded-2xl font-bold text-sm hover:bg-[#2a2a2a] transition-colors"
                >
                  {t('same_points_modal.understood', 'Compris')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SamePointsModal;
