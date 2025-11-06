/**
 * @fileoverview Service Géolocalisation - Wrapper navigator.geolocation
 * 
 * Fournit des fonctions simplifiées pour géolocalisation HTML5 :
 * - getCurrentPosition() : Position actuelle avec timeout/fallback
 * - watchPosition() : Suivi position en temps réel
 * - checkPermission() : Vérifier statut permission
 * - reverseGeocode() : Convertir coords → POI nommé (via Nominatim/Mapbox)
 * 
 * Gestion erreurs : Permission refusée, timeout, indisponible
 */

import { MESSAGES, NOMINATIM_CONFIG } from '../config/constants';

/**
 * @typedef {import('../models/types').GeolocationPosition} GeolocationPosition
 * @typedef {import('../models/types').GeolocationError} GeolocationError
 * @typedef {import('../models/types').Point} Point
 */

/**
 * Options par défaut géolocalisation
 */
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,  // Précision maximale (GPS si disponible)
  timeout: 10000,            // Timeout 10s
  maximumAge: 60000,         // Cache 1 min
};

/**
 * Obtient la position actuelle de l'utilisateur
 * 
 * @param {Object} [options] - Options géolocalisation (override defaults)
 * @returns {Promise<GeolocationPosition>} Position avec coords
 * @throws {Error} Si permission refusée, timeout ou indisponible
 * 
 * @example
 * try {
 *   const position = await getCurrentPosition();
 *   console.log(`Position: ${position.coords.latitude}, ${position.coords.longitude}`);
 *   console.log(`Précision: ±${position.coords.accuracy}m`);
 * } catch (error) {
 *   console.error('Géoloc échouée:', error.userMessage);
 * }
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    // Vérifier support navigateur
    if (!navigator.geolocation) {
      const error = new Error(MESSAGES.ERROR_GEOLOCATION_UNAVAILABLE);
      error.code = 0;
      error.userMessage = MESSAGES.ERROR_GEOLOCATION_UNAVAILABLE;
      reject(error);
      return;
    }
    
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Log silencieux
        resolve(position);
      },
      (error) => {
        // Log uniquement si pas permission denied
        if (error.code !== 1) {
          console.warn('[getCurrentPosition] Erreur:', error.message);
        }
        
        // Formater erreur avec message utilisateur
        const formattedError = formatGeolocationError(error);
        reject(formattedError);
      },
      opts
    );
  });
};

/**
 * Démarre le suivi de position en temps réel
 * 
 * @param {Function} onSuccess - Callback succès (GeolocationPosition)
 * @param {Function} [onError] - Callback erreur (Error)
 * @param {Object} [options] - Options géolocalisation
 * @returns {number} Watch ID (pour clearWatch ultérieur)
 * 
 * @example
 * const watchId = watchPosition(
 *   (position) => console.log('Nouvelle position:', position.coords),
 *   (error) => console.error('Erreur suivi:', error.userMessage)
 * );
 * // Plus tard : stopWatchingPosition(watchId);
 */
export const watchPosition = (onSuccess, onError, options = {}) => {
  if (!navigator.geolocation) {
    const error = new Error(MESSAGES.ERROR_GEOLOCATION_UNAVAILABLE);
    error.userMessage = MESSAGES.ERROR_GEOLOCATION_UNAVAILABLE;
    if (onError) onError(error);
    return null;
  }
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log('[watchPosition] Update:', position);
      onSuccess(position);
    },
    (error) => {
      console.error('[watchPosition] Erreur:', error);
      const formattedError = formatGeolocationError(error);
      if (onError) onError(formattedError);
    },
    opts
  );
  
  return watchId;
};

/**
 * Arrête le suivi de position
 * 
 * @param {number} watchId - ID retourné par watchPosition()
 * @returns {void}
 * 
 * @example
 * stopWatchingPosition(watchId);
 */
export const stopWatchingPosition = (watchId) => {
  if (navigator.geolocation && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    console.log(`[stopWatchingPosition] Watch ${watchId} arrêté`);
  }
};

/**
 * Vérifie le statut de permission géolocalisation (API Permissions si disponible)
 * 
 * @returns {Promise<string>} "granted" | "denied" | "prompt" | "unsupported"
 * 
 * @example
 * const status = await checkGeolocationPermission();
 * if (status === 'denied') {
 *   alert('Veuillez autoriser la géolocalisation dans les paramètres.');
 * }
 */
