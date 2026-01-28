
/**
 * @fileoverview Service Nominatim - Recherche POI OpenStreetMap
 * 
 * Alternative à Mapbox pour recherche détaillée locale :
 * - Plus de POIs (écoles, marchés, carrefours)
 * - Données OSM Cameroun
 * - Gratuit et sans limites
 * 
 * NOTE: Nominatim requiert une identification (email) pour éviter les blocages
 * Le header User-Agent ne peut pas être défini depuis le navigateur (restriction sécurité)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
// Email requis par Nominatim pour identifier l'application (leur politique d'usage)
const APP_EMAIL = 'contact@taxiestimator.cm';

// Cache
const searchCache = new Map();
const CACHE_TTL = 3600000; // 1h

// Throttle pour respecter la limite de 1 req/sec de Nominatim
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 secondes entre chaque requête

const throttledFetch = async (url) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
};

/**
 * Recherche de lieux avec Nominatim
 * Support : POIs, rues, quartiers, bâtiments
 */
export const searchPlaces = async (query, options = {}) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const {
    limit = 10,
    bounded = true, // Limiter à Yaoundé
    viewbox = '11.4,3.78,11.6,3.95', // Bbox Yaoundé [minLon,minLat,maxLon,maxLat]
    countrycodes = 'cm',
  } = options;

  // Check cache
  const cacheKey = `nominatim_${query}_${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Cache hit:', cacheKey);
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      countrycodes,
      viewbox,
      bounded: bounded ? '1' : '0',
      'accept-language': 'fr',
      dedupe: '1', // Éviter doublons
      email: APP_EMAIL, // Identification requise par Nominatim
    });

    const url = `${NOMINATIM_BASE_URL}/search?${params}`;

    // Utiliser throttledFetch pour respecter la limite de 1 req/sec
    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();

    // Transformer en format uniforme
    const results = data.map((item) => {
      const address = item.address || {};
      
      // Construire label hiérarchique
      const parts = [];
      if (item.name) parts.push(item.name);
      if (address.road && address.road !== item.name) parts.push(address.road);
      if (address.suburb) parts.push(address.suburb);
      if (address.city || address.town) parts.push(address.city || address.town);

      return {
        id: item.place_id,
        name: item.display_name.split(',')[0], // Premier élément = nom principal
        display_name: item.display_name,
        place_formatted: parts.join(', '),
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        longitude: parseFloat(item.lon),
        latitude: parseFloat(item.lat),
        type: item.type,
        category: item.class,
        address: {
          road: address.road,
          suburb: address.suburb || address.neighbourhood,
          city: address.city || address.town,
          country: address.country,
        },
        importance: item.importance || 0,
        osm_type: item.osm_type,
        osm_id: item.osm_id,
      };
    });

    // Trier par importance
    results.sort((a, b) => b.importance - a.importance);

    // Cache résultat
    searchCache.set(cacheKey, {
      data: results,
      timestamp: Date.now(),
    });

    console.log(`✅ Nominatim: ${results.length} résultats pour "${query}"`);
    return results;
  } catch (error) {
    console.error('[Nominatim searchPlaces] Erreur:', error);
    return [];
  }
};

/**
 * Recherche spécifique par catégorie
 */
export const searchByCategory = async (category, query = '', options = {}) => {
  const categoryQueries = {
    school: `school ${query}`,
    market: `marché ${query}`,
    hospital: `hôpital ${query}`,
    carrefour: `carrefour ${query}`,
    university: `université ${query}`,
  };

  const searchQuery = categoryQueries[category] || query;
  return searchPlaces(searchQuery, options);
};

/**
 * Recherche structurée (plus précise)
 */
export const searchStructured = async (components = {}) => {
  const {
    street,
    city = 'Yaoundé',
    country = 'Cameroun',
    limit = 5,
  } = components;

  try {
    const params = new URLSearchParams({
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      'accept-language': 'fr',
      email: APP_EMAIL,
    });

    if (street) params.append('street', street);
    if (city) params.append('city', city);
    if (country) params.append('country', country);

    const url = `${NOMINATIM_BASE_URL}/search?${params}`;

    const response = await throttledFetch(url);

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((item) => ({
      id: item.place_id,
      name: item.display_name.split(',')[0],
      display_name: item.display_name,
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
      longitude: parseFloat(item.lon),
      latitude: parseFloat(item.lat),
    }));
  } catch (error) {
    console.error('[Nominatim searchStructured] Erreur:', error);
    return [];
  }
};

/**
 * Reverse geocoding
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      addressdetails: '1',
      zoom: '18',
      'accept-language': 'fr',
      email: APP_EMAIL,
    });

    const url = `${NOMINATIM_BASE_URL}/reverse?${params}`;

    const response = await throttledFetch(url);

    if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

    const data = await response.json();
    const address = data.address || {};

    return {
      name: data.display_name.split(',')[0],
      display_name: data.display_name,
      coordinates: [lon, lat],
      longitude: lon,
      latitude: lat,
      address: {
        road: address.road,
        suburb: address.suburb || address.neighbourhood,
        city: address.city || address.town,
        country: address.country,
      },
    };
  } catch (error) {
    console.error('[Nominatim reverseGeocode] Erreur:', error);
    return null;
  }
};

/**
 * Recherche inversée simplifiée : Coordonnées -> Chaîne formatée
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<string>} "Rue, Ville" ou "Quartier, Ville"
 */
export const reverseSearch = async (lat, lon) => {
  try {
    const data = await reverseGeocode(lat, lon);
    if (!data || !data.address) return "Position inconnue";

    const { road, suburb, city, town, village, neighbourhood } = data.address;
    let label = "";

    // Priorité : Route > Quartier > Voisinage
    if (road) label = road;
    else if (suburb) label = suburb;
    else if (neighbourhood) label = neighbourhood;

    // Ajout Ville
    const ville = city || town || village;
    if (ville) {
      if (label && label !== ville) label += `, ${ville}`;
      else if (!label) label = ville;
    }

    return label || data.display_name.split(',')[0];
  } catch (error) {
    return "Votre position";
  }
};

/**
 * Clear cache (utile pour debug)
 */
export const clearCache = () => {
  searchCache.clear();
  console.log('🗑️ Cache Nominatim vidé');
};

export default {
  searchPlaces,
  searchByCategory,
  searchStructured,
  reverseGeocode,
  reverseSearch,
  clearCache,
};
