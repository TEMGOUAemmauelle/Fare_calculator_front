import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'en', label: 'EN', name: 'English' }
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const toggleLanguage = (newLang) => {
    if (newLang === lang) return;

    // Calculer le nouveau chemin
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Si le premier segment est une langue connue, on le remplace
    if (['fr', 'en'].includes(pathSegments[0])) {
      pathSegments[0] = newLang;
    } else {
      // Sinon on l'ajoute au début (cas théorique géré par LanguageWrapper)
      pathSegments.unshift(newLang);
    }

    const newPath = '/' + pathSegments.join('/') + location.search + location.hash;
    
    // On change la langue dans i18n (facultatif si LanguageWrapper le fait au prochain render)
    i18n.changeLanguage(newLang);
    
    // On navigue vers la nouvelle URL
    navigate(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md border rounded-full transition-all font-bold text-xs uppercase tracking-wider ${
          variant === 'dark' 
            ? 'bg-black/5 border-black/10 text-black hover:bg-black/10' 
            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden py-1 border border-gray-100"
            >
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => toggleLanguage(l.code)}
                  className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                    lang === l.code ? 'bg-yellow-500 text-black' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l.name}
                  {lang === l.code && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
