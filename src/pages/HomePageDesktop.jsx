
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    Search, MapPin, BarChart2, Globe, PlusCircle, ArrowRight, 
    Navigation, Calculator, Sun, CloudRain, MapPinned, Loader2, 
    Clock, Ruler, LocateFixed, ShieldCheck, Zap, Heart
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import PriceCard from '../components/PriceCard';
import CarouselAds from '../components/CarouselAds';
import LanguageSwitcher from '../components/LanguageSwitcher';
import showToast from '../utils/customToast';

// Services
import { estimatePrice } from '../services/estimateService';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';
import { getAds } from '../services/adService';

const HERO_IMAGE = "https://image.arrivalguides.com/x/09/589f0996b9fbebbbc00a573694086f3a.jpg";

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

  const arriveeInputRef = useRef(null);
  const departInputRef = useRef(null);

  const scrollToEstimation = () => {
    estimationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        if (!departPlace) departInputRef.current?.focus();
        else arriveeInputRef.current?.focus();
    }, 800);
  };

  const performGeolocation = async () => {
    setIsLocating(true);
    try {
        const pos = await geolocationService.getCurrentPosition();
        if (pos) {
            const addressLabel = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
            setDepartPlace({ label: addressLabel, longitude: pos.coords.longitude, latitude: pos.coords.latitude });
            setDepartQuery(addressLabel);
            setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            showToast.success(t('estimate.locate_success'));
        }
    } catch (e) {
        showToast.error(t('estimate.locate_error'));
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
  }, []);

  useEffect(() => {
    const newMarkers = [];
    if (departPlace) newMarkers.push({ coordinates: [departPlace.longitude, departPlace.latitude], type: 'depart', color: '#141414', label: departPlace.label });
    if (arriveePlace) newMarkers.push({ coordinates: [arriveePlace.longitude, arriveePlace.latitude], type: 'arrivee', color: '#f3cd08', label: arriveePlace.label });
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

  const handleEstimate = async () => {
      if (!departPlace || !arriveePlace) return;
      setIsLoading(true);
      try {
          const res = await estimatePrice({
              depart: { lat: departPlace.latitude, lon: departPlace.longitude },
              arrivee: { lat: arriveePlace.latitude, lon: arriveePlace.longitude },
              meteo, heure: heureTrajet
          });
          setPrediction(res);
      } catch (e) { showToast.error(t('estimate.server_error')); }
      finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      
      {/* NAVBAR DESKTOP */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none italic cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                    FARE<span className="text-[#f3cd08]">CALC</span>
                </h1>
                <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
            </div>

            <div className="hidden lg:flex items-center gap-8">
                <button onClick={() => navigate('/trajets')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('all_trajets.title')}</button>
                <button onClick={() => navigate('/stats')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('stats.dashboard')}</button>
                <button onClick={() => navigate('/services')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('partners.title')}</button>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="bg-gray-50 rounded-2xl p-1">
                <LanguageSwitcher variant="dark" />
            </div>
            <button 
                onClick={() => navigate('/add-trajet')}
                className="px-6 py-3 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
                <PlusCircle className="w-4 h-4 text-[#f3cd08]" />
                {t('home.cta_contribute')}
            </button>
        </div>
      </nav>

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
                    <span className="text-[#f3cd08]">{t('home.hero_title_3')}</span>
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
                    <div className="absolute inset-0 bg-[#f3cd08] rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="relative flex items-center gap-6 p-6 bg-white border-2 border-[#141414] rounded-3xl shadow-2xl shadow-gray-200/50 group-hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-[#141414] rounded-2xl flex items-center justify-center text-[#f3cd08] shrink-0">
                            <Search className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <span className="text-2xl font-black text-gray-300 italic group-hover:text-[#141414] transition-colors">{t('estimate.start_search')}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black transition-all">
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
                    <img src={HERO_IMAGE} className="w-full h-[450px] xl:h-[650px] object-cover" alt="Taxi Cameroon" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#141414]/90 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/10 backdrop-blur-xl rounded-4xl border border-white/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#f3cd08] rounded-2xl flex items-center justify-center">
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

      {/* ADS STRIP */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-12">
            <div className="flex flex-col items-center mb-12 text-center">
                <span className="text-[10px] font-black text-[#f3cd08] uppercase tracking-[0.3em] mb-4">{t('partners.special_offer')}</span>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">{t('partners.discover_partners')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {backendAds.map((ad, i) => (
                    <div key={ad.id || i} className="group relative bg-white rounded-4xl p-8 border border-white shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#f3cd08] transition-colors shrink-0 overflow-hidden">
                                {ad.image_url ? (
                                    <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Zap className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                )}
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">{i18n.language === 'en' ? (ad.title_en || ad.title) : ad.title}</h4>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8 flex-1">
                                {i18n.language === 'en' ? (ad.description_en || ad.description) : ad.description}
                            </p>
                            <a href={ad.app_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#f3cd08] group-hover:underline">
                                {t('partners.see_offers')} <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ESTIMATION SECTION */}
      <section ref={estimationSectionRef} className="py-32 px-12 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
                <div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">
                        {t('estimate.title_section').split(' ').slice(0, 2).join(' ')} <br/>
                        <span className="text-[#f3cd08]">{t('estimate.title_section').split(' ').slice(2).join(' ')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">{t('estimate.drawer_description')}</p>
                </div>
                <div className="flex items-center gap-4 lg:justify-end">
                     <div className="px-6 py-4 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Calculator className="w-5 h-5 text-[#f3cd08]" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Dernière mise à jour</p>
                            <p className="text-xs font-black uppercase italic">Aujourd'hui à 14:30</p>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        {prediction ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t('estimate.result_title')}</h3>
                                    <button onClick={() => setPrediction(null)} className="px-5 py-2.5 bg-gray-50 rounded-xl text-[9px] font-black text-gray-400 uppercase hover:bg-black hover:text-white transition-all">{t('estimate.recalculate')}</button>
                                </div>
                                <PriceCard prediction={prediction} onAddTrajet={() => navigate('/add-trajet')} />
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className={`group relative p-6 rounded-3xl border-2 transition-all ${activeSearchField === 'depart' ? 'border-[#f3cd08] bg-white ring-8 ring-yellow-50' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100'}`}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-xl transition-colors ${activeSearchField === 'depart' ? 'bg-[#f3cd08] text-black' : 'bg-white text-gray-400'}`}>
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
                                                type="button" onClick={performGeolocation} disabled={isLocating}
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

                                    <div className={`group relative p-6 rounded-3xl border-2 transition-all ${activeSearchField === 'arrivee' ? 'border-[#f3cd08] bg-white ring-8 ring-yellow-50' : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-100'}`}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-xl transition-colors ${activeSearchField === 'arrivee' ? 'bg-[#f3cd08] text-black' : 'bg-white text-gray-400'}`}>
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
                                            {isSearching && <Loader2 className="w-5 h-5 text-[#f3cd08] animate-spin shrink-0" />}
                                        </div>
                                    </div>
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
                                                {TIME_SLOTS.map(slot => <option key={slot.value} value={t(slot.label_key)}>{t(slot.label_key)}</option>)}
                                            </select>
                                            <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {activeSearchField && suggestions.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-20 w-[400px] mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                                            <div className="p-2 space-y-1">
                                                {suggestions.map((s, i) => (
                                                    <button key={i} onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-left group hover:bg-gray-50 transition-all">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black shrink-0 transition-all"><MapPinned className="w-5 h-5"/></div>
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

                                <button 
                                    onClick={handleEstimate} 
                                    className="w-full py-6 bg-[#f3cd08] text-black rounded-4xl font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group mt-4"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> {t('estimate.launch')} <div className="p-2 bg-black rounded-xl group-hover:rotate-12 transition-transform"><Calculator className="w-4 h-4 text-[#f3cd08]" /></div></>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#141414] rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#f3cd08] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Heart className="w-8 h-8 text-[#f3cd08]" />
                            </div>
                            <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{t('add.share_fare')} <br/> <span className="text-[#f3cd08]">{t('add.fare')}</span></h4>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider leading-relaxed">Aidez-nous à rendre les estimations encore plus précises en partageant vos derniers trajets.</p>
                            <button onClick={() => navigate('/add-trajet')} className="w-fit px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f3cd08] transition-colors">{t('home.cta_contribute')}</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 h-[850px] sticky top-32 flex flex-col gap-6">
                    <div className="flex-1 rounded-[4rem] overflow-hidden border-8 border-gray-50 shadow-2xl relative">
                        <MapView center={mapCenter} markers={markers} route={routeData} showControls={true} />
                        
                        <AnimatePresence>
                            {routeStats && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute bottom-10 left-10 p-8 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white flex flex-col gap-6 min-w-[240px]">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-2xl"><Ruler className="w-6 h-6 text-blue-500" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Distance Totale</p>
                                            <p className="text-2xl font-black italic">{routeStats.distance} km</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-gray-100" />
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl"><Clock className="w-6 h-6 text-indigo-500" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Durée Estimée</p>
                                            <p className="text-2xl font-black italic">{routeStats.duration} min</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {prediction && (
                             <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                className="bg-[#141414] rounded-4xl p-8 text-white shadow-2xl border border-white/10"
                             >
                                <div className="flex items-center justify-between mb-6">
                                     <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 bg-[#f3cd08] rounded-2xl flex items-center justify-center text-black">
                                             <Sparkles className="w-6 h-6" />
                                         </div>
                                         <div>
                                             <h4 className="text-xl font-black italic uppercase tracking-tighter">Résultat Optimal</h4>
                                             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Estimation IA complète</p>
                                         </div>
                                     </div>
                                     <button onClick={() => setPrediction(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Nouveau Calcul</button>
                                </div>
                                <PriceCard prediction={prediction} onAddTrajet={() => navigate('/add-trajet')} variant="desktop" />
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </section>

      <footer className="py-20 bg-[#141414] text-white">
        <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="md:col-span-2 space-y-8">
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">FARE<span className="text-[#f3cd08]">CALC.</span></h1>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">L'outil ultime pour estimer et partager les tarifs de taxi au Cameroun.</p>
                <div className="flex gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 hover:bg-[#f3cd08] hover:text-black transition-all cursor-pointer flex items-center justify-center text-gray-400"><Globe className="w-5 h-5"/></div>)}
                </div>
            </div>
            <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Produit</h5>
                <ul className="space-y-4">
                    <li><button onClick={() => navigate('/estimate')} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Calculateur</button></li>
                    <li><button onClick={() => navigate('/stats')} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Statistiques</button></li>
                </ul>
            </div>
            <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Légal</h5>
                <ul className="space-y-4">
                    <li><button className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Confidentialité</button></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-12 pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© 2025 Fare Calc. Made with ❤️ in Cameroon.</p>
        </div>
      </footer>
    </div>
  );
}
