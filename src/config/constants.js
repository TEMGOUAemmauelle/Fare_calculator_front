/**
 * @fileoverview Constantes globales du projet Fare Calculator
 * 
 * Ce fichier contient toutes les constantes utilisées dans l'application :
 * - Mappings météo (codes 0-3 → labels/emojis)
 * - Tranches horaires (matin/après-midi/soir/nuit)
 * - Types de zones (urbaine/mixte/rurale)
 * - Codes statut API (exact/similaire/inconnu)
 * - Configurations Mapbox (profils, paramètres isochrones)
 * 
 * Utilisé par : Services, Components, Pages
 */

// ===========================================
// MÉTÉO - Mappings codes API → labels/icônes
// ===========================================
export const METEO_CODES = {
  0: { label: 'Soleil', emoji: '☀️', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  1: { label: 'Pluie légère', emoji: '🌦️', color: 'text-blue-400', bg: 'bg-blue-50' },
  2: { label: 'Pluie forte', emoji: '🌧️', color: 'text-blue-600', bg: 'bg-blue-100' },
  3: { label: 'Orage', emoji: '⛈️', color: 'text-purple-600', bg: 'bg-purple-100' },
};

export const METEO_OPTIONS = Object.entries(METEO_CODES).map(([code, data]) => ({
  value: parseInt(code),
  label: `${data.emoji} ${data.label}`,
  ...data,
}));

// ===========================================
// TRANCHES HORAIRES - Mappings API → labels/icônes
// ===========================================
export const HEURE_TRANCHES = {
  matin: { label: '6h-12h', emoji: '🌅', color: 'text-orange-500', bg: 'bg-orange-50' },
  'apres-midi': { label: '12h-18h', emoji: '☀️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  soir: { label: '18h-22h', emoji: '🌆', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  nuit: { label: '22h-6h', emoji: '🌙', color: 'text-blue-700', bg: 'bg-blue-100' },
};

export const HEURE_OPTIONS = Object.entries(HEURE_TRANCHES).map(([key, data]) => ({
  value: key,
  label: `${data.emoji} ${data.label}`,
  ...data,
}));

// Fonction helper : Détecter tranche horaire depuis heure (0-23)
export const getHeureTrancheFromTime = (heure) => {
  if (heure >= 6 && heure < 12) return 'matin';
  if (heure >= 12 && heure < 18) return 'apres-midi';
  if (heure >= 18 && heure < 22) return 'soir';
  return 'nuit';
};

// ===========================================
// TYPES DE ZONES - Mappings codes 0-2 → labels
// ===========================================
export const TYPE_ZONE_CODES = {
  0: { label: 'Urbaine', emoji: '🏙️', color: 'text-gray-700', bg: 'bg-gray-50', description: 'Zone dense, routes principales' },
  1: { label: 'Mixte', emoji: '🏘️', color: 'text-green-600', bg: 'bg-green-50', description: 'Zone semi-urbaine' },
  2: { label: 'Rurale', emoji: '🌾', color: 'text-amber-600', bg: 'bg-amber-50', description: 'Zone peu dense, routes secondaires' },
};

export const TYPE_ZONE_OPTIONS = Object.entries(TYPE_ZONE_CODES).map(([code, data]) => ({
  value: parseInt(code),
  label: `${data.emoji} ${data.label}`,
  ...data,
}));

// ===========================================
// STATUTS API - Pour réponses /estimate
// ===========================================
export const STATUT_ESTIMATION = {
  exact: {
    label: 'Trajet Exact',
    color: 'text-green-600',
    bg: 'bg-green-100',
    icon: '✅',
    description: 'Basé sur trajets identiques en base de données',
  },
  similaire: {
    label: 'Trajet Similaire',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    icon: '≈',
    description: 'Estimation ajustée depuis trajets proches',
  },
  inconnu: {
    label: 'Trajet Inconnu',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: '⚠️',
    description: 'Estimation approximative (fiabilité réduite)',
  },
};

// ===========================================
// CONGESTION UTILISATEUR - Échelle 1-10
// ===========================================
export const CONGESTION_SCALE = Array.from({ length: 10 }, (_, i) => {
  const value = i + 1;
  let label, emoji, color;
  
  if (value <= 3) {
    label = 'Fluide';
    emoji = '🟢';
    color = 'text-green-600';
  } else if (value <= 6) {
    label = 'Modéré';
    emoji = '🟡';
    color = 'text-yellow-600';
  } else if (value <= 8) {
    label = 'Dense';
    emoji = '🟠';
    color = 'text-orange-600';
  } else {
    label = 'Bloqué';
    emoji = '🔴';
    color = 'text-red-600';
  }
  
  return { value, label: `${emoji} ${value}/10 - ${label}`, emoji, color };
});

// ===========================================
// MAPBOX - Configuration API
// ===========================================
export const MAPBOX_CONFIG = {
  // Profils routing (pour Directions API)
  PROFILES: {
    DRIVING_TRAFFIC: 'mapbox/driving-traffic', // Par défaut - avec trafic temps réel
    DRIVING: 'mapbox/driving', // Sans trafic
  },
  
  // Annotations demandées (Directions API)
  ANNOTATIONS: ['congestion', 'maxspeed', 'speed', 'duration', 'distance'],
  
  // Isochrones - Contours temporels (en minutes)
  ISOCHRONE_CONTOURS: {
    EXACT: 2,        // Périmètre "exact" (2 min)
    SIMILAIRE: 5,    // Périmètre "similaire élargi" (5 min)
  },
  
  // Centre par défaut - Yaoundé, Cameroun
  DEFAULT_CENTER: {
    lat: 3.8480,
    lon: 11.5021,
  },
  
  // Zoom par défaut
  DEFAULT_ZOOM: 13,
  
  // Bbox Yaoundé (pour filtres/recherches locales)
  YAOUNDE_BBOX: [11.4000, 3.7800, 11.6000, 3.9500], // [minLon, minLat, maxLon, maxLat]
};

// ===========================================
// NOMINATIM - Configuration API (Fallback Geocoding)
// ===========================================
export const NOMINATIM_CONFIG = {
  // Paramètres recherche par défaut
  DEFAULT_PARAMS: {
    format: 'json',
    addressdetails: 1,
    limit: 5,
    countrycodes: 'cm', // Cameroun uniquement
    bounded: 1,         // Limiter aux bbox
  },
  
  // Bbox Yaoundé (priorité résultats locaux)
  YAOUNDE_VIEWBOX: '11.4000,3.7800,11.6000,3.9500', // minLon,minLat,maxLon,maxLat
};

// ===========================================
// OPEN-METEO - Configuration API
// ===========================================
export const OPENMETEO_CONFIG = {
  // Variables demandées
  CURRENT_WEATHER_PARAMS: {
    current_weather: true,
    temperature_unit: 'celsius',
  },
  
  // Mapping code météo Open-Meteo → nos codes (simplifié)
  WEATHER_CODE_MAPPING: {
    0: 0,           // Clear sky → Soleil
    1: 0, 2: 0, 3: 0, // Mainly clear → Soleil
    45: 1, 48: 1,   // Fog → Pluie légère (approx)
    51: 1, 53: 1, 55: 1, // Drizzle → Pluie légère
    61: 1, 63: 2, 65: 2, // Rain → Pluie légère/forte
    71: 2, 73: 2, 75: 2, // Snow → Pluie forte (rare Cameroun)
    80: 2, 81: 2, 82: 2, // Rain showers → Pluie forte
    95: 3, 96: 3, 99: 3, // Thunderstorm → Orage
  },
};

// ===========================================
// UI - Constantes interface
// ===========================================
export const UI_CONFIG = {
  // Durée animations (ms)
  ANIMATION_DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  
  // Debounce pour recherche auto-complétion (ms)
  SEARCH_DEBOUNCE: 300,
  
  // Pagination par défaut
  DEFAULT_PAGE_SIZE: 20,
  
  // Toasts notifications
  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    INFO: 4000,
  },
  
  // Skeleton placeholders (nombre)
  SKELETON_ITEMS: 5,
};

// ===========================================
// MESSAGES UTILISATEUR - Templates
// ===========================================
export const MESSAGES = {
  // Erreurs
  ERROR_NETWORK: 'Impossible de contacter le serveur. Vérifiez votre connexion Internet.',
  ERROR_GEOLOCATION_DENIED: 'Permission géolocalisation refusée. Saisissez manuellement votre position.',
  ERROR_GEOLOCATION_UNAVAILABLE: 'Géolocalisation non disponible sur cet appareil.',
  ERROR_API_KEY: 'Clé API invalide. Contactez l\'administrateur.',
  ERROR_SAME_POINTS: 'Les points de départ et d\'arrivée doivent être différents.',
  
  // Succès
  SUCCESS_TRAJET_ADDED: 'Trajet ajouté avec succès ! Merci de contribuer à la communauté 🎉',
  SUCCESS_COPIED: 'Copié dans le presse-papiers !',
  
  // Info
  INFO_LOADING_ESTIMATE: 'Calcul de l\'estimation en cours...',
  INFO_DETECTING_LOCATION: 'Détection de votre position...',
  INFO_NO_RESULTS: 'Aucun résultat trouvé. Essayez avec un autre lieu.',
  
  // Invites ajout trajet
  INVITE_ADD_TRAJET: 'Ce trajet est inconnu. Aidez la communauté en ajoutant votre prix après le trajet !',
};

// ===========================================
// ROUTES - Chemins navigation (pour React Router)
// ===========================================
export const ROUTES = {
  HOME: '/',
  ESTIMATE: '/estimate',
  ADD_TRAJET: '/add-trajet',
  HISTORY: '/history',
  ABOUT: '/about',
  STATS: '/stats',
};

// Export par défaut (pour imports simplifiés)
export default {
  METEO_CODES,
  METEO_OPTIONS,
  HEURE_TRANCHES,
  HEURE_OPTIONS,
  TYPE_ZONE_CODES,
  TYPE_ZONE_OPTIONS,
  STATUT_ESTIMATION,
  CONGESTION_SCALE,
  MAPBOX_CONFIG,
  NOMINATIM_CONFIG,
  OPENMETEO_CONFIG,
  UI_CONFIG,
  MESSAGES,
  ROUTES,
};
