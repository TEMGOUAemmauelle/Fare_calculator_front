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
  Building2, ChevronRight, Eye, TrendingUp
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import NavbarDesktop from '../components/NavbarDesktop';
import PricingCard from '../components/PricingCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { getOffresAbonnement, createSouscription } from '../services/pricingService';

const ALL_FEATURES = [
  { icon: Eye, title: "Visibilité accrue", desc: "Mise en avant de votre service auprès de notre communauté active." },
  { icon: TrendingUp, title: "Clientèle boostée", desc: "Attirez de nouveaux clients grâce à notre plateforme de recommandation." },
  { icon: Headphones, title: "Support dédié", desc: "Une assistance technique et commerciale à votre écoute." },
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
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/pricing" />

      {/* HERO SECTION - Plus épuré */}
      <section className="pt-44 pb-24 px-12 bg-white relative overflow-hidden">
        {/* Background decoration subtile */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full mb-8 border border-gray-100">
              <Sparkles className="w-4 h-4 text-[#f3cd08]" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Partenariats & API
              </span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
              Boostez votre <br/>
              <span className="text-[#f3cd08]">Croissance</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Rejoignez l'écosystème FareCal et profitez d'une visibilité unique auprès des voyageurs au Cameroun.
            </p>
          </motion.div>

          {/* Pricing Cards - Layout plus équilibré */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[500px] bg-gray-50 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto items-stretch"
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

      {/* FEATURES SECTION - Design minimaliste */}
      <section className="py-32 px-12 bg-gray-50/50 border-y border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {ALL_FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-gray-200/50 group hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-[#f3cd08]" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{feature.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CTA - Plus pro et épuré */}
      <section className="py-32 px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#141414] rounded-[4rem] p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#f3cd08]/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                  <Building2 className="w-4 h-4 text-[#f3cd08]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Solutions Enterprise
                  </span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Besoin de <br/>
                  <span className="text-[#f3cd08]">Sur-mesure ?</span>
                </h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                  Volume illimité, intégration dédiée et support prioritaire. Parlons de votre projet.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-10 py-5 bg-[#f3cd08] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-[#f3cd08]/20"
                >
                  <span>Contacter l'équipe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 space-y-6">
                {[
                  "Volume de requêtes illimité",
                  "SLA garanti 99.9%",
                  "Support prioritaire 24/7",
                  "Intégration accompagnée",
                  "Facturation personnalisée"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 bg-[#f3cd08]/20 rounded-lg flex items-center justify-center group-hover:bg-[#f3cd08] transition-colors">
                      <Check className="w-3 h-3 text-[#f3cd08] group-hover:text-black transition-colors" strokeWidth={4} />
                    </div>
                    <span className="text-gray-300 font-bold text-sm tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
