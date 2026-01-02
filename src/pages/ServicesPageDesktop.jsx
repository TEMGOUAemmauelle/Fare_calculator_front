
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigate } from '../hooks/useAppNavigate';
import { 
    ArrowUpRight, Loader2, Users, Rocket, Sparkles, ShieldCheck
} from 'lucide-react';
import { getAds } from '../services/adService';
import { motion } from 'framer-motion';
import NavbarDesktop from '../components/NavbarDesktop';

export default function ServicesPageDesktop() {
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

  // Determine layout mode based on count
  const getLayoutMode = (count) => {
    if (count === 1) return 'single';
    if (count === 2) return 'split';
    if (count === 3) return 'trio';
    return 'grid'; // 4+
  };

  const layoutMode = getLayoutMode(services.length);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#141414] font-sans selection:bg-[#f3cd08]/30 overflow-x-hidden">
      <NavbarDesktop activeRoute="/services" />

      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto">
        {/* HEADER */}
        <header className="mb-24 flex flex-col md:flex-row items-end justify-between gap-10 border-b border-gray-200 pb-10">
            <div className="max-w-2xl">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] text-white rounded-sm mb-6"
                >
                    <ShieldCheck className="w-3 h-3 text-[#f3cd08]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Official Partners</span>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-7xl font-black uppercase tracking-tighter leading-[0.9]"
                >
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#141414] to-gray-500">Ecosystem</span>
                </motion.h1>
            </div>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md text-right"
            >
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    {t('partners.trust_partners')}
                </p>
            </motion.div>
        </header>

        {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-10 h-10 animate-spin text-[#141414]" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('partners.loading_offers')}</p>
            </div>
        ) : (
            <div className="min-h-[60vh]">
                {/* SINGLE MODE */}
                {layoutMode === 'single' && (
                    <div className="w-full h-[70vh]">
                        <PartnerCard service={services[0]} t={t} variant="hero" />
                    </div>
                )}

                {/* SPLIT MODE */}
                {layoutMode === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh]">
                        {services.map((service, idx) => (
                            <PartnerCard key={service.id || idx} service={service} t={t} variant="tall" />
                        ))}
                    </div>
                )}

                {/* TRIO MODE */}
                {layoutMode === 'trio' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
                        {services.map((service, idx) => (
                            <PartnerCard key={service.id || idx} service={service} t={t} variant="tall" />
                        ))}
                    </div>
                )}

                {/* GRID MODE (4+) */}
                {layoutMode === 'grid' && (
                    <div className="grid grid-cols-12 gap-4 auto-rows-[400px]">
                        {/* Featured Item (First one spans 8 cols) */}
                        <div className="col-span-12 lg:col-span-8 row-span-1">
                            <PartnerCard service={services[0]} t={t} variant="featured" />
                        </div>
                        {/* Second Item (Spans 4 cols) */}
                        <div className="col-span-12 lg:col-span-4 row-span-1">
                            <PartnerCard service={services[1]} t={t} variant="standard" />
                        </div>
                        {/* Rest of items */}
                        {services.slice(2).map((service, idx) => (
                            <div key={service.id || idx + 2} className="col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
                                <PartnerCard service={service} t={t} variant="standard" />
                            </div>
                        ))}
                    </div>
                )}

                {services.length === 0 && (
                    <div className="w-full h-[50vh] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-sm bg-gray-50">
                        <p className="text-gray-400 font-medium">{t('services.no_partners_yet')}</p>
                    </div>
                )}
            </div>
        )}

        {/* BECOME A PARTNER SECTION */}
        <section className="mt-32 border-t border-gray-200 pt-20">
            <div className="bg-[#141414] text-white rounded-sm p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f3cd08] rounded-full blur-[150px] opacity-10" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-20">
                    <div className="space-y-8 max-w-2xl">
                        <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">
                            {t('services.join_the')} <span className="text-[#f3cd08]">{t('services.join_the_network')}</span>
                        </h3>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                            {t('services.position_brand_desc')}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => navigate('/pricing')}
                                className="px-8 py-4 bg-white text-black rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-[#f3cd08] transition-colors inline-block"
                            >
                                {t('services.apply_now')}
                            </button>
                            <a 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert(t('services.media_kit_coming_soon'));
                                }}
                                className="px-8 py-4 border border-white/20 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors inline-block"
                            >
                                {t('services.download_media_kit')}
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm">
                            <Users className="w-6 h-6 text-[#f3cd08] mb-4" />
                            <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{t('services.targeted_reach')}</h4>
                            <p className="text-gray-500 text-xs leading-relaxed">{t('services.targeted_reach_desc')}</p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-[#f3cd08] mb-4" />
                            <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{t('services.premium_brand')}</h4>
                            <p className="text-gray-500 text-xs leading-relaxed">{t('services.premium_brand_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">© 2025 Fare Calculator</p>
            <div className="flex gap-8">
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#141414]">Privacy</a>
                <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#141414]">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

function PartnerCard({ service, t, variant = 'standard' }) {
    const isHero = variant === 'hero';
    const isFeatured = variant === 'featured';
    
    return (
        <motion.a
            href={service.app_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`group relative block w-full h-full overflow-hidden bg-white border border-gray-200 rounded-sm hover:border-[#f3cd08] transition-colors duration-500 ${isHero ? 'shadow-2xl' : 'shadow-sm'}`}
        >
            {/* Image Background */}
            <div className="absolute inset-0">
                <img 
                    src={service.image_url} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-[#141414]/40 group-hover:bg-[#141414]/20 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent opacity-90" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <span 
                            className="px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-[#141414]"
                            style={{ backgroundColor: service.color || '#f3cd08' }}
                        >
                            {service.category}
                        </span>
                        {isHero && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-sm text-[9px] font-bold uppercase tracking-widest">
                                {t('services.featured_partner')}
                            </span>
                        )}
                    </div>

                    <h3 className={`font-black text-white uppercase tracking-tighter mb-4 ${isHero ? 'text-6xl md:text-8xl' : isFeatured ? 'text-4xl md:text-6xl' : 'text-3xl'}`}>
                        {service.title}
                    </h3>

                    <div className={`overflow-hidden transition-all duration-500 ${isHero ? 'max-h-40' : 'max-h-0 group-hover:max-h-40'}`}>
                        <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed max-w-2xl mb-8">
                            {service.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-white group/btn">
                            <span className="text-xs font-bold uppercase tracking-widest group-hover/btn:text-[#f3cd08] transition-colors">
                                {t('services.visit_website')}
                            </span>
                            <ArrowUpRight className="w-4 h-4 group-hover/btn:text-[#f3cd08] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.a>
    );
}
