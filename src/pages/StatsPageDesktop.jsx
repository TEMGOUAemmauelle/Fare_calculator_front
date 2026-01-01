
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { 
  ArrowLeft, TrendingUp, MapPin, DollarSign, Clock, 
  AlertTriangle, Filter, X, Calendar, ChevronRight, BarChart3, Loader2,
  PieChart, Activity, Zap, Sparkles, Target, Compass, Award
} from 'lucide-react';
import { getStats } from '../services/statsService';
import NavbarDesktop from '../components/NavbarDesktop';
import { motion, AnimatePresence } from 'framer-motion';

export default function StatsPageDesktop() {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getStats(period);
        setStats(data);
      } catch (err) {
        setError(t('stats.error_loading') || "Impossible de charger les statistiques.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchStats();
  }, [period, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#f3cd08]" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Analysing Data Streams...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      {/* NAVBAR */}
      <NavbarDesktop activeRoute="/stats" />

      <main className="pt-40 pb-32 px-12 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Live Insights</span>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Data<span className="text-[#f3cd08]">Dashboard</span>
                </motion.h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                    Visualisez les tendances du transport en temps réel grâce aux contributions de notre communauté.
                </p>
            </div>

            <div className="flex bg-gray-50 p-1.5 rounded-4xl border border-gray-100">
                {[
                    { id: 'all', label: t('stats.filters.all') },
                    { id: 'month', label: t('stats.filters.month') },
                    { id: 'week', label: t('stats.filters.week') }
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => setPeriod(opt.id)}
                        className={`px-8 py-3.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${period === opt.id ? 'bg-[#141414] text-[#f3cd08] shadow-xl' : 'text-gray-400 hover:text-black'}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#f3cd08]" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trajets Analysés</p>
                   <p className="text-4xl font-black italic tracking-tighter tabular-nums">{stats.total_trajets}</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Zones Actives</p>
                   <p className="text-4xl font-black italic tracking-tighter tabular-nums">{stats.lieux_populaires.arrivee.length * 2}</p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Moyenne Prix</p>
                   <p className="text-4xl font-black italic tracking-tighter tabular-nums">~850<span className="text-xs uppercase ml-1">CFA</span></p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Compass className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fiabilité</p>
                   <p className="text-4xl font-black italic tracking-tighter tabular-nums">98.2<span className="text-xs ml-0.5">%</span></p>
                </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT SIDE: POPULAR DESTINATIONS */}
            <div className="lg:col-span-8 space-y-12">
                <section className="bg-gray-50 rounded-[3.5rem] p-12 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity" />
                     <div className="relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <Target className="w-8 h-8 text-blue-500" />
                                Top Destinations
                            </h3>
                            <div className="px-4 py-2 bg-white rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-400">Classement Volume</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {stats.lieux_populaires.arrivee.slice(0, 6).map((lieu, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-8 rounded-4xl shadow-sm border border-white hover:border-blue-100 transition-all flex items-center gap-8 group/item hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic shrink-0 transition-all ${idx === 0 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-300 group-hover/item:bg-blue-50 group-hover/item:text-blue-500'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-3">
                                            <span className="text-lg font-black text-[#141414] truncate italic uppercase tracking-tighter">{lieu.point_arrivee__label}</span>
                                            <span className="text-xs font-black text-blue-500 tabular-nums">{lieu.count}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(lieu.count / stats.lieux_populaires.arrivee[0].count) * 100}%` }}
                                                className="h-full bg-blue-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                     </div>
                </section>

                {/* CRITICAL ZONES */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 px-1">
                        <AlertTriangle className="w-6 h-6 text-[#f3cd08]" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Zones de Tension</h3>
                    </div>
                    <div className="flex overflow-x-auto pb-8 gap-8 hide-scrollbar snap-x">
                        {stats.trajets_difficiles.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                className="snap-center shrink-0 w-[350px] bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:border-[#f3cd08]/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Qualité Trajet</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-black text-[#141414] italic tracking-tighter">{item.qualite_trajet}/10</span>
                                            <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-red-100">Critical</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Compass className="w-5 h-5" /></div>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                                        <span className="text-sm font-bold text-gray-600 truncate">{item.point_depart.label}</span>
                                     </div>
                                     <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-[#f3cd08]" />
                                        <span className="text-sm font-black text-gray-900 truncate uppercase italic tracking-tight">{item.point_arrivee.label}</span>
                                     </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* RIGHT SIDE: INSIGHTS & MONTH'S DESTINATION */}
            <div className="lg:col-span-4 space-y-12">
                {stats.lieu_du_mois && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#141414] rounded-[3.5rem] p-12 text-white relative overflow-hidden group h-[500px] flex flex-col justify-between">
                         <div className="absolute top-0 right-0 w-80 h-80 bg-[#f3cd08] rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity" />
                         
                         <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#f3cd08] rounded-full">
                                <Award className="w-4 h-4 text-black" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-black">Destination Elue</span>
                            </div>
                            <h4 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{stats.lieu_du_mois.point_arrivee__label}</h4>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed uppercase tracking-wide">Plus grand volume d'échanges détecté sur les 30 derniers jours.</p>
                         </div>

                         <div className="relative z-10">
                            <div className="flex items-baseline gap-4 mb-2">
                                <span className="text-7xl font-black italic text-[#f3cd08] tabular-nums tracking-tighter">{stats.lieu_du_mois.count}</span>
                                <span className="text-lg font-black uppercase tracking-widest text-white/40">Visites</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5 }} className="h-full bg-[#f3cd08]" />
                            </div>
                         </div>
                    </motion.div>
                )}

                <div className="bg-gray-50 rounded-[3rem] p-10 space-y-8">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        Analyses IA
                    </h4>
                    <div className="space-y-6">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Heure de Pointe</p>
                            <p className="text-lg font-black italic uppercase tracking-tight">17h00 - 19h30</p>
                            <p className="text-[10px] font-medium text-gray-500">+45% de variation de prix détectée</p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact Météo</p>
                            <p className="text-lg font-black italic uppercase tracking-tight">Forte Corrélation</p>
                            <p className="text-[10px] font-medium text-gray-500">Les prix augmentent de 25% sous la pluie</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/trajets')} className="w-full py-5 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-3">
                        Tout les Trajets <ChevronRight className="w-4 h-4 text-[#f3cd08]" />
                    </button>
                </div>
            </div>
        </div>
      </main>

      <footer className="py-20 bg-[#141414] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-12 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© 2025 Fare Calc Deep Intelligence.</p>
            <div className="flex gap-10">
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Documentation API</button>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Status Réseau</button>
            </div>
        </div>
      </footer>
    </div>
  );
}
