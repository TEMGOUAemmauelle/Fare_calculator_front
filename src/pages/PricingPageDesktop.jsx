/**
 * @fileoverview PricingPageDesktop - Page pricing version desktop
 * 
 * Page complète des offres d'abonnement avec design professionnel,
 * grille de tarifs et formulaire de souscription.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Check, Sparkles, Shield, Zap, Users, 
  Code, Globe, Headphones, ArrowRight, PlusCircle,
  Building2, ChevronRight
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import NavbarDesktop from '../components/NavbarDesktop';
import PricingCard from '../components/PricingCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { getOffresAbonnement, createSouscription } from '../services/pricingService';

const ALL_FEATURES = [
  { icon: Code, title: "API RESTful", desc: "Documentation complète et endpoints optimisés" },
  { icon: Shield, title: "Sécurité", desc: "Authentification par clé API, HTTPS obligatoire" },
  { icon: Globe, title: "Couverture nationale", desc: "Données pour tout le Cameroun" },
  { icon: Headphones, title: "Support réactif", desc: "Assistance technique dédiée" },
];

const FAQ_ITEMS = [
  { 
    q: "Comment fonctionne l'API ?", 
    a: "Notre API REST vous permet d'obtenir des estimations de prix de taxi en envoyant simplement les coordonnées de départ et d'arrivée." 
  },
  { 
    q: "Puis-je tester avant de souscrire ?", 
    a: "Oui ! L'offre Starter est gratuite et vous permet de tester l'API avec un nombre limité de requêtes." 
  },
  { 
    q: "Comment obtenir ma clé API ?", 
    a: "Après souscription, vous recevrez votre clé API par email dans les 24h." 
  },
];

export default function PricingPageDesktop() {
  const navigate = useAppNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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
    <div className="min-h-screen bg-white text-[#141414] font-sans">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/pricing" />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-12 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#f3cd08]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f3cd08]/10 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-[#f3cd08]" />
              <span className="text-sm font-bold text-[#f3cd08] uppercase tracking-wide">
                Offres Partenaires
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter mb-6">
              Tarifs <span className="text-[#f3cd08]">Transparents</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Intégrez notre API d'estimation de taxi dans votre application et offrez une meilleure expérience à vos utilisateurs
            </p>
          </motion.div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch"
            >
              {offres.map((offre, index) => (
                <motion.div
                  key={offre.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <PricingCard 
                    offre={offre} 
                    onSubscribe={handleSubscribe}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
              Inclus dans <span className="text-[#f3cd08]">chaque plan</span>
            </h2>
            <p className="text-gray-400">
              Des fonctionnalités essentielles pour tous nos partenaires
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ALL_FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-[#f3cd08]/5 transition-colors group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <feature.icon className="w-6 h-6 text-[#f3cd08]" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CTA */}
      <section className="py-20 px-12 bg-[#141414]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-[#f3cd08]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Entreprise
                </span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">
                Besoin d'une solution <span className="text-[#f3cd08]">sur mesure</span> ?
              </h2>
              <p className="text-gray-400 mb-8">
                Contactez-nous pour discuter de vos besoins spécifiques et obtenir une offre personnalisée.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-[#f3cd08] text-black rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform mx-auto lg:mx-0"
              >
                <span>Nous contacter</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <ul className="space-y-4">
                  {[
                    "Volume de requêtes illimité",
                    "SLA garanti 99.9%",
                    "Support prioritaire 24/7",
                    "Intégration accompagnée",
                    "Facturation personnalisée"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <div className="w-5 h-5 bg-[#f3cd08] rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
              Questions <span className="text-[#f3cd08]">fréquentes</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-bold">{item.q}</span>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-gray-500">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
