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

import { useState, useEffect } from 'react';
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
    // 0. Détecter la tranche horaire actuelle
    setCurrentTimeSlot();
    
    // 1. Ouvrir le drawer automatiquement
    setDrawerOpen(true);

    // 2. Tenter la géolocalisation si pas de données pré-remplies
    const attemptAutoGeoloc = async () => {
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
          if (point) {
            setFormData(prev => ({
              ...prev,
              depart_point: point.label || 'Ma position',
              depart_coords: [point.coords_longitude, point.coords_latitude],
            }));
            toast.success('Position actuelle détectée', { id: 'geoloc-success' });
          }
        } catch (e) {
          console.warn('Auto-geoloc failed:', e);
        } finally {
          setIsLocating(false);
        }
      }
    };

    attemptAutoGeoloc();
  }, []);

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

      {/* Switch élégant en haut au centre */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-2xl border border-gray-200"
        >
          <div className="flex gap-1">
            <button
              onClick={() => navigate('/estimate')}
              className="px-6 py-3 bg-transparent hover:bg-gray-100 text-gray-700 rounded-full font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4" strokeWidth={2.5} />
              <span>Estimer</span>
            </button>
            
            <button
              onClick={() => navigate('/add-trajet')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#231f0f] rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <PlusCircle className="w-4 h-4" strokeWidth={3} />
              <span>Ajouter</span>
            </button>
          </div>
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
            <div className="p-4 bg-white rounded-t-3xl flex-shrink-0">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
              <div className="max-w-md mx-auto">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Drawer.Title className="font-black text-2xl text-gray-700">
                      Ajouter un trajet
                    </Drawer.Title>
                    <p id="drawer-description-add" className="text-sm text-gray-600 mt-1">
                      Aidez la communauté en partageant vos données
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/trajets')}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    Trajets commu
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white overflow-y-auto flex-1">
              <div className="max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section Itinéraire */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Itinéraire
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Départ <span className="text-red-500">*</span>
                </label>
                <SearchBar
                  placeholder="Saisir le lieu de départ"
                  value={formData.depart_point}
                  onSelect={handleDepartSelect}
                  showCurrentLocation={true}
                  externalLoading={isLocating}
                />
                {validationErrors.depart_point && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.depart_point}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Arrivée <span className="text-red-500">*</span>
                </label>
                <SearchBar
                  placeholder="Saisir le lieu d'arrivée"
                  value={formData.arrivee_point}
                  onSelect={handleArriveeSelect}
                />
                {validationErrors.arrivee_point && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.arrivee_point}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section Prix */}
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Prix payé
            </h2>

            <FormInput
              label=""
              name="prix_paye"
              type="number"
              value={formData.prix_paye}
              onChange={(e) => handleInputChange('prix_paye', e.target.value)}
              placeholder="Montant en FCFA (ex: 1500)"
              min={0}
              step={50}
              required
              error={validationErrors.prix_paye}
              icon={DollarSign}
              iconPosition="left"
            />
          </div>

          {/* Section Conditions */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">
              Conditions du trajet
            </h2>

            {/* Météo */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Météo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('meteo', 0)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.meteo === 0
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Sun className={`w-5 h-5 ${formData.meteo === 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${formData.meteo === 0 ? 'text-yellow-900' : 'text-gray-600'}`}>
                    Ensoleillé
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('meteo', 2)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.meteo === 2
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <CloudRain className={`w-5 h-5 ${formData.meteo === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm ${formData.meteo === 2 ? 'text-blue-900' : 'text-gray-600'}`}>
                    Pluvieux
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Tranche horaire */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tranche horaire
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl">
                {Object.entries(HEURE_TRANCHES).map(([key, { label }]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('heure_tranche', key)}
                    className={`py-2 px-1 rounded-lg font-bold text-xs transition-all ${
                      formData.heure_tranche === key
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </motion.button>
                ))}
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

          {/* Bouton Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-[#231f0f] disabled:text-gray-500 font-black text-base rounded-xl shadow-lg shadow-yellow-500/30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Soumettre le trajet
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
