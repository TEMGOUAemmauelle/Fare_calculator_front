/**
 * @fileoverview SubscriptionForm - Formulaire de souscription partenaire
 * 
 * Modal/formulaire élégant pour la souscription à une offre d'abonnement.
 * Capture les informations du partenaire.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Building2, Mail, Phone, Globe, User, 
  Loader2, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';

const SubscriptionForm = ({ 
  isOpen, 
  onClose, 
  selectedOffre, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    email: '',
    telephone: '',
    site_web: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom_entreprise.trim()) {
      newErrors.nom_entreprise = "Le nom de l'entreprise est requis";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit?.({
        ...formData,
        offre_id: selectedOffre?.id
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          nom_entreprise: '',
          email: '',
          telephone: '',
          site_web: '',
          message: ''
        });
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message || "Une erreur est survenue" });
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f3cd08]/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-[#f3cd08]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Devenir partenaire</h2>
                    {selectedOffre && (
                      <p className="text-xs text-gray-500">
                        Offre {selectedOffre.nom}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Demande envoyée !
                    </h3>
                    <p className="text-gray-500">
                      Nous vous contacterons très bientôt.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errors.submit && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}

                    {/* Nom entreprise */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Nom de l'entreprise *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.nom_entreprise}
                          onChange={handleChange('nom_entreprise')}
                          placeholder="Ex: Ma Super Entreprise"
                          className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                            errors.nom_entreprise 
                              ? 'ring-2 ring-red-500' 
                              : 'focus:ring-2 focus:ring-[#f3cd08]'
                          }`}
                        />
                      </div>
                      {errors.nom_entreprise && (
                        <p className="text-xs text-red-500 mt-1">{errors.nom_entreprise}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Email professionnel *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          placeholder="contact@entreprise.com"
                          className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                            errors.email 
                              ? 'ring-2 ring-red-500' 
                              : 'focus:ring-2 focus:ring-[#f3cd08]'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={handleChange('telephone')}
                          placeholder="+237 6XX XXX XXX"
                          className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                            errors.telephone 
                              ? 'ring-2 ring-red-500' 
                              : 'focus:ring-2 focus:ring-[#f3cd08]'
                          }`}
                        />
                      </div>
                      {errors.telephone && (
                        <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>
                      )}
                    </div>

                    {/* Site web (optionnel) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Site web <span className="text-gray-300">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={formData.site_web}
                          onChange={handleChange('site_web')}
                          placeholder="https://www.votresite.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all"
                        />
                      </div>
                    </div>

                    {/* Message (optionnel) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Message <span className="text-gray-300">(optionnel)</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={handleChange('message')}
                        placeholder="Décrivez votre activité et vos besoins..."
                        rows={3}
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Envoyer ma demande</span>
                          <Sparkles className="w-4 h-4 text-[#f3cd08]" />
                        </>
                      )}
                    </motion.button>

                    <p className="text-xs text-gray-400 text-center">
                      En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionForm;
