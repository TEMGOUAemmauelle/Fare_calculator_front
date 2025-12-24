
import apiClient from '../config/api';

/**
 * Service pour récupérer les publicités depuis le backend.
 */

// Fallback data au cas où le backend est vide ou inaccessible
const STATIC_FALLBACK_ADS = [

  {
    "id": "1",
    "title": "Wiki Taxi",
    "title_en": "Wiki Taxi",
    "description": "Réservez votre taxi en un clic",
    "description_en": "Book your taxi in one click",
    "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/TAXI.jpg/1280px-TAXI.jpg",
    "app_link": "https://play.google.com/store/apps/details?id=com.wikitaxi",
    "category": "Transport",
    "color": "#f3cd08"
  },
  {
    "id": "2",
    "title": "Service VIP",
    "title_en": "VIP Service",
    "description": "Le luxe à portée de main",
    "description_en": "Luxury at your fingertips",
    "image_url": "https://www.leparisien.fr/resizer/g65uyv7tT0jw3hpe7AJb5r4FRZM=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/ILSOWNDOZ4QWIEHAVX4Z336MZI.jpg",
    "app_link": "#",
    "category": "Premium",
    "color": "#141414"
  },
  {
    "id": "3",
    "title": "Eco Ride",
    "title_en": "Eco Ride",
    "description": "Moins de CO2, plus de confort",
    "description_en": "Less CO2, more comfort",
    "image_url": "https://images.radio-canada.ca/q_auto,w_700/v1/ici-info/16x9/taxi-jaune.jpg",
    "app_link": "#",
    "category": "Eco",
    "color": "#22c55e"
  }

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
