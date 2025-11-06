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
import taxiAnimation from '../assets/lotties/yellow taxi.json';

export default function HomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/estimate');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Blobs animés background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Content container - Responsive */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 md:px-12">
        
        {/* Logo + Animation Lottie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            type: 'spring', 
            damping: 15 
          }}
          className="mb-12 md:mb-16"
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
            <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
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
          className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white text-center mb-4 tracking-tight"
        >
          Fare Calculator
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center mb-16 md:mb-20 max-w-md md:max-w-lg"
        >
          Votre trajet, votre tarif, en toute simplicité.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="w-full max-w-sm md:max-w-md"
        >
          {/* Glow effect button */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-lg opacity-75"
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="relative w-full py-5 md:py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-black text-xl md:text-2xl rounded-full shadow-2xl shadow-yellow-500/40 transition-all"
            >
              Commencer
            </motion.button>
          </div>
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
