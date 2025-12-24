
/**
 * @fileoverview AddTrajetPage - Layout corrigé
 * 
 * Fixes:
 * - Prix déplacé APRÈS la zone de suggestions
 * - Formulaire plus haut (60vh)
 * - Scroll unifié (pas de zones séparées)
 * - Labels plus visibles (gray-500)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Drawer } from 'vaul';
import { 
  MapPin, Navigation, DollarSign, Sun, CloudRain, Loader2, Calculator, PlusCircle, ArrowLeft, ThumbsDown, ThumbsUp, Ruler, Clock, MapPinned
} from 'lucide-react';
import showToast from '../utils/customToast';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import { TrajetAddedModal } from '../components/ConfirmationModal';

// Services
import { addTrajet } from '../services';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

const HEURE_SLOTS = [
  { value: 'matin', label: 'Matin' },
  { value: 'apres-midi', label: 'Après-midi' },
  { value: 'soir', label: 'Soir' },
  { value: 'nuit', label: 'Nuit' },
];

export default function AddTrajetPage() {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeStats, setRouteStats] = useState(null);

  useEffect(() => {
    const autoLocate = async () => {
        try {
            const pos = await geolocationService.getCurrentPosition();
            if (pos) {
                const address = await reverseSearch(pos.coords.latitude, pos.coords.longitude);
                const loc = { label: address, longitude: pos.coords.longitude, latitude: pos.coords.latitude };
                setFormData(prev => ({ ...prev, depart: loc }));
                setDepartQuery(address);
                setMapCenter([pos.coords.longitude, pos.coords.latitude]);
            }
        } catch (e) {}
    };

    if (location.state?.depart && location.state?.arrivee) {
        setFormData(prev => ({
            ...prev,
            depart: location.state.depart,
            arrivee: location.state.arrivee
        }));
        setDepartQuery(location.state.depart.label);
        setArriveeQuery(location.state.arrivee.label);
    } else {
        autoLocate();
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
        showToast.error("Formulaire incomplet");
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
        setShowSuccessModal(true);
    } catch (err) {
        showToast.error("Erreur d'ajout");
    } finally {
        setIsLoading(false);
    }
  };

  // Mode recherche actif = on affiche les suggestions
  const isSearchMode = activeSearchField && (isSearching || suggestions.length > 0);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white antialiased">
      <div className="absolute inset-0 z-0">
        <MapView center={mapCenter} markers={markers} route={routeData} showControls={false} />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2.5 bg-white rounded-xl shadow-md active:scale-95 transition-transform text-gray-700"><ArrowLeft className="w-5 h-5"/></button>
          
          <div className="flex items-center p-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <button onClick={() => navigate('/estimate')} className="px-3 py-1.5 text-gray-500 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 hover:text-gray-700">
                  <Calculator className="w-3 h-3" /> Estimer
              </button>
              <button className="px-3 py-1.5 bg-[#f3cd08] text-black rounded-full font-bold text-[9px] uppercase tracking-wide flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" /> Contribuer
              </button>
          </div>

          <LanguageSwitcher variant="dark" />
      </div>

      {/* ROUTE STATS */}
      <AnimatePresence>
          {routeStats && !activeSearchField && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
            
            {/* SCROLL UNIFIÉ - Tout le formulaire scrolle ensemble */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-lg font-bold tracking-tight text-[#141414] italic">Partager un <span className="text-[#f3cd08]">tarif</span></h2>

                    {/* SECTION ITINÉRAIRE */}
                    <div className="space-y-2">
                         <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'depart' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-transparent bg-gray-50'}`}>
                            <Navigation className={`w-4 h-4 shrink-0 ${activeSearchField === 'depart' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Départ</span>
                                <SearchBarEnhanced
                                    value={departQuery} onChange={setDepartQuery}
                                    onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('depart'); }}
                                    onLoading={setIsSearching} placeholder="Lieu de prise en charge..."
                                    className="w-full text-sm font-semibold text-gray-800 border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-400 truncate"
                                />
                            </div>
                        </div>

                         <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'arrivee' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-transparent bg-gray-50'}`}>
                            <MapPin className={`w-4 h-4 shrink-0 ${activeSearchField === 'arrivee' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Destination</span>
                                <SearchBarEnhanced
                                    value={arriveeQuery} onChange={setArriveeQuery}
                                    onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('arrivee'); }}
                                    onLoading={setIsSearching} placeholder="Destination..."
                                    className="w-full text-sm font-semibold text-gray-800 border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-400 truncate"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SUGGESTIONS - Affichées ICI, avant le prix */}
                    <AnimatePresence>
                        {isSearchMode && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden">
                                {isSearching ? (
                                    <div className="p-3 text-[10px] font-bold text-gray-400 animate-pulse">Recherche en cours...</div>
                                ) : (
                                    suggestions.map((s, i) => (
                                        <button key={i} type="button" onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-3 rounded-xl flex items-center gap-3 text-left group hover:bg-gray-50 transition-all">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black shrink-0"><MapPinned className="w-4 h-4"/></div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-gray-900 truncate">{s.name}</span>
                                                <span className="text-[9px] text-gray-500 font-medium uppercase truncate">{s.place_formatted}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* SECTION PRIX - Après les suggestions */}
                    {!isSearchMode && (
                        <>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f3cd08]/10 border border-[#f3cd08]/20">
                                 <DollarSign className="w-4 h-4 text-[#f3cd08] shrink-0" />
                                 <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block">Prix payé</span>
                                    <div className="flex items-baseline gap-2">
                                        <input 
                                            type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            placeholder="0" className="w-full text-lg font-bold text-[#141414] border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-300"
                                        />
                                        <span className="text-[10px] font-bold text-gray-500 shrink-0">FCFA</span>
                                    </div>
                                 </div>
                            </div>

                            {/* SECTION OPTIONS */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">Météo</p>
                                    <div className="flex gap-2">
                                        {[{v:0, i:Sun, l:'Soleil'}, {v:2, i:CloudRain, l:'Pluie'}].map(o => (
                                            <button key={o.v} type="button" onClick={() => setFormData({...formData, meteo: o.v})} className={`flex-1 p-2.5 rounded-xl border transition-all ${formData.meteo === o.v ? 'bg-[#141414] border-[#141414] text-white' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                                <o.i className="w-4 h-4 mx-auto" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">Période</p>
                                    <select value={formData.heure} onChange={(e) => setFormData({...formData, heure: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl text-[10px] font-semibold p-2.5 outline-none uppercase text-gray-700">
                                        {HEURE_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* QUALITÉ */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Qualité du trajet</p>
                                    <span className="text-sm font-bold text-[#f3cd08]">{formData.qualite}/10</span>
                                </div>
                                <input 
                                    type="range" min="1" max="10" value={formData.qualite} 
                                    onChange={(e) => setFormData({...formData, qualite: parseInt(e.target.value)})}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#f3cd08]"
                                />
                                <div className="flex justify-between"><ThumbsDown className="w-3 h-3 text-gray-400"/><ThumbsUp className="w-3 h-3 text-gray-400"/></div>
                            </div>

                            {/* BOUTON */}
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#f3cd08]" /> : <>Contribuer <PlusCircle className="w-4 h-4 text-[#f3cd08]" /></>}
                            </button>
                        </>
                    )}
                </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <TrajetAddedModal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); navigate('/estimate'); }} />
    </div>
  );
}
