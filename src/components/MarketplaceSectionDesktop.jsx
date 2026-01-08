/**
 * @fileoverview MarketplaceSectionDesktop - Section Marketplace dédiée au Desktop
 * 
 * Composant spécifique pour afficher les services Marketplace sur la page d'accueil Desktop.
 * Utilise getMarketplaceServices() pour les vraies données Marketplace.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ArrowRight, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { getMarketplaceServices } from '../services/marketplaceService';

const MarketplaceSectionDesktop = ({ maxItems = 4, showTitle = true }) => {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#f3cd08]" />
      </div>
    );
  }

  if (!services.length) return null;

  return (
    <div className="space-y-16">
      {/* Header Editorial */}
      {showTitle && (
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 border-b border-gray-100 pb-8">
          <div className="space-y-4 max-w-2xl">
             <motion.div 
               initial={{ width: 0 }} 
               whileInView={{ width: '100px' }} 
               className="h-2 bg-[#f3cd08]" 
             />
            <h2 className="text-6xl font-black italic uppercase tracking-tighter text-[#141414] leading-[0.85]">
              La <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px #141414' }}>Marketplace</span>
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Une sélection exclusive de services partenaires pour enrichir votre expérience.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-4 px-8 py-4 bg-[#141414] text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#f3cd08] hover:text-black transition-all shadow-xl"
          >
            <span>Explorer le catalogue</span>
            <div className="p-1 bg-white/20 rounded-full">
                <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      )}

      {/* Grid Structurée & Premium */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <motion.a
            key={service.id || index}
            href={service.url || service.lien_redirection || '#'}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col bg-white border border-gray-100 hover:border-[#141414] transition-all duration-300"
          >
            {/* Image Block - Sharp & Clean */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
                <img 
                  src={service.logo_url || service.image_url} 
                  alt={service.nom}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-[#141414] border border-gray-100">
                        {service.categorie}
                    </span>
                </div>
            </div>

            {/* Content Block */}
            <div className="flex flex-col flex-1 p-6 relative">
                <h3 className="text-xl font-black text-[#141414] uppercase leading-tight mb-3 group-hover:text-[#f3cd08] transition-colors">
                    {service.nom}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {service.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#141414] group-hover:tracking-[0.2em] transition-all">
                        En savoir plus
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center bg-[#141414] text-white group-hover:bg-[#f3cd08] group-hover:text-black transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceSectionDesktop;
