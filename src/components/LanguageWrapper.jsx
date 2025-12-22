import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageWrapper = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const supportedLangs = ['fr', 'en'];
    
    // Si la langue dans l'URL est valide
    if (lang && supportedLangs.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
        // Mettre à jour l'attribut lang du document
        document.documentElement.lang = lang;
      }
    } else {
      // Redirection vers la langue par défaut ou détectée
      const detectedLang = i18n.language ? i18n.language.split('-')[0] : 'fr';
      const finalLang = supportedLangs.includes(detectedLang) ? detectedLang : 'fr';
      
      // Construire le nouveau path sans le segment lang invalide ou manquant
      // Si on est sur "/", on va vers "/fr"
      // Si on est sur "/estimate" (sans lang), on va vers "/fr/estimate"
      let newPath = location.pathname;
      
      // Si le premier segment est une langue (même invalide), on l'enlève
      const segments = location.pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0].length === 2) {
        newPath = '/' + segments.slice(1).join('/');
      }
      
      navigate(`/${finalLang}${newPath === '/' ? '' : newPath}`, { replace: true });
    }
  }, [lang, i18n, navigate, location.pathname]);

  // Si on n'a pas encore de langue valide dans l'URL, on ne rend rien pour éviter le flash
  const supportedLangs = ['fr', 'en'];
  if (!lang || !supportedLangs.includes(lang)) {
    return null;
  }

  return <Outlet />;
};

export default LanguageWrapper;
