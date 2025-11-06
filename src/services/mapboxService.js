/**
 * @fileoverview Service Mapbox - Intégration API Mapbox
 * 
 * Fournit des fonctions wrapper pour APIs Mapbox :
 * - Search API : Auto-complétion POI (searchSuggestions)
 * - Geocoding API : Forward/reverse geocoding
 * - Directions API : Calcul itinéraire avec trafic
 * - Matrix API : Distances/durées batch
 * - Isochrone API : Zones temporelles (périmètres similarité)
 * 
 * Note : Token depuis .env (VITE_MAPBOX_TOKEN)
 * Gestion cache et fallbacks pour limites quota gratuit
 */

import { MAPBOX_CONFIG } from '../config/constants';

/**
 * @typedef {import('../models/types').MapboxFeature} MapboxFeature
 * @typedef {import('../models/types').MapboxSuggestion} MapboxSuggestion
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

// Cache simple en mémoire (pour dev - en prod utiliser Redis/localStorage)
const searchCache = new Map();
const CACHE_TTL = 3600000; // 1h

/**
 * Recherche auto-complétion POI/lieux (Search API)
 * 
 * @param {string} query - Texte recherché
 * @param {Object} [options] - Options recherche
 * @param {[number, number]} [options.proximity] - [lon, lat] pour prioriser résultats proches
 * @param {string} [options.bbox] - Bounding box "minLon,minLat,maxLon,maxLat"
 * @param {number} [options.limit=5] - Nombre résultats max
 * @returns {Promise<MapboxSuggestion[]>} Liste suggestions
 * 
 * @example
 * const suggestions = await searchSuggestions("Carrefour E", {
 *   proximity: [11.5021, 3.8480], // Yaoundé
 *   limit: 5
 * });
 * suggestions.forEach(s => console.log(s.name, s.place_formatted));
 */
export const searchSuggestions = async (query, options = {}) => {
  if (!MAPBOX_TOKEN) {
    console.error('[searchSuggestions] Token Mapbox manquant');
    throw new Error('Token Mapbox non configuré');
  }
  
  if (!query || query.trim().length < 2) {
    return []; // Pas assez de caractères
  }
  
  // Check cache
  const cacheKey = `search_${query}_${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[searchSuggestions] Cache hit:', query);
    return cached.data;
  }
  
  try {
    const {
      proximity = MAPBOX_CONFIG.DEFAULT_CENTER ? [MAPBOX_CONFIG.DEFAULT_CENTER.lon, MAPBOX_CONFIG.DEFAULT_CENTER.lat] : null,
      bbox = MAPBOX_CONFIG.YAOUNDE_BBOX ? MAPBOX_CONFIG.YAOUNDE_BBOX.join(',') : null,
      limit = 5,
    } = options;
    
    const params = new URLSearchParams({
      q: query,
      access_token: MAPBOX_TOKEN,
      limit: limit.toString(),
      language: 'fr',
      country: 'cm', // Cameroun
    });
    
    if (proximity) {
      params.append('proximity', proximity.join(','));
    }
    
    if (bbox) {
      params.append('bbox', bbox);
    }
    
    const url = `${MAPBOX_BASE_URL}/search/searchbox/v1/suggest?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Search API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const suggestions = data.suggestions || [];
    
    // Cache résultat
    searchCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now(),
    });
    
    return suggestions;
  } catch (error) {
    console.error('[searchSuggestions] Erreur:', error);
    return []; // Retourner vide plutôt que throw (non bloquant)
  }
};

/**
 * Récupère détails complets d'une suggestion (après sélection)
 * 
 * @param {string} mapboxId - ID Mapbox de la suggestion
 * @returns {Promise<MapboxFeature|null>} Feature complète avec géométrie
 * 
 * @example
 * const suggestion = suggestions[0];
 * const feature = await retrieveSuggestionDetails(suggestion.mapbox_id);
 * console.log(`Coords: ${feature.center}`); // [lon, lat]
 */
export const retrieveSuggestionDetails = async (mapboxId) => {
  if (!MAPBOX_TOKEN || !mapboxId) {
    return null;
  }
  
  try {
    const url = `${MAPBOX_BASE_URL}/search/searchbox/v1/retrieve/${mapboxId}?access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Retrieve API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.features?.[0] || null;
  } catch (error) {
    console.error('[retrieveSuggestionDetails] Erreur:', error);
    return null;
  }
};

/**
 * Forward geocoding : Nom lieu → Coordonnées (fallback si Search échoue)
 * 
 * @param {string} placeName - Nom lieu
 * @param {Object} [options] - Options
 * @returns {Promise<MapboxFeature[]>} Features trouvées
 * 
 * @example
 * const features = await forwardGeocode("Carrefour Ekounou, Yaoundé");
 * if (features.length > 0) {
 *   const [lon, lat] = features[0].center;
 * }
 */
export const forwardGeocode = async (placeName, options = {}) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      country: 'cm',
      language: 'fr',
      limit: options.limit || 5,
    });
    
    if (MAPBOX_CONFIG.YAOUNDE_BBOX) {
      params.append('bbox', MAPBOX_CONFIG.YAOUNDE_BBOX.join(','));
    }
    
    const encoded = encodeURIComponent(placeName);
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encoded}.json?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Geocoding error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.features || [];
  } catch (error) {
    console.error('[forwardGeocode] Erreur:', error);
    return [];
  }
};

/**
 * Reverse geocoding : Coordonnées → Nom lieu
 * 
 * @param {number} lon - Longitude
 * @param {number} lat - Latitude
 * @returns {Promise<MapboxFeature|null>} Feature la plus proche
 * 
 * @example
 * const feature = await reverseGeocode(11.5021, 3.8480);
 * console.log(`Lieu: ${feature.place_name}`);
 */
export const reverseGeocode = async (lon, lat) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  try {
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&language=fr`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Reverse Geocoding error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.features?.[0] || null;
  } catch (error) {
    console.error('[reverseGeocode] Erreur:', error);
    return null;
  }
};

