/**
 * @fileoverview PricingPageMobile - Page pricing version mobile
 * 
 * Affiche les offres d'abonnement avec design mobile-first,
 * slider horizontal et formulaire de souscription.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, Sparkles, Shield, Zap, Users } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import PricingCard from '../components/PricingCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { getOffresAbonnement, createSouscription } from '../services/pricingService';

const FEATURES_LIST = [
  { icon: Shield, text: "Accès API sécurisé" },
  { icon: Zap, text: "Estimations illimitées" },
  { icon: Users, text: "Support dédié" },
];

export default function PricingPageMobile() {
  const navigate = useAppNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        const data = await getOffresAbonnement();
        setOffres(data);
      } catch (error) {
        console.error('Erreur chargement offres:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffres();
  }, []);

  const handleSubscribe = (offre) => {
    setSelectedOffre(offre);
    setShowForm(true);
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      await createSouscription(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-gray-50 rounded-xl active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#f3cd08]" />
            <h1 className="text-lg font-black uppercase tracking-tight italic">
              Pricing
            </h1>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3cd08]/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#f3cd08]" />
            <span className="text-xs font-bold text-[#f3cd08] uppercase tracking-wide">
              Devenez partenaire
            </span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-3">
            Choisissez votre <span className="text-[#f3cd08]">plan</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Accédez à notre API et intégrez les estimations de taxi dans votre application
          </p>
        </motion.div>
      </div>

      {/* Offres */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {offres.map((offre, index) => (
              <motion.div
                key={offre.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PricingCard 
                  offre={offre} 
                  variant="compact"
                  onSubscribe={handleSubscribe}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Features */}
      <div className="px-6 py-8 bg-white border-t border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 text-center">
          Inclus dans tous les plans
        </h3>
        <div className="space-y-4">
          {FEATURES_LIST.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
            >
              <div className="w-10 h-10 bg-[#f3cd08]/10 rounded-xl flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-[#f3cd08]" />
              </div>
              <span className="font-medium text-gray-700">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ teaser */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Des questions sur nos offres ?
        </p>
        <button 
          onClick={() => navigate('/contact')}
          className="text-[#f3cd08] font-bold text-sm"
        >
          Contactez-nous →
        </button>
      </div>

      {/* Subscription Form Modal */}
      <SubscriptionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedOffre={selectedOffre}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
