
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    ArrowLeft, ExternalLink, ShieldCheck, Globe, Loader2, 
    Zap, Sparkles, Heart, Rocket, Users, BadgeCheck
} from 'lucide-react';
import { getAds } from '../services/adService';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ServicesPageDesktop() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const isEn = i18n.language === 'en';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAds();
        setServices(data);
      } catch (err) {
        console.error("Erreur services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-white text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none italic cursor-pointer" onClick={() => navigate('/')}>
                    FARE<span className="text-[#f3cd08]">CALC</span>
                </h1>
                <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
            </div>
            <div className="hidden lg:flex items-center gap-8">
                <button onClick={() => navigate('/trajets')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('all_trajets.title')}</button>
                <button onClick={() => navigate('/stats')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('stats.dashboard')}</button>
                <button className="text-[10px] font-black uppercase tracking-widest text-black border-b-2 border-[#f3cd08] pb-1">{t('partners.title')}</button>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <LanguageSwitcher variant="dark" />
            <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-3"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
            </button>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-12 max-w-7xl mx-auto">
        <header className="mb-20 text-center max-w-3xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-100 mb-6"
            >
                <BadgeCheck className="w-4 h-4 text-[#f3cd08]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Verified Network</span>
            </motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-8"
            >
                {t('partners.discover_partners').split(' ').slice(0, 2).join(' ')} <br/> 
                <span className="text-[#f3cd08]">{t('partners.discover_partners').split(' ').slice(2).join(' ')}</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg font-medium leading-relaxed"
            >
                {t('partners.trust_partners')}
            </motion.p>
        </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-[#f3cd08]" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">{t('partners.loading_offers')}</p>
            </div>
        ) : (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
                {services.map((service, idx) => (
                    <motion.a
                        key={service.id || idx}
                        variants={itemVariants}
                        href={service.app_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden h-[550px]"
                    >
                        <div className="relative h-64 w-full overflow-hidden shrink-0">
                            <img 
                                src={service.image_url} 
                                alt={isEn ? (service.title_en || service.title) : service.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#141414]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="absolute top-6 left-6">
                                <span 
                                    className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-black shadow-lg"
                                    style={{ backgroundColor: service.color || '#f3cd08' }}
                                >
                                    {service.category}
                                </span>
                            </div>

                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                                <div className="p-3 bg-white rounded-2xl shadow-xl">
                                    <ExternalLink className="w-5 h-5 text-black" />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 flex flex-col flex-1">
                            <h3 className="text-3xl font-black text-[#141414] italic uppercase tracking-tighter mb-4">
                                {isEn ? (service.title_en || service.title) : service.title}
                            </h3>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wide leading-relaxed mb-10 flex-1 line-clamp-3">
                                {isEn ? (service.description_en || service.description) : service.description}
                            </p>
                            
                            <div className="flex items-center gap-4">
                                <button className="flex-1 py-5 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-[#f3cd08] group-hover:text-black transition-colors">
                                    {t('partners.discover_service')}
                                </button>
                                <div className="p-5 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#141414] group-hover:text-white transition-all">
                                    <Globe className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: service.color || '#f3cd08' }} />
                    </motion.a>
                ))}
            </motion.div>
        )}

        {/* CTA SECTION */}
        <section className="mt-32 p-16 bg-[#141414] rounded-[4rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#f3cd08] rounded-full blur-[150px] opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#f3cd08]" />
                    </div>
                    <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                        Devenez un <br/> <span className="text-[#f3cd08]">Partenaire.</span>
                    </h3>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        Rejoignez le premier réseau de transport communautaire au Cameroun et touchez des milliers d'utilisateurs qualifiés.
                    </p>
                    <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f3cd08] transition-colors">
                        Rejoindre le Réseau
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                        <Rocket className="w-8 h-8 text-[#f3cd08]" />
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Visibilité</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase leading-relaxed tracking-widest">Exposition premium sur Web & Mobile.</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                        <Sparkles className="w-8 h-8 text-[#f3cd08]" />
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Conversion</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase leading-relaxed tracking-widest">Lead ultra-qualifiés et locaux.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-20 bg-[#141414] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-12 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">© 2025 Fare Calc. Designed for Excellence.</p>
            <div className="flex gap-10">
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Contact</button>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Legal</button>
            </div>
        </div>
      </footer>
    </div>
  );
}