/**
 * Calcule itinéraire avec Directions API (incluant trafic, annotations)
 * 
 * @param {Array<[number, number]>} coordinates - [[lon1, lat1], [lon2, lat2], ...]
 * @param {Object} [options] - Options
 * @param {string} [options.profile="driving-traffic"] - Profil routing
 * @param {boolean} [options.steps=true] - Inclure steps détaillés
 * @param {string[]} [options.annotations] - Annotations (congestion, maxspeed, etc.)
 * @returns {Promise<Object|null>} Réponse Directions API
 * 
 * @example
 * const route = await getDirections(
 *   [[11.5021, 3.8547], [11.5174, 3.8667]],
 *   { profile: "driving-traffic", annotations: ["congestion", "maxspeed"] }
 * );
 * console.log(`Distance: ${route.routes[0].distance}m`);
 * console.log(`Durée: ${route.routes[0].duration}s`);
 */
export const getDirections = async (coordinates, options = {}) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  if (!coordinates || coordinates.length < 2) {
    throw new Error('Au moins 2 coordonnées requises');
  }
  
  try {
    const {
      profile = MAPBOX_CONFIG.PROFILES?.DRIVING_TRAFFIC || 'mapbox/driving-traffic',
      steps = true,
      annotations = MAPBOX_CONFIG.ANNOTATIONS || ['congestion', 'maxspeed', 'speed', 'duration', 'distance'],
    } = options;
    
    const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      geometries: 'geojson',
      steps: steps.toString(),
      annotations: annotations.join(','),
      overview: 'full',
      language: 'fr',
    });
    
    const url = `${MAPBOX_BASE_URL}/directions/v5/${profile}/${coordsString}?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Directions error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('[getDirections] Erreur:', error);
    return null;
  }
};

/**
 * Calcule isochrone (zone atteignable en X minutes)
 * Utilisé pour périmètres similarité intelligents
 * 
 * @param {[number, number]} center - [lon, lat] centre
 * @param {number[]} contours - Temps en minutes (ex: [2, 5])
 * @param {Object} [options] - Options
 * @returns {Promise<Object|null>} GeoJSON avec polygones
 * 
 * @example
 * const isochrone = await getIsochrone([11.5021, 3.8547], [2, 5]);
 * // Utiliser avec turf.js pour vérifier si point dans polygone
 */
export const getIsochrone = async (center, contours, options = {}) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  try {
    const {
      profile = 'driving-traffic',
      polygons = true,
    } = options;
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      contours_minutes: contours.join(','),
      polygons: polygons.toString(),
    });
    
    const url = `${MAPBOX_BASE_URL}/isochrone/v1/mapbox/${profile}/${center[0]},${center[1]}?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Isochrone error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('[getIsochrone] Erreur:', error);
    return null;
  }
};

/**
 * Calcule distances/durées batch via Matrix API
 * Optimisation pour comparaison multiples trajets (similarité)
 * 
 * @param {Array<[number, number]>} coordinates - Max 25 points
 * @param {Object} [options] - Options
 * @returns {Promise<Object|null>} Matrice distances/durées
 * 
 * @example
 * // Comparer 1 départ à 3 arrivées
 * const matrix = await getMatrix([
 *   [11.5021, 3.8547], // Départ
 *   [11.5174, 3.8667], // Arrivée 1
 *   [11.5200, 3.8700], // Arrivée 2
 *   [11.5180, 3.8650], // Arrivée 3
 * ], { sources: [0], destinations: [1, 2, 3] });
 * console.log('Distances:', matrix.distances[0]); // [dist1, dist2, dist3]
 */
export const getMatrix = async (coordinates, options = {}) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  if (!coordinates || coordinates.length > 25) {
    throw new Error('Max 25 coordonnées pour Matrix API');
  }
  
  try {
    const {
      profile = 'driving-traffic',
      sources = 'all',
      destinations = 'all',
    } = options;
    
    const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      sources: Array.isArray(sources) ? sources.join(';') : sources,
      destinations: Array.isArray(destinations) ? destinations.join(';') : destinations,
    });
    
    const url = `${MAPBOX_BASE_URL}/directions-matrix/v1/mapbox/${profile}/${coordsString}?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox Matrix error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('[getMatrix] Erreur:', error);
    return null;
  }
};

/**
 * Vérifie si token Mapbox est configuré
 * @returns {boolean}
 */
export const isMapboxConfigured = () => {
  return Boolean(MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.'));
};

export default {
  searchSuggestions,
  retrieveSuggestionDetails,
  forwardGeocode,
  reverseGeocode,
  getDirections,
  getIsochrone,
  getMatrix,
  isMapboxConfigured,
};
