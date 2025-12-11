import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, MapPin, DollarSign, Clock, 
  AlertTriangle, Award, Filter, X, Calendar, ChevronRight 
} from 'lucide-react';
import { getStats } from '../services/statsService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import bgImage from '../assets/images/yaounde.png';

export default function StatsPage() {
  const navigate = useNavigate();
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
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Composant Carte Horizontale (pour les listes)
  const HorizontalCard = ({ title, icon: Icon, color, data, type }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between px-6 mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-4 h-4 text-${color}-400`} />
          </div>
          {title}
        </h2>
        {/* Indicateur de scroll */}
        <span className="text-xs text-gray-500 font-medium">Glisser →</span>
      </div>
      
      <div className="flex overflow-x-auto pb-6 px-6 gap-4 snap-x hide-scrollbar">
        {data.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="snap-center shrink-0 w-[280px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 relative overflow-hidden group"
          >
            {/* Effet de gradient au survol */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Départ</span>
                <span className="text-sm font-bold text-white truncate w-40">{item.point_depart.label}</span>
              </div>
              <div className={`px-2 py-1 rounded-lg bg-${color}-500/20 border border-${color}-500/30`}>
                <span className={`text-xs font-bold text-${color}-400`}>
                  {type === 'price' && `${item.prix} FCFA`}
                  {type === 'quality' && `${item.qualite_trajet}/10`}
                  {type === 'duration' && `${Math.round(item.duree_estimee / 60)} min`}
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="w-0.5 h-4 bg-gray-700 ml-1 my-1" /> {/* Ligne de connexion visuelle */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Arrivée</span>
                <span className="text-sm font-bold text-white truncate w-full">{item.point_arrivee.label}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-gray-500">
                {new Date(item.date_ajout).toLocaleDateString()}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingSkeleton />
    </div>
  );
  
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black font-sans text-white overflow-x-hidden relative">
      {/* Background Immersif */}
      <div className="fixed inset-0 z-0">
        <img src={bgImage} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      {/* Header Flottant */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Tableau de Bord</h1>
          <button 
            onClick={() => setShowFilterModal(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
          >
            <Filter className="w-5 h-5 text-yellow-400" />
            {period !== 'all' && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black" />
            )}
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 pb-20 pt-6"
      >
        {/* 1. Hero Section: Lieu du Mois */}
        {stats.lieu_du_mois && (
          <div className="px-6 mb-8">
            <motion.div 
              variants={itemVariants}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-900/20"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Award className="w-32 h-32 text-white rotate-12" />
              </div>
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white">
                    Tendance
                  </span>
                  <span className="text-xs font-medium text-yellow-100">Destination Phare</span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-1">
                  {stats.lieu_du_mois.point_arrivee__label}
                </h2>
                <p className="text-yellow-100 text-sm mb-4">
                  Le point de chute le plus populaire de la période.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-white/30 border border-white/50" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white ml-2">
                    {stats.lieu_du_mois.count} visites enregistrées
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. KPI Grid */}
        <div className="px-6 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Total Trajets</span>
              </div>
              <div className="text-3xl font-black text-white">{stats.total_trajets}</div>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Période</span>
              </div>
              <div className="text-lg font-bold text-white capitalize">
                {period === 'all' ? 'Toujours' : period === 'month' ? 'Ce Mois' : 'Cette Semaine'}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. Sections Horizontales */}
        <HorizontalCard 
          title="Les plus redoutés" 
          icon={AlertTriangle} 
          color="red" 
          data={stats.trajets_difficiles} 
          type="quality"
        />

        <HorizontalCard 
          title="Les plus coûteux" 
          icon={DollarSign} 
          color="green" 
          data={stats.trajets_chers} 
          type="price"
        />

        <HorizontalCard 
          title="Les plus longs" 
          icon={Clock} 
          color="purple" 
          data={stats.trajets_longs} 
          type="duration"
        />

        {/* 4. Top Destinations List */}
        <div className="px-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Top Destinations
          </h2>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            {stats.lieux_populaires.arrivee.map((lieu, index) => (
              <div key={index} className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4">
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
                  ${index === 0 ? 'bg-yellow-400 text-black' : 
                    index === 1 ? 'bg-gray-300 text-black' : 
                    index === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-gray-400'}
                `}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-white">{lieu.point_arrivee__label}</span>
                    <span className="text-xs font-bold text-gray-400">{lieu.count}</span>
                  </div>
                  {/* Barre de progression relative */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ 
                        width: `${(lieu.count / stats.lieux_populaires.arrivee[0].count) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal de Filtres (Bottom Sheet) */}
      <AnimatePresence>
        {showFilterModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl z-50 border-t border-white/10 p-6 pb-10"
            >
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Filtrer les statistiques</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'all', label: 'Tout le temps', icon: Calendar },
                  { id: 'month', label: 'Ce mois-ci', icon: Calendar },
                  { id: 'week', label: 'Cette semaine', icon: Clock },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setPeriod(option.id);
                      setShowFilterModal(false);
                    }}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      period === option.id 
                        ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    {option.label}
                    {period === option.id && <div className="ml-auto w-2 h-2 bg-black rounded-full" />}
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

