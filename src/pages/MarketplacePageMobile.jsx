/**
 * @fileoverview MarketplacePageMobile - Page marketplace version mobile
 * 
 * Liste complète des services marketplace avec filtres par catégorie,
 * design mobile-first avec animations fluides.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Store, Search, Filter, Sparkles, Grid, List } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import MarketplaceCard from '../components/MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'transport', label: 'Transport' },
  { id: 'delivery', label: 'Livraison' },
  { id: 'tech', label: 'Tech' },
  { id: 'finance', label: 'Finance' },
];

export default function MarketplacePageMobile() {
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getMarketplaceServices();
        setServices(data);
        setFilteredServices(data);
      } catch (error) {
        console.error('Erreur chargement marketplace:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => 
        s.categorie?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.nom?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixe - Design plus épuré */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-50">
        <div className="px-6 pt-14 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-[#f3cd08] rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ecosystème</span>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                Market<span className="text-[#f3cd08]">place</span>
              </h1>
            </div>
            
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          {/* Barre de recherche - Plus pro */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-[#f3cd08]/20 transition-all"
            />
          </div>

          {/* Filtres par catégorie - Plus fins */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#141414] text-[#f3cd08] shadow-lg shadow-black/10'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu - Espacement ajusté */}
      <div className="pt-64 pb-12 px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-gray-50 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="w-6 h-6 text-gray-200" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic mb-1">
              Aucun résultat
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              Essayez d'autres mots-clés
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MarketplaceCard 
                    service={service} 
                    variant="compact"
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Stats */}
        {!loading && filteredServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
