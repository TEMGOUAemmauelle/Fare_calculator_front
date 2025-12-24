
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ isVisible, status, message, onRetry, onSkip }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8"
        >
            <div className="flex flex-col items-center space-y-8 w-full max-w-xs">
                 {/* LOGO TYPOGRAPHIQUE */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                     <h1 className="text-3xl font-black tracking-tighter uppercase italic text-[#141414]">
                        FARE<span className="text-[#f3cd08]">CALC</span>
                     </h1>
                     <div className="w-12 h-1 bg-[#141414] mt-2 rounded-full" />
                  </motion.div>

                  {/* LOADER OU MESSAGE */}
                  <div className="h-8 flex items-center justify-center">
                      {status === 'loading' && (
                         <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-1.5">
                               <motion.div 
                                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                 transition={{ repeat: Infinity, duration: 1 }}
                                 className="w-2 h-2 bg-[#f3cd08] rounded-full" 
                               />
                               <motion.div 
                                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                 transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                 className="w-2 h-2 bg-[#141414] rounded-full" 
                               />
                               <motion.div 
                                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                                 transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                 className="w-2 h-2 bg-[#f3cd08] rounded-full" 
                               />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                               {message || "Préliminaires..."}
                            </p>
                         </div>
                      )}
                     
                     {status === 'error' && (
                        <div className="flex flex-col items-center gap-3">
                           <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">{message}</p>
                           <div className="flex gap-2">
                              {onRetry && (
                                  <button onClick={onRetry} className="text-[10px] font-black underline text-[#141414]">
                                      RÉESSAYER
                                  </button>
                              )}
                              <button onClick={onSkip} className="text-[10px] font-black text-gray-400">PASSER</button>
                           </div>
                        </div>
                     )}
                  </div>
            </div>
            
            {/* Pied de page discret */}
            <div className="absolute bottom-8 text-gray-300 text-[9px] font-bold tracking-widest uppercase">
                v2.0 • Ultra
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
