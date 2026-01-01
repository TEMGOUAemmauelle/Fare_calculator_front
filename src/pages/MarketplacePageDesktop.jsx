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
      <section className="pt-40 pb-20 px-12 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f3cd08]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3cd08]/10 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#f3cd08]" />
                <span className="text-[10px] font-black text-[#f3cd08] uppercase tracking-widest">
                  Ecosystème Partenaire
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
                Notre <br/>
                <span className="text-[#f3cd08]">Marketplace</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-md font-medium leading-relaxed">
                Découvrez les services qui transforment le quotidien au Cameroun. Mobilité, livraison et technologie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50"
            >
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un service..."
                    className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-2xl text-base font-bold outline-none ring-2 ring-transparent focus:ring-[#f3cd08]/30 transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? 'bg-[#141414] text-[#f3cd08] shadow-xl'
                          : 'bg-white text-gray-400 hover:text-black border border-gray-100'
                      }`}
                    >
                      {cat.label}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] ${
                        selectedCategory === cat.id
                          ? 'bg-[#f3cd08] text-black'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {categoryCounts[cat.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"
            >
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-400 mb-8 font-medium">
                Nous n'avons trouvé aucun service correspondant à votre recherche.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                Réinitialiser
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
                  <div className="mb-20">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-px flex-1 bg-gray-100" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[#f3cd08]" />
                        Sélection Premium
                      </h2>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div className="flex items-center gap-4 mb-10">
                      <div className="h-px flex-1 bg-gray-100" />
                      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                        Tous les services
                      </h2>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#141414] rounded-[4rem] p-16 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#f3cd08]/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-left space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Devenez <br/>
                  <span className="text-[#f3cd08]">Partenaire</span>
                </h2>
                <p className="text-gray-400 max-w-sm font-medium">
                  Propulsez votre service auprès de notre communauté grandissante au Cameroun.
                </p>
              </div>
              
              <button
                onClick={() => navigate('/pricing')}
                className="px-10 py-5 bg-[#f3cd08] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-[#f3cd08]/20"
              >
                <span>Voir les offres</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
