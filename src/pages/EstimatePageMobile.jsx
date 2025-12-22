/**
 * @fileoverview EstimatePageMobile - Version mobile CORRIGÉE
 * 
 * Corrections :
 * - Bottom sheet visible avec bon wrapper
 * - Pas d'emojis UI
 * - Toggles modernes
 * - Erreurs géolocalisation silencieuses
 */

import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Sun,
  CloudRain,
  TrendingUp,
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

// Services
import { estimatePrice } from '../services/estimateService';
import { getCurrentPosition } from '../services/geolocationService';
import { getCurrentWeather } from '../services/weatherService';

// Assets
import carDrivingAnimation from '../assets/lotties/Car driving on road.json';

// Constants
const WEATHER_OPTIONS = [
  { value: 0, labelKey: 'constants.weather.0', icon: Sun },
  { value: 2, labelKey: 'constants.weather.2', icon: CloudRain },
];

const TIME_SLOTS = [
  { value: 'matin', labelKey: 'constants.time.matin' },
  { value: 'apres-midi', labelKey: 'constants.time.apres-midi' },
  { value: 'soir', labelKey: 'constants.time.soir' },
  { value: 'nuit', labelKey: 'constants.time.nuit' },
];

export default function EstimatePageMobile() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  
  const [departPlace, setDepartPlace] = useState(null);
  const [arriveePlace, setArriveePlace] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heureTrajet, setHeureTrajet] = useState('matin');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const drawerFirstFocusRef = useRef(null);
  const autoLocationAttemptedRef = useRef(false); // Utiliser ref au lieu de state pour éviter re-render
  const mountedRef = useRef(true); // Ref pour survivre aux StrictMode double-mount
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Reset mounted à true à chaque mount
    mountedRef.current = true;
    
    const init = async () => {
      setCurrentTimeSlot();
      
      // Ouvrir le drawer automatiquement dès l'arrivée sur la page
      setDrawerOpen(true);
      
      // Éviter double exécution (utiliser ref pour ne pas trigger de re-render)
      if (autoLocationAttemptedRef.current) return;
      autoLocationAttemptedRef.current = true;
      
      setIsLocating(true);

      try {
        // 1. Récupérer position et adresse (une seule demande de permission)
        const { getCurrentPositionWithAddress, checkGeolocationPermission } = await import('../services/geolocationService');
        
        // Vérifier permission (optionnel, getCurrentPosition le fait aussi mais permet message custom)
        try {
            const status = await checkGeolocationPermission();
            if (status === 'denied') {
                toast('Activez la localisation pour une saisie plus rapide', {
                    icon: '📍',
                    duration: 5000,
                });
                // On continue quand même au cas où
            }
        } catch (e) { /* ignore */ }

        const point = await getCurrentPositionWithAddress();
        
        console.log('📍 [EstimatePageMobile] Point retourné par getCurrentPositionWithAddress:', point);
        console.log('📍 [EstimatePageMobile] mountedRef.current:', mountedRef.current);

        if (!mountedRef.current) return;

        if (point) {
          console.log('📍 [EstimatePageMobile] Label obtenu:', point.label);
          
          // 2. Mettre à jour le lieu de départ
          setDepartPlace({
            label: point.label || 'Ma position',
            longitude: point.coords_longitude,
            latitude: point.coords_latitude,
          });
          
          console.log('📍 [EstimatePageMobile] departPlace mis à jour avec label:', point.label || 'Ma position');
          
          // Centrer carte
          setMapCenter([point.coords_longitude, point.coords_latitude]);
          setMapZoom(15);
          
          toast.success(t('estimate.detecting_location'));

          // 3. Récupérer météo avec ces coordonnées
          try {
            const weatherData = await getCurrentWeather(
              point.coords_latitude,
              point.coords_longitude
            );
            if (mountedRef.current && weatherData?.meteo !== undefined) {
              setMeteo(weatherData.meteo);
            }
          } catch (wErr) {
            console.warn('Météo auto échouée:', wErr);
            if (mountedRef.current) setMeteo(0); // Défaut
          }
        }
      } catch (error) {
        console.warn('Géolocalisation auto échouée:', error);
        if (mountedRef.current) setMeteo(0);
      } finally {
        if (mountedRef.current) setIsLocating(false);
      }
    };
    
    init();
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // Dépendances vides - s'exécute une seule fois au montage

  // NOTE: removed delayed mounting for Drawer to avoid timing issues
  // and layout jumps. Drawer is mounted immediately (like AddTrajetPage).

  const setCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    let slot = 'matin';
    
    if (hour >= 5 && hour < 12) slot = 'matin';
    else if (hour >= 12 && hour < 17) slot = 'apres-midi';
    else if (hour >= 17 && hour < 21) slot = 'soir';
    else slot = 'nuit';
    
    setHeureTrajet(slot);
  };

  useEffect(() => {
    const newMarkers = [];
    
    if (departPlace) {
      newMarkers.push({
        coordinates: [departPlace.longitude, departPlace.latitude],
        type: 'depart',
        color: '#3B82F6',
        label: departPlace.label || 'Départ',
      });
    }
    
    if (arriveePlace) {
      newMarkers.push({
        coordinates: [arriveePlace.longitude, arriveePlace.latitude],
        type: 'arrivee',
        color: '#EF4444',
        label: arriveePlace.label || 'Arrivée',
      });
    }
    
    setMarkers(newMarkers);
    
    // Calculer et tracer la route dès que les 2 points sont sélectionnés
    if (departPlace && arriveePlace) {
      const centerLng = (departPlace.longitude + arriveePlace.longitude) / 2;
      const centerLat = (departPlace.latitude + arriveePlace.latitude) / 2;
      setMapCenter([centerLng, centerLat]);
      setMapZoom(13);
      
      // Tracer la route avec Mapbox Directions API
      const fetchRoute = async () => {
        try {
          const { getDirections } = await import('../services/mapboxService');
          const result = await getDirections([
            [departPlace.longitude, departPlace.latitude],
            [arriveePlace.longitude, arriveePlace.latitude],
          ], {
            profile: 'mapbox/driving-traffic',
            steps: true,
          });
          
          if (result?.routes?.[0]) {
            const route = result.routes[0];
            
            // Extraire données de congestion par segment
            const congestionLevels = route.legs?.[0]?.annotation?.congestion || [];
            const coordinates = route.geometry.coordinates;
            
            console.log('🚦 Données congestion:', congestionLevels.length, 'segments pour', coordinates.length, 'points');
            
            // Créer segments colorés selon la congestion
            const congestionSegments = [];
            if (congestionLevels.length > 0 && coordinates.length > 1) {
              // Mapbox donne 1 niveau de congestion par segment (n-1 pour n points)
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
            
            // Calculer niveau dominant pour l'affichage dans l'info box
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
            
            setRouteData({
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
      setRouteData(null);
    }
  }, [departPlace, arriveePlace]);

  const handleDepartSelect = (location) => {
    setDepartPlace({
      label: location.label,
      longitude: location.coords?.[0] || location.longitude,
      latitude: location.coords?.[1] || location.latitude,
    });
  };

  const handleArriveeSelect = (location) => {
    setArriveePlace({
      label: location.label,
      longitude: location.coords?.[0] || location.longitude,
      latitude: location.coords?.[1] || location.latitude,
    });
  };

  const handleEstimate = async () => {
    if (!departPlace || !arriveePlace) {
      toast.error('Veuillez sélectionner départ et arrivée');
      return;
    }

    // Mettre isLoading à true de façon synchrone pour forcer le rendu
    // immédiat du loader et éviter le clignotement du formulaire.
    try {
      flushSync(() => setIsLoading(true));
    } catch (e) {
      // Si flushSync indisponible ou échoue, fallback classique
      setIsLoading(true);
    }
    setError(null);
    setPrediction(null);

    try {
      const result = await estimatePrice({
        depart: {
          lat: departPlace.latitude,
          lon: departPlace.longitude,
        },
        arrivee: {
          lat: arriveePlace.latitude,
          lon: arriveePlace.longitude,
        },
        meteo: meteo,
        heure: heureTrajet,
      });

      setPrediction(result);
      
      if (result.details_trajet?.route_geometry) {
        setRouteData({
          coordinates: result.details_trajet.route_geometry,
          color: '#3B82F6',
        });
      }

      toast.success('Estimation calculée');
    } catch (err) {
      console.error('❌ Erreur estimation:', err);
      
      // Message spécifique pour erreur 401
      if (err.response?.status === 401) {
        setError('Erreur d\'authentification avec le serveur. Vérifiez la configuration backend (CORS).');
        toast.error('Erreur d\'authentification serveur');
      } else {
        setError(err.response?.data?.detail || err.userMessage || 'Impossible de calculer');
        toast.error('Erreur lors du calcul');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f8f8f5]">
      {/* Carte plein écran */}
      <div className="absolute inset-0">
        <MapView
          center={mapCenter}
          zoom={mapZoom}
          markers={markers}
          route={routeData}
          showControls={true}
          showGeolocate={true}
          className="w-full h-full"
        />
      </div>

      {/* Switch élégant en haut au centre - Premium Glass */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-fit">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-1.5 bg-white/80 backdrop-blur-xl border border-white/40 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <button
            onClick={() => navigate('/estimate')}
            className="px-6 py-2.5 bg-[#f3cd08] text-[#0a0a0a] rounded-full font-black text-xs uppercase tracking-wide flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" strokeWidth={3} />
            <span>{t('nav.estimate')}</span>
          </button>
          
          <button
            onClick={() => navigate('/add-trajet')}
            className="px-6 py-2.5 bg-transparent hover:bg-black/5 text-gray-500 rounded-full font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>{t('nav.add')}</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Sheet CORRIGÉ */}
      <Drawer.Root
        shouldScaleBackground={false}
        modal={true}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          // Quand le drawer s'ouvre, focuser un élément interne pour éviter
          // que le trigger conserve le focus et déclenche l'avertissement
          // aria-hidden (élément caché avec focus). On utilise un petit
          // élément sr-only pour faire le transfert de focus.
          if (open) {
            setTimeout(() => {
              try {
                // blur l'élément actif (le trigger) pour éviter le blocage
                if (document.activeElement && typeof document.activeElement.blur === 'function') {
                  document.activeElement.blur();
                }
              } catch (e) {
                // noop
              }
              drawerFirstFocusRef.current?.focus();
            }, 50);
          }
        }}
        >
        <Drawer.Trigger asChild>
          <button 
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#f3cd08] text-gray-700 rounded-full font-bold shadow-2xl z-20 ${drawerOpen ? 'hidden' : ''}`}
            aria-label={t('predict.estimate_a_trip')}
          >
            {t('predict.estimate_a_trip')}
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content 
            className="bg-white flex flex-col rounded-t-3xl h-auto max-h-[85vh] fixed bottom-0 left-0 right-0 z-50"
            aria-describedby="drawer-description"
          >
            <div className="p-5 bg-white rounded-t-[2.5rem] flex-shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="mx-auto w-12 h-1 bg-gray-200 rounded-full mb-8" />
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <Drawer.Title className="font-black text-2xl text-[#0a0a0a] tracking-tight">
                    {t('estimate.title')}
                  </Drawer.Title>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/trajets')}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      {t('estimate.community_trips')}
                    </button>
                    <LanguageSwitcher variant="dark" />
                  </div>
                </div>
                <p id="drawer-description" className="sr-only">
                  {t('estimate.drawer_description')}
                </p>
                {/* Élément focalisable caché : reçoit le focus à l'ouverture */}
                <div id="drawer-first-focus" ref={drawerFirstFocusRef} tabIndex={-1} className="sr-only" />
              </div>
            </div>

            <div className="p-4 bg-white overflow-y-auto flex-1">
              <div className="max-w-md mx-auto">
                {!prediction ? (
                  <>
                    {/* Inputs - Journey Card Style */}
                    <div className="mb-8 p-4 bg-gray-50/80 rounded-3xl border border-gray-100">
                      <div className="flex items-start gap-4">
                        {/* Timeline Visual */}
                        <div className="flex flex-col items-center pt-3 flex-shrink-0 h-full gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a]" />
                          <div className="w-0.5 h-10 bg-gray-200 rounded-full" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#f3cd08] ring-4 ring-[#f3cd08]/20" />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="relative">
                            <span className="absolute -top-2 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-wider">{t('estimate.label_from')}</span>
                            <SearchBar
                              placeholder={t('estimate.placeholder_from')}
                              onSelect={handleDepartSelect}
                              showCurrentLocation={true}
                              value={departPlace?.label || ''}
                              externalLoading={isLocating}
                              className="bg-transparent border-none p-0 focus:ring-0 text-[#0a0a0a] font-bold placeholder:text-gray-300"
                            />
                          </div>
                          
                          <div className="h-px w-full bg-gray-200" />

                          <div className="relative">
                             <span className="absolute -top-2 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-wider">{t('estimate.label_to')}</span>
                             <SearchBar
                              placeholder={t('estimate.placeholder_to')}
                              onSelect={handleArriveeSelect}
                              value={arriveePlace?.label || ''}
                              className="bg-transparent border-none p-0 focus:ring-0 text-[#0a0a0a] font-bold placeholder:text-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                     {/* Options Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Météo */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            {t('estimate.conditions')}
                          </label>
                          <div className="flex flex-col gap-2">
                            {WEATHER_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isActive = meteo === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => setMeteo(option.value)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                                    isActive
                                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-lg'
                                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f3cd08]' : 'text-gray-300'}`} />
                                  <span className="text-xs font-bold">{t(option.labelKey)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Heure */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                            {t('estimate.moment')}
                          </label>
                         <div className="grid grid-cols-1 gap-2">
                           {TIME_SLOTS.map((slot) => {
                             const isActive = heureTrajet === slot.value;
                             return (
                               <button
                                 key={slot.value}
                                 onClick={() => setHeureTrajet(slot.value)}
                                 className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                                   isActive
                                     ? 'bg-[#f3cd08] border-[#f3cd08] text-black shadow-md shadow-[#f3cd08]/20'
                                     : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                 }`}
                               >
                                 {t(slot.labelKey)}
                               </button>
                             );
                           })}
                         </div>
                       </div>
                    </div>

                    {/* Bouton Principal - Refined */}
                    <motion.button
                      onClick={handleEstimate}
                      disabled={!departPlace || !arriveePlace || isLoading}
                      className="w-full bg-[#0a0a0a] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:shadow-none transition-all flex items-center justify-center gap-3"
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-white/80">{t('estimate.calculating')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('estimate.launch')}</span>
                          <div className="w-6 h-6 bg-[#f3cd08] rounded-full flex items-center justify-center text-black">
                             <TrendingUp className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                        </>
                      )}
                    </motion.button>

                    {error && (
                      <div className="mt-6">
                        <ErrorMessage
                          error={error}
                          onRetry={handleEstimate}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-[#231f0f]">
                          {t('estimate.result')}
                        </h2>
                        <button
                          onClick={() => {
                            setPrediction(null);
                            setRouteData(null);
                          }}
                          className="px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700"
                        >
                          {t('estimate.new_search')}
                        </button>
                      </div>

                      <PriceCard
                        prediction={prediction}
                        onAddTrajet={() => navigate('/add-trajet')}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}