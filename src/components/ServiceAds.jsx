import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getAds } from '../services/adService';
import { Loader2, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';

const MOCK_ADS = [
  {
    id: 1,
    title: "Yango Pro",
    title_en: "Yango Pro",
    description: "Rejoignez la flotte Yango et gagnez plus.",
    description_en: "Join Yango fleet and earn more.",
    image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
    category: "Driver",
    color: "#e63946",
    app_link: "https://yango.com"
  },
  {
    id: 2,
    title: "Eco Ride Cameroun",
    title_en: "Eco Ride Cameroon",
    description: "Le covoiturage écologique et économique.",
    description_en: "Ecological and economical carpooling.",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop",
    category: "Transport",
    color: "#2a9d8f",
    app_link: "#"
  },
  {
    id: 3,
    title: "Assurance Zen",
    title_en: "Zen Insurance",
    description: "Assurez votre véhicule instantanément.",
    description_en: "Insure your vehicle instantly.",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
    category: "Service",
    color: "#457b9d",
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
        const data = await getAds();
        if (data && data.length > 0) {
            setAds(data);
        } else {
            console.warn("Backend ads empty, using MOCK data for design review");
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
      <Loader2 className="w-5 h-5 animate-spin text-[#f9d716]" />
    </div>
  );

  const displayAds = (ads && ads.length > 0) ? ads : MOCK_ADS;

  return (
    <div className="space-y-4 lg:space-y-8 lg:py-8 w-full">
      <div className="flex items-center justify-between px-1 mb-4 lg:mb-8">
        <h3 className="text-[10px] lg:text-3xl font-black text-gray-400 lg:text-[#141414] uppercase tracking-widest lg:tracking-tighter lg:italic pl-1">
          {isDesktop ? t('partners.discover_partners') : t('partners.partnership_services')}
        </h3>
        <a 
            href="/services" 
            onClick={(e) => { e.preventDefault(); window.location.href = '/services'; }}
            className="text-[9px] lg:text-xs font-black text-[#f9d716] lg:text-gray-400 lg:hover:text-[#141414] uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors"
        >
            {t('common.see_all')} <ChevronRight className="w-3 h-3" />
        </a>
      </div>
      
      {isDesktop ? (
        <DesktopCarousel ads={displayAds} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
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
                    style={{ backgroundColor: currentAd.color || '#f9d716' }}
                 >
                    {currentAd.category}
                 </motion.span>
                 
                 <h2 className="text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter italic drop-shadow-xl text-shadow-lg">
                    {currentAd.title}
                 </h2>
                 
                 <p className="text-gray-200 text-2xl font-medium leading-relaxed max-w-xl border-l-4 border-[#f9d716] pl-6 py-2">
                    {currentAd.description}
                 </p>

                 <div className="pt-4">
                    <motion.a
                        href={currentAd.app_link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(249, 215, 22, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm hover:bg-[#f9d716] transition-all duration-300 shadow-xl"
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
                    className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-20 bg-[#f9d716]' : 'w-4 bg-white/30 hover:bg-white/60 hover:w-8'}`}
                />
            ))}
        </div>

        <button 
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-[#f9d716] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
        >
            <ChevronLeft className="w-10 h-10" />
        </button>
        <button 
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-5 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-[#f9d716] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110"
        >
            <ChevronRight className="w-10 h-10" />
        </button>
    </div>
  );
}

function MobileAdCard({ ad, idx }) {
  const { t, i18n } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.a
      href={ad.app_link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer ${idx === 0 || idx === 3 ? 'col-span-2 h-32' : 'col-span-1 h-36'}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
           <Loader2 className="w-4 h-4 animate-spin text-gray-200" />
        </div>
      )}
      <div className="absolute inset-0">
         <img 
           src={ad.image_url} 
           alt={ad.title}
           onLoad={() => setIsLoaded(true)}
           className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
         />
         <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-95" />
      </div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
         <span 
            className="inline-block px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-black mb-1.5 opacity-90 tracking-tighter"
            style={{ backgroundColor: ad.color || '#f9d716' }}
         >
            {ad.category}
         </span>
         <h4 className="text-white text-lg font-black uppercase tracking-tight leading-none mb-1 shadow-sm">
             {ad.title}
         </h4>
         <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider opacity-80 truncate">
             {ad.description}
         </p>
      </div>
      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-white rounded-full opacity-30 group-hover:bg-[#f9d716] group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
    </motion.a>
  );
}
