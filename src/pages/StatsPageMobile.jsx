
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { 
  ArrowLeft, TrendingUp, MapPin, DollarSign, Clock, 
  AlertTriangle, Award, Filter, X, Calendar, ChevronRight, BarChart3, Loader2
} from 'lucide-react';
import { getStats } from '../services/statsService';
import ErrorMessage from '../components/ErrorMessage';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CarouselAds from '../components/CarouselAds';
import { motion, AnimatePresence } from 'framer-motion';

export default function StatsPageMobile() {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

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
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const HorizontalCard = ({ title, icon: Icon, color, data, type }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-1 mb-4">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </h2>
        <span className="text-[9px] text-[#f3cd08] font-black uppercase tracking-tighter">Glisser →</span>
      </div>
      
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
        {data.map((item, idx) => (
          <motion.div 
            key={idx}
            className="snap-center shrink-0 w-[240px] bg-white border border-gray-100 rounded-3xl p-4 shadow-sm group hover:border-[#f3cd08]/30 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Départ</span>
                <span className="text-[11px] font-bold text-gray-800 truncate">{item.point_depart.label}</span>
              </div>
              <div className="ml-2 px-2 py-1 rounded-lg bg-gray-50 border border-transparent group-hover:bg-[#141414] group-hover:text-[#f3cd08] transition-all shrink-0">
                <span className="text-[9px] font-black">
                  {type === 'price' && `${Math.round(item.prix).toLocaleString()} CFA`}
                  {type === 'quality' && `${item.qualite_trajet}/10 Q`}
                  {type === 'duration' && `${Math.round(item.duree_estimee / 60)} min`}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="w-px h-3 bg-gray-100 ml-1.5" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Arrivée</span>
                <span className="text-[11px] font-black italic text-gray-900 truncate">{item.point_arrivee.label}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[8px] font-bold text-gray-300 uppercase">
                {new Date(item.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-200 group-hover:text-[#f3cd08] transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-10">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#f3cd08]" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">{t('stats.loading_data')}</p>
      </div>
    </div>
  );
  
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-white font-sans text-[#141414] overflow-x-hidden relative pb-20">
      <header className="px-6 pt-12 pb-5 sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-colors active:scale-95"><ArrowLeft className="w-5 h-5"/></button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                STATS<span className="text-[#f3cd08]">INSIGHT</span>
              </h1>
              <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowFilterModal(true)}
                className={`p-2.5 rounded-2xl transition-all relative ${period !== 'all' ? 'bg-[#141414] text-[#f3cd08]' : 'bg-gray-50 text-gray-400'}`}
            >
                <Filter className="w-5 h-5" />
                {period !== 'all' && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f3cd08] rounded-full border-2 border-white" />}
            </button>
            <div className="bg-gray-50 rounded-2xl scale-90 origin-right">
                <LanguageSwitcher variant="dark" /> 
            </div>
         </div>
      </header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 space-y-8 mt-6 max-w-3xl mx-auto"
      >
        <CarouselAds />

        {stats.lieu_du_mois && (
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-4xl bg-[#141414] p-8 shadow-2xl shadow-gray-200 group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#f3cd08] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-2.5 py-1 bg-[#f3cd08] text-black text-[8px] font-black uppercase tracking-widest rounded-full">
                      {t('stats.trending')}
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('stats.destination_of_month')}</span>
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">
                   {stats.lieu_du_mois.point_arrivee__label}
                </h2>
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wide leading-relaxed mb-6 max-w-[80%]">
                   {t('stats.destination_description')}
                </p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-[#f3cd08] italic tracking-tighter">{stats.lieu_du_mois.count}</span>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">{t('stats.visits_recorded')}</span>
                </div>
             </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="bg-gray-50 p-5 rounded-3xl border border-transparent hover:border-gray-100 transition-all">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{t('stats.total_trips')}</span>
            </div>
            <div className="text-3xl font-black italic tracking-tighter">{stats.total_trajets}</div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-gray-50 p-5 rounded-3xl border border-transparent hover:border-gray-100 transition-all">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{t('stats.period_label')}</span>
            </div>
            <div className="text-base font-black italic uppercase tracking-tighter text-[#141414]">
              {t(`stats.filters.${period}`)}
            </div>
          </motion.div>
        </div>

        <HorizontalCard 
          title={t('stats.tension_zones')} 
          icon={AlertTriangle} 
          color="red" 
          data={stats.trajets_difficiles} 
          type="quality"
        />

        <HorizontalCard 
          title={t('stats.premium_trips')} 
          icon={DollarSign} 
          color="green" 
          data={stats.trajets_chers} 
          type="price"
        />

        <HorizontalCard 
          title={t('stats.sections.long_distances')} 
          icon={Clock} 
          color="blue" 
          data={stats.trajets_longs} 
          type="duration"
        />

        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2 pl-1">
            <MapPin className="w-3.5 h-3.5" />
            {t('stats.sections.ranking_destinations')}
          </h2>
          <div className="bg-white border border-gray-100 rounded-4xl overflow-hidden shadow-sm">
            {stats.lieux_populaires.arrivee.map((lieu, index) => (
              <div key={index} className="p-4 border-b border-gray-50 last:border-0 flex items-center gap-4 group hover:bg-gray-50 transition-all">
                <span className={`
                  w-7 h-7 flex items-center justify-center rounded-xl text-[10px] font-black italic
                  ${index === 0 ? 'bg-[#f3cd08] text-black ring-4 ring-yellow-50' : 
                    index === 1 ? 'bg-gray-200 text-gray-600' : 
                    index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-300'}
                `}>
                  #{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] font-bold text-gray-800 truncate">{lieu.point_arrivee__label}</span>
                    <span className="text-[10px] font-black text-gray-300 tracking-tighter">{lieu.count}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(lieu.count / stats.lieux_populaires.arrivee[0].count) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#3b82f6] rounded-full group-hover:bg-[#f3cd08] transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.main>

      <AnimatePresence>
        {showFilterModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-4xl z-50 border-t border-gray-100 p-8 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-8" onClick={() => setShowFilterModal(false)} />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-[#141414]">{t('stats.filter_by_period')}</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 bg-gray-50 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'all', label: t('stats.filters.all'), icon: Calendar },
                  { id: 'month', label: t('stats.filters.month'), icon: Calendar },
                  { id: 'week', label: t('stats.filters.week'), icon: Clock },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => { setPeriod(option.id); setShowFilterModal(false); }}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${period === option.id ? 'bg-[#141414] text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    <div className={`p-2 rounded-xl ${period === option.id ? 'bg-[#f3cd08] text-black' : 'bg-white'}`}><option.icon className="w-5 h-5" /></div>
                    <span className="text-sm font-black uppercase tracking-widest">{option.label}</span>
                    {period === option.id && <ChevronRight className="ml-auto w-5 h-5 text-[#f3cd08]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
