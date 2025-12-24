
import { motion } from 'framer-motion';

// Image taxi demandée
const ADS_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/TAXI.jpg/1280px-TAXI.jpg";

const ADS_DATA = [
  { id: 1, title: "LIVRAISON", subtitle: "Rapide & Sûr", size: "full" },
  { id: 2, title: "VIP", subtitle: "Confort Absolu", size: "half" },
  { id: 3, title: "MOTO", subtitle: "Évitez les bouchons", size: "half" },
  { id: 4, title: "COVOITURAGE", subtitle: "Économique", size: "full" }
];

export default function ServiceAds() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Autres Services</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {ADS_DATA.map((ad) => (
          <motion.div
            key={ad.id}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer ${ad.size === 'full' ? 'col-span-2 h-36' : 'col-span-1 h-40'}`}
          >
            {/* Image Background */}
            <div className="absolute inset-0">
               <img 
                 src={ADS_IMAGE_URL} 
                 alt={ad.title}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               {/* Elegant Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
            </div>

            {/* Content avec Typo Élégante */}
            <div className="absolute bottom-0 left-0 p-5 w-full">
               <h4 className="text-white text-xl font-black uppercase tracking-tight leading-none mb-1">
                   {ad.title}
               </h4>
               <p className="text-gray-300 text-[10px] font-bold uppercase tracking-wider opacity-80">
                   {ad.subtitle}
               </p>
            </div>
            
            {/* Petit accent jaune discret */}
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[#f3cd08] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
