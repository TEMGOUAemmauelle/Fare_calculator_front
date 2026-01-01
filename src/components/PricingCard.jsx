/**
 * @fileoverview PricingCard - Carte d'offre d'abonnement
 * 
 * Composant élégant pour afficher une offre d'abonnement
 * avec animation et design moderne.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

const TIER_CONFIG = {
  starter: {
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    badge: null
  },
  business: {
    icon: Sparkles,
    gradient: 'from-[#f3cd08] to-amber-500',
    shadow: 'shadow-amber-500/20',
    badge: 'Populaire'
  },
  premium: {
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20',
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

  // Parser les fonctionnalités (supposées séparées par des virgules ou en JSON)
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
        className={`relative p-5 rounded-2xl border-2 ${
          isFeatured 
            ? 'border-[#f3cd08] bg-gradient-to-br from-[#f3cd08]/5 to-transparent' 
            : 'border-gray-100 bg-white'
        }`}
      >
        {config.badge && (
          <div className="absolute -top-3 left-4">
            <span className={`px-3 py-1 bg-gradient-to-r ${config.gradient} text-white text-[9px] font-black uppercase tracking-wide rounded-full`}>
              {config.badge}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <TierIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{offre.nom}</h3>
            <p className="text-xs text-gray-500">{offre.duree_jours} jours</p>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-2xl font-black">{formatPrice(offre.prix)}</span>
          {offre.prix > 0 && <span className="text-gray-400 text-sm ml-1">FCFA</span>}
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSubscribe?.(offre)}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            isFeatured
              ? 'bg-[#141414] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isLoading ? 'Chargement...' : 'Souscrire'}
        </motion.button>
      </motion.div>
    );
  }

  // Variante default / featured
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={`relative p-8 rounded-3xl transition-all ${
        isFeatured 
          ? `border-2 border-[#f3cd08] bg-gradient-to-br from-[#f3cd08]/5 via-white to-white shadow-2xl ${config.shadow}` 
          : 'border-2 border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl'
      }`}
    >
      {/* Badge */}
      {config.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className={`px-4 py-1.5 bg-gradient-to-r ${config.gradient} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}
          >
            {config.badge}
          </motion.span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg ${config.shadow}`}>
          <TierIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">{offre.nom}</h3>
        <p className="text-sm text-gray-500">{offre.description}</p>
      </div>

      {/* Prix */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-black">{formatPrice(offre.prix)}</span>
          {offre.prix > 0 && (
            <span className="text-gray-400 text-lg font-medium">FCFA</span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          pour {offre.duree_jours} jours
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-gray-600 text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubscribe?.(offre)}
        disabled={isLoading}
        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isFeatured
            ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg hover:shadow-xl ${config.shadow}`
            : 'bg-[#141414] text-white hover:bg-gray-800'
        }`}
      >
        {isLoading ? (
          <span>Chargement...</span>
        ) : (
          <>
            <span>Commencer maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default PricingCard;