export const checkGeolocationPermission = async () => {
  try {
    // API Permissions (moderne, pas supportée partout)
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      console.log(`[checkGeolocationPermission] Statut: ${result.state}`);
      return result.state; // "granted", "denied", "prompt"
    }
    
    // Fallback : tester avec getCurrentPosition (timeout rapide)
    try {
      await getCurrentPosition({ timeout: 1000 });
      return 'granted';
    } catch (error) {
      if (error.code === 1) return 'denied'; // PERMISSION_DENIED
      return 'prompt'; // Autres erreurs = pas encore demandé
    }
  } catch (error) {
    console.warn('[checkGeolocationPermission] Non supporté:', error);
    return 'unsupported';
  }
};

/**
 * Reverse geocoding : Convertit coordonnées → POI nommé + infos admin
 * Utilise Nominatim (OpenStreetMap) pour éviter quotas Mapbox
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Point>} Point avec label, quartier, ville, etc.
 * 
 * @example
 * const position = await getCurrentPosition();
 * const point = await reverseGeocode(position.coords.latitude, position.coords.longitude);
 * console.log(`Vous êtes à: ${point.label || point.quartier || point.ville}`);
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    const url = `${NOMINATIM_CONFIG.BASE_URL || 'https://nominatim.openstreetmap.org'}/reverse`;
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      addressdetails: '1',
      zoom: '18', // Niveau détail max (POI/adresse précise)
    });
    
    const response = await fetch(`${url}?${params}`, {
      headers: {
        'User-Agent': 'FareCalculatorApp/1.0', // Requis par Nominatim
      },
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extraire infos pertinentes depuis address
    const address = data.address || {};
    
    // Label : POI > rue > quartier > village
    const label = data.display_name?.split(',')[0] ||
                  address.amenity ||
                  address.building ||
                  address.road ||
                  address.suburb ||
                  address.village ||
                  'Position actuelle';
    
    return {
      id: null,
      coords_latitude: lat,
      coords_longitude: lon,
      label,
      quartier: address.suburb || address.neighbourhood || address.village || null,
      ville: address.city || address.town || address.municipality || 'Yaoundé',
      arrondissement: address.county || address.state_district || null,
      departement: address.state || null,
      created_at: null,
      updated_at: null,
    };
  } catch (error) {
    console.error('[reverseGeocode] Erreur:', error);
    
    // Fallback : Retourner coords brutes avec label générique
    return {
      id: null,
      coords_latitude: lat,
      coords_longitude: lon,
      label: 'Position actuelle',
      quartier: null,
      ville: 'Yaoundé',
      arrondissement: null,
      departement: null,
      created_at: null,
      updated_at: null,
    };
  }
};

/**
 * Obtient position actuelle + reverse geocoding en une fois
 * Helper pratique pour formulaires
 * 
 * @returns {Promise<Point>} Point avec coords + label
 * 
 * @example
 * const currentPoint = await getCurrentPositionWithAddress();
 * console.log(`Départ depuis: ${currentPoint.label}`);
 * // Utiliser dans formulaire estimation
 */
export const getCurrentPositionWithAddress = async () => {
  const position = await getCurrentPosition();
  const point = await reverseGeocode(
    position.coords.latitude,
    position.coords.longitude
  );
  return point;
};

// ===========================================
// HELPERS INTERNES
// ===========================================

/**
 * Formate les erreurs géolocalisation avec messages utilisateur
 * @private
 * @param {GeolocationError} error - Erreur native
 * @returns {Error} Erreur enrichie
 */
const formatGeolocationError = (error) => {
  const formattedError = new Error(error.message);
  formattedError.code = error.code;
  
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      formattedError.userMessage = MESSAGES.ERROR_GEOLOCATION_DENIED;
      break;
    case 2: // POSITION_UNAVAILABLE
      formattedError.userMessage = MESSAGES.ERROR_GEOLOCATION_UNAVAILABLE;
      break;
    case 3: // TIMEOUT
      formattedError.userMessage = 'Timeout géolocalisation. Réessayez.';
      break;
    default:
      formattedError.userMessage = 'Erreur géolocalisation inconnue.';
  }
  
  return formattedError;
};

export default {
  getCurrentPosition,
  watchPosition,
  stopWatchingPosition,
  checkGeolocationPermission,
  reverseGeocode,
  getCurrentPositionWithAddress,
};
