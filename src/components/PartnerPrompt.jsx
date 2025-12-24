
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

export default function PartnerPrompt({ isVisible, onClose }) {
  const navigate = useAppNavigate();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-6 right-6 z-60 bg-[#141414] rounded-3xl p-5 shadow-2xl border border-white/5 overflow-hidden group"
        >
          {/* Background Decoration */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#f3cd08] rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-[#f3cd08] rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                 </div>
                 <span className="text-[10px] font-black text-[#f3cd08] uppercase tracking-[0.2em]">Offre Spéciale</span>
              </div>
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-white text-base font-black italic uppercase tracking-tighter leading-tight mb-1">
                Optimisez vos <span className="text-[#f3cd08]">déplacements</span>
            </h3>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide opacity-80 mb-4 max-w-[90%]">
                Découvrez nos partenaires de confiance pour voyager plus sereinement.
            </p>

            <button 
                onClick={() => {
                    onClose();
                    navigate('/services');
                }}
                className="w-full py-3 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                Consulter les offres <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
