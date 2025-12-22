import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { getTrajets } from '../services/trajetService';
import { ArrowLeft, MapPin, Clock, Cloud, Search, Filter, Calendar, X } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import yellowTaxiAnimation from '../assets/lotties/yellow taxi.json';
import { motion, AnimatePresence } from 'framer-motion';

const AllTrajetsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHeure, setFilterHeure] = useState('all');
  const [filterMeteo, setFilterMeteo] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        const data = await getTrajets({ ordering: 'point_depart__label' });
        const list = data.results || data;
        setTrajets(list);
      } catch (err) {
        console.error("Erreur chargement trajets:", err);
        setError(t('common.error') + ": " + t('all_trajets.error_loading'));
      } finally {
        // Petit délai artificiel pour laisser voir l'animation si c'est trop rapide
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchTrajets();
  }, []);

  // Filtrage des trajets
  const filteredTrajets = useMemo(() => {
    return trajets.filter(trajet => {
      // Recherche textuelle (départ ou arrivée)
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        (trajet.point_depart?.label || '').toLowerCase().includes(searchLower) ||
        (trajet.point_arrivee?.label || '').toLowerCase().includes(searchLower);

      // Filtre Heure
      const matchHeure = filterHeure === 'all' || trajet.heure === filterHeure;

      // Filtre Météo
      const matchMeteo = filterMeteo === 'all' || String(trajet.meteo) === filterMeteo;

      return matchSearch && matchHeure && matchMeteo;
    });
  }, [trajets, searchTerm, filterHeure, filterMeteo]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-CM' : 'en-CM', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getMeteoLabel = (code) => {
    return t(`constants.weather.${code}`) || t('common.unknown');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans selection:bg-[#f3cd08]/30">
      {/* 1. STICKY HEADER - PREMIUM BLUR */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2.5 bg-gray-50 hover:bg-yellow-50 rounded-2xl transition-all text-gray-700 active:scale-90"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t('all_trajets.title')} <span className="text-[#f3cd08]">{t('all_trajets.subtitle')}</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('all_trajets.description')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                <LottieAnimation animationData={yellowTaxiAnimation} loop={true} />
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-[#f3cd08] transition-colors" />
              <input
                type="text"
                placeholder={t('all_trajets.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-[#f3cd08]/30 focus:ring-4 focus:ring-[#f3cd08]/5 transition-all outline-none text-gray-700 font-medium placeholder-gray-400 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-[1.25rem] border transition-all active:scale-95 ${showFilters ? 'bg-[#f3cd08] border-[#f3cd08] text-black shadow-lg shadow-[#f3cd08]/20' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <Filter className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 flex flex-wrap gap-2">
                  <FilterChip 
                    label={t('all_trajets.filters.period')}
                    value={filterHeure}
                    onChange={setFilterHeure}
                    options={[
                      { id: 'all', label: t('all_trajets.filters.all') },
                      { id: 'matin', label: t('constants.time.matin') },
                      { id: 'apres-midi', label: t('constants.time.apres-midi') },
                      { id: 'soir', label: t('constants.time.soir') },
                      { id: 'nuit', label: t('constants.time.nuit') },
                    ]}
                  />

                  <FilterChip 
                    label={t('all_trajets.filters.weather')}
                    value={filterMeteo}
                    onChange={setFilterMeteo}
                    options={[
                      { id: 'all', label: t('all_trajets.filters.all') },
                      { id: '0', label: t('constants.weather.0') },
                      { id: '1', label: t('constants.weather.1') },
                      { id: '2', label: t('constants.weather.2') },
                    ]}
                  />

                  {(filterHeure !== 'all' || filterMeteo !== 'all') && (
                    <button 
                      onClick={() => { setFilterHeure('all'); setFilterMeteo('all'); }}
                      className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      RESET
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MAIN FEED */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-4xl mb-6 text-center border-2 border-red-100/50 font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-40 h-40 scale-150">
              <LottieAnimation animationData={yellowTaxiAnimation} loop={true} />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs mt-12 animate-pulse">{t('all_trajets.syncing')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTrajets.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-gray-300">
                  <Search className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-gray-900 leading-tight">{t('all_trajets.no_results')}</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-[200px] mx-auto">{t('all_trajets.no_results_subtitle') || "Essayez d'ajuster vos critères de recherche."}</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTrajets.map((trajet, index) => (
                    <motion.div
                      key={trajet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, type: "spring", damping: 20 }}
                      className="relative bg-white p-5 rounded-3xl shadow-[0_5px_20px_-10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] hover:border-[#f3cd08]/30 transition-all group overflow-hidden"
                    >
                      {/* Background Glow on Hover */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f3cd08]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#f3cd08]/15 transition-colors" />

                      <div className="flex flex-col md:flex-row gap-5 mb-5 relative z-10">
                        {/* Route visualization - Thinner */}
                        <div className="hidden md:flex flex-col items-center gap-1 pt-2 w-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-black ring-2 ring-gray-100" />
                          <div className="flex-1 w-[1.5px] bg-linear-to-b from-black/20 to-gray-200 border-l border-dashed border-gray-300 min-h-[40px]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#f3cd08] ring-2 ring-[#f3cd08]/20" />
                        </div>

                        <div className="flex-1 space-y-4">
                          {/* Depart - Plus fin */}
                          <div className="relative pl-5 md:pl-0">
                            <div className="md:hidden absolute left-0 top-1.5 w-2 h-2 rounded-full bg-black" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 block">{t('all_trajets.depart')}</span>
                            <h4 className="text-base font-bold text-gray-900 leading-tight truncate pr-4">
                              {trajet.point_depart?.label || t('common.unknown_sector')}
                            </h4>
                          </div>
                          
                          {/* Connecteur Mobile */}
                          <div className="md:hidden absolute left-[3.5px] top-[42px] bottom-[70px] w-[1.5px] bg-gray-100" />

                          {/* Arrivee - Plus fin */}
                          <div className="relative pl-5 md:pl-0">
                            <div className="md:hidden absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#f3cd08]" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5 block">{t('all_trajets.arrivee')}</span>
                            <h4 className="text-base font-bold text-gray-900 leading-tight truncate pr-4">
                              {trajet.point_arrivee?.label || t('common.unknown_sector')}
                            </h4>
                          </div>
                        </div>

                        {/* Price & Date - Sleek Layout */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 mt-2 md:mt-0">
                          <div className="bg-[#0a0a0a] text-[#f3cd08] px-4 py-2 rounded-xl shadow-lg shadow-[#f3cd08]/10 group-hover:scale-105 transition-transform">
                            <span className="text-sm font-black tracking-wide">{formatPrice(trajet.prix).replace(',00', '')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{formatDate(trajet.date_ajout)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Footer - Compact */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-50 relative z-10">
                        <MetaBadge icon={Clock} label={t(`constants.time.${trajet.heure}`)} />
                        <MetaBadge icon={Cloud} label={getMeteoLabel(trajet.meteo)} />
                        {trajet.distance && (
                          <MetaBadge 
                            icon={MapPin} 
                            label={`${(trajet.distance / 1000).toFixed(1)} km`} 
                            highlight
                          />
                        )}
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// UI Components
function FilterChip({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest pl-1">{label}</span>
      <div className="flex gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-100">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${value === opt.id ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetaBadge({ icon: Icon, label, highlight }) {
  if (!label) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-colors ${highlight ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-100 group-hover:bg-white group-hover:border-gray-200'}`}>
      <Icon className={`w-3 h-3 ${highlight ? 'text-[#f3cd08]' : 'text-gray-400'}`} />
      <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
    </div>
  );
}

export default AllTrajetsPage;
