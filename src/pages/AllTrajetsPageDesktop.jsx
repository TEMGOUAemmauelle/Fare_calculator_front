
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { getTrajets } from '../services/trajetService';
import { 
    ArrowLeft, MapPin, Clock, Cloud, Search, Filter, 
    Navigation, Ruler, ChevronRight, ListFilter,
    Calendar, MapPinned, CreditCard, Activity, Sparkles
} from 'lucide-react';
import NavbarDesktop from '../components/NavbarDesktop';
import { motion, AnimatePresence } from 'framer-motion';

export default function AllTrajetsPageDesktop() {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHeure, setFilterHeure] = useState('all');
  const [filterMeteo, setFilterMeteo] = useState('all');

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        const data = await getTrajets({ ordering: '-date_ajout' });
        const list = Array.isArray(data) ? data : (data?.results || []);
        setTrajets(list);
      } catch (err) {
        setError(t('trajets.loading_error'));
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchTrajets();
  }, []);

  const filteredTrajets = useMemo(() => {
    return trajets.filter(trajet => {
      if (!trajet) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        (trajet.point_depart?.label || '').toLowerCase().includes(searchLower) ||
        (trajet.point_arrivee?.label || '').toLowerCase().includes(searchLower);
      const matchHeure = filterHeure === 'all' || trajet.heure === filterHeure;
      const matchMeteo = filterMeteo === 'all' || String(trajet.meteo) === filterMeteo;
      return matchSearch && matchHeure && matchMeteo;
    });
  }, [trajets, searchTerm, filterHeure, filterMeteo]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/trajets" />

      <main className="pt-40 pb-32 px-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-100">
                    <Activity className="w-4 h-4 text-[#f3cd08]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">{t('trajets.real_time_feed')}</span>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Trajets<span className="text-[#f3cd08]">{t('trajets.title').split(' ')[1]}</span>
                </motion.h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                    {t('trajets.subtitle')}
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
                <div className="relative group min-w-[400px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#f3cd08] transition-colors" />
                    <input 
                        type="text" placeholder={t('trajets.search_placeholder')} 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl text-sm font-black text-gray-700 placeholder:text-gray-300 focus:bg-white focus:border-[#f3cd08]/30 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <select value={filterHeure} onChange={(e) => setFilterHeure(e.target.value)} className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl text-[10px] font-black p-4 outline-none uppercase text-gray-400 appearance-none cursor-pointer hover:border-gray-100 text-center">
                        <option value="all">{t('trajets.filter_all_hours')}</option>
                        <option value="matin">{t('trajets.filter_morning')}</option>
                        <option value="apres-midi">{t('trajets.filter_afternoon')}</option>
                        <option value="soir">{t('trajets.filter_evening')}</option>
                        <option value="nuit">{t('trajets.filter_night')}</option>
                    </select>
                    <select value={filterMeteo} onChange={(e) => setFilterMeteo(e.target.value)} className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl text-[10px] font-black p-4 outline-none uppercase text-gray-400 appearance-none cursor-pointer hover:border-gray-100 text-center">
                        <option value="all">{t('trajets.filter_weather')}</option>
                        <option value="0">{t('trajets.filter_sunny')}</option>
                        <option value="2">{t('trajets.filter_rainy')}</option>
                    </select>
                </div>
            </div>
        </header>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-50 rounded-[2.5rem] animate-pulse" />)}
            </div>
        ) : (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredTrajets.map((trajet, idx) => (
                    <motion.div
                        key={trajet.id || idx}
                        variants={itemVariants}
                        className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-[#f3cd08]/30 transition-all overflow-hidden flex flex-col h-[320px]"
                    >
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{t('trajets.price_paid')}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-[#141414] italic tracking-tighter tabular-nums">{trajet.prix?.toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-[#f3cd08] uppercase">{t('trajets.currency')}</span>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-2xl group-hover:bg-[#141414] transition-colors">
                                <span className="text-[10px] font-black text-gray-400 group-hover:text-[#f3cd08] tabular-nums">
                                    {trajet.date_ajout ? new Date(trajet.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '---'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                             <div className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-1.5 shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">{t('trajets.departure')}</span>
                                    <span className="text-sm font-bold text-gray-600 truncate">{trajet.point_depart?.label || t('trajets.unknown_location')}</span>
                                </div>
                             </div>
                             <div className="flex items-start gap-4">
                                <Navigation className="w-4 h-4 text-[#f3cd08] mt-1 shrink-0 transform rotate-45" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">{t('trajets.arrival')}</span>
                                    <span className="text-sm font-black text-gray-900 truncate uppercase italic tracking-tight">{trajet.point_arrivee?.label || t('trajets.unknown_location')}</span>
                                </div>
                             </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between shrink-0">
                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 bg-gray-50 rounded-xl flex items-center gap-2 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-[9px] font-black uppercase text-gray-500">{trajet.heure}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-gray-50 rounded-xl flex items-center gap-2 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-100 transition-all">
                                    <Cloud className="w-3 h-3 text-gray-400" />
                                    <span className="text-[9px] font-black uppercase text-gray-500">{trajet.meteo === 2 ? t('trajets.filter_rainy') : t('trajets.filter_sunny')}</span>
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black italic text-[#f3cd08]">{trajet.qualite_trajet || 5}/10</span>
                                <span className="text-[7px] font-black text-gray-200 uppercase tracking-widest">{t('add.quality_label')}</span>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#f3cd08] rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity" />
                    </motion.div>
                ))}
            </motion.div>
        )}

        {!loading && filteredTrajets.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center gap-6">
                <div className="p-10 bg-gray-50 rounded-full">
                    <MapPinned className="w-16 h-16 text-gray-200" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-300">{t('trajets.no_matching_trajets')}</h3>
                <button onClick={() => { setSearchTerm(''); setFilterHeure('all'); setFilterMeteo('all'); }} className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f3cd08] hover:text-black transition-all shadow-xl">
                    {t('trajets.reset_filters')}
                </button>
            </div>
        )}
      </main>

      <footer className="py-20 bg-[#141414] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-12 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{t('trajets.copyright')}</p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>{t('trajets.total_contributions')} {trajets.length}</span>
                <span className="text-white">{t('trajets.active_nodes')} 1,420</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
