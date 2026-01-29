import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getMarketplaceServices } from '../services/marketplaceService';
import { Loader2, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

const MOCK_ADS = [
  {
    id: 1,
    title: "Tech Service",
    title_en: "Tech Service",
    description: "Service technologique de mobilité.",
    description_en: "Mobility tech service.",
    image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
    category: "Tech",
    color: "#6366f1",
    app_link: "#"
  },
  {
    id: 2,
    title: "Livraison Express",
    title_en: "Express Delivery",
    description: "Livraison rapide dans toute la ville.",
    description_en: "Fast delivery across the city.",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop",
    category: "Delivery",
    color: "#22c55e",
    app_link: "#"
  },
  {
    id: 3,
    title: "Finance Mobile",
    title_en: "Mobile Finance",
    description: "Services financiers pour conducteurs.",
    description_en: "Financial services for drivers.",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
    category: "Finance",
    color: "#f59e0b",
    app_link: "#"
  }
];

export default function ServiceAds({ ads: propAds }) {
  const { t } = useTranslation();
  const [ads, setAds] = useState(propAds || []);
  const [loading, setLoading] = useState(!propAds);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (propAds) {
        setAds(propAds);
        setLoading(false);
        return;
    }

    const fetchAds = async () => {
      try {
        // Fetching marketplace services for this section
        const data = await getMarketplaceServices();
        // Normalize data to match the ad card structure
        const normalized = (data || []).map(service => ({
          id: service.id,
          title: service.nom,
          description: service.description,
          image_url: service.logo_url || service.image_url,
          category: service.categorie,
          color: '#f39908',
          app_link: service.url || service.lien_redirection
        }));
        if (normalized.length > 0) {
            setAds(normalized);
        } else {
            console.warn("Backend marketplace empty, using MOCK data for design review");
            setAds(MOCK_ADS);
        }
      } catch (err) {
        console.error("Erreur ServiceAds, using MOCK:", err);
        setAds(MOCK_ADS);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [propAds]);

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 animate-spin text-[#fabd16]" />
    </div>
  );

  const displayAds = (ads && ads.length > 0) ? ads : MOCK_ADS;

  return (
    <div className="space-y-4 lg:space-y-8 lg:py-8 w-full">
      <div className="flex items-center justify-between px-1 mb-4 lg:mb-8">
        <h3 className="text-[10px] lg:text-3xl font-black text-gray-400 lg:text-[#141414] uppercase tracking-widest lg:tracking-tighter lg:italic pl-1">
          {isDesktop ? t('partners.discover_partners') : t('partners.marketplace_services')}
        </h3>
        <a 
            href="/marketplace" 
            onClick={(e) => { e.preventDefault(); window.location.href = '/marketplace'; }}
            className="text-[9px] lg:text-xs font-black text-[#fabd16] lg:text-gray-400 lg:hover:text-[#141414] uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors"
        >
            {t('common.see_all')} <ChevronRight className="w-3 h-3" />
        </a>
      </div>
      
      {isDesktop ? (
        <DesktopCarousel ads={displayAds} />
      ) : (
        <div className="flex flex-col bg-gray-50/50 rounded-3xl overflow-hidden border border-gray-100 mx-0">
          {displayAds.map((ad, idx) => (
            <MobileAdCard key={ad.id || idx} ad={ad} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopCarousel({ ads }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, i18n } = useTranslation();
  const timeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => setCurrentIndex((prevIndex) => (prevIndex === ads.length - 1 ? 0 : prevIndex + 1)),
      6000 
    );

    return () => resetTimeout();
  }, [currentIndex, ads.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  };

  const currentAd = ads[currentIndex];

  if (!currentAd) return null;

  return (
    <div className="relative w-full h-[550px] rounded-[3rem] overflow-hidden group shadow-2xl bg-black border border-white/5">
        <AnimatePresence mode='wait'>
            <motion.div
                key={currentAd.id || currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="absolute inset-0 w-full h-full"
            >
                <img 
                    src={currentAd.image_url} 
                    className="w-full h-full object-cover"
                    alt={currentAd.title}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 flex flex-col justify-center px-20 max-w-4xl z-10">
            <motion.div
                key={`content-${currentIndex}`}
                initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-8"
            >
                 <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: 'auto' }}
                    className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase text-black tracking-widest shadow-lg transform -rotate-1 origin-bottom-left"
                    style={{ backgroundColor: currentAd.color || '#fabd16' }}
                 >
                    {currentAd.category}
                 </motion.span>
                 
                 <h2 className="text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter italic drop-shadow-xl text-shadow-lg">
                    {currentAd.title}
                 </h2>
                 
                 <p className="text-gray-200 text-2xl font-medium leading-relaxed max-w-xl border-l-4 border-[#fabd16] pl-6 py-2">
                    {currentAd.description}
                 </p>

                 <div className="pt-4">
                    <motion.a
                        href={currentAd.app_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(249, 215, 22, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#fabd16] transition-all duration-300 shadow-xl"
                    >
                        {t('partners.discover_service')} <ExternalLink className="w-5 h-5" />
                    </motion.a>
                 </div>
            </motion.div>
        </div>

        <div className="absolute bottom-12 right-20 flex gap-4 z-20">
            {ads.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-20 bg-[#fabd16]' : 'w-4 bg-white/30 hover:bg-white/60 hover:w-8'}`}
                />
            ))}
        </div>

        <button 
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-[#fabd16] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
        >
            <ChevronLeft className="w-10 h-10" />
        </button>
        <button 
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-[#fabd16] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
        >
            <ChevronRight className="w-10 h-10" />
        </button>
    </div>
  );
}



function MobileAdCard({ ad, idx }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.a
      href={ad.app_link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className="group relative flex items-start gap-3 p-4 bg-white border-b border-gray-100 last:border-b-0 active:bg-gray-50 transition-colors w-full"
    >
      {/* Image/Icon */}
      <div className="relative w-12 h-12 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mt-1">
        {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
            </div>
        )}
        <img 
          src={ad.image_url} 
          alt={ad.title}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
         {/* Top Line: Category & Title */}
         <div className="flex flex-col mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                {ad.category}
            </span>
            <h4 className="text-sm font-black text-[#141414] uppercase tracking-tight leading-none group-hover:text-[#f39908] transition-colors">
                {ad.title}
            </h4>
         </div>
         
         {/* Description Restored */}
         <p className="text-[10px] text-gray-500 font-medium leading-normal line-clamp-2">
            {ad.description}
         </p>
      </div>

      {/* Action Arrow */}
      <div className="shrink-0 pt-2">
         <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-[#141414] group-hover:bg-[#141414] group-hover:text-[#f39908] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
         </div>
      </div>
    </motion.a>
  );
}
