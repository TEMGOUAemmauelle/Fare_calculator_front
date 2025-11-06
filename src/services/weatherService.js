/**
 * @fileoverview Service Météo - Intégration Open-Meteo API
 * 
 * Fournit des fonctions pour détecter météo actuelle :
 * - getCurrentWeather() : Météo actuelle pour coords
 * - getWeatherCode() : Convertit code Open-Meteo → nos codes (0-3)
 * 
 * API gratuite illimitée : https://open-meteo.com/
 * Utilisé pour auto-détection météo si user ne renseigne pas
 */

import { OPENMETEO_CONFIG } from '../config/constants';

const OPENMETEO_BASE_URL = import.meta.env.VITE_OPENMETEO_BASE_URL || 'https://api.open-meteo.com/v1';

// Cache simple (15 min comme doc recommande)
const weatherCache = new Map();
const CACHE_TTL = 900000; // 15 min

/**
 * Récupère météo actuelle pour coordonnées données
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{code: number, label: string, temperature: number}>} Météo simplifiée
 * 
 * @example
 * const weather = await getCurrentWeather(3.8480, 11.5021);
 * console.log(`Météo: ${weather.label} (${weather.temperature}°C)`);
 * console.log(`Code interne: ${weather.code}`); // 0=soleil, 1=pluie légère, 2=pluie forte, 3=orage
 */
export const getCurrentWeather = async (lat, lon) => {
  // Check cache
  const cacheKey = `weather_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[getCurrentWeather] Cache hit');
    return cached.data;
  }
  
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current_weather: 'true',
      temperature_unit: 'celsius',
    });
    
    const url = `${OPENMETEO_BASE_URL}/forecast?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const current = data.current_weather;
    if (!current) {
      throw new Error('Données météo manquantes');
    }
    
    // Convertir code Open-Meteo (WMO) → nos codes (0-3)
    const ourCode = mapWeatherCode(current.weathercode);
    const label = getWeatherLabel(ourCode);
    
    const result = {
      code: ourCode,
      label,
      temperature: current.temperature,
      windspeed: current.windspeed,
      timestamp: current.time,
    };
    
    // Cache
    weatherCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });
    
    return result;
  } catch (error) {
    console.error('[getCurrentWeather] Erreur:', error);
    
    // Fallback : Retourner soleil par défaut (code 0)
    return {
      code: 0,
      label: 'Soleil',
      temperature: null,
      windspeed: null,
      timestamp: null,
    };
  }
};

/**
 * Convertit code WMO Open-Meteo → nos codes internes (0-3)
 * Mapping basé sur OPENMETEO_CONFIG.WEATHER_CODE_MAPPING
 * 
 * @param {number} wmoCode - Code WMO (0-99)
 * @returns {number} Notre code (0=soleil, 1=pluie légère, 2=pluie forte, 3=orage)
 * 
 * @example
 * mapWeatherCode(0) // 0 (Clear sky → Soleil)
 * mapWeatherCode(61) // 1 (Rain → Pluie légère)
 * mapWeatherCode(95) // 3 (Thunderstorm → Orage)
 */
export const mapWeatherCode = (wmoCode) => {
  const mapping = OPENMETEO_CONFIG.WEATHER_CODE_MAPPING || {
    0: 0,           // Clear sky → Soleil
    1: 0, 2: 0, 3: 0, // Mainly clear → Soleil
    45: 1, 48: 1,   // Fog → Pluie légère (approx)
    51: 1, 53: 1, 55: 1, // Drizzle → Pluie légère
    61: 1, 63: 2, 65: 2, // Rain → Pluie légère/forte
    71: 2, 73: 2, 75: 2, // Snow → Pluie forte (rare Cameroun)
    80: 2, 81: 2, 82: 2, // Rain showers → Pluie forte
    95: 3, 96: 3, 99: 3, // Thunderstorm → Orage
  };
  
  return mapping[wmoCode] ?? 0; // Fallback soleil si inconnu
};

/**
 * Obtient le label français pour notre code météo interne
 * 
 * @param {number} code - Notre code (0-3)
 * @returns {string} Label ("Soleil", "Pluie légère", "Pluie forte", "Orage")
 */
export const getWeatherLabel = (code) => {
  const labels = {
    0: 'Soleil',
    1: 'Pluie légère',
    2: 'Pluie forte',
    3: 'Orage',
  };
  
  return labels[code] || 'Inconnu';
};

/**
 * Détecte météo actuelle pour position user (wrapper pratique)
 * Utilise géolocalisation + Open-Meteo
 * 
 * @returns {Promise<{code: number, label: string}>} Météo actuelle
 * 
 * @example
 * // Depuis composant avec géoloc
 * const weather = await detectCurrentWeather();
 * console.log(`Météo détectée: ${weather.label}`);
 */
export const detectCurrentWeather = async () => {
  try {
    // Essayer géolocalisation pour coords précises
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non disponible'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { timeout: 5000 }
      );
    });
    
    return await getCurrentWeather(
      position.coords.latitude,
      position.coords.longitude
    );
  } catch (geoError) {
    console.warn('[detectCurrentWeather] Géoloc échouée, fallback Yaoundé:', geoError);
    
    // Fallback : Utiliser centre Yaoundé
    return await getCurrentWeather(3.8480, 11.5021);
  }
};

/**
 * Vide le cache météo (utile pour tests)
 * @returns {void}
 */
export const clearWeatherCache = () => {
  weatherCache.clear();
  console.log('[clearWeatherCache] Cache vidé');
};

export default {
  getCurrentWeather,
  mapWeatherCode,
  getWeatherLabel,
  detectCurrentWeather,
  clearWeatherCache,
};
