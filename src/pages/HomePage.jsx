/**
 * @fileoverview HomePage - Redesign "Immersive Dark Mode"
 * 
 * Inspiration : Advee Mobile UI Concept
 * Style : Dark, Moody, High Contrast Yellow
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import taxiAnimation from '../assets/lotties/yellow taxi.json';

// Import de l'image locale (Vite gère les imports d'images ainsi)
// Assure-toi que le chemin est exact par rapport à ce fichier
import bgImage from '../assets/images/yaounde.png';

export default function HomePage() {
  const navigate = useNavigate();

  // Animation variants pour l'apparition en cascade (Stagger)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    },
  };

  const handleStart = () => {
    navigate('/estimate');
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black font-sans">
      
      {/* 1. BACKGROUND IMMERSIF */}
      <div className="absolute inset-0 z-0">
        {/* Image de fond */}
        <img 
          src={bgImage} 
          alt="Yaoundé City" 
          className="w-full h-full object-cover scale-105" // scale léger pour effet cinéma
        />
        
        {/* Overlay Sombre (Gradient du bas vers le haut) */}
        {/* Cela permet au texte blanc/jaune de ressortir parfaitement */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        
        {/* Vignette subtile pour assombrir les bords */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40" />
      </div>

      {/* 2. TOP LEFT WIDGET (Lottie) */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-12 left-6 z-20"
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 pr-4 pl-1 py-1 rounded-2xl shadow-2xl">
          <div className="w-30 h-13 bg-white/10 rounded-xl flex items-center justify-center">
             {/* Animation Lottie Taxi miniaturisée */}
             <div className="w-30 h-15  ">
                <LottieAnimation
                  animationData={taxiAnimation}
                  loop={true}
                  autoplay={true}
                />
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold text-[#f3cd08]">Taxis disponibles</span>
          </div>
        </div>
      </motion.div>

      {/* 3. CONTENT (Bottom Anchored) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 flex flex-col justify-end h-full"
      >
        
        {/* Header Text */}
        <motion.div variants={itemVariants} className="mb-6">
          <p className="text-gray-400 text-sm font-medium mb-1 tracking-wide">
            Bienvenue sur Fare Calculator
          </p>
          <h1 className="text-5xl font-black text-white leading-[0.95] tracking-tighter">
            Où voulez-vous <br />
            <span className="text-[#f3cd08]">aller ?</span>
          </h1>
          
          <div className="flex items-center gap-2 mt-4 text-gray-400 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f3cd08] animate-pulse" />
            <span className="uppercase tracking-widest">Yaoundé, Cameroun</span>
          </div>
        </motion.div>

        {/* Action Bar (Bouton style Input) */}
        <motion.div variants={itemVariants} className="mb-6">
          <button 
            onClick={handleStart}
            className="group w-full flex items-center gap-3 p-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] transition-transform active:scale-95"
          >
            {/* Partie Gauche (Texte) */}
            <div className="flex-1 px-6 h-14 flex flex-col justify-center text-left">
              <span className="text-white font-bold text-lg">Commencer</span>
              <span className="text-white/40 text-xs">Estimer un trajet maintenant</span>
            </div>

            {/* Partie Droite (Icone Carrée Jaune) */}
            <div className="w-14 h-14 bg-[#f3cd08] rounded-[1.5rem] flex items-center justify-center text-black shadow-[0_0_20px_rgba(243,205,8,0.3)] group-hover:scale-105 transition-transform">
              <ArrowRight className="w-6 h-6 stroke-[3px]" />
            </div>
          </button>
        </motion.div>

        {/* Bottom Chips (Filtres visuels) */}
        <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Badge icon={Zap} label="Rapide" />
          <Badge icon={Shield} label="Fiable" />
          <Badge icon={Clock} label="24/7" />
        </motion.div>

      </motion.div>
    </div>
  );
}

// Composant Badge réutilisable
function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl whitespace-nowrap">
      <Icon className="w-4 h-4 text-[#f3cd08]" />
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </div>
  );
}