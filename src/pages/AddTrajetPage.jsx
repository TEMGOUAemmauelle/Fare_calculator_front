/**
 * @fileoverview AddTrajetPage - Page ajout trajet réel
 * 
 * Formulaire pour contribuer avec :
 * - Auto-enrichissement (géoloc, météo, heure)
 * - FormInput réutilisables
 * - Validation complète
 * - Modal de confirmation avec Lottie
 * - Responsive mobile/desktop
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign,
  Sun,
  CloudRain,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FormInput from '../components/FormInput';
import SearchBar from '../components/SearchBar';
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
    depart_coords: null,
    arrivee_coords: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
    setFormData(prev => ({
      ...prev,
      depart_point: location.place_name || location.label,
      depart_coords: location.coordinates || [location.longitude, location.latitude],
    }));
  };

  const handleArriveeSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      arrivee_point: location.place_name || location.label,
      arrivee_coords: location.coordinates || [location.longitude, location.latitude],
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
      // Le service addTrajet enrichit automatiquement avec géoloc/météo
      const response = await addTrajet({
        depart_point: formData.depart_point,
        arrivee_point: formData.arrivee_point,
        prix_paye: parseFloat(formData.prix_paye),
        meteo: formData.meteo,
        heure_tranche: formData.heure_tranche,
        depart_coords: formData.depart_coords,
        arrivee_coords: formData.arrivee_coords,
      });

      console.log('✅ Trajet ajouté:', response.data);
      
      // Afficher modal succès
      setShowSuccessModal(true);

      // Reset formulaire après 2s
      setTimeout(() => {
        setFormData({
          depart_point: '',
          arrivee_point: '',
          prix_paye: '',
          meteo: 0,
          heure_tranche: 'matin',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              Ajouter un trajet
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Aidez la communauté en partageant vos données
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire - Container responsive */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6"
        >
          {/* Section Itinéraire */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Itinéraire
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Point de départ <span className="text-red-500">*</span>
                </label>
                <SearchBar
                  placeholder="Saisir le lieu de départ"
                  value={formData.depart_point}
                  onLocationSelect={handleDepartSelect}
                  icon={<MapPin className="w-5 h-5" />}
                />
                {validationErrors.depart_point && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.depart_point}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Point d'arrivée <span className="text-red-500">*</span>
                </label>
                <SearchBar
                  placeholder="Saisir le lieu d'arrivée"
                  value={formData.arrivee_point}
                  onLocationSelect={handleArriveeSelect}
                  icon={<MapPin className="w-5 h-5" />}
                />
                {validationErrors.arrivee_point && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.arrivee_point}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section Prix */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              Prix payé
            </h2>

            <FormInput
              label="Montant en FCFA"
              name="prix_paye"
              type="number"
              value={formData.prix_paye}
              onChange={(e) => handleInputChange('prix_paye', e.target.value)}
              placeholder="Ex: 1500"
              min={0}
              step={50}
              required
              error={validationErrors.prix_paye}
              icon={DollarSign}
              iconPosition="left"
            />
          </div>

          {/* Section Conditions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Conditions du trajet
            </h2>

            {/* Météo */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Météo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('meteo', 0)}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    formData.meteo === 0
                      ? 'border-yellow-500 bg-yellow-50 shadow-lg shadow-yellow-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${formData.meteo === 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.meteo === 0 ? 'text-yellow-900' : 'text-gray-600'}`}>
                    Ensoleillé
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInputChange('meteo', 2)}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    formData.meteo === 2
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <CloudRain className={`w-6 h-6 ${formData.meteo === 2 ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-bold ${formData.meteo === 2 ? 'text-blue-900' : 'text-gray-600'}`}>
                    Pluvieux
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Tranche horaire */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Tranche horaire
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-gray-100 rounded-2xl">
                {Object.entries(HEURE_TRANCHES).map(([key, { label }]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('heure_tranche', key)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
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
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-black text-lg rounded-2xl shadow-lg shadow-green-500/30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Soumettre le trajet
              </>
            )}
          </motion.button>

          {/* Note */}
          <p className="text-center text-sm text-gray-500">
            Vos données sont anonymes et aident à améliorer les estimations pour tous.
          </p>
        </motion.form>
      </div>

      {/* Modal de confirmation */}
      <TrajetAddedModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
      />
    </div>
  );
}
