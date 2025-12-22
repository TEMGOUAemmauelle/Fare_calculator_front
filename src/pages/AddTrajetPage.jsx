/**
 * @fileoverview AddTrajetPage - Page ajout trajet réel avec CARTE
 * 
 * Formulaire pour contribuer avec :
 * - Carte Mapbox en plein écran
 * - Bottom sheet avec formulaire par-dessus
 * - Auto-enrichissement (géoloc, météo, heure)
 * - Validation complète
 * - Modal de confirmation avec Lottie
 * - Switch élégant pour navigation
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer } from 'vaul';
import { 
  MapPin, 
  DollarSign,
  Sun,
  CloudRain,
  Loader2,
  Calculator,
  PlusCircle,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FormInput from '../components/FormInput';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import ErrorMessage from '../components/ErrorMessage';
import { TrajetAddedModal } from '../components/ConfirmationModal';

// Services
import { addTrajet } from '../services';

// Constants
import { HEURE_TRANCHES } from '../config/constants';

export default function AddTrajetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États formulaire
  const [formData, setFormData] = useState({
    depart_point: '',
    arrivee_point: '',
    prix_paye: '',
    meteo: 0,
    heure_tranche: 'matin',
    qualite_trajet: 5,
    depart_coords: null,
    arrivee_coords: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false); // Contrôler ouverture Drawer
  const [isLocating, setIsLocating] = useState(false);
  
  // États carte
  const [mapCenter, setMapCenter] = useState([11.5021, 3.8480]); // Yaoundé
  const [mapZoom, setMapZoom] = useState(12);
  const [markers, setMarkers] = useState([]);
  const [routeData, setRouteData] = useState(null);
  
  // Refs pour éviter les problèmes de StrictMode
  const autoLocationAttemptedRef = useRef(false);
  const mountedRef = useRef(true);

  // Fonction pour détecter automatiquement la tranche horaire
  const setCurrentTimeSlot = () => {
    const hour = new Date().getHours();
    let slot = 'matin';
    
    if (hour >= 5 && hour < 12) slot = 'matin';
    else if (hour >= 12 && hour < 17) slot = 'apres-midi';
    else if (hour >= 17 && hour < 21) slot = 'soir';
    else slot = 'nuit';
    
    setFormData(prev => ({ ...prev, heure_tranche: slot }));
  };

  // Initialisation : Ouverture Drawer + Géolocalisation auto
  useEffect(() => {
    // Reset mounted à true à chaque mount
    mountedRef.current = true;
    
    // 0. Détecter la tranche horaire actuelle
    setCurrentTimeSlot();
    
    // 1. Ouvrir le drawer automatiquement
    setDrawerOpen(true);

    // 2. Tenter la géolocalisation si pas de données pré-remplies
    const attemptAutoGeoloc = async () => {
      // Éviter double exécution avec StrictMode
      if (autoLocationAttemptedRef.current) return;
      autoLocationAttemptedRef.current = true;
      
      if (!location.state?.depart) {
        setIsLocating(true);
        try {
          const { checkGeolocationPermission, getCurrentPositionWithAddress } = await import('../services/geolocationService');
          
          try {
            const status = await checkGeolocationPermission();
            if (status === 'denied') {
                toast('Activez la localisation pour une saisie plus rapide', {
                icon: '📍',
                duration: 5000,
                });
                // On continue quand même
            }
          } catch (e) { /* ignore */ }

          // Si accordé ou prompt, on tente
          const point = await getCurrentPositionWithAddress();
          
          console.log('📍 [AddTrajetPage] Point retourné:', point);
          
          if (!mountedRef.current) return;
          
          if (point) {
            setFormData(prev => ({
              ...prev,
              depart_point: point.label || 'Ma position',
              depart_coords: [point.coords_longitude, point.coords_latitude],
            }));
            
            // Centrer la carte sur la position
            setMapCenter([point.coords_longitude, point.coords_latitude]);
            setMapZoom(15);
            
            toast.success('Position actuelle détectée', { id: 'geoloc-success' });
          }
        } catch (e) {
          console.warn('Auto-geoloc failed:', e);
        } finally {
          if (mountedRef.current) setIsLocating(false);
        }
      }
    };

    attemptAutoGeoloc();
    
    return () => {
      mountedRef.current = false;
    };
  }, [location.state?.depart]);

  // Pré-remplir depuis estimation précédente
  useEffect(() => {
    if (location.state?.depart && location.state?.arrivee) {
      setFormData(prev => ({
        ...prev,
        depart_point: location.state.depart.label,
        arrivee_point: location.state.arrivee.label,
        depart_coords: location.state.depart.coordinates,
        arrivee_coords: location.state.arrivee.coordinates,
      }));
    }
  }, [location.state]);
  
  // Mettre à jour la carte quand les points changent
  useEffect(() => {
    const newMarkers = [];
    
    if (formData.depart_coords) {
      newMarkers.push({
        coordinates: formData.depart_coords,
        type: 'depart',
        color: '#3B82F6',
        label: formData.depart_point || 'Départ',
      });
    }
    
    if (formData.arrivee_coords) {
      newMarkers.push({
        coordinates: formData.arrivee_coords,
        type: 'arrivee',
        color: '#EF4444',
        label: formData.arrivee_point || 'Arrivée',
      });
    }
    
    setMarkers(newMarkers);
    
    // Tracer route si les 2 points existent
    if (formData.depart_coords && formData.arrivee_coords) {
      const centerLng = (formData.depart_coords[0] + formData.arrivee_coords[0]) / 2;
      const centerLat = (formData.depart_coords[1] + formData.arrivee_coords[1]) / 2;
      setMapCenter([centerLng, centerLat]);
      setMapZoom(13);
      
      const fetchRoute = async () => {
        try {
          const { getDirections } = await import('../services/mapboxService');
          const result = await getDirections([
            formData.depart_coords,
            formData.arrivee_coords,
          ], {
            profile: 'mapbox/driving-traffic',
            steps: true,
            annotations: ['congestion'],
          });
          
          if (result?.routes?.[0]) {
            const route = result.routes[0];
            
            // Créer segments de congestion
            const congestionLevels = route.legs?.[0]?.annotation?.congestion || [];
            const coordinates = route.geometry.coordinates;
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
            } else if (coordinates.length > 1) {
              // Pas de données de congestion → créer des segments "unknown" (jaune)
              for (let i = 0; i < coordinates.length - 1; i++) {
                congestionSegments.push({
                  congestion: 'unknown',
                  coordinates: [coordinates[i], coordinates[i + 1]],
                });
              }
            }
            
            setRouteData({
              coordinates: route.geometry.coordinates,
              distance: route.distance,
              duration: route.duration,
              congestion_segments: congestionSegments.length > 0 ? congestionSegments : null,
            });
          }
        } catch (error) {
          console.error('❌ Erreur tracé route:', error);
        }
      };
      
      fetchRoute();
    } else {
      setRouteData(null);
    }
  }, [formData.depart_coords, formData.arrivee_coords, formData.depart_point, formData.arrivee_point]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer erreur validation du champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDepartSelect = (location) => {
    console.log('🗺️ Départ sélectionné:', location);
    setFormData(prev => ({
      ...prev,
      depart_point: location.label || location.place_name || '',
      depart_coords: location.coords || [location.longitude, location.latitude],
    }));
  };

  const handleArriveeSelect = (location) => {
    console.log('🗺️ Arrivée sélectionnée:', location);
    setFormData(prev => ({
      ...prev,
      arrivee_point: location.label || location.place_name || '',
      arrivee_coords: location.coords || [location.longitude, location.latitude],
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.depart_point?.trim()) {
      errors.depart_point = 'Le point de départ est requis';
    }

    if (!formData.arrivee_point?.trim()) {
      errors.arrivee_point = 'Le point d\'arrivée est requis';
    }

    if (!formData.prix_paye || formData.prix_paye <= 0) {
      errors.prix_paye = 'Le prix doit être supérieur à 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire payload avec structure PointNested attendue par le backend
      const payload = {
        point_depart: {
          coords_latitude: formData.depart_coords[1], // [lon, lat] -> lat
          coords_longitude: formData.depart_coords[0], // [lon, lat] -> lon
          label: formData.depart_point,
        },
        point_arrivee: {
          coords_latitude: formData.arrivee_coords[1],
          coords_longitude: formData.arrivee_coords[0],
          label: formData.arrivee_point,
        },
        prix: parseFloat(formData.prix_paye), // 'prix' et non 'prix_paye'
        meteo: formData.meteo,
        heure: formData.heure_tranche, // 'heure' et non 'heure_tranche'
        qualite_trajet: Math.round(formData.qualite_trajet), // Arrondir avant envoi
      };

      console.log('📤 Envoi trajet:', payload);
      
      // Le service addTrajet enrichit automatiquement avec géoloc/météo
      const response = await addTrajet(payload);

      console.log('✅ Trajet ajouté:', response); // response est déjà .data du service
      
      // Fermer le Drawer AVANT d'afficher la modal
      setDrawerOpen(false);
      
      // Attendre un peu que le Drawer se ferme, puis afficher modal succès
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 300);

      // Reset formulaire après 2s
      setTimeout(() => {
        setFormData({
          depart_point: '',
          arrivee_point: '',
          prix_paye: '',
          meteo: 0,
          heure_tranche: 'matin',
          qualite_trajet: 5,
          depart_coords: null,
          arrivee_coords: null,
        });
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur ajout trajet:', err);
      setError(err.response?.data?.detail || 'Impossible d\'ajouter le trajet');
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/estimate');
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
            className="px-6 py-2.5 bg-transparent hover:bg-black/5 text-gray-500 rounded-full font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Estimer</span>
          </button>
          
          <button
            onClick={() => navigate('/add-trajet')}
            className="px-6 py-2.5 bg-[#f3cd08] text-[#0a0a0a] rounded-full font-black text-xs uppercase tracking-wide flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" strokeWidth={3} />
            <span>Ajouter</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Sheet avec Formulaire */}
      <Drawer.Root 
        shouldScaleBackground={false} 
        modal={true}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <Drawer.Trigger asChild>
          <button 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#f3cd08] text-gray-700 rounded-full font-bold shadow-2xl z-10"
            aria-label="Ajouter un trajet"
          >
            Ajouter un trajet
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content 
            className="bg-white flex flex-col rounded-t-3xl h-auto max-h-[85vh] fixed bottom-0 left-0 right-0 z-50"
            aria-describedby="drawer-description-add"
          >
            <div className="p-5 bg-white rounded-t-[2.5rem] flex-shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="mx-auto w-12 h-1 bg-gray-200 rounded-full mb-8" />
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <Drawer.Title className="font-black text-2xl text-[#0a0a0a] tracking-tight">
                       AJOUTER <span className="text-gray-300">/</span> TRAJET
                    </Drawer.Title>
                    <p id="drawer-description-add" className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">
                      Contribution communautaire
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/trajets')}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#0a0a0a] rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex-shrink-0"
                  >
                    Voir tout
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white overflow-y-auto flex-1">
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section Itinéraire - Journey Card */}
            <div className="mb-6 p-4 bg-gray-50/80 rounded-3xl border border-gray-100">
              <div className="flex items-start gap-4">
                 {/* Timeline Visual */}
                 <div className="flex flex-col items-center pt-3 flex-shrink-0 h-full gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a]" />
                   <div className="w-0.5 h-10 bg-gray-200 rounded-full" />
                   <div className="w-2.5 h-2.5 rounded-full bg-[#f3cd08] ring-4 ring-[#f3cd08]/20" />
                 </div>

                 <div className="flex-1 space-y-4">
                    <div className="relative">
                       <span className="absolute -top-2 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-wider">De</span>
                       <SearchBar
                         placeholder="Lieu de départ..."
                         value={formData.depart_point}
                         onSelect={handleDepartSelect}
                         showCurrentLocation={true}
                         externalLoading={isLocating}
                         className="bg-transparent border-none p-0 focus:ring-0 text-[#0a0a0a] font-bold placeholder:text-gray-300"
                       />
                       {validationErrors.depart_point && <p className="mt-1 text-[10px] font-bold text-red-500">{validationErrors.depart_point}</p>}
                    </div>

                    <div className="h-px w-full bg-gray-200" />

                    <div className="relative">
                       <span className="absolute -top-2 left-0 text-[9px] font-bold text-gray-400 uppercase tracking-wider">À</span>
                       <SearchBar
                         placeholder="Lieu d'arrivée..."
                         value={formData.arrivee_point}
                         onSelect={handleArriveeSelect}
                         className="bg-transparent border-none p-0 focus:ring-0 text-[#0a0a0a] font-bold placeholder:text-gray-300"
                       />
                       {validationErrors.arrivee_point && <p className="mt-1 text-[10px] font-bold text-red-500">{validationErrors.arrivee_point}</p>}
                    </div>
                 </div>
              </div>
            </div>

            {/* Section Prix - Minimalist */}
            <div className="mb-6">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">
                Prix payé (FCFA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-[#f3cd08] font-black text-lg">FCFA</span>
                </div>
                <input
                  type="number"
                  value={formData.prix_paye}
                  onChange={(e) => handleInputChange('prix_paye', e.target.value)}
                  placeholder="0"
                  className="w-full pl-16 pr-4 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-[#f3cd08] rounded-2xl font-black text-xl text-[#0a0a0a] transition-all outline-none placeholder:text-gray-300"
                />
              </div>
              {validationErrors.prix_paye && <p className="mt-1 text-[10px] font-bold text-red-500 pl-1">{validationErrors.prix_paye}</p>}
            </div>

            {/* Grid Options */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Météo */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Météo</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('meteo', 0)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                      formData.meteo === 0 ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    <Sun className={`w-4 h-4 ${formData.meteo === 0 ? 'text-[#f3cd08]' : 'text-gray-300'}`} />
                    <span className="text-xs font-bold">Soleil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('meteo', 2)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
                      formData.meteo === 2 ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'
                    }`}
                  >
                    <CloudRain className={`w-4 h-4 ${formData.meteo === 2 ? 'text-[#3b82f6]' : 'text-gray-300'}`} />
                    <span className="text-xs font-bold">Pluie</span>
                  </button>
                </div>
              </div>

              {/* Heure */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Moment</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(HEURE_TRANCHES).map(([key, { label }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleInputChange('heure_tranche', key)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                        formData.heure_tranche === key
                          ? 'bg-[#f3cd08] border-[#f3cd08] text-black shadow-md shadow-[#f3cd08]/20'
                          : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Qualité du trajet */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notez ce trajet - Est-il difficile ?
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    <span>Difficile</span>
                  </div>
                  <span className="text-lg font-black text-yellow-600">{Math.round(formData.qualite_trajet)}</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span>Facile</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={11 - formData.qualite_trajet}
                  onChange={(e) => handleInputChange('qualite_trajet', 11 - parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-yellow"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #fbbf24 ${(10 - formData.qualite_trajet) * 11.11}%, #fbbf24 ${(10 - formData.qualite_trajet) * 11.11}%, #10b981 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10</span>
                  <span>5</span>
                  <span>1</span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  {Math.round(formData.qualite_trajet) <= 3 && "Trajet fluide, peu d'obstacles"}
                  {Math.round(formData.qualite_trajet) > 3 && Math.round(formData.qualite_trajet) <= 7 && "Trajet normal avec quelques difficultés"}
                  {Math.round(formData.qualite_trajet) > 7 && "Trajet difficile (embouteillages, nids de poule...)"}
                </p>
              </div>
            </div>

          {/* Erreur */}
          {error && (
            <ErrorMessage
              error={error}
              type="api"
              variant="banner"
              onRetry={handleSubmit}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Bouton Submit - Premium Black */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-[#0a0a0a] hover:bg-black disabled:bg-gray-200 text-white disabled:text-gray-400 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:shadow-none transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white/80">Envoi en cours...</span>
              </>
            ) : (
              <>
                <span>Confirmer</span>
                <div className="w-6 h-6 bg-[#f3cd08] rounded-full flex items-center justify-center text-black">
                   <PlusCircle className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              </>
            )}
          </motion.button>

          {/* Note */}
          <p className="text-center text-xs text-gray-500">
            Vos données sont anonymes et aident à améliorer les estimations pour tous.
          </p>
                </form>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Modal de confirmation */}
      <TrajetAddedModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
