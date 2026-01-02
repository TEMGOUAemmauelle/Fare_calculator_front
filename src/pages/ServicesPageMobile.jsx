
import { useState, useEffect } from 'react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, ShieldCheck, Globe, Loader2, Sparkles, Users } from 'lucide-react';
import { getAds } from '../services/adService';
import { motion } from 'framer-motion';

export default function ServicesPageMobile() {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#141414] font-sans pb-24">
      {/* HEADER */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-[#141414] z-40 shadow-xl shadow-black/5">
         <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors active:scale-95 backdrop-blur-md">
                <ArrowLeft className="w-5 h-5"/>
            </button>
            <div className="px-3 py-1.5 bg-[#f3cd08]/10 border border-[#f3cd08]/20 rounded-full flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-[#f3cd08]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#f3cd08]">{t('services.verified')}</span>
            </div>
         </div>
         
         <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-2">
                {t('services.the_ecosystem')}
            </h1>
            <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[80%]">
                {t('partners.trust_partners')}
            </p>
         </div>
      </header>

      <main className="px-4 py-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">{t('partners.loading_offers')}</p>
            </div>
        ) : (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {services.map((service, idx) => (
                    <motion.a
                        key={service.id || idx}
                        variants={itemVariants}
                        href={service.app_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative overflow-hidden rounded-sm bg-white border border-gray-200 active:scale-[0.98] transition-transform duration-300"
                    >
                        <div className="relative h-40 w-full overflow-hidden">
                            <img 
                                src={service.image_url} 
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent opacity-90" />
                            
                            <div className="absolute top-4 left-4">
                                <span 
                                    className="px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest text-[#141414]"
                                    style={{ backgroundColor: service.color || '#f3cd08' }}
                                >
                                    {service.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 relative">
                            <div className="absolute -top-6 right-4 p-2 bg-white rounded-full shadow-lg">
                                <ExternalLink className="w-4 h-4 text-[#141414]" />
                            </div>

                            <h3 className="text-xl font-black text-[#141414] uppercase tracking-tighter mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-500 text-[10px] font-medium leading-relaxed line-clamp-2 mb-4">
                                {service.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-[#141414]">
                                <span className="text-[9px] font-bold uppercase tracking-widest border-b border-[#f3cd08] pb-0.5">
                                    {t('partners.discover_service')}
                                </span>
                            </div>
                        </div>
                    </motion.a>
                ))}
            </motion.div>
        )}

        {/* BECOME A PARTNER CTA */}
        <div className="mt-12 bg-[#141414] rounded-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f3cd08] rounded-full blur-[60px] opacity-10" />
            
            <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-[#f3cd08]" />
                </div>
                
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                    {t('services.join_the')} <span className="text-[#f3cd08]">{t('services.join_the_network')}</span>
                </h3>
                <p className="text-gray-400 text-[10px] font-medium leading-relaxed mb-6">
                    {t('services.position_brand')}
                </p>

                <button 
                    onClick={() => navigate('/pricing')}
                    className="w-full py-3 bg-white text-black rounded-sm font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                >
                    {t('services.apply_now')}
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}
