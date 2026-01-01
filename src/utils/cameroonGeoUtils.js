/**
 * @fileoverview Cameroon Geo Utils - Vérification géographique Cameroun
 * 
 * Utilitaires pour vérifier si des coordonnées sont au Cameroun.
 * Évite les appels API en utilisant les limites géographiques connues.
 */

// Limites géographiques du Cameroun (bounding box approximatif)
const CAMEROON_BOUNDS = {
  north: 13.1,   // Latitude max (nord du pays près du lac Tchad)
  south: 1.65,   // Latitude min (sud vers Guinée Équatoriale)
  west: 8.4,     // Longitude min (ouest vers Nigeria)
  east: 16.2     // Longitude max (est vers Tchad/RCA)
};

/**
 * Vérifie si des coordonnées sont dans les limites du Cameroun
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} true si au Cameroun
 */
export const isInCameroon = (lat, lon) => {
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return false;
  }
  
  return (
    lat >= CAMEROON_BOUNDS.south &&
    lat <= CAMEROON_BOUNDS.north &&
    lon >= CAMEROON_BOUNDS.west &&
    lon <= CAMEROON_BOUNDS.east
  );
};

/**
 * Vérifie si un point (objet avec coords) est au Cameroun
 * @param {Object} point - Point avec coords [lon, lat] ou {lat, lon}
 * @returns {boolean} true si au Cameroun
 */
export const isPointInCameroon = (point) => {
  if (!point) return false;
  
  let lat, lon;
  
  // Support différents formats
  if (Array.isArray(point.coords)) {
    // Format [lon, lat] (Mapbox/GeoJSON)
    [lon, lat] = point.coords;
  } else if (point.coords?.latitude !== undefined) {
    // Format {latitude, longitude}
    lat = point.coords.latitude;
    lon = point.coords.longitude;
  } else if (point.lat !== undefined) {
    // Format {lat, lon} ou {lat, lng}
    lat = point.lat;
    lon = point.lon || point.lng;
  } else if (point.latitude !== undefined) {
    lat = point.latitude;
    lon = point.longitude;
  }
  
  return isInCameroon(lat, lon);
};

/**
 * Vérifie si un trajet (départ et arrivée) est entièrement au Cameroun
 * @param {Object} depart - Point de départ
 * @param {Object} arrivee - Point d'arrivée
 * @returns {{isValid: boolean, invalidPoint: string|null, message: string}}
 */
export const validateTrajetInCameroon = (depart, arrivee) => {
  const departInCameroon = isPointInCameroon(depart);
  const arriveeInCameroon = isPointInCameroon(arrivee);
  
  if (!departInCameroon && !arriveeInCameroon) {
    return {
      isValid: false,
      invalidPoint: 'both',
      message: "Les points de départ et d'arrivée sont hors du Cameroun."
    };
  }
  
  if (!departInCameroon) {
    return {
      isValid: false,
      invalidPoint: 'depart',
      message: "Le point de départ est hors du Cameroun."
    };
  }
  
  if (!arriveeInCameroon) {
    return {
      isValid: false,
      invalidPoint: 'arrivee',
      message: "Le point d'arrivée est hors du Cameroun."
    };
  }
  
  return {
    isValid: true,
    invalidPoint: null,
    message: "Trajet valide au Cameroun."
  };
};

/**
 * Détecte le pays approximatif basé sur les coordonnées
 * (simplifié - retourne "Cameroun" ou "Hors Cameroun")
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Nom du pays/région
 */
export const detectCountry = (lat, lon) => {
  if (isInCameroon(lat, lon)) {
    return 'Cameroun';
  }
  
  // Détection basique des pays voisins pour un message plus précis
  if (lat >= 4 && lat <= 14 && lon >= 2 && lon <= 15) {
    return 'Nigeria';
  }
  if (lat >= 1 && lat <= 6 && lon >= 8 && lon <= 12) {
    return 'Guinée Équatoriale ou Gabon';
  }
  if (lat >= 2 && lat <= 11 && lon >= 14 && lon <= 24) {
    return 'République Centrafricaine';
  }
  if (lat >= 8 && lat <= 24 && lon >= 13 && lon <= 24) {
    return 'Tchad';
  }
  
  return 'un pays hors du Cameroun';
};

export default {
  isInCameroon,
  isPointInCameroon,
  validateTrajetInCameroon,
  detectCountry,
  CAMEROON_BOUNDS
};
