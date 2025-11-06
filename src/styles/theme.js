/**
 * @fileoverview Thème global de l'application
 * Palette de couleurs inspirée de la maquette - Dominance jaune #f3cd08
 */

export const THEME = {
  // Couleurs principales
  colors: {
    primary: '#f3cd08',      // Jaune dominant
    primaryDark: '#d4b307',  // Jaune foncé hover
    primaryLight: '#f3cd08', // Jaune clair
    
    text: {
      primary: '#231f0f',    // Texte principal (noir doré)
      secondary: '#231f0f',  // Texte secondaire (70% opacity)
      muted: '#64748b',      // Texte atténué
      light: '#94a3b8',      // Texte très clair
    },
    
    background: {
      main: '#f8f8f5',       // Fond principal (beige très clair)
      white: '#ffffff',      // Blanc pur
      card: '#ffffff',       // Fond cartes
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    border: {
      default: '#e2e8f0',    // Bordure par défaut
      active: '#f3cd08',     // Bordure active (jaune)
      light: '#f1f5f9',      // Bordure légère
    },
    
    status: {
      success: '#10b981',    // Vert succès
      warning: '#f59e0b',    // Orange warning
      error: '#ef4444',      // Rouge erreur
      info: '#3b82f6',       // Bleu info
    },
    
    // Variantes de jaune pour gradients
    yellow: {
      50: 'rgba(243, 205, 8, 0.05)',
      100: 'rgba(243, 205, 8, 0.1)',
      200: 'rgba(243, 205, 8, 0.2)',
      300: 'rgba(243, 205, 8, 0.3)',
      500: '#f3cd08',
      600: '#d4b307',
      700: '#b59906',
    },
    
    // Gris neutres
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  
  // Classes Tailwind réutilisables
  classes: {
    // Boutons
    button: {
      primary: 'bg-[#f3cd08] text-[#231f0f] hover:bg-[#d4b307] rounded-full font-semibold transition-all duration-200 shadow-lg hover:scale-105 active:scale-95',
      secondary: 'bg-white text-[#231f0f] border-2 border-[#f3cd08] hover:bg-[#f3cd08]/10 rounded-full font-semibold transition-all duration-200',
      ghost: 'bg-transparent text-[#231f0f] hover:bg-[#f3cd08]/10 rounded-full transition-all duration-200',
    },
    
    // Inputs
    input: {
      base: 'w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#f3cd08] focus:ring-4 focus:ring-[#f3cd08]/20 bg-white text-[#231f0f] placeholder-slate-400 transition-all duration-200',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-100',
    },
    
    // Cartes
    card: {
      base: 'bg-white rounded-2xl shadow-lg border border-slate-200',
      yellow: 'bg-gradient-to-br from-[#f3cd08]/10 to-[#f3cd08]/5 border-[#f3cd08]/30',
    },
    
    // Textes
    text: {
      primary: 'text-[#231f0f]',
      secondary: 'text-[#231f0f]/80',
      muted: 'text-slate-500',
      light: 'text-slate-400',
    },
    
    // Icônes
    icon: {
      primary: 'text-[#f3cd08]',
      secondary: 'text-[#231f0f]',
      muted: 'text-slate-500',
    },
  },
  
  // Animations
  animation: {
    transition: 'transition-all duration-200',
    hover: 'hover:scale-105 active:scale-95',
    fade: 'animate-fade-in',
  },
  
  // Espacements
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  
  // Border radius
  radius: {
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};

export default THEME;
