/**
 * @fileoverview Service Mapbox CORRIGÉ
 * 
 * Corrections :
 * - Search API avec session token (évite erreurs 400)
 * - Gestion erreurs robuste
 * - Fallback sur Geocoding API si Search échoue
 * - Cache optimisé
 */

import { MAPBOX_CONFIG } from '../config/constants';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

// Cache
const searchCache = new Map();
const CACHE_TTL = 3600000; // 1h

// Session token pour Search API (requis par Mapbox)
let sessionToken = generateSessionToken();

function generateSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Recherche auto-complétion POI/lieux (Search Box API v1)
 * CORRIGÉ : Ajout session_token + fallback Geocoding
 */
export const searchSuggestions = async (query, options = {}) => {
  if (!MAPBOX_TOKEN) {
    console.error('[searchSuggestions] Token Mapbox manquant');
    return [];
  }
  
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  // Check cache
  const cacheKey = `search_${query}_${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const {
      proximity = [11.5021, 3.8480], // Yaoundé par défaut
      bbox = null,
      limit = 5,
    } = options;
    
    // Essayer Search Box API d'abord
    try {
      const searchParams = new URLSearchParams({
        q: query,
        access_token: MAPBOX_TOKEN,
        session_token: sessionToken,
        language: 'fr',
        limit: limit.toString(),
        country: 'CM',
      });
      
      if (proximity) {
        searchParams.append('proximity', proximity.join(','));
      }
      
      if (bbox) {
        searchParams.append('bbox', bbox);
      }
      
      const searchUrl = `${MAPBOX_BASE_URL}/search/searchbox/v1/suggest?${searchParams}`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const suggestions = (searchData.suggestions || []).map(s => ({
          mapbox_id: s.mapbox_id,
          name: s.name,
          place_formatted: s.place_formatted || s.full_address || '',
          coordinates: s.coordinates || [s.longitude, s.latitude],
          longitude: s.coordinates?.[0] || s.longitude,
          latitude: s.coordinates?.[1] || s.latitude,
          context: s.context || {},
        }));
        
        // Cache résultat
        searchCache.set(cacheKey, {
          data: suggestions,
          timestamp: Date.now(),
        });
        
        // Renouveler session token après usage
        sessionToken = generateSessionToken();
        
        return suggestions;
      }
    } catch (searchError) {
      console.warn('[searchSuggestions] Search API échouée, fallback Geocoding:', searchError.message);
    }
    
    // FALLBACK : Geocoding API (plus robuste, pas de session token)
    const geocodeParams = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      country: 'CM',
      language: 'fr',
      limit: limit.toString(),
      autocomplete: 'true',
    });
    
    if (proximity) {
      geocodeParams.append('proximity', proximity.join(','));
    }
    
    if (bbox) {
      geocodeParams.append('bbox', bbox);
    }
    
    const encoded = encodeURIComponent(query);
    const geocodeUrl = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encoded}.json?${geocodeParams}`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding API error: ${geocodeResponse.status}`);
    }
    
    const geocodeData = await geocodeResponse.json();
    
    const suggestions = (geocodeData.features || []).map(feature => ({
      mapbox_id: feature.id,
      name: feature.text,
      place_formatted: feature.place_name,
      coordinates: feature.center,
      longitude: feature.center[0],
      latitude: feature.center[1],
      context: feature.context || {},
    }));
    
    // Cache résultat
    searchCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now(),
    });
    
    return suggestions;
  } catch (error) {
    console.error('[searchSuggestions] Erreur totale:', error);
    return [];
  }
};

/**
 * Récupère détails complets d'une suggestion
 * CORRIGÉ : Gestion session token + fallback
 */
export const retrieveSuggestionDetails = async (mapboxId) => {
  if (!MAPBOX_TOKEN || !mapboxId) {
    return null;
  }
  
  try {
    // Si c'est un ID Geocoding (commence par 'poi.', 'place.', etc.)
    if (mapboxId.includes('.')) {
      // Déjà complet depuis Geocoding, pas besoin de retrieve
      return null;
    }
    
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      session_token: sessionToken,
    });
    
    const url = `${MAPBOX_BASE_URL}/search/searchbox/v1/retrieve/${mapboxId}?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Renouveler session token
    sessionToken = generateSessionToken();
    
    return data.features?.[0] || null;
  } catch (error) {
    console.error('[retrieveSuggestionDetails] Erreur:', error);
    return null;
  }
};

/**
 * Forward geocoding : Nom lieu → Coordonnées
 */
export const forwardGeocode = async (placeName, options = {}) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      country: 'CM',
      language: 'fr',
      limit: options.limit || 5,
    });
    
    if (options.bbox) {
      params.append('bbox', options.bbox);
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
 */
export const reverseGeocode = async (lon, lat) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Token Mapbox non configuré');
  }
  
  try {
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&language=fr&country=CM`;
    
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
 * Calcule itinéraire avec Directions API
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
      profile = 'mapbox/driving-traffic',
      steps = true,
      annotations = ['congestion', 'maxspeed', 'speed', 'duration', 'distance'],
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
 * Calcule isochrone
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