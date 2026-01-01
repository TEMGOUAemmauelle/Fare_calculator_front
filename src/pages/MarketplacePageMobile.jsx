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
import { useTranslation } from 'react-i18next';
import MarketplaceCard from '../components/MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const CATEGORIES = [
  { id: 'all', label_key: 'marketplace.categories.all' },
  { id: 'transport', label_key: 'marketplace.categories.transport' },
  { id: 'delivery', label_key: 'marketplace.categories.delivery' },
  { id: 'tech', label_key: 'marketplace.categories.tech' },
  { id: 'finance', label_key: 'marketplace.categories.finance' },
];

export default function MarketplacePageMobile() {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.categorie?.toLowerCase() === selectedCategory.toLowerCase());
    }
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
    <div className="min-h-screen bg-[#f8f8f5]">
      {/* Header Premium - Plus "Cool" */}
      <div className="relative bg-[#141414] pt-14 pb-10 px-6 overflow-hidden">
        {/* Décorations de fond */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f3cd08]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f3cd08] rounded-full">
              <Sparkles className="w-3 h-3 text-black" />
              <span className="text-[9px] font-black uppercase tracking-widest text-black">{t('marketplace.premium_ecosystem')}</span>
            </div>
          </div>

          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none text-white mb-2">
            Market<span className="text-[#f3cd08]">place</span>
          </h1>
          <p className="text-gray-400 text-xs font-medium max-w-[240px] leading-relaxed">
            {t('marketplace.description')}
          </p>
        </div>
      </div>

      {/* Barre de recherche flottante */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-2 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('marketplace.search_placeholder')}
            className="flex-1 bg-transparent border-none text-sm font-bold outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Filtres - Design horizontal épuré */}
      <div className="mt-8 px-6">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#f3cd08] text-black shadow-lg shadow-[#f3cd08]/20'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {t(CATEGORIES.find(c => c.id === cat.id)?.label_key || cat.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de services */}
      <div className="px-6 pb-12 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
            <Store className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <h3 className="text-lg font-black uppercase tracking-tighter italic text-gray-400">{t('marketplace.no_services')}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}
      </div>
    </div>
  );
}
