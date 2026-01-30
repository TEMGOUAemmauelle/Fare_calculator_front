/**
 * @fileoverview TarifsStandardsDisplay - Affichage des tarifs standards
 * 
 * Composant réutilisable pour afficher les tarifs officiels des taxis
 * fixés par le Ministère des Transports du Cameroun.
 * 
 * Utilisé dans :
 * - EstimateSuccessModal (après une estimation)
 * - HomePageDesktop (section estimation)
 * - EstimatePageMobile (drawer estimation)
 * 
 * Variantes d'affichage :
 * - 'compact' : Version minimaliste inline
 * - 'card' : Version carte avec plus de détails
 * - 'inline' : Version texte simple
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, Sun, Moon, Car, Users, ChevronDown, ChevronUp, 
  Shield, AlertCircle, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  getTarifsStandards, 
  getTarifsForHeure, 
  getDefaultTarifs,
  formatTarif,
  getPeriodeFromHeure 
} from '../services/tarifService';

/**
 * Affiche les tarifs standards des taxis camerounais
 * 
 * @param {Object} props
 * @param {string} props.heure - Tranche horaire ('matin', 'apres-midi', 'soir', 'nuit')
 * @param {'compact' | 'card' | 'inline'} props.variant - Style d'affichage
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.showAllTarifs - Afficher tous les tarifs ou seulement celui adapté
 * @param {boolean} props.showSource - Afficher la source des tarifs
 * @param {boolean} props.expandable - Permettre d'étendre pour voir plus de détails
 */
const TarifsStandardsDisplay = ({ 
  heure = 'matin',
  variant = 'card',
  className = '',
  showAllTarifs = false,
  showSource = true,
  expandable = true
}) => {
  const { t } = useTranslation();
  const [tarifs, setTarifs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Déterminer la période (jour/nuit) à partir de l'heure
  const periode = getPeriodeFromHeure(heure);
  const isNuit = periode === 'nuit';

  useEffect(() => {
    const fetchTarifs = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await getTarifsStandards();
        setTarifs(data);
      } catch (err) {
        console.error('Erreur chargement tarifs:', err);
        setError(true);
        // Utiliser les valeurs par défaut
        setTarifs(getDefaultTarifs());
      } finally {
        setLoading(false);
      }
    };
    fetchTarifs();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getTarifsStandards(true); // Force refresh
      setTarifs(data);
    } catch (err) {
      setError(true);
      setTarifs(getDefaultTarifs());
    } finally {
      setLoading(false);
    }
  };

  // Calcul des tarifs à afficher selon la période
  const tarifTaxi = tarifs 
    ? (isNuit ? tarifs.tarif_taxi_nuit : tarifs.tarif_taxi_jour)
    : null;
  const tarifCourse = tarifs 
    ? (isNuit ? tarifs.tarif_course_nuit : tarifs.tarif_course_jour)
    : null;

  // Skeleton loading
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === 'card' ? (
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="h-6 bg-gray-200 rounded w-48" />
        )}
      </div>
    );
  }

  // VARIANT: COMPACT - Petite version inline
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
          {isNuit ? (
            <Moon className="w-4 h-4 text-indigo-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-xs font-bold text-gray-500 uppercase">
            {t('tarifs.standard')}:
          </span>
          <span className="text-sm font-black text-gray-900">
            {formatTarif(tarifTaxi)}
          </span>
        </div>
        
        {expandable && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('tarifs.voir_details')}
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
  }

  // VARIANT: INLINE - Version texte simple
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Shield className="w-4 h-4 text-[#f39908]" />
        <span className="text-xs text-gray-500">
          {t('tarifs.tarif_officiel')} ({isNuit ? t('tarifs.nuit') : t('tarifs.jour')}):
        </span>
        <span className="text-sm font-bold text-gray-900">
          {formatTarif(tarifTaxi)}
        </span>
      </div>
    );
  }

  // VARIANT: CARD (default) - Version carte complète
  return (
    <motion.div 
      className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header avec toggle */}
      <button 
        onClick={() => expandable && setExpanded(!expanded)}
        className={`w-full p-4 flex items-center justify-between ${expandable ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
        disabled={!expandable}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isNuit ? 'bg-indigo-50' : 'bg-amber-50'}`}>
            {isNuit ? (
              <Moon className="w-5 h-5 text-indigo-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">
              {t('tarifs.tarifs_officiels')}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {isNuit ? t('tarifs.tarif_nuit') : t('tarifs.tarif_jour')}
              {heure && ` • ${t(`constants.time.${heure}`)}`}
            </p>
          </div>
        </div>
        
        {expandable && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        )}
      </button>

      {/* Content principal - tarifs de la période */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Tarif Taxi Partagé */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#f39908]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('tarifs.taxi_partage')}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {tarifTaxi?.toLocaleString('fr-FR')}
              <span className="text-sm font-bold text-gray-400 ml-1">FCFA</span>
            </p>
          </div>

          {/* Tarif Course/Dépôt */}
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-[#f39908]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('tarifs.course_depot')}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {tarifCourse?.toLocaleString('fr-FR')}
              <span className="text-sm font-bold text-gray-400 ml-1">FCFA</span>
            </p>
          </div>
        </div>
      </div>

      {/* Section détails - expandable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              {/* Tous les tarifs */}
              {showAllTarifs && tarifs && (
                <div className="mb-4 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {t('tarifs.tous_tarifs')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-amber-50/50 rounded-lg">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> {t('tarifs.taxi_jour')}
                      </span>
                      <span className="font-bold">{formatTarif(tarifs.tarif_taxi_jour)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-amber-50/50 rounded-lg">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> {t('tarifs.course_jour')}
                      </span>
                      <span className="font-bold">{formatTarif(tarifs.tarif_course_jour)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-indigo-50/50 rounded-lg">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> {t('tarifs.taxi_nuit')}
                      </span>
                      <span className="font-bold">{formatTarif(tarifs.tarif_taxi_nuit)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-indigo-50/50 rounded-lg">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> {t('tarifs.course_nuit')}
                      </span>
                      <span className="font-bold">{formatTarif(tarifs.tarif_course_nuit)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source des tarifs */}
              {showSource && tarifs?.source && (
                <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      {t('tarifs.source')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {tarifs.source}
                    </p>
                  </div>
                </div>
              )}

              {/* Message d'erreur avec retry */}
              {error && (
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl mt-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-700">
                      {t('tarifs.erreur_chargement')}
                    </span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TarifsStandardsDisplay;
