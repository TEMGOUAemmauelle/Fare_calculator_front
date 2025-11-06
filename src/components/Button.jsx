/**
 * @fileoverview Composant Button - Bouton réutilisable avec thème jaune
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import THEME from '../styles/theme';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[#f3cd08] text-[#231f0f] hover:bg-[#231f0f] hover:text-white shadow-lg',
    secondary: 'bg-white text-[#231f0f] border-2 border-[#f3cd08] hover:bg-[#f3cd08]/10',
    ghost: 'bg-transparent text-[#231f0f] hover:bg-[#f3cd08]/10',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim();
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-5 h-5" />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-5 h-5" />
      )}
    </motion.button>
  );
}
