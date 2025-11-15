/**
 * @fileoverview HomePage - Écran d'accueil
 * 
 * Page de bienvenue élégante et responsive avec :
 * - Animation Lottie taxi
 * - Gradients animés
 * - Design moderne mobile-first
 * - Adaptation desktop automatique
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LottieAnimation from '../components/LottieAnimation';
import carAnimation from '../assets/lotties/Car driving on road.json';
import taxiAnimation from '../assets/lotties/yellow taxi.json';


export default function HomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/estimate');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f8f8f5]">
      {/* Blobs animés background - Jaune subtil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-[#f3cd08]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f3cd08]/25 rounded-full blur-3xl"
        />
      </div>

      {/* Content container - Responsive */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 md:px-12">
        
        {/* Logo + Animation Lottie */}
        
        
{/* Logo + Animation Lottie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            type: 'spring', 
            damping: 15 
          }}
          className="mb-0 md:mb-0"
        >
          {/* Container Lottie avec glow effect */}
          <div className="relative">
            {/* Glow background */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-8 bg-yellow-400/20 rounded-full blur-2xl"
            />
            
            {/* Lottie animation */}
            <div className="relative w-58 h-58 md:w-64 md:h-64 lg:w-80 lg:h-80">
              <LottieAnimation
                animationData={taxiAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
          </div>
        </motion.div>
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-[#231f0f] text-center mb-1 tracking-tight"
        >
          Fare Calculator
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-[#231f0f]/60 text-center mb-16 md:mb-20 max-w-md md:max-w-lg mt-0"
        >
          Votre trajet, votre tarif, en toute simplicité.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-sm md:max-w-md space-y-4"
        >
          {/* Primary Button - Estimer */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-1 bg-[#f3cd08] rounded-full blur-lg opacity-50"
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="relative w-full py-4 md:py-4 bg-[#f3cd08] hover:bg-[#e0bc07] text-[#231f0f] font-black text-xl md:text-2xl rounded-full shadow-2xl transition-all"
            >
              Estimer un trajet
            </motion.button>
          </div>

          {/* Secondary Button - Ajouter trajet */}
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/add-trajet')}
            className="w-full py-4 md:py-4 bg-white hover:bg-gray-50 text-[#231f0f] font-bold text-lg md:text-xl rounded-full shadow-lg border-2 border-gray-200 hover:border-[#f3cd08] transition-all"
          >
            Ajouter un trajet effectué
          </motion.button> */}
        </motion.div>

        {/* Info badges - Desktop uniquement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="hidden lg:flex items-center gap-8 mt-16"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">100% Gratuit</span>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">Anonyme</span>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">Temps réel</span>
          </div>
        </motion.div>

        {/* Footer text - Mobile */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="lg:hidden mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Estimation instantanée • 100% anonyme
        </motion.p>
      </div>
    </div>
  );
}
