/**
 * @fileoverview Composant PriceCard - Affichage estimation prix
 * 
 * Carte élégante et moderne affichant résultats estimation API avec :
 * - Design gradient professionnel
 * - Animations fluides Framer Motion  
 * - Icônes Lucide React
 * - Typographie hiérarchisée
 */

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Route,
  Sun,
  CloudRain,
  CloudLightning,
  Moon,
  Sunrise,
  Sunset,
  Info,
  Plus,
  ArrowRight,
  Target
} from 'lucide-react';
import { STATUT_ESTIMATION, METEO_CODES, HEURE_TRANCHES } from '../config/constants';

// Helper pour icônes météo
const getWeatherIcon = (code) => {
  const icons = {
    0: Sun,
    1: CloudRain,
    2: CloudRain,
    3: CloudLightning,
  };
  return icons[code] || Sun;
};

// Helper pour icônes heure
const getTimeIcon = (tranche) => {
  const icons = {
    matin: Sunrise,
    'apres-midi': Sun,
    soir: Sunset,
    nuit: Moon,
  };
  return icons[tranche] || Clock;
};

export default function PriceCard({ prediction, onAddTrajet }) {
  if (!prediction) return null;

  const statutInfo = STATUT_ESTIMATION[prediction.statut] || STATUT_ESTIMATION.inconnu;
  const hasRange = prediction.prix_min !== null && prediction.prix_max !== null;
  
  // Icône statut
  const StatusIcon = prediction.statut === 'exact' ? CheckCircle2 : 
                     prediction.statut === 'similaire' ? TrendingUp : 
                     AlertCircle;

  // Couleurs gradient selon statut - JAUNE au lieu de VERT
  const gradientColors = {
    exact: 'from-yellow-400 to-yellow-500',
    similaire: 'from-blue-500 to-indigo-600',
    inconnu: 'from-amber-500 to-orange-600',
  };

  const bgColors = {
    exact: 'bg-yellow-50',
    similaire: 'bg-blue-50',
    inconnu: 'bg-amber-50',
  };

  const textColors = {
    exact: 'text-yellow-700',
    similaire: 'text-blue-700',
    inconnu: 'text-amber-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto"
    >
      {/* Header compact avec gradient selon statut */}
      <div className={`relative bg-gradient-to-br ${gradientColors[prediction.statut]} px-6 py-4 text-white overflow-hidden`}>
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {statutInfo.label}
              </h3>
              <p className="text-white/90 text-xs mt-0.5">
                {prediction.message}
              </p>
            </div>
          </div>
          
          {/* Badge fiabilité compact */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30"
          >
            <div className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
              Fiabilité
            </div>
            <div className="text-2xl font-black">
              {(prediction.fiabilite * 100).toFixed(0)}%
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prix principal compact */}
      <div className={`relative px-6 py-6 ${bgColors[prediction.statut]}`}>
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            <div className={`text-xs font-semibold ${textColors[prediction.statut]} uppercase tracking-wider mb-2`}>
              Prix estimé
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-gray-900">
                {prediction.prix_moyen.toFixed(0)}
              </span>
              <span className="text-2xl font-bold text-gray-600">
                FCFA
              </span>
            </div>
            
            {hasRange && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200"
              >
                <Target className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {prediction.prix_min} - {prediction.prix_max} FCFA
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Détails du trajet - Compact en grille */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          {/* Départ */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
          >
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Départ
              </div>
              <div className="font-bold text-gray-900 truncate text-sm">
                {prediction.details_trajet?.depart?.label || 'Non spécifié'}
              </div>
            </div>
          </motion.div>

          {/* Arrivée */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-2 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
          >
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <MapPin className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                Arrivée
              </div>
              <div className="font-bold text-gray-900 truncate text-sm">
                {prediction.details_trajet?.arrivee?.label || 'Non spécifié'}
              </div>
            </div>
          </motion.div>

          {/* Distance */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
          >
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Route className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                Distance
              </div>
              <div className="text-lg font-black text-blue-900">
                {(prediction.details_trajet?.distance_estimee / 1000).toFixed(1)} km
              </div>
            </div>
          </motion.div>

          {/* Durée */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
          >
            <div className="p-1.5 bg-purple-600 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
                Durée
              </div>
              <div className="text-lg font-black text-purple-900">
                {Math.ceil(prediction.details_trajet?.duree_estimee / 60)} min
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ajustements - Compact */}
      {prediction.ajustements_appliques && (
        <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-gray-900 text-sm">
              Estimations alternatives
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {prediction.ajustements_appliques.meteo_opposee && (() => {
              const WeatherIcon = getWeatherIcon(prediction.ajustements_appliques.meteo_opposee.code);
              return (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <WeatherIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase">
                        {prediction.ajustements_appliques.meteo_opposee.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-black text-blue-600">
                    {prediction.ajustements_appliques.meteo_opposee.prix_estime?.toFixed(0)}
                  </div>
                </motion.div>
              );
            })()}
            
            {prediction.ajustements_appliques.heure_opposee && (() => {
              const TimeIcon = getTimeIcon(prediction.ajustements_appliques.heure_opposee.tranche);
              const heureInfo = HEURE_TRANCHES[prediction.ajustements_appliques.heure_opposee.tranche];
              return (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 ${heureInfo?.bg || 'bg-purple-100'} rounded-lg`}>
                      <TimeIcon className={`w-4 h-4 ${heureInfo?.color || 'text-purple-600'}`} />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase">
                        {heureInfo?.label || prediction.ajustements_appliques.heure_opposee.tranche}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-black text-purple-600">
                    {prediction.ajustements_appliques.heure_opposee.prix_estime?.toFixed(0)}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Estimations supplémentaires - Compact */}
      {prediction.estimations_supplementaires && (
        <div className="px-6 py-4 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="font-bold text-amber-900 text-sm">
              Méthodes alternatives
            </h4>
          </div>
          
          <div className="space-y-1.5">
            {[
              { key: 'distance_based', label: 'Distance' },
              { key: 'standardise', label: 'Officiel' },
              { key: 'zone_based', label: 'Zone' },
            ].map((method, idx) => (
              prediction.estimations_supplementaires[method.key] && (
                <motion.div
                  key={method.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200"
                >
                  <span className="text-xs font-medium text-gray-700">{method.label}</span>
                  <span className="text-base font-bold text-amber-700">
                    {prediction.estimations_supplementaires[method.key]?.toFixed(0)} FCFA
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Suggestions - Compact */}
      {prediction.suggestions && prediction.suggestions.length > 0 && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-blue-900 text-sm">
              Conseils
            </h4>
          </div>
          <ul className="space-y-1.5">
            {prediction.suggestions.map((suggestion, i) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-2 text-blue-800"
              >
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span className="text-xs">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
