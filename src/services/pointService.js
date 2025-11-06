/**
 * @fileoverview Service Points - Appels API /points
 * 
 * Fournit des fonctions pour gérer les points d'intérêt (POI) :
 * - getPoints() : Liste paginée avec filtres
 * - getPointById() : Détail point
 * - searchPoints() : Recherche textuelle
 * 
 * Utilisé par : Composants SearchBar, MapView pour suggestions locales
 */

import apiClient from '../config/api';
import { MESSAGES } from '../config/constants';

/**
 * @typedef {import('../models/types').Point} Point
 * @typedef {import('../models/types').PaginatedPoints} PaginatedPoints
 */

/**
 * Récupère une liste paginée de points avec filtres optionnels
 * 
 * @param {Object} [params] - Paramètres filtres/pagination
 * @param {string} [params.ville] - Filtrer par ville
 * @param {string} [params.quartier] - Filtrer par quartier
 * @param {string} [params.arrondissement] - Filtrer par arrondissement
 * @param {string} [params.search] - Recherche textuelle (label, quartier, ville)
 * @param {string} [params.ordering] - Tri (ex: "-created_at", "label")
 * @param {number} [params.limit=20] - Nombre résultats par page
 * @param {number} [params.offset=0] - Décalage pagination
 * @returns {Promise<PaginatedPoints>} Réponse paginée avec points
 * 
 * @example
 * // Récupérer points d'Ekounou
 * const result = await getPoints({ quartier: "Ekounou", limit: 10 });
 * console.log(`${result.count} points trouvés`);
 * result.results.forEach(p => console.log(`${p.label} (${p.ville})`));
 */
export const getPoints = async (params = {}) => {
  try {
    const response = await apiClient.get('/points/', { params });
    return response.data;
  } catch (error) {
    console.error('[getPoints] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Impossible de récupérer les points.',
    };
  }
};

/**
 * Récupère un point par son ID
 * 
 * @param {number} id - ID point
 * @returns {Promise<Point>} Point complet
 * 
 * @example
 * const point = await getPointById(10);
 * console.log(`Point: ${point.label} (${point.coords_latitude}, ${point.coords_longitude})`);
 */
export const getPointById = async (id) => {
  try {
    const response = await apiClient.get(`/points/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`[getPointById] Erreur pour ID ${id}:`, error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Point introuvable.',
    };
  }
};

/**
 * Recherche points par texte (labels, quartiers, ville)
 * Wrapper simplifié de getPoints avec param search
 * 
 * @param {string} query - Texte recherché
 * @param {Object} [additionalParams] - Params supplémentaires (limit, offset, etc.)
 * @returns {Promise<PaginatedPoints>}
 * 
 * @example
 * const results = await searchPoints("Carrefour", { limit: 5 });
 * results.results.forEach(p => console.log(p.label));
 */
export const searchPoints = async (query, additionalParams = {}) => {
  return getPoints({
    search: query,
    ...additionalParams,
  });
};

/**
 * Récupère points dans une bbox (bounding box)
 * Utile pour filtrer points visibles sur carte
 * 
 * Note : API backend ne supporte pas bbox directement (filtrer côté frontend)
 * Cette fonction récupère points ville puis filtre localement
 * 
 * @param {string} ville - Ville à filtrer
 * @param {[number, number, number, number]} bbox - [minLon, minLat, maxLon, maxLat]
 * @returns {Promise<Point[]>} Points dans bbox
 * 
 * @example
 * const points = await getPointsInBbox("Yaoundé", [11.4, 3.78, 11.6, 3.95]);
 */
export const getPointsInBbox = async (ville, bbox) => {
  try {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    // Récupérer tous points de la ville (pagination si >100)
    const result = await getPoints({ ville, limit: 100 });
    
    // Filtrer localement par bbox
    const filtered = result.results.filter(point => {
      const lon = point.coords_longitude;
      const lat = point.coords_latitude;
      return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
    });
    
    return filtered;
  } catch (error) {
    console.error('[getPointsInBbox] Erreur:', error);
    return [];
  }
};

/**
 * Charge la page suivante de points (helper pagination)
 * 
 * @param {string} nextUrl - URL complète de la page suivante (depuis response.next)
 * @returns {Promise<PaginatedPoints>}
 * 
 * @example
 * const page1 = await getPoints({ limit: 10 });
 * if (page1.next) {
 *   const page2 = await loadNextPage(page1.next);
 * }
 */
export const loadNextPage = async (nextUrl) => {
  try {
    // Extraire path relatif depuis URL complète
    const url = new URL(nextUrl);
    const path = url.pathname + url.search;
    
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    console.error('[loadNextPage] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Impossible de charger la page suivante.',
    };
  }
};

/**
 * Convertit Point API → format MapboxFeature (pour compatibilité composants)
 * Helper pour affichage uniforme
 * 
 * @param {Point} point - Point depuis API
 * @returns {Object} Pseudo-MapboxFeature
 */
export const pointToMapboxFeature = (point) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.coords_longitude, point.coords_latitude],
    },
    properties: {
      id: point.id,
      label: point.label || 'Point sans nom',
      quartier: point.quartier,
      ville: point.ville,
      arrondissement: point.arrondissement,
    },
    id: point.id,
    place_name: `${point.label || 'Point'}, ${point.quartier || ''} ${point.ville || ''}`.trim(),
    text: point.label || 'Point',
    center: [point.coords_longitude, point.coords_latitude],
  };
};

export default {
  getPoints,
  getPointById,
  searchPoints,
  getPointsInBbox,
  loadNextPage,
  pointToMapboxFeature,
};
