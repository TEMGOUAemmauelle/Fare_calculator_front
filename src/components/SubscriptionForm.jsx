/**
 * @fileoverview SubscriptionForm - Formulaire de souscription partenaire
 * 
 * Modal/formulaire complet pour la souscription à une offre d'abonnement.
 * Capture les informations du partenaire ET de leur service/publicité.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Building2, Mail, Phone, Globe, Image, FileText, 
  Loader2, CheckCircle2, AlertCircle, Sparkles, Link, Tag, Palette
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Transport', label: 'Transport' },
  { value: 'Livraison', label: 'Livraison' },
  { value: 'Location', label: 'Location de véhicules' },
  { value: 'VTC', label: 'VTC / Chauffeur privé' },
  { value: 'Logistique', label: 'Logistique' },
  { value: 'Autre', label: 'Autre' },
];

const COLORS = [
  { value: '#f3cd08', label: 'Or' },
  { value: '#22c55e', label: 'Vert' },
  { value: '#3b82f6', label: 'Bleu' },
  { value: '#ef4444', label: 'Rouge' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#141414', label: 'Noir' },
];

const SubscriptionForm = ({ 
  isOpen, 
  onClose, 
  selectedOffre, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [step, setStep] = useState(1); // 1: Info service, 2: Contact
  const [formData, setFormData] = useState({
    // Entreprise info
    nom_entreprise: '',
    // Service/Publicité info
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    image_url: '',
    app_link: '',
    category: 'Transport',
    color: '#f3cd08',
    // Contact info
    contact_email: '',
    contact_telephone: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setSuccess(false);
    }
  }, [isOpen]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.nom_entreprise.trim()) {
      newErrors.nom_entreprise = "Le nom de l'entreprise est requis";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Le nom du service est requis";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.length < 20) {
      newErrors.description = "La description doit faire au moins 20 caractères";
    }
    
    if (!formData.image_url.trim()) {
      newErrors.image_url = "L'URL de l'image est requise";
    } else if (!formData.image_url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i) && !formData.image_url.match(/^https?:\/\/.+/i)) {
      newErrors.image_url = "L'URL doit être une image valide (jpg, png, gif, webp)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Email invalide";
    }
    
    if (!formData.contact_telephone.trim()) {
      newErrors.contact_telephone = "Le téléphone est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
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
          title: '',
          title_en: '',
          description: '',
          description_en: '',
          image_url: '',
          app_link: '',
          category: 'Transport',
          color: '#f3cd08',
          contact_email: '',
          contact_telephone: '',
        });
        setStep(1);
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.userMessage || error.message || "Une erreur est survenue" });
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
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f3cd08]/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-[#f3cd08]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Devenir partenaire</h2>
                    {selectedOffre && (
                      <p className="text-xs text-gray-500">
                        Offre <span className="font-bold text-[#f3cd08]">{selectedOffre.nom}</span> • {selectedOffre.duree_jours || selectedOffre.duree_mois * 30} jours
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

              {/* Progress indicator */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 1 ? 'bg-[#f3cd08] text-black' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-[#f3cd08]' : 'bg-gray-200'}`} />
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 2 ? 'bg-[#f3cd08] text-black' : 'bg-gray-200 text-gray-500'}`}>
                    2
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Votre service</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Contact</span>
                </div>
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
                      Nous examinerons votre demande et vous contacterons sous 24h.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {errors.submit && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}

                    {/* STEP 1: Service Info */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5"
                      >
                        <p className="text-sm text-gray-500 mb-6">
                          Décrivez le service que vous souhaitez promouvoir auprès de nos utilisateurs.
                        </p>

                        {/* Nom de l'entreprise */}
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
                              placeholder="Ex: Ma Super Entreprise SARL"
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

                        {/* Nom du service */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Nom du service/produit *
                          </label>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.title}
                              onChange={handleChange('title')}
                              placeholder="Ex: Wiki Taxi, Express Delivery..."
                              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                                errors.title 
                                  ? 'ring-2 ring-red-500' 
                                  : 'focus:ring-2 focus:ring-[#f3cd08]'
                              }`}
                            />
                          </div>
                          {errors.title && (
                            <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Description (Français) *
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                            <textarea
                              value={formData.description}
                              onChange={handleChange('description')}
                              placeholder="Décrivez votre service en quelques phrases..."
                              rows={3}
                              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all resize-none ${
                                errors.description 
                                  ? 'ring-2 ring-red-500' 
                                  : 'focus:ring-2 focus:ring-[#f3cd08]'
                              }`}
                            />
                          </div>
                          {errors.description && (
                            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                          )}
                        </div>

                        {/* Description EN */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Description (English) <span className="text-gray-300">(optionnel)</span>
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                            <textarea
                              value={formData.description_en}
                              onChange={handleChange('description_en')}
                              placeholder="Describe your service in a few sentences..."
                              rows={2}
                              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all resize-none"
                            />
                          </div>
                        </div>

                        {/* Image URL */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            URL de l'image *
                          </label>
                          <div className="relative">
                            <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="url"
                              value={formData.image_url}
                              onChange={handleChange('image_url')}
                              placeholder="https://exemple.com/image.jpg"
                              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                                errors.image_url 
                                  ? 'ring-2 ring-red-500' 
                                  : 'focus:ring-2 focus:ring-[#f3cd08]'
                              }`}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Image de votre service (logo ou bannière)</p>
                          {errors.image_url && (
                            <p className="text-xs text-red-500 mt-1">{errors.image_url}</p>
                          )}
                        </div>

                        {/* Lien App */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Lien de votre application/site <span className="text-gray-300">(optionnel)</span>
                          </label>
                          <div className="relative">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="url"
                              value={formData.app_link}
                              onChange={handleChange('app_link')}
                              placeholder="https://play.google.com/store/apps/..."
                              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all"
                            />
                          </div>
                        </div>

                        {/* Category & Color */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                              Catégorie
                            </label>
                            <div className="relative">
                              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <select
                                value={formData.category}
                                onChange={handleChange('category')}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all appearance-none"
                              >
                                {CATEGORIES.map(cat => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                              Couleur
                            </label>
                            <div className="relative">
                              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <select
                                value={formData.color}
                                onChange={handleChange('color')}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all appearance-none"
                                style={{ borderLeft: `4px solid ${formData.color}` }}
                              >
                                {COLORS.map(col => (
                                  <option key={col.value} value={col.value}>{col.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          type="button"
                          onClick={handleNext}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-6"
                        >
                          <span>Continuer</span>
                          <span>→</span>
                        </motion.button>
                      </motion.div>
                    )}

                    {/* STEP 2: Contact Info */}
                    {step === 2 && (
                      <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                      >
                        <p className="text-sm text-gray-500 mb-6">
                          Comment pouvons-nous vous contacter pour finaliser votre partenariat ?
                        </p>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Email professionnel *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={formData.contact_email}
                              onChange={handleChange('contact_email')}
                              placeholder="contact@entreprise.com"
                              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                                errors.contact_email 
                                  ? 'ring-2 ring-red-500' 
                                  : 'focus:ring-2 focus:ring-[#f3cd08]'
                              }`}
                            />
                          </div>
                          {errors.contact_email && (
                            <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>
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
                              value={formData.contact_telephone}
                              onChange={handleChange('contact_telephone')}
                              placeholder="+237 6XX XXX XXX"
                              className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl outline-none transition-all ${
                                errors.contact_telephone 
                                  ? 'ring-2 ring-red-500' 
                                  : 'focus:ring-2 focus:ring-[#f3cd08]'
                              }`}
                            />
                          </div>
                          {errors.contact_telephone && (
                            <p className="text-xs text-red-500 mt-1">{errors.contact_telephone}</p>
                          )}
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Récapitulatif</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Service:</span>
                              <span className="font-bold">{formData.title || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Catégorie:</span>
                              <span className="font-medium">{formData.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Offre:</span>
                              <span className="font-bold text-[#f3cd08]">{selectedOffre?.nom || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Prix:</span>
                              <span className="font-bold">{selectedOffre?.prix?.toLocaleString() || 0} FCFA</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold"
                          >
                            ← Retour
                          </button>
                          <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-4 bg-[#f3cd08] text-black rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Envoi...</span>
                              </>
                            ) : (
                              <>
                                <span>Envoyer</span>
                                <Sparkles className="w-4 h-4" />
                              </>
                            )}
                          </motion.button>
                        </div>

                        <p className="text-xs text-gray-400 text-center">
                          Votre demande sera examinée sous 24h. Paiement après validation.
                        </p>
                      </motion.form>
                    )}
                  </>
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
