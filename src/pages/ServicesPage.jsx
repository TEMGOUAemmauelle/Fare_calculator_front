
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, ShieldCheck, Zap, Car, Compass, Globe, Loader2 } from 'lucide-react';
import { getAds } from '../services/adService';
import { motion, AnimatePresence } from 'framer-motion';

export default function ServicesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-white text-[#141414] font-sans">
      {/* HEADER PREMIUM */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-colors active:scale-95">
                <ArrowLeft className="w-5 h-5"/>
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                {t('partners.partnership_services').split(' ')[0]}<span className="text-[#f3cd08]">{t('partners.partnership_services').split(' ')[1]}</span>
              </h1>
              <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
            </div>
         </div>
         <div className="p-2.5 bg-yellow-50 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-[#f3cd08]" />
         </div>
      </header>

      <main className="px-6 py-8">
        <div className="mb-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">
                {t('partners.discover_partners').split(' ').slice(0, 2).join(' ')} <br/> <span className="text-[#f3cd08]">{t('partners.discover_partners').split(' ').slice(2).join(' ')}</span>
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                {t('partners.trust_partners')}
            </p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#f3cd08]" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">{t('partners.loading_offers')}</p>
            </div>
        ) : (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {services.map((service, idx) => (
                    <motion.a
                        key={service.id || idx}
                        variants={itemVariants}
                        href={service.app_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative overflow-hidden rounded-4xl bg-[#141414] group shadow-2xl shadow-gray-200"
                    >
                        <div className="relative h-48 w-full overflow-hidden">
                            <img 
                                src={service.image_url} 
                                alt={service.title}
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/20 to-transparent" />
                            
                            <div className="absolute top-6 left-6">
                                <span 
                                    className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-black"
                                    style={{ backgroundColor: service.color || '#f3cd08' }}
                                >
                                    {service.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                    {service.title}
                                </h3>
                                <div className="p-2 bg-white/5 rounded-xl">
                                    <ExternalLink className="w-4 h-4 text-[#f3cd08]" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide leading-relaxed mb-6">
                                {service.description}
                            </p>
                            
                            <div className="flex items-center gap-4">
                                <button className="flex-1 py-4 bg-[#f3cd08] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                    {t('partners.discover_service')}
                                </button>
                                <button className="p-4 bg-white/5 text-white rounded-2xl active:scale-95 transition-all border border-white/5">
                                    <Globe className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Background Decoration */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-10" style={{ backgroundColor: service.color || '#f3cd08' }} />
                    </motion.a>
                ))}
            </motion.div>
        )}

        <div className="mt-12 p-8 border border-dashed border-gray-200 rounded-4xl text-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('partners.become_partner')}</h4>
            <p className="text-[9px] font-bold text-gray-300 uppercase leading-relaxed mb-4">
                {t('partners.join_network')}
            </p>
            <button className="text-[9px] font-black text-[#f3cd08] uppercase tracking-widest underline decoration-2 underline-offset-4">
                {t('partners.contact_us')}
            </button>
        </div>
      </main>
    </div>
  );
}
