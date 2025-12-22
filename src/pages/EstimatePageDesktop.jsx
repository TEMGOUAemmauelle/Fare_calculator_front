/**
 * @fileoverview EstimatePageDesktop - Version desktop professionnelle
 * 
 * Corrections appliquées :
 * - Suppression emojis console
 * - Toggles modernes (comme mobile)
 * - Focus rings jaune (#f3cd08)
 * - Carte Mapbox visible
 * - Sidebar fixe responsive
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { 
  MapPin, 
  Navigation, 
  Sun as SunIcon, 
  CloudRain,
  Home,
  Briefcase,
  TrendingUp,
  Sunrise,
  Sunset,
  Moon,
  Calculator,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import PriceCard from '../components/PriceCard';
import ErrorMessage from '../components/ErrorMessage';
import LottieAnimation from '../components/LottieAnimation';
import carDrivingAnimation from '../assets/lotties/Car driving on road.json';

// Services
import { 
  estimatePrice, 
  getCurrentPosition,
  getRecentSearches,
  addRecentSearch,
  getShortcut,
  addEstimateToHistory,
  getCurrentWeather,
} from '../services';

// Constants
import { METEO_OPTIONS, HEURE_OPTIONS } from '../config/constants';

const WEATHER_ICONS = {
  0: SunIcon,
  2: CloudRain,
};

const TIME_ICONS = {
  'matin': Sunrise,
  'apres-midi': SunIcon,
  'soir': Sunset,
  'nuit': Moon,
};


export default function EstimatePageDesktop() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  
  // États principaux
  const [depart, setDepart] = useState(null);
  const [arrivee, setArrivee] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heure, setHeure] = useState('matin');
  const [route, setRoute] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [prediction, setPrediction] = useState(null);
  
  // États UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [shortcuts, setShortcuts] = useState({ home: null, work: null });

  // Initialisation
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      loadLocalData();
      setCurrentTimeSlot();
      
      try {
        const position = await getCurrentPosition({ timeout: 5000 });
        if (!mounted) return;
        
        setDepart({
          label: t('common.my_position'),
          coordinates: [position.coords.longitude, position.coords.latitude],
          type: 'current',
        });
        
        try {
          const weatherData = await getCurrentWeather(
            position.coords.latitude,
            position.coords.longitude
          );
          if (mounted && weatherData?.meteo !== undefined) {
            setMeteo(weatherData.meteo);
          }
        } catch (err) {
          // Silencieux
        }
      } catch (error) {
        // Silencieux
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);



  const loadLocalData = () => {
    const recent = getRecentSearches(5);
    setRecentSearches(recent);
    
    const homeShortcut = getShortcut('home');
    const workShortcut = getShortcut('work');
    setShortcuts({ home: homeShortcut, work: workShortcut });
  };

  const setCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setHeure('matin');
    } else if (hour >= 12 && hour < 17) {
      setHeure('apres-midi');
    } else if (hour >= 17 && hour < 21) {
      setHeure('soir');
    } else {
      setHeure('nuit');
    }
  };

  // Mise à jour markers
  useEffect(() => {
    const newMarkers = [];
    if (depart) {
      newMarkers.push({
        coordinates: depart.coordinates,
        type: 'depart',
        label: depart.label,
        color: '#3B82F6',
      });
    }
    if (arrivee) {
      newMarkers.push({
        coordinates: arrivee.coordinates,
        type: 'arrivee',
        label: arrivee.label,
        color: '#EF4444',
      });
    }
    setMarkers(newMarkers);
    
    // Tracer la route dès que les 2 points sont sélectionnés
    if (depart && arrivee) {
      const fetchRoute = async () => {
        try {
          const { getDirections } = await import('../services/mapboxService');
          const result = await getDirections([
            depart.coordinates,
            arrivee.coordinates,
          ], {
            profile: 'mapbox/driving-traffic',
            steps: true,
          });
          
          if (result?.routes?.[0]) {
            const route = result.routes[0];
            
            // Créer segments de congestion
            const congestionLevels = route.legs?.[0]?.annotation?.congestion || [];
            const coordinates = route.geometry.coordinates;
            
            console.log('🚦 Données congestion:', congestionLevels.length, 'segments pour', coordinates.length, 'points');
            
            const congestionSegments = [];
            if (congestionLevels.length > 0 && coordinates.length > 1) {
              congestionLevels.forEach((level, index) => {
                if (index < coordinates.length - 1) {
                  congestionSegments.push({
                    congestion: level,
                    coordinates: [coordinates[index], coordinates[index + 1]],
                  });
                }
              });
              
              console.log('✅ Segments créés:', congestionSegments.length);
              console.log('📊 Répartition:', {
                low: congestionSegments.filter(s => s.congestion === 'low').length,
                moderate: congestionSegments.filter(s => s.congestion === 'moderate').length,
                heavy: congestionSegments.filter(s => s.congestion === 'heavy').length,
                severe: congestionSegments.filter(s => s.congestion === 'severe').length,
              });
            } else if (coordinates.length > 1) {
              // Pas de données de congestion → créer des segments "unknown" (jaune)
              console.log('⚠️ Pas de données de trafic - Création segments "unknown"');
              for (let i = 0; i < coordinates.length - 1; i++) {
                congestionSegments.push({
                  congestion: 'unknown',
                  coordinates: [coordinates[i], coordinates[i + 1]],
                });
              }
              console.log('✅ Segments unknown créés:', congestionSegments.length);
            }
            
            // Calculer niveau dominant pour l'info box
            const congestionCounts = { low: 0, moderate: 0, heavy: 0, severe: 0, unknown: 0 };
            congestionLevels.forEach(level => {
              if (congestionCounts.hasOwnProperty(level)) {
                congestionCounts[level]++;
              } else {
                congestionCounts.unknown++;
              }
            });
            
            const dominantCongestion = congestionLevels.length > 0
              ? Object.keys(congestionCounts).reduce((a, b) => 
                  congestionCounts[a] > congestionCounts[b] ? a : b
                )
              : 'unknown';
            
            setRoute({
              coordinates: route.geometry.coordinates,
              distance: route.distance,
              duration: route.duration,
              congestion: congestionLevels.length > 0,
              congestion_level: dominantCongestion,
              congestion_segments: congestionSegments.length > 0 ? congestionSegments : null,
            });
            
            console.log('✅ Route tracée:', route.distance, 'm,', Math.round(route.duration / 60), 'min', '- Trafic dominant:', dominantCongestion);
          }
        } catch (error) {
          console.error('❌ Erreur tracé route:', error);
        }
      };
      
      fetchRoute();
    } else {
      setRoute(null);
    }
  }, [depart, arrivee]);

  const handleDepartSelect = (location) => {
    setDepart({
      label: location.place_name || location.label,
      coordinates: location.coordinates || [location.longitude, location.latitude],
      place_name: location.place_name,
    });
    addRecentSearch({
      label: location.place_name || location.label,
      coordinates: location.coordinates || [location.longitude, location.latitude],
      place_name: location.place_name,
      type: 'depart',
    });
  };

  const handleArriveeSelect = (location) => {
    setArrivee({
      label: location.place_name || location.label,
      coordinates: location.coordinates || [location.longitude, location.latitude],
      place_name: location.place_name,
    });
    addRecentSearch({
      label: location.place_name || location.label,
      coordinates: location.coordinates || [location.longitude, location.latitude],
      place_name: location.place_name,
      type: 'arrivee',
    });
  };

  const handleSuggestionClick = (suggestion, type) => {
    const location = {
      label: suggestion.label,
      coordinates: suggestion.coordinates,
      place_name: suggestion.place_name || suggestion.label,
    };
    
    if (type === 'depart') {
      handleDepartSelect(location);
    } else {
      handleArriveeSelect(location);
    }
  };

  const handleEstimate = async () => {
    if (!depart || !arrivee) {
      toast.error(t('messages.error_same_points')); // Use same points error as placeholder for missing points
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const requestData = {
        depart: {
          lat: depart.coordinates[1],
          lon: depart.coordinates[0],
        },
        arrivee: {
          lat: arrivee.coordinates[1],
          lon: arrivee.coordinates[0],
        },
        meteo: meteo,
        heure: heure,
      };

      const response = await estimatePrice(requestData);
      setPrediction(response);
      setShowResults(true);
      
      addEstimateToHistory({
        depart,
        arrivee,
        prediction: response,
      });

      if (response.details_trajet?.route_geometry) {
        setRoute({
          coordinates: response.details_trajet.route_geometry,
          color: '#3B82F6',
        });
      }
      
      toast.success(t('common.done'));
    } catch (err) {
      console.error('❌ Erreur estimation:', err);
      
      // Message spécifique pour erreur 401
      if (err.response?.status === 401) {
        setError(t('error.auth_title') + ": " + t('messages.error_api_key'));
        toast.error(t('error.auth_title'));
      } else {
        setError(err.response?.data?.detail || err.userMessage || t('error.unexpected'));
        toast.error(t('error.default_title'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f5]">
      {/* Carte - Gauche */}
      <div className="flex-1 relative">
        <MapView
          center={depart?.coordinates || [11.5021, 3.8480]}
          zoom={12}
          markers={markers}
          route={route}
          showControls={true}
          showGeolocate={true}
          className="absolute inset-0"
          height="100vh"
        />
        
        {/* Central switch en haut - Premium Glass */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/40"
          >
            <div className="flex gap-1">

              <button
                onClick={() => navigate('/estimate')}
                className="px-6 py-3 bg-linear-to-r from-yellow-400 to-yellow-500 text-[#231f0f] rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
              >
                <Calculator className="w-4 h-4" strokeWidth={3} />
                <span>{t('nav.estimate')}</span>
              </button>
              
              <button
                onClick={() => navigate('/add-trajet')}
                className="px-6 py-3 bg-transparent hover:bg-gray-100 text-gray-700 rounded-full font-bold text-sm flex items-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" strokeWidth={2.5} />
                <span>{t('nav.add')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sidebar - Droite */}
      <div className="w-[480px] bg-white shadow-2xl overflow-y-auto">
        <div className="p-6">
          {!showResults ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-black text-gray-700">
                    {t('predict.estimate_a_trip')}
                  </h2>
                  <LanguageSwitcher variant="dark" />
                </div>
                <p className="text-sm text-gray-600">
                  {t('estimate.subtitle')}
                </p>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                    <div className="w-0.5 h-8 bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <SearchBar
                      placeholder={t('estimate.label_from')}
                      onSelect={handleDepartSelect}
                      showCurrentLocation={true}
                      value={depart?.label || ''}
                    />
                    
                    <SearchBar
                      placeholder={t('estimate.label_to')}
                      onSelect={handleArriveeSelect}
                      value={arrivee?.label || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Raccourcis */}
              {(shortcuts.home || shortcuts.work) && (
                <div className="flex gap-3 mb-6">
                  {shortcuts.home && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(shortcuts.home, 'arrivee')}
                      className="flex-1 flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <Home className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-[#231f0f]">{t('common.home_shortcut')}</span>
                    </motion.button>
                  )}
                  
                  {shortcuts.work && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(shortcuts.work, 'arrivee')}
                      className="flex-1 flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-[#231f0f]">{t('common.work_shortcut')}</span>
                    </motion.button>
                  )}
                </div>
              )}

              {/* Recherches récentes */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    {t('estimate.recent')}
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        onClick={() => handleSuggestionClick(search, 'arrivee')}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                      >
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#231f0f] truncate">{search.label}</p>
                          {search.place_name && (
                            <p className="text-xs text-gray-500 truncate">{search.place_name}</p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Météo - Toggle moderne */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#231f0f]/70 mb-2">
                  {t('add.weather')}
                </label>
                <div className="flex gap-2 p-1 bg-[#f5f5f0] rounded-xl">
                  {METEO_OPTIONS.filter(o => [0, 2].includes(o.value)).map((option) => {
                    const Icon = WEATHER_ICONS[option.value] || SunIcon;
                    const isActive = meteo === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setMeteo(option.value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                          isActive
                            ? 'bg-white text-[#231f0f] shadow-md'
                            : 'text-[#8a8a60] hover:text-[#231f0f]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#f3cd08]' : ''}`} />
                        <span>{t(option.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Heure - Toggle moderne */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#231f0f]/70 mb-2">
                  {t('estimate.moment')}
                </label>
                <div className="grid grid-cols-4 gap-2 p-1 bg-[#f5f5f0] rounded-xl">
                  {HEURE_OPTIONS.map((slot) => {
                    const isActive = heure === slot.value;
                    
                    return (
                      <button
                        key={slot.value}
                        onClick={() => setHeure(slot.value)}
                        className={`py-3 px-2 rounded-lg font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-white text-[#231f0f] shadow-md'
                            : 'text-[#8a8a60] hover:text-[#231f0f]'
                        }`}
                      >
                        {t(slot.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bouton */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEstimate}
                disabled={!depart || !arrivee || isLoading}
                className="w-full py-4 bg-[#f3cd08] hover:bg-[#e0bc07] disabled:bg-gray-300 text-[#231f0f] disabled:text-gray-500 font-black text-lg rounded-2xl shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-12 h-12">
                      <LottieAnimation
                        animationData={carDrivingAnimation}
                        loop={true}
                        autoplay={true}
                      />
                    </div>
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6" />
                    {t('estimate.button')}
                  </>
                )}
              </motion.button>

              {error && (
                <div className="mt-4">
                  <ErrorMessage
                    error={error}
                    type="api"
                    variant="banner"
                    onRetry={handleEstimate}
                    onDismiss={() => setError(null)}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-[#231f0f]">
                    {t('common.result')}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowResults(false);
                      setPrediction(null);
                      setRoute(null);
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
                  >
                    {t('common.new_search')}
                  </motion.button>
                </div>

                <PriceCard
                  prediction={prediction}
                  onAddTrajet={() => navigate('/add-trajet', { 
                    state: { depart, arrivee, prediction } 
                  })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}