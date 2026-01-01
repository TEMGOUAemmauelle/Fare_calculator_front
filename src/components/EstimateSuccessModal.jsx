/**
 * @fileoverview EstimateSuccessModal - Modal après estimation réussie
 * 
 * Modal élégant proposant les services marketplace après une estimation.
 * Design adaptatif : slide-up sur mobile, centré sur desktop.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ArrowRight, ExternalLink, 
  MapPin, Clock, Car, ChevronRight, Store
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useTranslation } from 'react-i18next';
import { getMarketplaceServices } from '../services/marketplaceService';

const EstimateSuccessModal = ({ 
  isOpen, 
  onClose,
  estimateData = null // Données de l'estimation (prix, trajet, etc.)
}) => {
  const navigate = useAppNavigate();
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
          // Prendre 4-6 services selon la taille
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

  const handleServiceClick = (service) => {
    if (service.lien_redirection) {
      window.open(service.lien_redirection, '_blank');
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/marketplace');
  };

  const isEn = i18n.language === 'en';

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
          
          {/* Modal - Responsive : bottom sheet sur mobile, centré sur desktop */}
          <motion.div
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 ${
              isMobile 
                ? 'bottom-0 left-0 right-0 max-h-[85vh]' 
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
                  {/* Left side - Estimation info */}
                  <div className="w-2/5 bg-gradient-to-br from-[#141414] to-[#2a2a2a] p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-[#f3cd08] rounded-2xl">
                          <Sparkles className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white">
                            {isEn ? 'Your trip is ready!' : 'Votre trajet est prêt !'}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium">
                            {isEn ? 'Estimation completed' : 'Estimation terminée'}
                          </p>
                        </div>
                      </div>

                      {estimateData && (
                        <div className="space-y-6">
                          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">
                              {isEn ? 'Estimated fare' : 'Tarif estimé'}
                            </p>
                            <p className="text-4xl font-black text-white">
                              {estimateData.prix_estime || estimateData.prix_moyen || '---'}
                              <span className="text-lg font-bold text-[#f3cd08] ml-2">FCFA</span>
                            </p>
                          </div>

                          {estimateData.distance && (
                            <div className="flex gap-4">
                              <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Distance</p>
                                <p className="text-lg font-bold text-white">{estimateData.distance} km</p>
                              </div>
                              {estimateData.duree && (
                                <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Durée</p>
                                  <p className="text-lg font-bold text-white">{estimateData.duree} min</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-[#f3cd08] text-black rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#e5c007] transition-colors"
                    >
                      {isEn ? 'Got it!' : "C'est compris !"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right side - Services */}
                  <div className="flex-1 p-8 overflow-y-auto max-h-[85vh]">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors absolute top-4 right-4"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-[#f3cd08]" />
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                          {isEn ? 'Services for you' : 'Services pour vous'}
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
                            key={service.id}
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
                /* MOBILE LAYOUT - Original slide-up design */
                <>
                  {/* Header */}
                  <div className="px-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#f3cd08] rounded-2xl">
                          <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900">
                            {isEn ? 'Your trip is ready!' : 'Votre trajet est prêt !'}
                          </h2>
                          <p className="text-xs text-gray-500 font-medium">
                            {isEn ? 'Discover services to simplify your journey' : 'Découvrez des services pour faciliter votre trajet'}
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

                    {/* Quick estimate summary */}
                    {estimateData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 p-4 bg-gradient-to-r from-[#141414] to-[#2a2a2a] rounded-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl">
                              <Car className="w-4 h-4 text-[#f3cd08]" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
                                {isEn ? 'Estimated fare' : 'Tarif estimé'}
                              </p>
                              <p className="text-xl font-black text-white">
                                {estimateData.prix_estime || estimateData.prix_moyen || '---'} <span className="text-sm font-bold text-[#f3cd08]">FCFA</span>
                              </p>
                            </div>
                          </div>
                          {estimateData.distance && (
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{isEn ? 'Distance' : 'Distance'}</p>
                              <p className="text-sm font-bold text-white">{estimateData.distance} km</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Services Marketplace */}
                  <div className="px-6 py-5 overflow-y-auto max-h-[50vh]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#f3cd08]" />
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                          {isEn ? 'Services for you' : 'Services pour vous'}
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
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
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
                      {isEn ? 'Got it!' : "C'est compris !"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-400 mt-3">
                      {isEn 
                        ? 'These services are offered by our partners' 
                        : 'Ces services sont proposés par nos partenaires'}
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

export default EstimateSuccessModal;
