/**
 * @fileoverview Service Trajets - Appels API /trajets
 * 
 * Fournit des fonctions pour gérer les trajets (CRUD) :
 * - addTrajet() : POST /trajets/ (ajouter trajet réel)
 * - getTrajets() : GET /trajets/ (liste paginée avec filtres)
 * - getTrajetById() : GET /trajets/{id}/ (détail)
 * - getTrajetStats() : GET /trajets/stats/ (statistiques globales)
 * 
 * Utilisé par : Pages AddTrajet, History, Stats
 */

import apiClient, { retryRequest } from '../config/api';
import { MESSAGES } from '../config/constants';

/**
 * @typedef {import('../models/types').AddTrajetRequest} AddTrajetRequest
 * @typedef {import('../models/types').Trajet} Trajet
 * @typedef {import('../models/types').PaginatedTrajets} PaginatedTrajets
 * @typedef {import('../models/types').TrajetStats} TrajetStats
 */

/**
 * Ajoute un trajet réel avec prix payé (contribution communautaire)
 * 
 * @param {AddTrajetRequest} data - Données trajet
 * @returns {Promise<Trajet>} Trajet créé avec ID et enrichissements auto
 * 
 * @example
 * const trajet = await addTrajet({
 *   point_depart: {
 *     coords_latitude: 3.8547,
 *     coords_longitude: 11.5021,
 *     label: "Polytechnique Yaoundé"
 *   },
 *   point_arrivee: {
 *     coords_latitude: 3.8667,
 *     coords_longitude: 11.5174,
 *     label: "Carrefour Ekounou"
 *   },
 *   prix: 250,
 *   heure: "matin",
 *   meteo: 1,
 *   congestion_user: 5
 * });
 * console.log(`Trajet ajouté avec ID ${trajet.id}`);
 */
export const addTrajet = async (data) => {
  try {
    // Validation basique frontend
    if (!data.point_depart || !data.point_arrivee) {
      throw new Error('Les points de départ et d\'arrivée sont requis.');
    }
    
    if (!data.prix || data.prix <= 0) {
      throw new Error('Le prix doit être strictement positif.');
    }
    
    // Appel API
    const response = await retryRequest(() =>
      apiClient.post('/trajets/', data)
    );
    
    return response.data;
  } catch (error) {
    console.error('[addTrajet] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Impossible d\'ajouter le trajet.',
    };
  }
};

/**
 * Récupère une liste paginée de trajets avec filtres optionnels
 * 
 * @param {Object} [params] - Paramètres filtres/pagination
 * @param {string} [params.heure] - Filtrer par tranche horaire
 * @param {number} [params.meteo] - Filtrer par code météo
 * @param {number} [params.type_zone] - Filtrer par type zone
 * @param {string} [params.route_classe_dominante] - Filtrer par classe route
 * @param {string} [params.search] - Recherche textuelle (labels départ/arrivée)
 * @param {string} [params.ordering] - Tri (ex: "-date_ajout", "prix", "-distance")
 * @param {number} [params.limit=20] - Nombre résultats par page
 * @param {number} [params.offset=0] - Décalage pagination
 * @returns {Promise<PaginatedTrajets>} Réponse paginée avec trajets
 * 
 * @example
 * // Récupérer trajets du matin, triés par date décroissante
 * const result = await getTrajets({
 *   heure: "matin",
 *   ordering: "-date_ajout",
 *   limit: 10
 * });
 * console.log(`${result.count} trajets trouvés`);
 * result.results.forEach(t => console.log(`${t.point_depart.label} → ${t.point_arrivee.label} : ${t.prix} CFA`));
 */
export const getTrajets = async (params = {}) => {
  try {
    const response = await apiClient.get('/trajets/', { params });
    return response.data;
  } catch (error) {
    console.error('[getTrajets] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Impossible de récupérer les trajets.',
    };
  }
};

/**
 * Récupère un trajet par son ID
 * 
 * @param {number} id - ID trajet
 * @returns {Promise<Trajet>} Trajet complet
 * 
 * @example
 * const trajet = await getTrajetById(42);
 * console.log(`Distance: ${trajet.distance}m, Prix: ${trajet.prix} CFA`);
 */
export const getTrajetById = async (id) => {
  try {
    const response = await apiClient.get(`/trajets/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`[getTrajetById] Erreur pour ID ${id}:`, error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Trajet introuvable.',
    };
  }
};

/**
 * Récupère les statistiques globales des trajets
 * 
 * @returns {Promise<TrajetStats>} Statistiques (prix moyen, top quartiers, etc.)
 * 
 * @example
 * const stats = await getTrajetStats();
 * console.log(`Total trajets: ${stats.total_trajets}`);
 * console.log(`Prix moyen: ${stats.prix.moyen} CFA`);
 * console.log(`Top quartier départ: ${stats.top_quartiers_depart[0].quartier}`);
 */
export const getTrajetStats = async () => {
  try {
    const response = await apiClient.get('/trajets/stats/');
    return response.data;
  } catch (error) {
    console.error('[getTrajetStats] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || 'Impossible de récupérer les statistiques.',
    };
  }
};

/**
 * Recherche trajets par texte (labels départ/arrivée, quartiers)
 * Wrapper simplifié de getTrajets avec param search
 * 
 * @param {string} query - Texte recherché
 * @param {Object} [additionalParams] - Params supplémentaires (limit, offset, etc.)
 * @returns {Promise<PaginatedTrajets>}
 * 
 * @example
 * const results = await searchTrajets("Ekounou", { limit: 5 });
 */
export const searchTrajets = async (query, additionalParams = {}) => {
  return getTrajets({
    search: query,
    ...additionalParams,
  });
};

/**
 * Charge la page suivante de trajets (helper pagination)
 * 
 * @param {string} nextUrl - URL complète de la page suivante (depuis response.next)
 * @returns {Promise<PaginatedTrajets>}
 * 
 * @example
 * const page1 = await getTrajets({ limit: 10 });
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

export default {
  addTrajet,
  getTrajets,
  getTrajetById,
  getTrajetStats,
  searchTrajets,
  loadNextPage,
};
