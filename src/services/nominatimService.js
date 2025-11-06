/**
 * @fileoverview Service Nominatim - Recherche POI OpenStreetMap
 * 
 * Alternative à Mapbox pour recherche détaillée locale :
 * - Plus de POIs (écoles, marchés, carrefours)
 * - Données OSM Cameroun
 * - Gratuit et sans limites
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'FareCalculatorApp/1.0';

// Cache
const searchCache = new Map();
const CACHE_TTL = 3600000; // 1h

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
    });

    const url = `${NOMINATIM_BASE_URL}/search?${params}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

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
    });

    if (street) params.append('street', street);
    if (city) params.append('city', city);
    if (country) params.append('country', country);

    const url = `${NOMINATIM_BASE_URL}/search?${params}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

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
 * Reverse geocoding (déjà dans geolocationService mais on l'exporte aussi)
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
    });

    const url = `${NOMINATIM_BASE_URL}/reverse?${params}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

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
  clearCache,
};
