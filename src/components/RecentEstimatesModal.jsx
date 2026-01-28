/**
 * @fileoverview RecentEstimatesModal - Historique des estimations récentes
 * 
 * Modal élégant affichant les dernières estimations de l'utilisateur.
 * Design adaptatif : slide-up sur mobile, centré sur desktop.
 * Stockage localStorage, pas de compte requis.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  X, Clock, MapPin, ArrowRight, Trash2, 
  Navigation, Calendar, Sparkles, History,
  ChevronRight, AlertCircle, Car
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useTranslation } from 'react-i18next';
import { 
  getEstimatesHistory, 
  deleteEstimateFromHistory, 
  clearEstimatesHistory 
} from '../services/localStorageService';

/**
 * Formate une date relative (il y a X minutes, hier, etc.)
 */
const formatRelativeTime = (timestamp, t) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return t('history.just_now');
  if (diffMins < 60) return t('history.minutes_ago', { count: diffMins });
  if (diffHours < 24) return t('history.hours_ago', { count: diffHours });
  if (diffDays === 1) return t('history.yesterday');
  if (diffDays < 7) return t('history.days_ago', { count: diffDays });
  
  return date.toLocaleDateString();
};

/**
 * Carte d'estimation individuelle
 */
const EstimateCard = ({ estimate, onDelete, onSelect, t, index }) => {
  const [showDelete, setShowDelete] = useState(false);

  const departLabel = estimate.depart?.label || estimate.depart?.place_name || t('common.unknown');
  const arriveeLabel = estimate.arrivee?.label || estimate.arrivee?.place_name || t('common.unknown');
  const distance = estimate.distance ? (estimate.distance / 1000).toFixed(1) : null;
  const duree = estimate.duree ? Math.round(estimate.duree / 60) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <button
        onClick={() => onSelect(estimate)}
        className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#f3cd08] hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-4">
          {/* Icône / Badge prix */}
          <div className="shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-[#f3cd08] to-[#e5c007] rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-[#f3cd08]/20">
              <span className="text-lg font-black text-black leading-none">
                {estimate.prix_moyen || '---'}
              </span>
              <span className="text-[8px] font-bold text-black/60 uppercase">FCFA</span>
            </div>
          </div>

          {/* Infos trajet */}
          <div className="flex-1 min-w-0">
            {/* Départ -> Arrivée */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                <span className="text-sm font-bold text-gray-900 truncate">{departLabel}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                <span className="text-sm font-bold text-gray-900 truncate">{arriveeLabel}</span>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(estimate.timestamp, t)}
              </span>
              {distance && (
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {distance} km
                </span>
              )}
              {duree && (
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  {duree} min
                </span>
              )}
            </div>

            {/* Statut */}
            {estimate.statut && (
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                  estimate.statut === 'connu' 
                    ? 'bg-green-100 text-green-700' 
                    : estimate.statut === 'similaire'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {estimate.statut === 'connu' && <Sparkles className="w-2.5 h-2.5" />}
                  {t(`history.status_${estimate.statut}`) || estimate.statut}
                </span>
              </div>
            )}
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#f3cd08] transition-colors shrink-0 self-center" />
        </div>
      </button>

      {/* Bouton supprimer (desktop hover) */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onDelete(estimate.id); }}
            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors hidden md:flex"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Swipe to delete hint (mobile) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(estimate.id); }}
        className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors md:hidden"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

/**
 * Modal principal de l'historique
 */
const RecentEstimatesModal = ({ 
  isOpen, 
  onClose,
  onSelectEstimate = null // Callback optionnel pour ré-utiliser une estimation
}) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const [estimates, setEstimates] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger l'historique
  useEffect(() => {
    if (isOpen) {
      const history = getEstimatesHistory(20);
      setEstimates(history);
    }
  }, [isOpen]);

  const handleDelete = (id) => {
    deleteEstimateFromHistory(id);
    setEstimates(prev => prev.filter(e => e.id !== id));
  };

  const handleClearAll = () => {
    clearEstimatesHistory();
    setEstimates([]);
    setShowClearConfirm(false);
  };

  const handleSelect = (estimate) => {
    if (onSelectEstimate) {
      onSelectEstimate(estimate);
    }
    onClose();
  };

  // Animation variants selon le device
  const modalVariants = {
    mobile: {
      initial: { opacity: 0, y: '100%' },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: '100%' }
    },
    desktop: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 }
    }
  };

  const currentVariant = isMobile ? modalVariants.mobile : modalVariants.desktop;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />
          
          {/* Modal */}
          <motion.div
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-[10000] ${
              isMobile 
                ? 'bottom-0 left-0 right-0 max-h-[85vh]' 
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full max-h-[80vh]'
            }`}
          >
            <div 
              className={`bg-white shadow-2xl overflow-hidden flex flex-col ${
                isMobile 
                  ? 'rounded-t-[2rem] w-full h-full max-h-[85vh]' 
                  : 'rounded-3xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle - mobile only */}
              {isMobile && (
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
              )}

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#f3cd08]/10 rounded-xl">
                    <History className="w-5 h-5 text-[#f3cd08]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                      {t('history.title')}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      {estimates.length} {t('history.estimates_count')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {estimates.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title={t('history.clear_all')}
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {estimates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <History className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {t('history.empty_title')}
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs mb-6">
                      {t('history.empty_description')}
                    </p>
                    <button
                      onClick={() => { onClose(); navigate('/estimate'); }}
                      className="px-6 py-3 bg-[#f3cd08] text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#e5c007] transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      {t('history.start_estimate')}
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {estimates.map((estimate, index) => (
                        <EstimateCard
                          key={estimate.id}
                          estimate={estimate}
                          onDelete={handleDelete}
                          onSelect={handleSelect}
                          t={t}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              {estimates.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <p className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-wide">
                    {t('history.storage_hint')}
                  </p>
                </div>
              )}
            </div>

            {/* Clear confirmation overlay */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                    {t('history.clear_confirm_title')}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                    {t('history.clear_confirm_description')}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('history.clear_all')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Utiliser createPortal pour le rendu
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default RecentEstimatesModal;
