/**
 * @fileoverview PricingCard - Carte d'offre d'abonnement
 * 
 * Composant minimaliste et professionnel pour afficher une offre d'abonnement.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

const TIER_CONFIG = {
  starter: {
    icon: Zap,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    badge: null
  },
  business: {
    icon: Sparkles,
    color: 'text-[#f3cd08]',
    bg: 'bg-[#f3cd08]/10',
    badge: 'Populaire'
  },
  premium: {
    icon: Crown,
    color: 'text-gray-900',
    bg: 'bg-gray-100',
    badge: 'Premium'
  }
};

const PricingCard = ({ 
  offre, 
  variant = 'default', // 'default' | 'featured' | 'compact'
  onSubscribe,
  isLoading = false 
}) => {
  const tierKey = offre.nom?.toLowerCase().includes('premium') 
    ? 'premium' 
    : offre.nom?.toLowerCase().includes('business') 
      ? 'business' 
      : 'starter';
  
  const config = TIER_CONFIG[tierKey];
  const TierIcon = config.icon;
  
  // Formatter le prix
  const formatPrice = (prix) => {
    if (prix === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(prix);
  };

  // Parser les fonctionnalités
  const parseFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    try {
      return JSON.parse(features);
    } catch {
      return features.split(',').map(f => f.trim()).filter(Boolean);
    }
  };
  
  const features = parseFeatures(offre.fonctionnalites);
  const isFeatured = tierKey === 'business' || variant === 'featured';

  // Variante compacte (pour mobile)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`relative p-6 rounded-[2.5rem] border ${
          isFeatured 
            ? 'border-[#f3cd08] bg-white shadow-xl shadow-[#f3cd08]/5' 
            : 'border-gray-100 bg-white'
        }`}
      >
        {config.badge && (
          <div className="absolute -top-3 left-8">
            <span className={`px-3 py-1 ${isFeatured ? 'bg-[#f3cd08] text-black' : 'bg-gray-900 text-white'} text-[8px] font-black uppercase tracking-[0.2em] rounded-full`}>
              {config.badge}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center`}>
              <TierIcon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-tighter text-lg">{offre.nom}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="text-gray-900 mr-1">{offre.duree_jours}</span>
                JOURS
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tighter italic">{formatPrice(offre.prix)}</span>
          {offre.prix > 0 && <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">FCFA</span>}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onSubscribe?.(offre)}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${
            isFeatured
              ? 'bg-[#f3cd08] text-black border-[#f3cd08] shadow-lg shadow-[#f3cd08]/20'
              : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isLoading ? '...' : 'Souscrire'}
        </motion.button>
      </motion.div>
    );
  }

  // Variante default / featured (Desktop)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative p-10 rounded-[3rem] transition-all border ${
        isFeatured 
          ? 'border-[#f3cd08] bg-white shadow-2xl shadow-[#f3cd08]/10' 
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      {config.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className={`px-4 py-1.5 ${isFeatured ? 'bg-[#f3cd08] text-black' : 'bg-gray-900 text-white'} text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg`}>
            {config.badge}
          </span>
        </div>
      )}

      <div className="text-center mb-10">
        <div className={`w-20 h-20 rounded-[2rem] ${config.bg} flex items-center justify-center mx-auto mb-6`}>
          <TierIcon className={`w-10 h-10 ${config.color}`} />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{offre.nom}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{offre.duree_jours} jours d'accès</p>
      </div>

      <div className="text-center mb-10">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-black tracking-tighter italic">{formatPrice(offre.prix)}</span>
          {offre.prix > 0 && <span className="text-gray-400 text-xs font-black uppercase tracking-widest">FCFA</span>}
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full ${isFeatured ? 'bg-[#f3cd08]/20' : 'bg-gray-50'} flex items-center justify-center flex-shrink-0`}>
              <Check className={`w-3 h-3 ${isFeatured ? 'text-[#f3cd08]' : 'text-gray-400'}`} />
            </div>
            <span className="text-sm font-medium text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubscribe?.(offre)}
        disabled={isLoading}
        className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
          isFeatured
            ? 'bg-[#f3cd08] text-black shadow-xl shadow-[#f3cd08]/20'
            : 'bg-gray-900 text-white hover:bg-black'
        }`}
      >
        {isLoading ? 'Traitement...' : 'Choisir ce plan'}
      </motion.button>
    </motion.div>
  );
};

export default PricingCard;
