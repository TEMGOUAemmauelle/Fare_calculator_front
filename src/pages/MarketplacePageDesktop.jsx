/**
 * @fileoverview MarketplacePageDesktop - Page marketplace version desktop
 * 
 * Page complète du marketplace avec grille de services,
 * filtres avancés et design professionnel.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Search, Filter, Sparkles, Grid, List, 
  ArrowRight, ExternalLink, PlusCircle, BarChart2, Globe 
} from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import NavbarDesktop from '../components/NavbarDesktop';
import MarketplaceCard from '../components/MarketplaceCard';
import { getMarketplaceServices } from '../services/marketplaceService';

const CATEGORIES = [
  { id: 'all', label: 'Tous les services', icon: Grid, count: 0 },
  { id: 'transport', label: 'Transport', icon: null, count: 0 },
  { id: 'delivery', label: 'Livraison', icon: null, count: 0 },
  { id: 'tech', label: 'Technologie', icon: null, count: 0 },
  { id: 'finance', label: 'Finance', icon: null, count: 0 },
];

export default function MarketplacePageDesktop() {
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getMarketplaceServices();
        setServices(data);
        setFilteredServices(data);
        
        // Calculer les comptages par catégorie
        const counts = { all: data.length };
        data.forEach(s => {
          const cat = s.categorie?.toLowerCase() || 'other';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);
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
      filtered = filtered.filter(s => 
        s.categorie?.toLowerCase() === selectedCategory.toLowerCase()
      );
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

  // Séparer les services featured
  const featuredServices = filteredServices.filter(s => s.featured);
  const regularServices = filteredServices.filter(s => !s.featured);

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/marketplace" />

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-[#f3cd08]/10 rounded-2xl">
                <Store className="w-8 h-8 text-[#f3cd08]" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mb-4">
              Services <span className="text-[#f3cd08]">Marketplace</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Découvrez nos services partenaires pour simplifier vos déplacements et votre quotidien au Cameroun
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un service, une catégorie..."
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-base font-medium outline-none focus:border-[#f3cd08] transition-all shadow-lg"
              />
            </div>
          </motion.div>

          {/* Filtres par catégorie */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-[#141414] text-white shadow-lg'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {cat.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  selectedCategory === cat.id
                    ? 'bg-[#f3cd08] text-black'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-16 px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">
                Aucun service trouvé
              </h3>
              <p className="text-gray-400 mb-6">
                Essayez avec d'autres critères de recherche
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Featured Services */}
                {featuredServices.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#f3cd08]" />
                      Services en vedette
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {featuredServices.map((service, index) => (
                        <motion.div
                          key={service.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <MarketplaceCard service={service} variant="featured" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Services */}
                {regularServices.length > 0 && (
                  <div>
                    {featuredServices.length > 0 && (
                      <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">
                        Tous les services
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularServices.map((service, index) => (
                        <motion.div
                          key={service.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <MarketplaceCard service={service} variant="default" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Stats */}
          {!loading && filteredServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <p className="text-sm text-gray-400">
                {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} disponible{filteredServices.length > 1 ? 's' : ''}
                {selectedCategory !== 'all' && ` dans "${CATEGORIES.find(c => c.id === selectedCategory)?.label}"`}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
            Vous avez un service à <span className="text-[#f3cd08]">proposer</span> ?
          </h2>
          <p className="text-gray-400 mb-8">
            Rejoignez notre marketplace et touchez des milliers d'utilisateurs au Cameroun
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold text-sm flex items-center gap-3 mx-auto hover:scale-105 transition-transform"
          >
            <span>Devenir partenaire</span>
            <ArrowRight className="w-5 h-5 text-[#f3cd08]" />
          </button>
        </div>
      </section>
    </div>
  );
}
