import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cookie, X } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';

const CookieConsent = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="p-3 bg-[#f39908]/10 rounded-xl">
                <Cookie className="w-6 h-6 text-[#f39908]" />
              </div>
              <button 
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('cookies_modal.title', 'Cookies & Privacy')}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {t('cookies_modal.description', 'We use cookies to improve your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.')}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAccept}
                className="w-full py-2.5 px-4 bg-[#f39908] hover:bg-[#dNb907] text-black font-bold rounded-xl transition-all transform active:scale-95 text-sm"
              >
                {t('cookies_modal.accept', 'Accept All')}
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm"
                >
                  {t('cookies_modal.decline', 'Essential Only')}
                </button>
                <button
                  onClick={() => navigate('/cookies')}
                  className="py-2.5 px-4 bg-transparent text-gray-500 hover:text-[#f39908] font-medium transition-colors text-sm"
                >
                  {t('cookies_modal.learn_more', 'Privacy')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
