/**
 * @fileoverview ContributionSuccessModal - Modal de succès après contribution
 * 
 * Modal enrichie affichée après l'ajout d'un trajet, montrant les services
 * marketplace. Design adaptatif : slide-up sur mobile, centré sur desktop.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, X, Sparkles, ArrowRight, 
  PlusCircle, Calculator, ExternalLink, Heart, Store, ChevronRight, Car
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useTranslation } from 'react-i18next';
import { getMarketplaceServices } from '../services/marketplaceService';

const ContributionSuccessModal = ({ 
  isOpen, 
  onClose,
  contributionData = null // Données du trajet ajouté
}) => {
  const navigate = useAppNavigate();
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isEn = i18n.language === 'en';

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchServices = async () => {
        try {
          const data = await getMarketplaceServices();
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setServices(shuffled.slice(0, isMobile ? 4 : 6));
        } catch (error) {
          console.error('Erreur chargement services:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [isOpen, isMobile]);

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleServiceClick = (service) => {
    if (service.lien_redirection) {
      window.open(service.lien_redirection, '_blank');
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/marketplace');
  };

  // Animation variants selon le device
  const modalVariants = {
    mobile: {
      initial: { opacity: 0, y: '100%' },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: '100%' }
    },
    desktop: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 }
    }
  };

  const currentVariant = isMobile ? modalVariants.mobile : modalVariants.desktop;

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          {/* Modal - Responsive */}
          <motion.div
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 ${
              isMobile 
                ? 'bottom-0 left-0 right-0 max-h-[90vh]' 
                : 'inset-0 flex items-center justify-center p-8'
            }`}
          >
            <div 
              className={`bg-white shadow-2xl overflow-hidden ${
                isMobile 
                  ? 'rounded-t-[2rem] w-full' 
                  : 'rounded-3xl max-w-4xl w-full max-h-[85vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - mobile only */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
              )}

              {/* DESKTOP LAYOUT */}
              {!isMobile ? (
                <div className="flex h-full">
                  {/* Left side - Contribution info */}
                  <div className="w-2/5 bg-gradient-to-br from-[#141414] to-[#2a2a2a] p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[#f3cd08] rounded-2xl">
                          <CheckCircle2 className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white">
                            {t('contribution_success_modal.thank_you')}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
                            {t('contribution_success_modal.help_community')}
                          </p>
                        </div>
                      </div>

                      {contributionData && (
                        <div className="space-y-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">
                              {t('contribution_success_modal.trip_added')}
                            </p>
                            <p className="text-lg font-bold text-white mb-4 leading-tight">
                              {contributionData.depart?.label?.split(',')[0]} 
                              <span className="text-[#f3cd08] mx-2">→</span> 
                              {contributionData.arrivee?.label?.split(',')[0]}
                            </p>
                            <p className="text-4xl font-black text-white">
                              {contributionData.prix}
                              <span className="text-lg font-bold text-[#f3cd08] ml-2">{t('contribution_success_modal.currency')}</span>
                            </p>
                          </div>

                          {/* Quick actions desktop */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleNavigate('/add-trajet')}
                              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4 text-[#f3cd08]" />
                              <span className="text-xs font-bold text-white">
                                {t('contribution_success_modal.add_another')}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => handleNavigate('/estimate')}
                              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 transition-colors"
                            >
                              <Calculator className="w-4 h-4 text-[#f3cd08]" />
                              <span className="text-xs font-bold text-white">
                                {t('contribution_success_modal.estimate')}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-[#f3cd08] text-black rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#e5c007] transition-colors"
                    >
                      {t('contribution_success_modal.continue')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right side - Services */}
                  <div className="flex-1 p-8 overflow-y-auto max-h-[85vh] relative">
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors absolute top-4 right-4"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-[#f3cd08]" />
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                          {t('contribution_success_modal.discover_also')}
                        </h3>
                      </div>
                      <button
                        onClick={handleViewAll}
                        className="text-sm font-bold text-[#f3cd08] flex items-center gap-1 hover:underline"
                      >
                        {isEn ? 'View all' : 'Voir tout'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : services.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {services.map((service, index) => (
                          <motion.button
                            key={service.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleServiceClick(service)}
                            className="group relative bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 text-left transition-all hover:scale-[1.02] overflow-hidden"
                          >
                            <div 
                              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                              style={{ 
                                background: `linear-gradient(135deg, ${service.couleur || '#f3cd08'} 0%, transparent 100%)` 
                              }}
                            />
                            
                            <div className="relative z-10">
                              {service.image_url ? (
                                <div className="w-14 h-14 rounded-xl overflow-hidden mb-4 bg-white shadow-sm">
                                  <img 
                                    src={service.image_url} 
                                    alt={service.nom}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center"
                                  style={{ backgroundColor: service.couleur || '#f3cd08' }}
                                >
                                  <Sparkles className="w-6 h-6 text-white" />
                                </div>
                              )}
                              
                              <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
                                {isEn && service.nom_en ? service.nom_en : service.nom}
                              </h4>
                              
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {isEn && service.description_en ? service.description_en : service.description}
                              </p>
                              
                              {service.lien_redirection && (
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-sm">
                          {isEn ? 'No services available' : 'Aucun service disponible'}
                        </p>
                      </div>
                    )}

                    <p className="text-center text-xs text-gray-400 mt-6">
                      {isEn 
                        ? 'These services are offered by our partners' 
                        : 'Ces services sont proposés par nos partenaires'}
                    </p>
                  </div>
                </div>
              ) : (
                /* MOBILE LAYOUT */
                <>
                  {/* Header Success */}
                  <div className="px-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#f3cd08] rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900">
                            {isEn ? 'Thank you!' : 'Merci !'}
                          </h2>
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
                            {isEn ? 'You help the community' : 'Vous aidez la communauté'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors -mt-1"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Contribution summary - thème jaune/noir */}
                    {contributionData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 p-4 bg-gradient-to-r from-[#141414] to-[#2a2a2a] rounded-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#f3cd08]/20 rounded-xl">
                              <Car className="w-4 h-4 text-[#f3cd08]" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
                                {isEn ? 'Trip added' : 'Trajet ajouté'}
                              </p>
                              <p className="text-sm font-bold text-white truncate max-w-[180px]">
                                {contributionData.depart?.label?.split(',')[0]} → {contributionData.arrivee?.label?.split(',')[0]}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-white">
                              {contributionData.prix} <span className="text-sm font-bold text-[#f3cd08]">FCFA</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => handleNavigate('/add-trajet')}
                        className="p-3 bg-[#f3cd08]/10 hover:bg-[#f3cd08]/20 rounded-xl flex items-center gap-2 transition-colors active:scale-95"
                      >
                        <PlusCircle className="w-4 h-4 text-[#f3cd08]" />
                        <span className="text-xs font-bold text-gray-700">
                          {isEn ? 'Add another' : 'Ajouter un autre'}
                        </span>
                      </motion.button>
                      
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        onClick={() => handleNavigate('/estimate')}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors active:scale-95"
                      >
                        <Calculator className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">
                          {isEn ? 'Estimate trip' : 'Estimer un trajet'}
                        </span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Services Marketplace */}
                  <div className="px-6 py-5 overflow-y-auto max-h-[45vh]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#f3cd08]" />
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                          {t('contribution_success_modal.discover_also')}
                        </h3>
                      </div>
                      <button
                        onClick={handleViewAll}
                        className="text-xs font-bold text-[#f3cd08] flex items-center gap-1 hover:underline"
                      >
                        {isEn ? 'View all' : 'Voir tout'}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : services.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {services.map((service, index) => (
                          <motion.button
                            key={service.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            onClick={() => handleServiceClick(service)}
                            className="group relative bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 text-left transition-all active:scale-95 overflow-hidden"
                          >
                            <div 
                              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                              style={{ 
                                background: `linear-gradient(135deg, ${service.couleur || '#f3cd08'} 0%, transparent 100%)` 
                              }}
                            />
                            
                            <div className="relative z-10">
                              {service.image_url ? (
                                <div className="w-12 h-12 rounded-xl overflow-hidden mb-3 bg-white shadow-sm">
                                  <img 
                                    src={service.image_url} 
                                    alt={service.nom}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                                  style={{ backgroundColor: service.couleur || '#f3cd08' }}
                                >
                                  <Sparkles className="w-5 h-5 text-white" />
                                </div>
                              )}
                              
                              <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                                {isEn && service.nom_en ? service.nom_en : service.nom}
                              </h4>
                              
                              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                {isEn && service.description_en ? service.description_en : service.description}
                              </p>
                              
                              {service.lien_redirection && (
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">
                          {isEn ? 'No services available' : 'Aucun service disponible'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="px-6 pb-8 pt-2 border-t border-gray-100">
                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-[#141414] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {t('contribution_success_modal.continue')}
                      <ArrowRight className="w-4 h-4 text-[#f3cd08]" />
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-400 mt-3">
                      {t('contribution_success_modal.services_disclaimer')}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContributionSuccessModal;
