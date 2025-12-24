
import { useState, useEffect } from 'react';
import { ADS_DATA } from '../constants/ads';
import { ExternalLink } from 'lucide-react';

export default function CarouselAds() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Préchargement de toutes les images au montage
  useEffect(() => {
    if (!ADS_DATA || ADS_DATA.length === 0) return;
    
    let loadedCount = 0;
    ADS_DATA.forEach(ad => {
      const img = new Image();
      img.src = ad.image;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === ADS_DATA.length) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === ADS_DATA.length) {
          setImagesLoaded(true);
        }
      };
    });
  }, []);

  // Défilement automatique
  useEffect(() => {
    if (!imagesLoaded) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADS_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imagesLoaded]);

  if (!ADS_DATA || ADS_DATA.length === 0) return null;

  const currentAd = ADS_DATA[currentIndex];

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

      {/* Slides - Toutes les images sont rendues, seul l'index actif est visible */}
      {imagesLoaded && ADS_DATA.map((ad, idx) => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`absolute inset-0 flex flex-col justify-end p-6 text-white no-underline transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* BACKGROUND IMAGE */}
          <div className="absolute inset-0 -z-10">
            <img 
              src={ad.image} 
              alt={ad.title}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* CONTENT */}
          <div className="relative z-10 space-y-1">
            <span className="px-2 py-0.5 rounded-full bg-[#f3cd08] text-black text-[7px] font-black uppercase tracking-widest inline-block mb-1">
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
          <div className="absolute bottom-5 right-6 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
             <ExternalLink className="w-3 h-3 text-white/50" />
          </div>
        </a>
      ))}

      {/* INDICATORS */}
      {imagesLoaded && (
        <div className="absolute top-5 right-6 flex gap-1 z-20">
          {ADS_DATA.map((_, i) => (
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
