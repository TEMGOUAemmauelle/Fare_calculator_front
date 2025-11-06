/**
 * @fileoverview EstimatePageMobile - Version mobile CORRIGÉE
 * 
 * Corrections :
 * - Bottom sheet visible avec bon wrapper
 * - Pas d'emojis UI
 * - Toggles modernes
 * - Erreurs géolocalisation silencieuses
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Sun,
  CloudRain,
  TrendingUp,
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
  { value: 0, label: 'Ensoleillé', icon: Sun },
  { value: 2, label: 'Pluvieux', icon: CloudRain },
];

const TIME_SLOTS = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'nuit', label: 'Nuit' },
];

export default function EstimatePageMobile() {
  const navigate = useNavigate();
  
  const [departPlace, setDepartPlace] = useState(null);
  const [arriveePlace, setArriveePlace] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heureTrajet, setHeureTrajet] = useState('matin');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      setCurrentTimeSlot();
      
      try {
        const position = await getCurrentPosition({ timeout: 5000 });
        if (!mounted) return;
        
        const weatherData = await getCurrentWeather(
          position.coords.latitude,
          position.coords.longitude
        );
        
        if (mounted && weatherData?.meteo !== undefined) {
          setMeteo(weatherData.meteo);
        }
      } catch (error) {
        if (mounted) {
          setMeteo(0);
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

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
    
    if (departPlace && arriveePlace) {
      const centerLng = (departPlace.longitude + arriveePlace.longitude) / 2;
      const centerLat = (departPlace.latitude + arriveePlace.latitude) / 2;
      setMapCenter([centerLng, centerLat]);
      setMapZoom(13);
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

    setIsLoading(true);
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
      setError(err.response?.data?.detail || 'Impossible de calculer');
      toast.error('Erreur lors du calcul');
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

      {/* Bottom Sheet CORRIGÉ */}
      <Drawer.Root shouldScaleBackground={false}>
        <Drawer.Trigger asChild>
          <button className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#f3cd08] text-gray-700 rounded-full font-bold shadow-2xl z-10">
            Planifier un trajet
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-3xl h-[85vh] fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-white rounded-t-3xl flex-shrink-0">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
              <div className="max-w-md mx-auto">
                <Drawer.Title className="font-black text-2xl mb-6 text-gray-800">
                  Planifier un trajet
                </Drawer.Title>
                <Drawer.Description className="sr-only">
                  Formulaire pour estimer le prix d'un trajet en taxi
                </Drawer.Description>
              </div>
            </div>

            <div className="p-4 bg-white overflow-y-auto flex-1">
              <div className="max-w-md mx-auto">
                {!prediction ? (
                  <>
                    {/* Inputs */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-4 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                          <div className="w-0.5 h-12 bg-gray-300" />
                          <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                        </div>

                        <div className="flex-1 space-y-4">
                          <SearchBar
                            placeholder="Départ"
                            onSelect={handleDepartSelect}
                            showCurrentLocation={true}
                          />
                          
                          <SearchBar
                            placeholder="Arrivée"
                            onSelect={handleArriveeSelect}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Météo */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-[#231f0f]/70 mb-2">
                        Météo
                      </label>
                      <div className="flex gap-2 p-1 bg-[#f5f5f0] rounded-xl">
                        {WEATHER_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isActive = meteo === option.value;
                          
                          return (
                            <button
                              key={option.value}
                              onClick={() => setMeteo(option.value)}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                                isActive
                                  ? 'bg-white text-[#231f0f] shadow-md'
                                  : 'text-[#8a8a60]'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? 'text-[#f3cd08]' : ''}`} />
                              <span className="text-sm">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Heure */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-[#231f0f]/70 mb-2">
                        Tranche horaire
                      </label>
                      <div className="grid grid-cols-4 gap-2 p-1 bg-[#f5f5f0] rounded-xl">
                        {TIME_SLOTS.map((slot) => {
                          const isActive = heureTrajet === slot.value;
                          
                          return (
                            <button
                              key={slot.value}
                              onClick={() => setHeureTrajet(slot.value)}
                              className={`py-3 px-2 rounded-lg font-bold text-xs transition-all ${
                                isActive
                                  ? 'bg-white text-[#231f0f] shadow-md'
                                  : 'text-[#8a8a60]'
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bouton */}
                    <motion.button
                      onClick={handleEstimate}
                      disabled={!departPlace || !arriveePlace || isLoading}
                      className="w-full bg-[#f3cd08] hover:bg-[#e0bc07] disabled:bg-gray-300 text-[#231f0f] disabled:text-gray-500 py-4 rounded-full font-black text-lg shadow-xl disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-10 h-10">
                            <LottieAnimation 
                              animationData={carDrivingAnimation}
                              loop={true}
                              autoplay={true}
                            />
                          </div>
                          <span>Calcul...</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-6 h-6" />
                          <span>Estimer le tarif</span>
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
                          Résultat
                        </h2>
                        <button
                          onClick={() => {
                            setPrediction(null);
                            setRouteData(null);
                          }}
                          className="px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700"
                        >
                          Nouvelle recherche
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