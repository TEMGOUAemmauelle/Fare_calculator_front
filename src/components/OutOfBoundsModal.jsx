/**
 * @fileoverview OutOfBoundsModal - Modal pour localisation hors Cameroun
 * 
 * Modal élégante affichée quand l'utilisateur sélectionne un point
 * en dehors du Cameroun. Design moderne avec animation.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinOff, X, AlertTriangle, Map } from 'lucide-react';

const OutOfBoundsModal = ({ 
  isOpen, 
  onClose, 
  invalidPoint = 'depart', // 'depart', 'arrivee', ou 'both'
  detectedCountry = 'un pays hors du Cameroun' 
}) => {
  const getTitle = () => {
    switch (invalidPoint) {
      case 'both':
        return 'Points hors zone';
      case 'depart':
        return 'Départ hors zone';
      case 'arrivee':
        return 'Arrivée hors zone';
      default:
        return 'Localisation invalide';
    }
  };

  const getMessage = () => {
    switch (invalidPoint) {
      case 'both':
        return `Les points de départ et d'arrivée semblent être situés dans ${detectedCountry}. Notre service couvre uniquement le Cameroun.`;
      case 'depart':
        return `Le point de départ semble être situé dans ${detectedCountry}. Veuillez sélectionner un point au Cameroun.`;
      case 'arrivee':
        return `Le point d'arrivée semble être situé dans ${detectedCountry}. Veuillez sélectionner une destination au Cameroun.`;
      default:
        return 'La localisation sélectionnée est hors de notre zone de couverture.';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header avec icône animée */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                {/* Pattern de fond */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)"/>
                  </svg>
                </div>
                
                {/* Contenu header */}
                <div className="relative z-10 flex items-start gap-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2,
                      ease: 'easeInOut'
                    }}
                    className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    <MapPinOff className="w-8 h-8" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{getTitle()}</h3>
                    <p className="text-white/80 text-sm">
                      Service limité au Cameroun
                    </p>
                  </div>
                  
                  {/* Bouton fermer */}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Corps */}
              <div className="p-6">
                {/* Message */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {getMessage()}
                  </p>
                </div>
                
                {/* Info box */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <span className="font-medium">Zone de couverture :</span> Toutes les villes et régions du Cameroun
                    </p>
                  </div>
                </div>
                
                {/* Villes populaires */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Villes populaires :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Kribi'].map((ville) => (
                      <span
                        key={ville}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                      >
                        {ville}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Bouton */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
                >
                  Compris, je modifie ma sélection
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OutOfBoundsModal;
