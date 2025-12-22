/**
 * @fileoverview HomePage - Redesign "Immersive Dark Mode"
 * 
 * Inspiration : Advee Mobile UI Concept
 * Style : Dark, Moody, High Contrast Yellow
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlusCircle, Zap,Sparkle, Sparkles } from 'lucide-react';
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
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] font-sans selection:bg-[#f3cd08]/30">
      
      {/* 1. BACKGROUND IMMERSIF */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Yaoundé City" 
          className="w-full h-full object-cover scale-105 opacity-60 md:opacity-80 transition-opacity duration-700"
        />
        
        {/* Gradients pour la profondeur */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a]/40 via-transparent to-transparent" />
        
        {/* Grain texture pour le côté premium */}
        <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none" />
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-between py-12 md:py-20 lg:flex-row lg:items-end">
        
        {/* TOP LEFT : Live Status Hub - Floating & 3D Effect for Originality */}
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", damping: 18, stiffness: 80 }}
          className="self-start mt-8 ml-1"
        >
          {/* Glass Platform */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-yellow-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 pr-5 pl-1 py-1.5 rounded-full overflow-visible">
              
              {/* Le Taxi qui 'sort' du cadre (Pop-out effect) */}
              <div className="relative w-14 h-10 shrink-0 z-10">
                 <div className="absolute inset-0 scale-[2.5] -translate-y-2 -translate-x-1 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    <LottieAnimation
                      animationData={taxiAnimation}
                      loop={true}
                      autoplay={true}
                    />
                 </div>
              </div>

              <div className="flex flex-col pr-2">
                <span className="text-[9px] text-[#f3cd08] font-black uppercase tracking-[0.15em] leading-none mb-0.5">Tarifs de Taxi </span>
                <span className="text-[10px] font-bold text-gray-400">Ne payez plus trop cher</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM SECTION : Dual Action Command Center */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:max-w-xl pb-6"
        >
          {/* Headline Section */}
          <motion.div variants={itemVariants} className="mb-10 pl-2">
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-6 drop-shadow-2xl">
              FARE <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#f3cd08] to-[#f59e0b]">CALCULATOR.</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-xl font-medium max-w-[280px] md:max-w-md leading-relaxed border-l-2 border-[#f3cd08] pl-5 opacity-90">
              Estimez vos coûts ou enrichissez la base de données.
            </p>
          </motion.div>

          {/* DUAL ACTION CONTROLLER - Refined Paddings */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-10">
            {/* 1. Primary Action : ESTIMER */}
            <button 
              onClick={handleStart}
              className="group relative w-full flex items-center justify-between p-2.5 bg-[#f3cd08] rounded-4xl hover:bg-[#ffda29] active:scale-[0.98] transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(243,205,8,0.3)]"
            >
              <div className="flex flex-col items-start px-6 py-1">
                <span className="text-[#0a0a0a] font-black text-lg md:text-xl uppercase tracking-wider leading-tight">Estimer</span>
                <span className="text-[#0a0a0a]/50 text-[10px] font-bold uppercase tracking-tight">Calculateur de prix</span>
              </div>
              <div className="w-14 h-14 bg-[#0a0a0a] rounded-3xl flex items-center justify-center text-[#f3cd08] group-hover:-rotate-45 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 stroke-[3px]" />
              </div>
            </button>

            {/* 2. Secondary Action & Info Row */}
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <button 
                onClick={() => navigate('/add-trajet')}
                className="group flex items-center justify-between px-7 py-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-4xl hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-sm uppercase tracking-wide">Contribuer</span>
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-tighter">Base de données</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#f3cd08] group-hover:text-black transition-all">
                   <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
                </div>
              </button>

              {/* Status Chips - Balanced height */}
              <div className="flex items-center justify-center px-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-4xl">
                 <div className="flex flex-col items-center">
                    <Sparkles className="w-5 h-5 text-[#f3cd08] mb-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AI</span>
                 </div>
              </div>
            </div>
          </motion.div>
          
          {/* Footer Version - Refined Visibility */}
          <motion.div variants={itemVariants} className="flex items-center gap-5 text-white/40 px-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">Core v2.0</span>
             <div className="h-px flex-1 bg-white/20 rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">YDE</span>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

// Composant Badge réutilisable - Ultra Minimalist
function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-4 bg-white/3 backdrop-blur-md border border-white/5 rounded-full transition-colors hover:bg-white/8">
      <Icon className="w-4 h-4 text-[#f3cd08]" />
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}