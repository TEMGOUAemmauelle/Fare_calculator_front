/**
 * @fileoverview UserAuthButton - Bouton de connexion/état utilisateur
 * 
 * Affiche soit :
 * - Un bouton "Se connecter" si non authentifié
 * - Le nom, email ou téléphone si connecté (par ordre de priorité)
 * 
 * Design compact et élégant pour intégration dans navbar/header.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, LogIn, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

/**
 * Formate le numéro de téléphone pour l'affichage
 * +237612345678 -> +237 6** *** **8
 */
const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length >= 12) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 5)}** *** **${cleaned.slice(-1)}`;
  }
  return phone;
};

/**
 * Formate l'email pour l'affichage
 * arthur.donfack@gmail.com -> arth****@gmail.com
 */
const formatEmailForDisplay = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visiblePart = local.slice(0, Math.min(4, local.length));
  return `${visiblePart}****@${domain}`;
};

export default function UserAuthButton({ 
  variant = 'default', // 'default' | 'compact' | 'navbar'
  className = '' 
}) {
  const { t } = useTranslation();
  const { 
    isAuthenticated, 
    phoneNumber, 
    user,
    backendUser,
    openAuthModal,
    logout,
    isFirebaseConfigured 
  } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Ne rien afficher si Firebase n'est pas configuré
  if (!isFirebaseConfigured) {
    return null;
  }

  // Déterminer l'identifiant à afficher (ordre de priorité)
  const displayName = backendUser?.display_name || user?.displayName;
  const email = backendUser?.email || user?.email;
  const photoURL = backendUser?.photo_url || user?.photoURL;
  
  // Ce qu'on affiche dans le bouton compact
  const shortDisplay = displayName?.split(' ')[0] || (phoneNumber ? formatPhoneForDisplay(phoneNumber) : formatEmailForDisplay(email));
  
  // Ce qu'on affiche dans le modal
  const fullDisplay = displayName || phoneNumber || email || 'Utilisateur';

  const variants = {
    default: {
      container: 'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
      icon: 'w-4 h-4',
      text: 'text-xs font-semibold',
    },
    compact: {
      container: 'flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all',
      icon: 'w-3 h-3',
      text: 'text-[10px] font-semibold',
    },
    navbar: {
      container: 'flex items-center gap-2 px-3 py-2 rounded-xl transition-all',
      icon: 'w-3.5 h-3.5',
      text: 'text-[10px] font-semibold uppercase tracking-wide', // Cleaned later? No keeping for navbar
    },
  };

  const style = variants[variant] || variants.default;
  const isCompact = variant === 'compact';

  if (isAuthenticated) {
    // Utilisateur connecté - afficher le nom/email/téléphone
    const showLabel = variant !== 'compact';
    const avatarSize = variant === 'compact' ? 'w-5 h-5' : 'w-6 h-6';
    const hasPhoto = !!photoURL;
    
    return (
      <>
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsProfileOpen(true)}
          className={`${style.container} bg-gray-50 border border-gray-200 hover:bg-gray-100 ${className}`}
          aria-label={t('auth.logged_in_as')}
        >
          {hasPhoto ? (
            <img 
              src={photoURL} 
              alt="" 
              className={`${avatarSize} rounded-full object-cover`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`${avatarSize} bg-black/5 rounded-full flex items-center justify-center`}>
              <User className={`${style.icon} text-black`} />
            </div>
          )}
          {!isCompact && shortDisplay && (
            <span className={`${style.text} text-gray-700 whitespace-nowrap`}>
              {showLabel && (
                <>
                  <span className="text-gray-500 font-medium">{t('auth.logged_in_as')}</span>
                  <span className="mx-1 text-gray-300">•</span>
                </>
              )}
              {shortDisplay}
            </span>
          )}
        </motion.button>

        <AnimatePresence>
          {isProfileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                onClick={() => setIsProfileOpen(false)}
              />
              
              {/* Modal Profile */}
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="pointer-events-auto bg-white w-full max-w-[320px] rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="relative p-6 text-center">
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    
                        {hasPhoto ? (
                          <img 
                            src={photoURL} 
                            alt="" 
                            className="w-16 h-16 mx-auto rounded-full object-cover mb-4"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                            {t('auth.logged_in_as')}
                        </h3>
                        <p className="text-lg font-bold text-gray-900 tracking-tight">
                            {fullDisplay}
                        </p>
                        {/* Afficher l'email en secondaire si on a un nom */}
                        {displayName && email && (
                          <p className="text-xs text-gray-400 mt-1">
                            {email}
                          </p>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                                await logout();
                                setIsProfileOpen(false);
                            }}
                            className="w-full bg-white border border-gray-200 text-gray-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{t('auth.logout_btn')}</span>
                        </motion.button>
                    </div>
                  </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Utilisateur non connecté - bouton de connexion
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={openAuthModal}
      className={`${style.container} ${isCompact 
          ? 'bg-black text-white hover:bg-gray-800' 
          : 'bg-black text-white hover:bg-gray-800'
        } ${className}`}
      aria-label={t('auth.login_btn')}
    >
      <LogIn className={`${style.icon} ${isCompact ? 'text-white' : 'text-white'}`} />
      {variant !== 'compact' && (
        <span className={style.text}>{t('auth.login_btn')}</span>
      )}
    </motion.button>
  );
}
