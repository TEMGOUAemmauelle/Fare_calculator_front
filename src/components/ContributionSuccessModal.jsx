/**
 * @fileoverview ContributionSuccessModal - Modal de succès après contribution
 * 
 * Modal enrichie affichée après l'ajout d'un trajet, montrant les services
 * marketplace et encourageant l'utilisateur à continuer.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, X, Sparkles, ArrowRight, 
  PlusCircle, Calculator, ExternalLink, Heart
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import MarketplaceCard from './MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const ContributionSuccessModal = ({ 
  isOpen, 
  onClose,
  contributionData = null // Données du trajet ajouté
}) => {
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        try {
          const data = await getMarketplaceServices();
          // Prendre 2-3 services pour ne pas surcharger
          setServices(data.slice(0, 3));
        } catch (error) {
          console.error('Erreur chargement services:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [isOpen]);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header avec animation de succès */}
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-8 text-white overflow-hidden">
                {/* Confetti effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 0, 
                        y: -20,
                        x: Math.random() * 100 - 50,
                        rotate: 0
                      }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        y: 200,
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 2 + Math.random(),
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className={`absolute top-0 w-2 h-2 rounded-full`}
                      style={{
                        left: `${10 + i * 8}%`,
                        backgroundColor: ['#f3cd08', '#fff', '#10b981', '#3b82f6'][i % 4]
                      }}
                    />
                  ))}
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Contenu header */}
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black mb-2"
                  >
                    Merci pour votre contribution !
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" fill="currentColor" />
                    Vous aidez la communauté
                  </motion.p>
                </div>
              </div>

              {/* Corps */}
              <div className="p-6">
                {/* Stats de contribution (si disponibles) */}
                {contributionData && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Trajet ajouté
                    </p>
                    <p className="font-bold text-gray-900 truncate">
                      {contributionData.depart?.label} → {contributionData.arrivee?.label}
                    </p>
                    <p className="text-[#f3cd08] font-black text-lg">
                      {contributionData.prix} FCFA
                    </p>
                  </div>
                )}

                {/* Actions rapides */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/add-trajet')}
                    className="p-4 bg-[#f3cd08]/10 rounded-2xl text-center group hover:bg-[#f3cd08] transition-colors"
                  >
                    <PlusCircle className="w-6 h-6 text-[#f3cd08] mx-auto mb-2 group-hover:text-black transition-colors" />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-black transition-colors">
                      Ajouter un autre
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/estimate')}
                    className="p-4 bg-gray-50 rounded-2xl text-center group hover:bg-[#141414] transition-colors"
                  >
                    <Calculator className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-[#f3cd08] transition-colors" />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-white transition-colors">
                      Estimer un trajet
                    </span>
                  </motion.button>
                </div>

                {/* Section Marketplace */}
                {!loading && services.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#f3cd08]" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Découvrez aussi
                        </h3>
                      </div>
                      <button
                        onClick={() => handleNavigate('/marketplace')}
                        className="text-xs font-bold text-[#f3cd08] flex items-center gap-1"
                      >
                        Voir tout
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {services.slice(0, 2).map((service, index) => (
                        <motion.div
                          key={service.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <MarketplaceCard service={service} variant="compact" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton fermer */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4 text-[#f3cd08]" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContributionSuccessModal;
