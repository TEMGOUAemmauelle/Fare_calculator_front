import { useNavigate, useParams } from 'react-router-dom';

export const useAppNavigate = () => {
  const navigate = useNavigate();
  const { lang } = useParams();

  const appNavigate = (path, options) => {
    // Si le path est un nombre (ex: -1 pour retour), on l'utilise direct
    if (typeof path === 'number') {
      return navigate(path, options);
    }

    // Si le path commence par /, on ajoute le segment de langue
    if (path.startsWith('/')) {
      // Éviter de doubler le segment lang si déjà présent
      const segments = path.split('/').filter(Boolean);
      const supportedLangs = ['fr', 'en'];
      
      if (segments.length > 0 && supportedLangs.includes(segments[0])) {
        return navigate(path, options);
      }

      const cleanPath = path === '/' ? '' : path;
      return navigate(`/${lang || 'fr'}${cleanPath}`, options);
    }
    
    return navigate(path, options);
  };

  return appNavigate;
};
