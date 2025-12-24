
import { useState, useEffect } from 'react';
import { getAds } from '../services/adService';
import { ExternalLink } from 'lucide-react';

export default function CarouselAds() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis le backend
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getAds();
        setAds(data);
      } catch (err) {
        console.error("Erreur chargement pubs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Préchargement de toutes les images
  useEffect(() => {
    if (!ads || ads.length === 0) return;
    
    let loadedCount = 0;
    ads.forEach(ad => {
      const img = new Image();
      img.src = ad.image_url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === ads.length) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === ads.length) setImagesLoaded(true);
      };
    });
  }, [ads]);

  // Défilement automatique
  useEffect(() => {
    if (!imagesLoaded || ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imagesLoaded, ads.length]);

  if (loading || ads.length === 0) return (
     <div className="w-full h-40 rounded-4xl bg-gray-50 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-[#f3cd08] border-t-transparent animate-spin" />
     </div>
  );

  return (
    <div className="relative w-full h-40 rounded-4xl overflow-hidden bg-[#141414] shadow-lg">
      {/* Skeleton pendant le chargement initial */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-[#f3cd08] rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse delay-100" />
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      )}

      {/* Slides */}
      {imagesLoaded && ads.map((ad, idx) => (
        <a
          key={ad.id || idx}
          href={ad.app_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 flex flex-col justify-end p-6 text-white no-underline transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* BACKGROUND IMAGE */}
          <div className="absolute inset-0 -z-10">
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-full object-cover opacity-50 transition-transform duration-1000 scale-100"
            />
            {/* Elegant overlay gradient matching the app's refined style */}
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
          </div>

          {/* CONTENT */}
          <div className="relative z-10 space-y-1">
            <span 
              className="px-2 py-0.5 rounded-full text-black text-[7px] font-black uppercase tracking-widest inline-block mb-1"
              style={{ backgroundColor: ad.color || '#f3cd08' }}
            >
              {ad.category}
            </span>
            <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">
              {ad.title}
            </h3>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wide opacity-90 truncate max-w-[80%]">
              {ad.description}
            </p>
          </div>

          {/* ACTION ICON */}
          <div className="absolute bottom-5 right-6 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/5 group-hover:bg-[#f3cd08]/20 transition-all">
             <ExternalLink className="w-3 h-3 text-white/50" />
          </div>
        </a>
      ))}

      {/* INDICATORS */}
      {imagesLoaded && ads.length > 1 && (
        <div className="absolute top-5 right-6 flex gap-1 z-20">
          {ads.map((_, i) => (
            <div 
              key={i} 
              className={`h-[3px] rounded-full transition-all duration-500 ${i === currentIndex ? 'w-5 bg-[#f3cd08]' : 'w-1.5 bg-white/20'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
