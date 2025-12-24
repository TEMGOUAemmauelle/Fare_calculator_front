
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAds } from '../services/adService';
import { Loader2 } from 'lucide-react';

export default function ServiceAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getAds();
        setAds(data);
      } catch (err) {
        console.error("Erreur ServiceAds:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 animate-spin text-[#f3cd08]" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Services Partenaires</h3>
        <a 
            href="/services" 
            onClick={(e) => { e.preventDefault(); window.location.href = '/services'; }}
            className="text-[9px] font-black text-[#f3cd08] uppercase tracking-widest hover:underline"
        >
            Voir tout
        </a>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {ads.map((ad, idx) => (
          <AdCard key={ad.id || idx} ad={ad} idx={idx} />
        ))}
      </div>
    </div>
  );
}

function AdCard({ ad, idx }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.a
      href={ad.app_link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer ${idx === 0 || idx === 3 ? 'col-span-2 h-32' : 'col-span-1 h-36'}`}
    >
      {/* SKELETON */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
           <Loader2 className="w-4 h-4 animate-spin text-gray-200" />
        </div>
      )}

      {/* Image Background */}
      <div className="absolute inset-0">
         <img 
           src={ad.image_url} 
           alt={ad.title}
           onLoad={() => setIsLoaded(true)}
           className={`w-full h-full object-cover transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
         />
         {/* Elegant Overlay Gradient */}
         <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-95" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-4 w-full">
         <span 
            className="inline-block px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-black mb-1.5 opacity-90 tracking-tighter"
            style={{ backgroundColor: ad.color || '#f3cd08' }}
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
      
      {/* Accent */}
      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-white rounded-full opacity-30 group-hover:bg-[#f3cd08] group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
    </motion.a>
  );
}
