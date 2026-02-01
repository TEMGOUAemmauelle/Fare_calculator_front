
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    Search, MapPin, BarChart2, Globe, PlusCircle, ArrowRight, 
    Navigation, Calculator, Sun, CloudRain, MapPinned, Loader2, 
    Clock, Ruler, LocateFixed, ShieldCheck, Zap, Heart, Sparkles, X, History,
    Moon, Users, Car, Shield
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import PriceCard from '../components/PriceCard';
import CarouselAds from '../components/CarouselAds';
import ServiceAds from '../components/ServiceAds';
import CityIndicator from '../components/CityIndicator';
import MarketplaceSectionDesktop from '../components/MarketplaceSectionDesktop';
import Footer from '../components/Footer';
import QuickPriceModal from '../components/QuickPriceModal';
import EstimateSuccessModal from '../components/EstimateSuccessModal';
import RecentEstimatesModal from '../components/RecentEstimatesModal';
import SamePointsModal from '../components/SamePointsModal';
import NavbarDesktop from '../components/NavbarDesktop';
import showToast from '../utils/customToast';

// Services
import { estimatePrice } from '../services/estimateService';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';
import { getAds } from '../services/adService';
import { addEstimateToHistory } from '../services/localStorageService';
import { getTarifsStandards, getDefaultTarifs, getPeriodeFromHeure } from '../services/tarifService';

const HERO_IMAGE = "https://image.arrivalguides.com/x/09/589f0996b9fbebbbc00a573694086f3a.jpg";

