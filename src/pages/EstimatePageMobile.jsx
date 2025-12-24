
/**
 * @fileoverview EstimatePageMobile - Layout unifié
 * 
 * - Formulaire 60vh
 * - Scroll unifié
 * - Labels plus visibles (gray-500)
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Navigation, MapPin, Calculator, ArrowLeft, 
    Sun, CloudRain, MapPinned, Loader2, Globe, BarChart2, PlusCircle, Clock, Ruler
} from 'lucide-react';
import showToast from '../utils/customToast';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import PriceCard from '../components/PriceCard';

// Services
import { estimatePrice } from '../services/estimateService';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

const WEATHER_OPTIONS = [
  { value: 0, label: 'Ensoleillé', icon: Sun },
  { value: 2, label: 'Pluie', icon: CloudRain },
];

const TIME_SLOTS = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'nuit', label: 'Nuit' },
];

const SuggestionSkeleton = () => (
    <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-2 bg-gray-50 rounded w-3/4" />
                </div>
            </div>
        ))}
    </div>
);

export default function EstimatePageMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [departPlace, setDepartPlace] = useState(null);
  const [arriveePlace, setArriveePlace] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heureTrajet, setHeureTrajet] = useState('matin');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [departQuery, setDepartQuery] = useState('');
  const [arriveeQuery, setArriveeQuery] = useState('');
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeStats, setRouteStats] = useState(null);

  const arriveeInputRef = useRef(null);
  const departInputRef = useRef(null);

  useEffect(() => {
    const autoLocate = async () => {
        try {
            const pos = await geolocationService.getCurrentPosition();
            if (pos) {
                const addressLabel = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
                setDepartPlace({ label: addressLabel, longitude: pos.coords.longitude, latitude: pos.coords.latitude });
                setDepartQuery(addressLabel);
                setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            }
        } catch (e) { console.warn("Auto-locate failed", e); }
    };

    if (location.state?.prefilledStart && location.state.prefilledStart.coords) {
        const coords = location.state.prefilledStart.coords;
        const fallbackLabel = location.state.prefilledStart.label || "Ma position";
        setDepartPlace({ label: fallbackLabel, longitude: coords[0], latitude: coords[1] });
        setDepartQuery(fallbackLabel);
        setMapCenter(coords);
        reverseSearch(coords[1], coords[0]).then(addr => {
            setDepartPlace(prev => ({ ...prev, label: addr }));
            setDepartQuery(addr);
        });
    } else {
        autoLocate();
    }

    if (location.state?.targetDestination) {
        const d = location.state.targetDestination;
        if (d.coords) {
            setArriveePlace({ label: d.name, longitude: d.coords[0], latitude: d.coords[1] });
            setArriveeQuery(d.name);
        }
    } else if (location.state?.focusDestination) {
        setTimeout(() => arriveeInputRef.current?.focus(), 500);
    }
  }, [location.state]);

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
      } catch (e) { showToast.error("Erreur serveur"); }
      finally { setIsLoading(false); }
  };

  const isSearchMode = activeSearchField && (isSearching || suggestions.length > 0);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white antialiased">
      <div className="absolute inset-0 z-0">
          <MapView center={mapCenter} markers={markers} route={routeData} showControls={false} />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2.5 bg-white rounded-xl shadow-md active:scale-95 transition-transform text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
          
          <div className="flex items-center p-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <button className="px-3 py-1.5 bg-[#f3cd08] text-black rounded-full font-bold text-[9px] uppercase tracking-wide flex items-center gap-1">
                  <Calculator className="w-3 h-3" /> Estimer
              </button>
              <button onClick={() => navigate('/add-trajet')} className="px-3 py-1.5 text-gray-500 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 hover:text-gray-700">
                  <PlusCircle className="w-3 h-3" /> Contribuer
              </button>
          </div>

          <div className="flex gap-2">
             <button onClick={() => navigate('/stats')} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#3b82f6] shadow-md"><BarChart2 className="w-4 h-4" /></button>
             <button onClick={() => navigate('/trajets')} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#3b82f6] shadow-md"><Globe className="w-4 h-4" /></button>
          </div>
      </div>

      {/* ROUTE STATS */}
      <AnimatePresence>
          {routeStats && !prediction && !activeSearchField && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute bottom-[62%] left-4 z-30"
              >
                  <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-[#3b82f6]" />
                          <span className="text-xs font-bold text-gray-800">{routeStats.distance} km</span>
                      </div>
                      <div className="w-px h-3 bg-gray-200" />
                      <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                          <span className="text-xs font-bold text-gray-800">{routeStats.duration} min</span>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* DRAWER - 60vh, scroll unifié */}
      <Drawer.Root open={true} modal={false} dismissible={false}>
        <Drawer.Portal>
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] outline-none h-[60vh]">
                <div className="w-full flex justify-center pt-3 pb-2 shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {!prediction ? (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold tracking-tight text-[#141414] italic">Estimation du <span className="text-[#f3cd08]">prix</span></h2>

                            {/* ITINÉRAIRE */}
                            <div className="space-y-2">
                                <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'depart' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-transparent bg-gray-50'}`}>
                                    <Navigation className={`w-4 h-4 shrink-0 ${activeSearchField === 'depart' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Départ</span>
                                        <SearchBarEnhanced
                                            inputRef={departInputRef} value={departQuery} onChange={setDepartQuery}
                                            onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('depart'); }}
                                            onLoading={setIsSearching} placeholder="Lieu de départ..."
                                            className="w-full text-sm font-semibold text-gray-800 border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-400 truncate"
                                        />
                                    </div>
                                </div>

                                <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'arrivee' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-gray-100 bg-white'}`}>
                                    <MapPin className={`w-4 h-4 shrink-0 ${activeSearchField === 'arrivee' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Destination</span>
                                        <SearchBarEnhanced
                                            inputRef={arriveeInputRef} value={arriveeQuery} onChange={setArriveeQuery}
                                            onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('arrivee'); }}
                                            onLoading={setIsSearching} placeholder="Où allez-vous ?"
                                            className="w-full text-base font-bold text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-300 truncate"
                                        />
                                    </div>
                                    {isSearching && <Loader2 className="w-4 h-4 text-[#f3cd08] animate-spin shrink-0" />}
                                </div>
                            </div>

                            {/* SUGGESTIONS */}
                            <AnimatePresence>
                                {isSearchMode && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        {isSearching ? (
                                            <SuggestionSkeleton />
                                        ) : (
                                            <div className="space-y-1">
                                                {suggestions.map((s, i) => (
                                                    <button key={i} onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-3 rounded-xl flex items-center gap-3 text-left group hover:bg-gray-50 transition-all">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black shrink-0"><MapPinned className="w-4 h-4"/></div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-semibold text-gray-900 truncate">{s.name}</span>
                                                            <span className="text-[9px] text-gray-500 font-medium uppercase truncate">{s.place_formatted}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* OPTIONS - Après les suggestions */}
                            {!isSearchMode && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">Météo</p>
                                            <div className="flex gap-2">
                                                {WEATHER_OPTIONS.map(opt => (
                                                    <button key={opt.value} onClick={() => setMeteo(opt.value)} className={`flex-1 p-2.5 rounded-xl border transition-all ${meteo === opt.value ? 'bg-[#141414] border-[#141414] text-white' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                                        <opt.icon className="w-4 h-4 mx-auto" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">Période</p>
                                            <select value={heureTrajet} onChange={(e) => setHeureTrajet(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl text-[10px] font-semibold p-2.5 outline-none uppercase text-gray-700">
                                                {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {departPlace && arriveePlace && (
                                        <button onClick={handleEstimate} disabled={isLoading} className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#f3cd08]" /> : <>Voir l'estimation <Calculator className="w-4 h-4 text-[#f3cd08]" /></>}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="py-4">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-tight italic">Résultat</h2>
                                <button onClick={() => setPrediction(null)} className="px-3 py-1.5 bg-gray-100 rounded-xl text-[9px] font-bold text-gray-600 uppercase hover:bg-[#f3cd08] hover:text-black transition-all">Nouvelle</button>
                             </div>
                             <PriceCard prediction={prediction} onAddTrajet={() => navigate('/add-trajet')} />
                        </div>
                    )}
                </div>
            </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}