/**
 * @fileoverview MarketplaceSection - Section marketplace pour homepage
 * 
 * Affiche une grille de services marketplace sur la page d'accueil
 * avec un design élégant et moderne.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Store, ArrowRight, Sparkles } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import MarketplaceCard from './MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const MarketplaceSection = ({ maxItems = 6, showTitle = true, variant = 'default' }) => {
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const isUserScrolling = useRef(false);
  const userScrollTimeout = useRef(null);

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

  // Auto-scroll fluide avec CSS animation pour la variante compacte
  const startAutoScroll = useCallback(() => {
    if (!scrollRef.current || variant !== 'compact' || services.length === 0) return;
    
    const scrollContainer = scrollRef.current;
    const scrollSpeed = 0.5; // pixels par frame
    
    const animate = () => {
      if (!scrollContainer || isUserScrolling.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calcul du seuil de reset (moitié du contenu car on duplique)
      const halfWidth = scrollContainer.scrollWidth / 2;
      
      // Avancer le scroll
      scrollContainer.scrollLeft += scrollSpeed;
      
      // Reset silencieux quand on atteint la moitié (seamless loop)
      if (scrollContainer.scrollLeft >= halfWidth) {
        scrollContainer.scrollLeft = 0;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [variant, services.length]);

  // Gestion de l'interaction utilisateur
  const handleUserInteraction = useCallback(() => {
    isUserScrolling.current = true;
    
    // Clear le timeout précédent
    if (userScrollTimeout.current) {
      clearTimeout(userScrollTimeout.current);
    }
    
    // Reprendre l'auto-scroll après 3 secondes d'inactivité
    userScrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 3000);
  }, []);

  useEffect(() => {
    if (variant === 'compact' && services.length > 0) {
      startAutoScroll();
      
      const scrollContainer = scrollRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener('touchstart', handleUserInteraction, { passive: true });
        scrollContainer.addEventListener('mousedown', handleUserInteraction);
        scrollContainer.addEventListener('wheel', handleUserInteraction, { passive: true });
      }
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (userScrollTimeout.current) {
          clearTimeout(userScrollTimeout.current);
        }
        if (scrollContainer) {
          scrollContainer.removeEventListener('touchstart', handleUserInteraction);
          scrollContainer.removeEventListener('mousedown', handleUserInteraction);
          scrollContainer.removeEventListener('wheel', handleUserInteraction);
        }
      };
    }
  }, [variant, services, startAutoScroll, handleUserInteraction]);

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

  // Variante compacte pour mobile (Homepage)
  if (variant === 'compact') {
    // Tripler les services pour un défilement vraiment fluide
    const loopedServices = [...services, ...services, ...services];
    
    return (
      <div className="space-y-3 py-2">
        {showTitle && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#f3cd08] rounded-full" />
              <h3 className="text-[10px] font-black text-[#141414] uppercase tracking-widest">
                Notre Marketplace
              </h3>
            </div>
            <button 
              onClick={() => navigate('/marketplace')}
              className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-[#f3cd08] transition-all"
            >
              Voir tout
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'auto' // Important: pas de smooth pour éviter les conflits
          }}
        >
          {loopedServices.map((service, index) => (
            <div
              key={`item-${index}`}
              className="flex-shrink-0 w-36"
            >
              <MarketplaceCard service={service} variant="compact" />
            </div>
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
