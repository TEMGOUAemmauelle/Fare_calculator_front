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
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#f3cd08]" />
              <h1 className="text-lg font-black uppercase tracking-tight italic">
                Marketplace
              </h1>
            </div>
            
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-400"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#f3cd08] transition-all"
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#141414] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="pt-52 pb-8 px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">
              Aucun service trouvé
            </h3>
            <p className="text-sm text-gray-400">
              Essayez avec d'autres critères de recherche
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === 'grid' 
                ? 'grid grid-cols-2 gap-4' 
                : 'flex flex-col gap-3'
              }
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
                    variant={viewMode === 'grid' ? 'compact' : 'default'}
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
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-400">
              {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} disponible{filteredServices.length > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