// Skeleton pour l'image Hero
const HeroImageWithSkeleton = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="relative w-full h-[450px] xl:h-[650px]">
      {/* Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-2xl animate-pulse" />
              <div className="h-4 w-32 mx-auto bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-shimmer" />
        </div>
      )}
      
      {/* Image */}
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      
      {/* Fallback en cas d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f39908]/20 to-[#141414]/20 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-bold uppercase">{t('home.city_name')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const WEATHER_OPTIONS = [
  { value: 0, label_key: 'add.weather_sunny', icon: Sun },
  { value: 2, label_key: 'add.weather_rainy', icon: CloudRain },
];

const TIME_SLOTS = [
  { value: 'matin', label_key: 'constants.time.matin' },
  { value: 'apres-midi', label_key: 'constants.time.apres-midi' },
  { value: 'soir', label_key: 'constants.time.soir' },
  { value: 'nuit', label_key: 'constants.time.nuit' },
];

export default function HomePageDesktop() {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const estimationSectionRef = useRef(null);
  
  // State for estimation logic
  const [departPlace, setDepartPlace] = useState(null);
  const [arriveePlace, setArriveePlace] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heureTrajet, setHeureTrajet] = useState('matin');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [departQuery, setDepartQuery] = useState('');
  const [arriveeQuery, setArriveeQuery] = useState('');
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [backendAds, setBackendAds] = useState([]);
  const [showQuickPriceModal, setShowQuickPriceModal] = useState(false);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSamePointsModal, setShowSamePointsModal] = useState(false);
  const [tarifs, setTarifs] = useState(null);

  // Déterminer la période (jour/nuit) à partir de l'heure
  const periode = getPeriodeFromHeure(heureTrajet);
  const isNuit = periode === 'nuit';

  const arriveeInputRef = useRef(null);
  const departInputRef = useRef(null);

  const scrollToEstimation = () => {
    estimationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        if (!departPlace) departInputRef.current?.focus();
        else arriveeInputRef.current?.focus();
    }, 800);
  };

  const performGeolocation = async (isManual = false) => {
    setIsLocating(true);
    try {
        const pos = await geolocationService.getCurrentPosition();
        if (pos) {
            const addressLabel = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
            setDepartPlace({ label: addressLabel, longitude: pos.coords.longitude, latitude: pos.coords.latitude });
            setDepartQuery(addressLabel);
            setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            // Désactivé: ne plus afficher le toast de localisation réussie
            // showToast.success(t('estimate.locate_success'));
        }
    } catch (e) {
        // Afficher le toast d'échec seulement si c'est une action manuelle
        if (isManual) {
            showToast.error(t('estimate.locate_error'));
        }
    } finally {
        setIsLocating(false);
    }
  };

  useEffect(() => {
    performGeolocation();
    const fetchAds = async () => {
        const ads = await getAds();
        setBackendAds(ads.slice(0, 3));
    };
    fetchAds();
    
    // Charger les tarifs standards
    const fetchTarifs = async () => {
      try {
        const tarifsData = await getTarifsStandards();
        setTarifs(tarifsData);
      } catch (error) {
        console.error('Erreur chargement tarifs:', error);
        setTarifs(getDefaultTarifs());
      }
    };
    fetchTarifs();
  }, []);

  useEffect(() => {
    const newMarkers = [];
    if (departPlace) newMarkers.push({ coordinates: [departPlace.longitude, departPlace.latitude], type: 'depart', color: '#141414', label: departPlace.label });
    if (arriveePlace) newMarkers.push({ coordinates: [arriveePlace.longitude, arriveePlace.latitude], type: 'arrivee', color: '#f39908', label: arriveePlace.label });
    setMarkers(newMarkers);

    if (departPlace && arriveePlace) {
        const fetchRoute = async () => {
            const result = await getDirections(
                [[departPlace.longitude, departPlace.latitude], [arriveePlace.longitude, arriveePlace.latitude]],
                { profile: 'mapbox/driving-traffic' }
            );
            if (result?.routes?.[0]) {
                const r = result.routes[0];
                setRouteData({ coordinates: r.geometry.coordinates, congestion: true });
                setRouteStats({ 
                    distance: (r.distance / 1000).toFixed(1), 
                    duration: Math.round(r.duration / 60) 
                });
            }
        };
        fetchRoute();
    }
  }, [departPlace, arriveePlace]);

  const handleSelectSuggestion = (suggestion) => {
      const coords = suggestion.coordinates || [suggestion.longitude, suggestion.latitude];
      const selected = { label: suggestion.name, longitude: coords[0], latitude: coords[1] };
      if (activeSearchField === 'depart') { setDepartPlace(selected); setDepartQuery(suggestion.name); }
      else { setArriveePlace(selected); setArriveeQuery(suggestion.name); }
      setSuggestions([]); setActiveSearchField(null);
  };

  // Fonction pour vérifier si deux points sont identiques ou très proches
  const arePointsIdentical = (point1, point2, thresholdMeters = 50) => {
      if (!point1 || !point2) return false;
      
      // Vérifier par le label (nom du lieu)
      if (point1.label && point2.label && point1.label.trim().toLowerCase() === point2.label.trim().toLowerCase()) {
          return true;
      }
      
      // Vérifier par les coordonnées (distance < seuil)
      const lat1 = point1.latitude || point1.lat;
      const lon1 = point1.longitude || point1.lon;
      const lat2 = point2.latitude || point2.lat;
      const lon2 = point2.longitude || point2.lon;
      
      if (lat1 && lon1 && lat2 && lon2) {
          // Calcul approximatif de distance en mètres (formule haversine simplifiée)
          const R = 6371000; // Rayon de la Terre en mètres
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return distance < thresholdMeters;
      }
      
      return false;
  };

  const handleEstimate = async () => {
      if (!departPlace || !arriveePlace) return;
      
      // Vérification des points identiques
      if (arePointsIdentical(departPlace, arriveePlace)) {
          setShowSamePointsModal(true);
          return;
      }
      
      setIsLoading(true);
      try {
          const res = await estimatePrice({
              depart: { lat: departPlace.latitude, lon: departPlace.longitude },
              arrivee: { lat: arriveePlace.latitude, lon: arriveePlace.longitude },
              meteo, heure: heureTrajet
          });
          setPrediction(res);
                    addEstimateToHistory({
                        depart: { 
                            label: departPlace.label, 
                            latitude: departPlace.latitude, 
                            longitude: departPlace.longitude,
                            coordinates: [departPlace.longitude, departPlace.latitude],
                        },
                        arrivee: { 
                            label: arriveePlace.label, 
                            latitude: arriveePlace.latitude, 
                            longitude: arriveePlace.longitude,
                            coordinates: [arriveePlace.longitude, arriveePlace.latitude],
                        },
                        prediction: res,
                    });
          // Afficher le modal marketplace après une estimation réussie
          setTimeout(() => setShowMarketplaceModal(true), 500);
      } catch (e) { showToast.error(t('estimate.server_error')); }
      finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f39908]/30 overflow-x-hidden">
      
      {/* NAVBAR DESKTOP */}
      <NavbarDesktop 
        currentAddress={departQuery || t('home.city_name')} 
        showCityIndicator={true} 
      />

      {/* HERO SECTION */}
      <section className="relative pt-33 pb-12 px-12 min-h-[90vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gray-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">

                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl lg:text-6xl xl:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-[#141414]"
                >
                    {t('home.hero_title_1')} <br/>
                    <span className="text-transparent border-t-2 border-b-2 py-2 px-0 mb-2 inline-block " style={{ WebkitTextStroke: '2px #141414' }}>{t('home.hero_title_2')}</span><br/>
                    <span className="text-[#f39908]">{t('home.hero_title_3')}</span>
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-lg font-medium max-w-lg leading-relaxed"
                >
                    {t('home.description')}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={scrollToEstimation}
                    className="relative max-w-xl group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-[#f39908] rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="relative flex items-center gap-6 p-6 bg-white border-2 border-[#141414] rounded-3xl shadow-2xl shadow-gray-200/50 group-hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-[#141414] rounded-2xl flex items-center justify-center text-[#f39908] shrink-0">
                            <Search className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <span className="text-2xl font-black text-gray-300 italic group-hover:text-[#141414] transition-colors">{t('estimate.start_search')}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#f39908] group-hover:text-black transition-all">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative hidden lg:block"
            >
                <div className="absolute -inset-4 bg-gray-100 rounded-[4rem] -rotate-3 border-2 border-dashed border-gray-200" />
                <div className="relative rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white">
                    <HeroImageWithSkeleton src={HERO_IMAGE} alt="Taxi Cameroon" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#141414]/90 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/10 backdrop-blur-xl rounded-4xl border border-white/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#f39908] rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-tighter italic leading-none">{t('home.hero_badge_title')}</h4>
                                <p className="text-gray-300 text-[8px] font-bold uppercase tracking-widest mt-1">{t('home.hero_badge_subtitle')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute -top-10 -right-10 w-72 h-auto z-20">
                    <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                        <CarouselAds />
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* ADS STRIP - Services partenaires */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-12">
            <ServiceAds ads={backendAds} />
        </div>
      </section>

      {/* MARKETPLACE SECTION - Juste après ServiceAds */}
      <section className="py-20 px-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <MarketplaceSectionDesktop maxItems={4} showTitle={true} />
        </div>
      </section>

      {/* ESTIMATION SECTION */}
      <section ref={estimationSectionRef} className="py-32 px-12 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
                <div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
                        {t('estimate.title_section').split(' ').slice(0, 2).join(' ')} <br/>
                        <span className="text-[#f39908]">{t('estimate.title_section').split(' ').slice(2).join(' ')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">{t('estimate.drawer_description')}</p>
                </div>
                     <div className="flex items-center gap-4 lg:justify-end">
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="px-5 py-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-3 text-gray-400 hover:text-[#f39908] hover:border-[#f39908]/30 hover:bg-white transition-all"
                                title={t('nav.history')}
                            >
                                <div className="p-2 bg-white rounded-xl shadow-sm"><History className="w-5 h-5 text-[#f39908]" /></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{t('nav.history')}</span>
                            </button>
                            <div className="px-6 py-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Calculator className="w-5 h-5 text-[#f39908]" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{t('home.last_update')}</p>
                            <p className="text-xs font-black uppercase italic">{t('home.last_update_time')}</p>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="space-y-8 relative">
                            <div className="space-y-6 relative">
                                    <div className={`group relative p-6 rounded-3xl border-2 transition-all ${activeSearchField === 'depart' ? 'border-[#f39908] bg-white ring-8 ring-yellow-50' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100'}`}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-xl transition-colors ${activeSearchField === 'depart' ? 'bg-[#f39908] text-black' : 'bg-white text-gray-400'}`}>
                                                <Navigation className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('add.placeholder_from').split(' ')[0]}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <SearchBarEnhanced
                                                inputRef={departInputRef} value={departQuery} onChange={setDepartQuery}
                                                onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('depart'); }}
                                                onLoading={setIsSearching} placeholder={t('estimate.placeholder_from')}
                                                className="w-full text-xl font-black text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-200 truncate italic"
                                            />
                                            <button 
                                                type="button" onClick={() => performGeolocation(true)} disabled={isLocating}
                                                className="p-3 bg-white rounded-2xl shadow-md border border-gray-50 text-[#3b82f6] hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-4 relative z-10">
                                        <div className="p-3 bg-white border border-gray-50 rounded-2xl shadow-md">
                                            <ArrowRight className="w-4 h-4 text-gray-300 rotate-90" />
                                        </div>
                                    </div>

                                    <div className={`group relative p-6 rounded-3xl border-2 transition-all ${activeSearchField === 'arrivee' ? 'border-[#f39908] bg-white ring-8 ring-yellow-50' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100'}`}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-xl transition-colors ${activeSearchField === 'arrivee' ? 'bg-[#f39908] text-black' : 'bg-white text-gray-400'}`}>
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('add.placeholder_to').split(' ')[0]}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <SearchBarEnhanced
                                                inputRef={arriveeInputRef} value={arriveeQuery} onChange={setArriveeQuery}
                                                onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('arrivee'); }}
                                                onLoading={setIsSearching} placeholder={t('estimate.placeholder_to')}
                                                className="w-full text-2xl font-black text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-200 truncate italic"
                                            />
                                            {isSearching && <Loader2 className="w-5 h-5 text-[#f39908] animate-spin shrink-0" />}
                                        </div>
                                    </div>
                                    
                                    {/* SUGGESTIONS - directement sous les champs */}
                                    <AnimatePresence>
                                        {activeSearchField && suggestions.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -10 }} 
                                                className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[280px] overflow-y-auto"
                                            >
                                                <div className="p-2 space-y-1">
                                                    {suggestions.map((s, i) => (
                                                        <button key={i} onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-left group hover:bg-gray-50 transition-all">
                                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#f39908] group-hover:text-black shrink-0 transition-all"><MapPinned className="w-5 h-5"/></div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-black text-gray-900 truncate tracking-tight uppercase italic">{s.name}</span>
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase truncate tracking-widest">{s.place_formatted}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('add.weather')}</p>
                                        <div className="flex gap-3">
                                            {WEATHER_OPTIONS.map(opt => (
                                                <button key={opt.value} onClick={() => setMeteo(opt.value)} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${meteo === opt.value ? 'bg-[#141414] border-[#141414] text-white shadow-xl' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}>
                                                    <opt.icon className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{t(opt.label_key)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('estimate.moment')}</p>
                                        <div className="relative">
                                            <select value={heureTrajet} onChange={(e) => setHeureTrajet(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent hover:border-gray-100 rounded-2xl text-[10px] font-black p-5 outline-none uppercase text-gray-700 appearance-none cursor-pointer">
                                                {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{t(slot.label_key)}</option>)}
                                            </select>
                                            <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleEstimate} 
                                    className="w-full py-6 bg-[#f39908] text-black rounded-4xl font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group mt-4"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> {t('estimate.launch')} <div className="p-2 bg-black rounded-xl group-hover:rotate-12 transition-transform"><Calculator className="w-4 h-4 text-[#f39908]" /></div></>}
                                </button>
                            </div>

                            <AnimatePresence>
                                {/* Prediction removed from here */}
                            </AnimatePresence>

                    </div>

                    <div className="bg-[#141414] rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#f39908] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Heart className="w-8 h-8 text-[#f39908]" />
                            </div>
                            <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{t('add.share_fare')} <br/> <span className="text-[#f39908]">{t('add.fare')}</span></h4>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider leading-relaxed">{t('home.contribute_description')}</p>
                            <button onClick={() => navigate('/add-trajet')} className="w-fit px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f39908] transition-colors">{t('home.cta_contribute')}</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 h-[850px] sticky top-32 flex flex-col gap-6">
                    <div className="flex-1 rounded-[4rem] overflow-hidden border-8 border-gray-50 shadow-2xl relative">
                        <MapView center={mapCenter} markers={markers} route={routeData} showControls={true} />
                        
                        <AnimatePresence>
                            {routeStats && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-xl"><Ruler className="w-4 h-4 text-blue-500" /></div>
                                        <div>
                                            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{t('estimate.total_distance')}</p>
                                            <p className="text-base font-black">{routeStats.distance} km</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-50 rounded-xl"><Clock className="w-4 h-4 text-indigo-500" /></div>
                                        <div>
                                            <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{t('estimate.estimated_duration')}</p>
                                            <p className="text-base font-black">{routeStats.duration} min</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {prediction && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-6 left-6 z-20 bg-[#141414]/90 backdrop-blur-xl rounded-2xl p-4 text-white shadow-2xl border border-white/10"
                                >
                                    {/* Header compact */}
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                                        <div className="w-8 h-8 bg-[#f39908] rounded-lg flex items-center justify-center text-black">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black uppercase tracking-tight">{t('estimate.optimal_result')}</h4>
                                            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest">{t('estimate.ai_estimation')}</p>
                                        </div>
                                        <button onClick={() => setPrediction(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                                            <X className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                    </div>
                                    
                                    {/* Prix principal - Compact */}
                                    <div className="text-center mb-3">
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('price_card.estimated_price')}</p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-black">{prediction.prix_moyen?.toLocaleString('fr-FR')}</span>
                                            <span className="text-sm font-bold text-gray-400">{t('price_card.currency')}</span>
                                        </div>
                                        {prediction.prix_min && prediction.prix_max && (
                                            <div className="mt-1 inline-flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-gray-400">
                                                <span>{prediction.prix_min}</span>
                                                <div className="w-4 h-0.5 bg-gray-600 rounded-full" />
                                                <span>{prediction.prix_max}</span>
                                            </div>
                                        )}
                                        
                                        {/* Tarifs Standards - Directement sous le prix */}
                                        {tarifs && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <div className="flex items-center justify-center gap-1.5 mb-2">
                                                    <Shield className="w-3.5 h-3.5 text-[#f39908]" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('tarifs.title')}</span>
                                                    {isNuit && <Moon className="w-3 h-3 text-purple-400" />}
                                                </div>
                                                <div className="flex justify-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-gray-500 font-medium mb-0.5">{t('tarifs.taxi_label')}</p>
                                                        <p className="text-base font-black text-white">
                                                            {isNuit ? tarifs.tarif_taxi_nuit : tarifs.tarif_taxi_jour} <span className="text-[10px] text-gray-400">FCFA</span>
                                                        </p>
                                                    </div>
                                                    <div className="w-px bg-white/10" />
                                                    <div className="text-center">
                                                        <p className="text-[9px] text-gray-500 font-medium mb-0.5">{t('tarifs.course_label')}</p>
                                                        <p className="text-base font-black text-white">
                                                            {isNuit ? tarifs.tarif_course_nuit?.toLocaleString('fr-FR') : tarifs.tarif_course_jour?.toLocaleString('fr-FR')} <span className="text-[10px] text-gray-400">FCFA</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Trajet compact */}
                                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl mb-3">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#f39908]" />
                                            <div className="w-0.5 h-4 bg-gradient-to-b from-[#f39908] to-gray-600" />
                                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-bold text-white truncate">{prediction.details_trajet?.depart?.label || t('price_card.default_depart')}</p>
                                            <p className="text-[9px] font-bold text-gray-400 truncate">{prediction.details_trajet?.arrivee?.label || t('price_card.default_arrival')}</p>
                                        </div>
                                    </div>

                                    {/* Infos compactes en grille */}
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="p-2 bg-white/5 rounded-xl">
                                            <p className="text-[7px] font-bold uppercase tracking-wider text-gray-500">{t('price_card.reliability')}</p>
                                            <p className="text-xs font-black text-green-400">{(prediction.fiabilite * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-xl">
                                            <p className="text-[7px] font-bold uppercase tracking-wider text-gray-500">{t('price_card.status')}</p>
                                            <p className="text-xs font-black text-[#f39908] capitalize">{prediction.statut}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer variant="default" />
      
      {/* Quick Price Modal pour contribution rapide */}
      <QuickPriceModal
        isOpen={showQuickPriceModal}
        onClose={() => setShowQuickPriceModal(false)}
        trajetData={{
          depart: departPlace ? { lat: departPlace.latitude, lon: departPlace.longitude, label: departPlace.label } : null,
          arrivee: arriveePlace ? { lat: arriveePlace.latitude, lon: arriveePlace.longitude, label: arriveePlace.label } : null,
          meteo,
          heure: heureTrajet,
        }}
        onSuccess={() => {
          // Optionnel : refaire une estimation pour voir le nouveau prix
          setPrediction(null);
        }}
      />

      {/* Modal marketplace après estimation réussie */}
      <EstimateSuccessModal
        isOpen={showMarketplaceModal && !!prediction}
        onClose={() => setShowMarketplaceModal(false)}
        estimateData={prediction}
        heureTrajet={heureTrajet}
        departLabel={departPlace?.label}
        arriveeLabel={arriveePlace?.label}
      />

            {/* Modal Historique des estimations récentes */}
            <RecentEstimatesModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                onSelectEstimate={(estimate) => {
                    if (estimate.depart) {
                        setDepartPlace({
                            label: estimate.depart.label || estimate.depart.place_name,
                            longitude: estimate.depart.coordinates?.[0] || estimate.depart.lon,
                            latitude: estimate.depart.coordinates?.[1] || estimate.depart.lat,
                        });
                        setDepartQuery(estimate.depart.label || estimate.depart.place_name || '');
                    }
                    if (estimate.arrivee) {
                        setArriveePlace({
                            label: estimate.arrivee.label || estimate.arrivee.place_name,
                            longitude: estimate.arrivee.coordinates?.[0] || estimate.arrivee.lon,
                            latitude: estimate.arrivee.coordinates?.[1] || estimate.arrivee.lat,
                        });
                        setArriveeQuery(estimate.arrivee.label || estimate.arrivee.place_name || '');
                    }
                    scrollToEstimation();
                }}
            />

            {/* Modal points identiques */}
            <SamePointsModal
                isOpen={showSamePointsModal}
                onClose={() => setShowSamePointsModal(false)}
            />
    </div>
  );
}
