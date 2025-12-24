
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { getTrajets } from '../services/trajetService';
import { ArrowLeft, Clock, Cloud, Search, Navigation, Ruler } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CarouselAds from '../components/CarouselAds';
import { motion, AnimatePresence } from 'framer-motion';

const AllTrajetsPageMobile = () => {
  const navigate = useAppNavigate();
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        const data = await getTrajets({ ordering: '-date_ajout' });
        const list = Array.isArray(data) ? data : (data?.results || []);
        setTrajets(list);
      } catch (err) {
        setError("Erreur de chargement");
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
      return (trajet.point_depart?.label || '').toLowerCase().includes(searchLower) ||
             (trajet.point_arrivee?.label || '').toLowerCase().includes(searchLower);
    });
  }, [trajets, searchTerm]);

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans antialiased pb-20">
      <header className="px-6 pt-10 pb-4 sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 transition-colors hover:bg-gray-50 rounded-lg text-gray-400">
               <ArrowLeft className="w-5 h-5"/>
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-black uppercase tracking-tighter italic leading-none">
                TRAJETS<span className="text-[#f3cd08]">COMMU</span>
              </h1>
              <div className="h-[2px] w-5 bg-[#f3cd08] mt-1" />
            </div>
         </div>
         <div className="scale-75 origin-right">
            <LanguageSwitcher variant="dark" /> 
         </div>
      </header>

      <main className="px-6 mt-4 space-y-6">
        <CarouselAds />

        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-[#f3cd08] transition-colors" />
           <input 
              type="text" placeholder="Rechercher une destination..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-[11px] font-bold text-gray-700 placeholder:text-gray-300 focus:ring-1 focus:ring-[#f3cd08]/30 outline-none transition-all"
           />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Communauté</h3>
            <span className="text-[8px] font-black text-[#f3cd08] uppercase tracking-widest">{filteredTrajets.length} Trajets</span>
          </div>

          {loading ? (
             <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              <AnimatePresence>
                {filteredTrajets.map((trajet, idx) => (
                  <motion.div
                    key={trajet.id || idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="relative bg-white p-3.5 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.03)] hover:border-[#f3cd08]/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                             <h4 className="text-[11px] font-bold text-gray-800 truncate tracking-tight">
                                {trajet.point_depart?.label || "---"}
                             </h4>
                          </div>
                          <div className="flex items-center gap-2">
                             <Navigation className="w-2.5 h-2.5 text-[#f3cd08] shrink-0 transform rotate-45" />
                             <h4 className="text-[11px] font-black italic text-gray-900 truncate tracking-tight">
                                {trajet.point_arrivee?.label || "---"}
                             </h4>
                          </div>
                       </div>

                       <div className="shrink-0 flex flex-col items-end gap-1">
                          <div className="px-2.5 py-1 bg-[#141414] text-white rounded-lg">
                             <span className="text-xs font-black tracking-tighter italic">{trajet.prix?.toLocaleString()}</span>
                             <span className="text-[7px] font-bold opacity-40 ml-0.5">CFA</span>
                          </div>
                          <span className="text-[7px] font-bold text-gray-300 uppercase">
                             {trajet.date_ajout ? new Date(trajet.date_ajout).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-50/50">
                       <MiniBadge icon={Clock} label={trajet.heure} />
                       <MiniBadge icon={Cloud} label={trajet.meteo === 2 ? 'Pluie' : 'Soleil'} />
                       {trajet.distance && (
                         <MiniBadge icon={Ruler} label={`${(trajet.distance/1000).toFixed(1)}km`} highlight />
                       )}
                       <div className="ml-auto text-[7px] font-black text-gray-200 uppercase tracking-tighter">
                          {trajet.qualite_trajet || 5}/10 Q
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!loading && filteredTrajets.length === 0 && (
                <div className="text-center py-20">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aucun trajet trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

function MiniBadge({ icon: Icon, label, highlight }) {
  if (!label) return null;
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${highlight ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
      <Icon className={`w-2.5 h-2.5 ${highlight ? 'text-[#f3cd08]' : 'text-gray-300'}`} />
      <span className="text-[8px] font-bold uppercase truncate max-w-[40px]">{label}</span>
    </div>
  );
}

export default AllTrajetsPageMobile;
