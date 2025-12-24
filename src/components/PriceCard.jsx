/**
 * @fileoverview Composant PriceCard - Affichage estimation prix
 * 
 * Design "Pro & Pure" :
 * - Dominante Blanche & Accents Jaune (#F59E0B / #FBBF24)
 * - Typography Clean & Modern (Inter/Sans)
 * - Mobile-first UX
 * - Visualisation trajet type "Timeline"
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { METEO_CODES, TYPE_ZONE_CODES } from '../config/constants';
import { 
  MapPin, 
  Clock, 
  Route,
  Info,
  ChevronRight,
  Navigation,
  Cloud,
  Umbrella,
  Sun,
  Moon,
  Zap,
  Car,
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import CarouselAds from './CarouselAds'; // Re-use the existing dynamic carousel

export default function PriceCard({ prediction, onAddTrajet }) {
  const { t, i18n } = useTranslation();
  if (!prediction) return null;

  // Variables de style
  const isInconnu = prediction.statut === 'inconnu';
  const accentColor = isInconnu ? 'text-gray-500' : 'text-yellow-500';
  const bgColor = isInconnu ? 'bg-gray-50' : 'bg-yellow-50';
  const borderColor = isInconnu ? 'border-gray-100' : 'border-yellow-100';

  const estimSup = prediction.estimations_supplementaires || {};
  const mlPrediction = estimSup?.ml_prediction;
  const featuresUsed = estimSup?.features_utilisees;

  // Icône Météo dynamique
  const getWeatherIcon = (meteoCode) => {
    switch(meteoCode) {
      case 0: return <Sun className="w-4 h-4" />;
      case 1: 
      case 2: return <Cloud className="w-4 h-4" />;
      case 3: return <Zap className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", damping: 25 }}
      className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100"
    >
      {/* 1. EN-TÊTE STATUT & FIABILITÉ */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${bgColor}`}>
            {isInconnu ? (
              <AlertTriangle className="w-4 h-4 text-gray-500" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {isInconnu ? t('price_card.standard_estimation') : t('price_card.intelligent_estimation')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
           <span className="text-xs font-medium text-gray-400">{t('price_card.reliability')}</span>
           <div className="flex px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
             <span className={`text-xs font-bold ${isInconnu ? 'text-gray-600' : 'text-green-600'}`}>
               {(prediction.fiabilite * 100).toFixed(0)}%
             </span>
           </div>
        </div>
      </div>

      {/* 2. PRIX CENTRAL */}
      <div className="px-6 py-8 text-center relative overflow-hidden">
        {/* Fond subtil jaune */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl -z-10"></div>
        
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
          <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">{t('price_card.estimated_price')}</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-gray-900 tracking-tight">
              {prediction.prix_moyen?.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
            </span>
            <span className="text-xl font-bold text-gray-400">FCFA</span>
          </div>
          
          {/* Fourchette Min-Max propre */}
          {prediction.prix_min && prediction.prix_max && (
            <div className="mt-3 inline-flex items-center gap-3 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <span className="text-sm font-semibold text-gray-600">
                {prediction.prix_min.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
              </span>
              <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: '60%' }} // Visuel statique pour l'esthétique
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                {prediction.prix_max.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* 3. TIMELINE TRAJET (Départ -> Arrivée) */}
      <div className="px-6 py-2">
        <div className="relative pl-4 space-y-6">
          {/* Ligne connectrice */}
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-linear-to-b from-yellow-400 to-gray-200 border-l border-dashed border-gray-300"></div>

          {/* Point Départ */}
          <div className="relative flex items-start gap-4">
            <div className="relative z-10 w-2.5 h-2.5 mt-1.5 rounded-full bg-yellow-400 ring-4 ring-white shadow-sm"></div>
            <div className="flex-1 min-w-0">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('price_card.depart')}</div>
               <div className="text-sm font-bold text-gray-900 truncate">
                  {prediction.details_trajet?.depart?.label || 'Départ'}
               </div>
               <div className="text-xs text-gray-500 truncate">
                  {prediction.details_trajet?.depart?.quartier || prediction.details_trajet?.depart?.ville || 'Yaoundé'}
               </div>
            </div>
          </div>

          {/* Point Arrivée */}
          <div className="relative flex items-start gap-4">
            <div className="relative z-10 w-2.5 h-2.5 mt-1.5 rounded-full bg-gray-900 ring-4 ring-white shadow-sm"></div>
             <div className="flex-1 min-w-0">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('price_card.arrival')}</div>
               <div className="text-sm font-bold text-gray-900 truncate">
                  {prediction.details_trajet?.arrivee?.label || 'Arrivée'}
               </div>
               <div className="text-xs text-gray-500 truncate">
                  {prediction.details_trajet?.arrivee?.quartier || prediction.details_trajet?.arrivee?.ville || 'Destination'}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DETAILS GRID (Les nouvelles données API) */}
      <div className="p-4 mx-4 mt-6 mb-6 bg-gray-50 rounded-2xl border border-gray-100">
         <div className="grid grid-cols-2 gap-4">
            {/* Distance */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Route className="w-3.5 h-3.5" /> {t('price_card.distance')}
               </div>
               <div className="text-sm font-bold text-gray-900">
                  {((prediction.details_trajet?.distance_metres || prediction.distance || 0) / 1000).toFixed(1)} km
               </div>
            </div>

            {/* Durée */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {t('price_card.duration')}
               </div>
               <div className="text-sm font-bold text-gray-900">
                  {Math.ceil((prediction.details_trajet?.duree_secondes || prediction.duree || 0) / 60)} min
               </div>
            </div>

            {/* Météo (Nouveau) */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {getWeatherIcon(prediction.details_trajet?.meteo)} {t('price_card.weather')}
               </div>
               <div className="text-sm font-bold text-gray-900 capitalize">
                  {METEO_CODES[prediction.details_trajet?.meteo]?.labelKey ? t(METEO_CODES[prediction.details_trajet?.meteo].labelKey) : (prediction.details_trajet?.meteo_label || 'Normal')}
               </div>
            </div>

            {/* Zone (Nouveau) */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Navigation className="w-3.5 h-3.5" /> {t('price_card.zone')}
               </div>
               <div className="text-sm font-bold text-gray-900 capitalize">
                  {TYPE_ZONE_CODES[prediction.details_trajet?.type_zone]?.labelKey ? t(TYPE_ZONE_CODES[prediction.details_trajet?.type_zone].labelKey) : (prediction.details_trajet?.type_zone_label || 'Urbaine')}
               </div>
            </div>
         </div>
      </div>

      {/* 5. ESTIMATIONS ALTERNATIVES COMPACTES (Si inconnu) */}
        {isInconnu && prediction.estimations_supplementaires && (
        <div className="px-6 pb-6">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">
            {t('price_card.calculation_details')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-50 border-dashed">
              <span className="text-xs text-gray-600">{t('price_card.ml_prediction')}</span>
              <span className="text-xs font-bold text-gray-900">
                {mlPrediction ? `${mlPrediction} FCFA` : t('price_card.not_available')}
              </span>
            </div>
            {featuresUsed && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2">
                    <div>Distance: {((featuresUsed.distance_metres || 0) / 1000).toFixed(2)} km</div>
                    <div>Durée: {Math.round((featuresUsed.duree_secondes || 0) / 60)} min</div>
                    <div>Sinuosité: {(featuresUsed.sinuosite || 0).toFixed(2)}</div>
                    <div>Virages: {featuresUsed.nb_virages ?? 0}</div>
                    <div>Heure: {featuresUsed.heure || '-'}</div>
                    <div>Météo: {featuresUsed.meteo ?? '-'}</div>
                  </div>
            )}
          </div>
        </div>
        )}

 

      {/* 7. PARTENAIRES SUGGESTION (Nouveau) */}
      <div className="px-6 pb-6 pt-2">
         <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
               <Sparkles className="w-3 h-3 text-[#f3cd08]" />
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Partenaires suggérés</span>
            </div>
            <a href="/services" className="text-[8px] font-black text-[#f3cd08] uppercase tracking-widest">Voir plus</a>
         </div>
         <div className="rounded-3xl overflow-hidden scale-95 origin-center shadow-sm">
            <CarouselAds />
         </div>
      </div>
    </motion.div>
  );
}
