/**
 * @fileoverview PricingPageMobile - Page pricing version mobile
 * 
 * Affiche les offres d'abonnement avec design mobile-first,
 * slider horizontal et formulaire de souscription.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, Sparkles, Shield, Zap, Users, Eye, TrendingUp, Headphones } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useTranslation } from 'react-i18next';
import PricingCard from '../components/PricingCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { getOffresAbonnement, createSouscription } from '../services/pricingService';

const FEATURES_LIST = [
  { icon: Eye, text_key: 'pricing.increased_visibility' },
  { icon: TrendingUp, text_key: 'pricing.boosted_clientele' },
  { icon: Headphones, text_key: 'pricing.dedicated_support' },
];

export default function PricingPageMobile() {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-white">
      {/* Header - Plus épuré */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-50">
        <div className="px-6 pt-14 pb-6 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-[#f3cd08] rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('pricing.partnerships')}</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
              Pri<span className="text-[#f3cd08]">cing</span>
            </h1>
          </div>
          
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-8 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
            {t('pricing.boost_growth')}
          </h2>
          <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
            {t('pricing.join_ecosystem')}
          </p>
        </motion.div>
      </div>

      {/* Offres */}
      <div className="px-6 pb-12">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-gray-50 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
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

      {/* Features - Design minimaliste */}
      <div className="px-8 py-16 bg-gray-50/50 border-t border-gray-50">
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10 text-center">
          {t('pricing.included_in_each_plan')}
        </h3>
        <div className="grid grid-cols-1 gap-8">
          {FEATURES_LIST.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <feature.icon className="w-6 h-6 text-[#f3cd08]" />
              </div>
              <span className="text-sm font-black italic uppercase tracking-tighter">{t(feature.text_key)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-8 py-16 text-center bg-white">
        <p className="text-sm text-gray-400 font-medium mb-6">
          Besoin d'une solution sur mesure ?
        </p>
        <button 
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-[#141414] text-[#f3cd08] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10"
        >
          Nous contacter
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
