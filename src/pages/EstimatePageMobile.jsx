
/**
 * @fileoverview EstimatePageMobile - Refonte UX Unifiée
 * 
 * - Modal rétractable avec clic carte
 * - Bouton Géolocalisation dans le champ Départ
 * - Labels gray-500 pour visibilité
 * - Vérification géographique Cameroun
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Navigation, MapPin, Calculator, ArrowLeft, 
    Sun, CloudRain, MapPinned, Loader2, Globe, BarChart2, PlusCircle, Clock, Ruler, ChevronUp, LocateFixed, Store
} from 'lucide-react';
import showToast from '../utils/customToast';

// Components
import MapView from '../components/MapView';
import SearchBarEnhanced from '../components/SearchBarEnhanced';
import PriceCard from '../components/PriceCard';
import EstimateSuccessModal from '../components/EstimateSuccessModal';
import OutOfBoundsModal from '../components/OutOfBoundsModal';
import QuickPriceModal from '../components/QuickPriceModal';

// Services
import { estimatePrice } from '../services/estimateService';
import { getDirections } from '../services/mapboxService';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

// Utils
import { validateTrajetInCameroon, detectCountry } from '../utils/cameroonGeoUtils';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [departPlace, setDepartPlace] = useState(null);
  const [arriveePlace, setArriveePlace] = useState(null);
  const [meteo, setMeteo] = useState(0);
  const [heureTrajet, setHeureTrajet] = useState('matin');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [departQuery, setDepartQuery] = useState('');
  const [arriveeQuery, setArriveeQuery] = useState('');
  
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showOutOfBoundsModal, setShowOutOfBoundsModal] = useState(false);
  const [outOfBoundsInfo, setOutOfBoundsInfo] = useState({ invalidPoint: 'depart', detectedCountry: '' });
  const [showQuickPriceModal, setShowQuickPriceModal] = useState(false);

  const arriveeInputRef = useRef(null);
  const departInputRef = useRef(null);

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
    if (location.state?.prefilledStart && location.state.prefilledStart.coords) {
        const coords = location.state.prefilledStart.coords;
        const fallbackLabel = location.state.prefilledStart.label || t('geolocation.my_position');
        setDepartPlace({ label: fallbackLabel, longitude: coords[0], latitude: coords[1] });
        setDepartQuery(fallbackLabel);
        setMapCenter(coords);
        reverseSearch(coords[1], coords[0]).then(addr => {
            setDepartPlace(prev => ({ ...prev, label: addr }));
            setDepartQuery(addr);
        });
    } else {
        performGeolocation();
    }

    if (location.state?.targetDestination) {
        const d = location.state.targetDestination;
        if (d.coords) {
            setArriveePlace({ label: d.name, longitude: d.coords[0], latitude: d.coords[1] });
            setArriveeQuery(d.name);
        }
    } else if (location.state?.focusDestination) {
        setTimeout(() => arriveeInputRef.current?.focus(), 0);
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
      
      // Vérification géographique Cameroun
      const departPoint = { lat: departPlace.latitude, lon: departPlace.longitude };
      const arriveePoint = { lat: arriveePlace.latitude, lon: arriveePlace.longitude };
      const validation = validateTrajetInCameroon(departPoint, arriveePoint);
      
      if (!validation.isValid) {
          // Déterminer le pays détecté pour un meilleur message
          let detectedCountry = '';
          if (validation.invalidPoint === 'depart' || validation.invalidPoint === 'both') {
              detectedCountry = detectCountry(departPlace.latitude, departPlace.longitude);
          } else {
              detectedCountry = detectCountry(arriveePlace.latitude, arriveePlace.longitude);
          }
          
          setOutOfBoundsInfo({
              invalidPoint: validation.invalidPoint,
              detectedCountry: detectedCountry
          });
          setShowOutOfBoundsModal(true);
          return;
      }
      
      setIsLoading(true);
      try {
          const res = await estimatePrice({
              depart: departPoint,
              arrivee: arriveePoint,
              meteo, heure: heureTrajet
          });
          setPrediction(res);
          // Afficher le modal marketplace après 2.5s si c'est une première prédiction
          setTimeout(() => setShowMarketplaceModal(true), 2500);
      } catch (e) { showToast.error(t('estimate.server_error')); }
      finally { setIsLoading(false); }
  };

  const isSearchMode = activeSearchField && (isSearching || suggestions.length > 0);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white antialiased">
      <div className="absolute inset-0 z-0 text-[#141414]">
          <MapView 
            center={mapCenter} 
            markers={markers} 
            route={routeData} 
            showControls={false} 
            onMapClick={() => isDrawerOpen && setIsDrawerOpen(false)}
          />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2.5 bg-white rounded-xl shadow-md active:scale-95 transition-transform text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
          
          <div className="flex items-center p-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
              <button className="px-4 py-1.5 bg-[#f3cd08] text-black rounded-full font-bold text-[9px] uppercase tracking-wide flex items-center gap-1">
                  <Calculator className="w-3 h-3" /> {t('nav.estimate')}
              </button>
              <button onClick={() => navigate('/add-trajet')} className="px-4 py-1.5 text-gray-500 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1 hover:text-gray-700">
                  <PlusCircle className="w-3 h-3" /> {t('add.cta_contribute_sub') || t('nav.add')}
              </button>
          </div>

          <div className="flex gap-2">
             <button onClick={() => navigate('/marketplace')} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#f3cd08] shadow-md transition-colors"><Store className="w-4 h-4" /></button>
             <button onClick={() => navigate('/stats')} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#3b82f6] shadow-md transition-colors"><BarChart2 className="w-4 h-4" /></button>
             <button onClick={() => navigate('/trajets')} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-[#3b82f6] shadow-md transition-colors"><Globe className="w-4 h-4" /></button>
          </div>
      </div>

      {/* ROUTE STATS */}
      <AnimatePresence>
          {routeStats && !prediction && !activeSearchField && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`absolute left-4 z-30 transition-all duration-300 ${isDrawerOpen ? 'bottom-[57%]' : 'bottom-24'}`}
              >
                  <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg flex items-center gap-4 border border-gray-100">
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

      {/* BOUTON RÉOUVRIR LE MODAL */}
      <AnimatePresence>
        {!isDrawerOpen && (
          <motion.button
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            onClick={() => setIsDrawerOpen(true)}
            className="fixed bottom-6 left-1/2 z-40 px-5 py-2.5 bg-[#141414] text-white rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs active:scale-95 transition-all group"
          >
            <ChevronUp className="w-4 h-4 text-[#f3cd08] group-hover:animate-bounce" />
            {t('estimate.reopen_modal')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* DRAWER / MODAL */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] outline-none transition-[height] duration-500 ${prediction ? 'h-[85vh]' : 'h-[55vh]'}`}
          >
            <div className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-pointer" onClick={() => setIsDrawerOpen(false)}>
                <div className="w-10 h-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {!prediction ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold tracking-tight text-[#141414] italic">{t('estimate.title_section').split(' ')[0]} {t('estimate.title_section').split(' ')[1]} <span className="text-[#f3cd08]">{t('estimate.title_section').split(' ')[2]}</span></h2>

                        {/* ITINÉRAIRE */}
                        <div className="space-y-2">
                            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'depart' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-transparent bg-gray-50'}`}>
                                <Navigation className={`w-4 h-4 shrink-0 ${activeSearchField === 'depart' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">{t('add.placeholder_from').split(' ')[0]}</span>
                                    <SearchBarEnhanced
                                        inputRef={departInputRef} value={departQuery} onChange={setDepartQuery}
                                        onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('depart'); }}
                                        onLoading={setIsSearching} placeholder={t('estimate.placeholder_from')}
                                        className="w-full text-sm font-semibold text-gray-800 border-none p-0 focus:ring-0 bg-transparent placeholder:text-gray-400 truncate"
                                    />
                                </div>
                                <button 
                                    type="button" onClick={() => performGeolocation(true)} disabled={isLocating}
                                    className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-[#3b82f6] active:scale-90 transition-transform disabled:opacity-50"
                                >
                                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${activeSearchField === 'arrivee' ? 'border-[#f3cd08] bg-white shadow-lg' : 'border-gray-100 bg-white'}`}>
                                <MapPin className={`w-4 h-4 shrink-0 ${activeSearchField === 'arrivee' ? 'text-[#f3cd08]' : 'text-gray-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">{t('add.placeholder_to').split(' ')[0]}</span>
                                    <SearchBarEnhanced
                                        inputRef={arriveeInputRef} value={arriveeQuery} onChange={setArriveeQuery}
                                        onSuggestions={(s) => { setSuggestions(s); setActiveSearchField('arrivee'); }}
                                        onLoading={setIsSearching} placeholder={t('estimate.placeholder_to')}
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
                                                <button key={i} onMouseDown={() => handleSelectSuggestion(s)} className="w-full p-3 rounded-xl flex items-center gap-4 text-left group hover:bg-gray-50 transition-all">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#f3cd08] group-hover:text-black shrink-0"><MapPinned className="w-4 h-4"/></div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-gray-900 truncate tracking-tight">{s.name}</span>
                                                        <span className="text-[9px] text-gray-500 font-bold uppercase truncate">{s.place_formatted}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* OPTIONS */}
                        {!isSearchMode && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">{t('add.weather')}</p>
                                        <div className="flex gap-2">
                                            {WEATHER_OPTIONS.map(opt => (
                                                <button key={opt.value} onClick={() => setMeteo(opt.value)} className={`flex-1 p-3 rounded-xl border transition-all ${meteo === opt.value ? 'bg-[#141414] border-[#141414] text-white' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                                    <opt.icon className="w-4 h-4 mx-auto" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide pl-1">{t('estimate.moment')}</p>
                                        <select value={heureTrajet} onChange={(e) => setHeureTrajet(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl text-[10px] font-bold p-3.5 outline-none uppercase text-gray-700">
                                            {TIME_SLOTS.map(slot => <option key={slot.value} value={slot.value}>{t(slot.label_key)}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {departPlace && arriveePlace && (
                                    <button onClick={handleEstimate} disabled={isLoading} className="w-full py-5 bg-[#141414] text-white rounded-4xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#f3cd08]" /> : <>{t('estimate.launch')} <Calculator className="w-4 h-4 text-[#f3cd08]" /></>}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-4">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold uppercase tracking-tight italic">{t('estimate.result_title')}</h2>
                            <button onClick={() => setPrediction(null)} className="px-4 py-2 bg-gray-100 rounded-xl text-[9px] font-bold text-gray-600 uppercase hover:bg-[#f3cd08] hover:text-black transition-all">{t('estimate.recalculate')}</button>
                         </div>
                         <PriceCard prediction={prediction} onAddTrajet={() => navigate('/add-trajet')} />
                         
                         {/* Bouton contribution rapide si trajet inconnu */}
                         {prediction?.statut === 'inconnu' && (
                           <motion.button
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: 0.5 }}
                             onClick={() => setShowQuickPriceModal(true)}
                             className="w-full mt-4 py-4 bg-gradient-to-r from-[#f3cd08] to-[#fbbf24] text-black rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-transform"
                           >
                             <PlusCircle className="w-4 h-4" />
                             {t('quick_price.cta_know_price') || 'Vous connaissez le vrai prix ?'}
                           </motion.button>
                         )}
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EstimateSuccessModal 
        isOpen={showMarketplaceModal && !!prediction} 
        onClose={() => setShowMarketplaceModal(false)}
        estimateData={prediction}
      />
      
      <OutOfBoundsModal 
        isOpen={showOutOfBoundsModal}
        onClose={() => setShowOutOfBoundsModal(false)}
        invalidPoint={outOfBoundsInfo.invalidPoint}
        detectedCountry={outOfBoundsInfo.detectedCountry}
      />
      
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
    </div>
  );
}