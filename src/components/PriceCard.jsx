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

  // Couleurs gradient selon statut
  const gradientColors = {
    exact: 'from-emerald-500 to-teal-600',
    similaire: 'from-blue-500 to-indigo-600',
    inconnu: 'from-amber-500 to-orange-600',
  };

  const bgColors = {
    exact: 'bg-emerald-50',
    similaire: 'bg-blue-50',
    inconnu: 'bg-amber-50',
  };

  const textColors = {
    exact: 'text-emerald-700',
    similaire: 'text-blue-700',
    inconnu: 'text-amber-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Header avec gradient selon statut */}
      <div className={`relative bg-gradient-to-br ${gradientColors[prediction.statut]} px-8 py-6 text-white overflow-hidden`}>
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <StatusIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {statutInfo.label}
              </h3>
              <p className="text-white/90 text-sm mt-1">
                {prediction.message}
              </p>
            </div>
          </div>
          
          {/* Badge fiabilité */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/30"
          >
            <div className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">
              Fiabilité
            </div>
            <div className="text-3xl font-black">
              {(prediction.fiabilite * 100).toFixed(0)}%
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prix principal avec effet glassmorphism */}
      <div className={`relative px-8 py-10 ${bgColors[prediction.statut]}`}>
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            <div className={`text-sm font-semibold ${textColors[prediction.statut]} uppercase tracking-wider mb-3`}>
              Prix estimé
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black text-gray-900">
                {prediction.prix_moyen.toFixed(0)}
              </span>
              <span className="text-3xl font-bold text-gray-600">
                FCFA
              </span>
            </div>
            
            {hasRange && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200"
              >
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-lg font-semibold text-gray-700">
                  {prediction.prix_min} - {prediction.prix_max} FCFA
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Détails du trajet */}
      <div className="px-8 py-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Départ */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
          >
            <div className="p-2 bg-blue-500 rounded-xl">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Départ
              </div>
              <div className="font-bold text-gray-900 truncate text-lg">
                {prediction.details_trajet?.depart?.label || 'Non spécifié'}
              </div>
            </div>
          </motion.div>

          {/* Arrivée */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
          >
            <div className="p-2 bg-purple-500 rounded-xl">
              <MapPin className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Arrivée
              </div>
              <div className="font-bold text-gray-900 truncate text-lg">
                {prediction.details_trajet?.arrivee?.label || 'Non spécifié'}
              </div>
            </div>
          </motion.div>

          {/* Distance */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl"
          >
            <div className="p-2 bg-blue-600 rounded-xl">
              <Route className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                Distance
              </div>
              <div className="text-2xl font-black text-blue-900">
                {(prediction.details_trajet?.distance_estimee / 1000).toFixed(1)} km
              </div>
            </div>
          </motion.div>

          {/* Durée */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl"
          >
            <div className="p-2 bg-purple-600 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                Durée
              </div>
              <div className="text-2xl font-black text-purple-900">
                {Math.ceil(prediction.details_trajet?.duree_estimee / 60)} min
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ajustements (météo/heure opposées) */}
      {prediction.ajustements_appliques && (
        <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-900 text-lg">
              Estimations alternatives
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prediction.ajustements_appliques.meteo_opposee && (() => {
              const WeatherIcon = getWeatherIcon(prediction.ajustements_appliques.meteo_opposee.code);
              return (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <WeatherIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {prediction.ajustements_appliques.meteo_opposee.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        Si météo change
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-blue-600">
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
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${heureInfo?.bg || 'bg-purple-100'} rounded-xl`}>
                      <TimeIcon className={`w-5 h-5 ${heureInfo?.color || 'text-purple-600'}`} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {heureInfo?.label || prediction.ajustements_appliques.heure_opposee.tranche}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        Si heure différente
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-purple-600">
                    {prediction.ajustements_appliques.heure_opposee.prix_estime?.toFixed(0)}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Estimations supplémentaires (si inconnu) */}
      {prediction.estimations_supplementaires && (
        <div className="px-8 py-6 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-amber-900 text-lg">
              Méthodes de calcul alternatives
            </h4>
          </div>
          
          <div className="space-y-2">
            {[
              { key: 'distance_based', label: 'Basé sur la distance' },
              { key: 'standardise', label: 'Tarif standardisé officiel' },
              { key: 'zone_based', label: 'Moyenne de la zone' },
            ].map((method, idx) => (
              prediction.estimations_supplementaires[method.key] && (
                <motion.div
                  key={method.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200"
                >
                  <span className="text-sm font-medium text-gray-700">{method.label}</span>
                  <span className="text-xl font-bold text-amber-700">
                    {prediction.estimations_supplementaires[method.key]?.toFixed(0)} FCFA
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {prediction.suggestions && prediction.suggestions.length > 0 && (
        <div className="px-8 py-6 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-blue-900 text-lg">
              Conseils utiles
            </h4>
          </div>
          <ul className="space-y-2">
            {prediction.suggestions.map((suggestion, i) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-3 text-blue-800"
              >
                <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <span className="text-sm">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton ajouter trajet */}
      {onAddTrajet && (
        <div className="px-8 py-6 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddTrajet}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Ajouter ce trajet après le ride</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
