
import apiClient from '../config/api';

/**
 * Service pour récupérer les publicités depuis le backend.
 */

// Fallback data au cas où le backend est vide ou inaccessible
const STATIC_FALLBACK_ADS = [

];

export const getAds = async () => {
  try {
    const response = await apiClient.get('/publicites/');
    const data = response.data;
    
    // Si l'API retourne une liste vide, on utilise le fallback statique
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return STATIC_FALLBACK_ADS;
  } catch (error) {
    console.warn('⚠️ [AdService] Erreur API, utilisation du fallback statique:', error);
    return STATIC_FALLBACK_ADS;
  }
};
