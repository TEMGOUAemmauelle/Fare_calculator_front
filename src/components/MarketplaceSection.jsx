/**
 * @fileoverview MarketplaceSection - Section marketplace pour homepage
 * 
 * Affiche une grille de services marketplace sur la page d'accueil
 * avec un design élégant et moderne.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import MarketplaceCard from './MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const MarketplaceSection = ({ maxItems = 4, showTitle = true, variant = 'default' }) => {
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getMarketplaceServices();
        setServices(data.slice(0, maxItems));
      } catch (error) {
        console.error('Erreur chargement marketplace:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [maxItems]);

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="h-6 bg-gray-100 rounded w-48 animate-pulse" />
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!services.length) return null;

  // Variante compacte pour mobile
  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#f3cd08]" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Notre Marketplace
              </h3>
            </div>
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-[10px] font-bold text-[#f3cd08] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Voir tout
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {services.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-48"
            >
              <MarketplaceCard service={service} variant="compact" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Variante default pour desktop
  return (
    <div className="space-y-8">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f3cd08]/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-[#f3cd08]" />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                Notre <span className="text-[#f3cd08]">Marketplace</span>
              </h2>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              Des solutions partenaires pour simplifier vos déplacements
            </p>
          </div>
          <motion.button 
            whileHover={{ x: 4 }}
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-[#141414] hover:text-white rounded-xl font-bold text-sm transition-all group"
          >
            <span>Explorer tout</span>
            <ArrowRight className="w-4 h-4 group-hover:text-[#f3cd08]" />
          </motion.button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id || index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <MarketplaceCard 
              service={service} 
              variant={index === 0 && service.featured ? 'featured' : 'default'}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceSection;
