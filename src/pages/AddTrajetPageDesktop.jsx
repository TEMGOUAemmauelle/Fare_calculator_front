
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import NavbarDesktop from '../components/NavbarDesktop';
import { 
  MapPin, Navigation, Sun, CloudRain, Loader2, Calculator, PlusCircle, ArrowLeft, ThumbsDown, ThumbsUp, Ruler, Clock, MapPinned, LocateFixed, Zap, Sparkles, Heart
} from 'lucide-react';
import showToast from '../utils/customToast';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import ContributionSuccessModal from '../components/ContributionSuccessModal';

// Services
import { addTrajet } from '../services';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

const HEURE_SLOTS = [
  { value: 'matin', label_key: 'constants.time.matin' },
  { value: 'apres-midi', label_key: 'constants.time.apres-midi' },
  { value: 'soir', label_key: 'constants.time.soir' },
  { value: 'nuit', label_key: 'constants.time.nuit' },
];

export default function AddTrajetPageDesktop() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    price: '',
    meteo: 0,
    heure: 'matin',
    qualite: 5,
    depart: null,
    arrivee: null
  });

  const [departQuery, setDepartQuery] = useState('');
  const [arriveeQuery, setArriveeQuery] = useState('');
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastContribution, setLastContribution] = useState(null);
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeStats, setRouteStats] = useState(null);

  const departInputRef = useRef(null);
  const arriveeInputRef = useRef(null);

  const performGeolocation = async () => {
    setIsLocating(true);
    try {
        const pos = await geolocationService.getCurrentPosition();
        if (pos) {
            const address = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
            const loc = { label: address, longitude: pos.coords.longitude, latitude: pos.coords.latitude };
            setFormData(prev => ({ ...prev, depart: loc }));
            setDepartQuery(address);
            setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            showToast.success(t('add.locate_success_alt'));
        }
    } catch (e) {
        showToast.error(t('add.locate_error_alt'));
    } finally {
        setIsLocating(false);
    }
  };

  useEffect(() => {
    if (location.state?.depart && location.state?.arrivee) {
        setFormData(prev => ({
            ...prev,
            depart: location.state.depart,
            arrivee: location.state.arrivee
        }));
        setDepartQuery(location.state.depart.label);
        setArriveeQuery(location.state.arrivee.label);
    } else {
        performGeolocation();
    }

    const hour = new Date().getHours();
    let slot = 'matin';
    if (hour >= 12 && hour < 17) slot = 'apres-midi';
    else if (hour >= 17 && hour < 21) slot = 'soir';
    else if (hour >= 21 || hour < 5) slot = 'nuit';
    setFormData(prev => ({ ...prev, heure: slot }));
  }, [location.state]);

  useEffect(() => {
    const newMarkers = [];
    if (formData.depart) newMarkers.push({ coordinates: [formData.depart.longitude, formData.depart.latitude], type: 'depart', color: '#141414', label: formData.depart.label });
    if (formData.arrivee) newMarkers.push({ coordinates: [formData.arrivee.longitude, formData.arrivee.latitude], type: 'arrivee', color: '#f3cd08', label: formData.arrivee.label });
    setMarkers(newMarkers);

    if (formData.depart && formData.arrivee) {
        const fetchRoute = async () => {
            const result = await getDirections(
                [[formData.depart.longitude, formData.depart.latitude], [formData.arrivee.longitude, formData.arrivee.latitude]],
                { profile: 'mapbox/driving-traffic' }
            );
            if (result?.routes?.[0]) {
                const r = result.routes[0];
                setRouteData({ coordinates: r.geometry.coordinates, congestion: true });
                setRouteStats({ distance: (r.distance/1000).toFixed(1), duration: Math.round(r.duration/60) });
            }
        };
        fetchRoute();
    }
  }, [formData.depart, formData.arrivee]);

  const handleSelectSuggestion = (suggestion) => {
    const coords = suggestion.coordinates || [suggestion.longitude, suggestion.latitude];
    const selected = { label: suggestion.name, longitude: coords[0], latitude: coords[1] };
    if (activeSearchField === 'depart') {
        setFormData(prev => ({ ...prev, depart: selected }));
        setDepartQuery(suggestion.name);
        setTimeout(() => arriveeInputRef.current?.focus(), 100);
    } else {
        setFormData(prev => ({ ...prev, arrivee: selected }));
        setArriveeQuery(suggestion.name);
    }
    setSuggestions([]);
    setActiveSearchField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.price || !formData.depart || !formData.arrivee) {
        showToast.error(t('add.form_incomplete'));
        return;
    }
    setIsLoading(true);
    try {
        const payload = {
            point_depart: { coords_latitude: formData.depart.latitude, coords_longitude: formData.depart.longitude, label: formData.depart.label },
            point_arrivee: { coords_latitude: formData.arrivee.latitude, coords_longitude: formData.arrivee.longitude, label: formData.arrivee.label },
            prix: parseFloat(formData.price),
            meteo: formData.meteo,
            heure: formData.heure,
            qualite_trajet: formData.qualite
        };
        await addTrajet(payload);
        
        // Sauvegarder les données de contribution pour le modal
        setLastContribution({
          depart: formData.depart,
          arrivee: formData.arrivee,
          prix: parseFloat(formData.price),
          distance: routeStats?.distance,
        });
        
        setShowSuccessModal(true);
    } catch (err) {
        showToast.error(t('add.add_error'));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/add-trajet" />

      <main className="pt-32 pb-20 px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT COLUMN: FORM */}
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-100">
                        <Heart className="w-4 h-4 text-[#f3cd08]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Community Power</span>
                    </div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                        {t('add.share_fare')} <br/>
                        <span className="text-[#f3cd08]">{t('add.fare')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                        {t('add.drawer_description') || "Partagez votre dernier trajet pour aider la communauté à obtenir des estimations plus précises."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
                    <div className="space-y-6">
                        {/* DEPART */}
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
                                    onLoading={setIsSearching} placeholder={t('add.placeholder_from')}
                                    className="w-full text-xl font-black text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-200 italic"
                                />
                                <button 
                                    type="button" onClick={performGeolocation} disabled={isLocating}
                                    className="p-3 bg-white rounded-2xl shadow-md border border-gray-50 text-[#3b82f6] hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* ARRIVEE */}
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
                                    onLoading={setIsSearching} placeholder={t('add.placeholder_to')}
                                    className="w-full text-xl font-black text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-200 italic"
                                />
                                {activeSearchField === 'arrivee' && isSearching && <Loader2 className="w-5 h-5 text-[#f3cd08] animate-spin" />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* PRICE */}
                        <div className="p-6 rounded-4xl bg-yellow-50/50 border-2 border-yellow-100 flex flex-col gap-2">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest pl-1">{t('add.price_paid_label')}</span>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0" className="flex-1 text-4xl font-black text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-yellow-200 tabular-nums"
                                />
                                <span className="text-xl font-black text-amber-400 uppercase">{t('add.currency_label')}</span>
                            </div>
                        </div>

                        {/* WEATHER & TIME */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('add.weather')}</p>
                                <div className="flex gap-3">
                                    {[{v:0, i:Sun, l:t('add.weather_sunny')}, {v:2, i:CloudRain, l:t('add.weather_rainy')}].map(opt => (
                                        <button key={opt.v} type="button" onClick={() => setFormData({...formData, meteo: opt.v})} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.meteo === opt.v ? 'bg-[#141414] border-[#141414] text-white shadow-xl' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}>
                                            <opt.i className="w-5 h-5" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{opt.l}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{t('estimate.moment')}</p>
                                <div className="relative">
                                    <select value={formData.heure} onChange={(e) => setFormData({...formData, heure: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent hover:border-gray-100 rounded-2xl text-[10px] font-black p-5 outline-none uppercase text-gray-700 appearance-none cursor-pointer">
                                        {HEURE_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{t(slot.label_key)}</option>)}
                                    </select>
                                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* QUALITY */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('add.quality_label')}</p>
                                <div className="px-4 py-1.5 bg-[#f3cd08] text-black rounded-full font-black text-xs italic tabular-nums shadow-lg shadow-yellow-500/20">{formData.qualite}/10</div>
                            </div>
                            <div className="relative pt-2">
                                <input 
                                    type="range" min="1" max="10" value={formData.qualite} 
                                    onChange={(e) => setFormData({...formData, qualite: parseInt(e.target.value)})}
                                    className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#f3cd08]"
                                />
                                <div className="flex justify-between px-1 mt-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <ThumbsDown className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Poor</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Excellent</span>
                                        <ThumbsUp className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={isLoading}
                        className="w-full py-6 bg-[#141414] text-white rounded-4xl font-black text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-black/10 flex items-center justify-center gap-4 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[#f3cd08]" /> : <> {t('common.confirm')} <PlusCircle className="w-5 h-5 text-[#f3cd08] group-hover:rotate-90 transition-transform" /> </>}
                    </button>
                </form>

                {/* SUGGESTIONS POPUP (PORTAL-LIKE) */}
                <AnimatePresence>
                    {activeSearchField && suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed z-60 w-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden" style={{ top: activeSearchField === 'depart' ? '300px' : '480px', left: '100px' }}>
                            <div className="p-3 space-y-1">
                                {suggestions.map((s, i) => (
                                    <button key={i} onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-left group hover:bg-gray-50 transition-all">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black shrink-0 transition-all"><MapPinned className="w-5 h-5"/></div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-black text-gray-900 truncate tracking-tight uppercase italic">{s.name}</span>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase truncate tracking-widest">{s.place_formatted}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: MAP & STATS */}
            <div className="lg:col-span-7 h-[850px] sticky top-32 flex flex-col gap-8">
                <div className="flex-1 rounded-[4rem] overflow-hidden border-8 border-gray-50 shadow-2xl relative bg-gray-100">
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

                <div className="bg-[#141414] rounded-4xl p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f3cd08] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#f3cd08]" />
                            </div>
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{t('add.contribution_title')}</h4>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest max-w-xs">{t('add.contribution_description')}</p>
                        </div>
                        <div className="hidden xl:block">
                             <div className="text-center">
                                <span className="text-5xl font-black italic text-[#f3cd08] tabular-nums">850+</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{t('add.active_contributors')}</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Modal de succès enrichi avec marketplace */}
      <ContributionSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => { 
          setShowSuccessModal(false);
        }}
        contributionData={lastContribution}
      />
    </div>
  );
}
