/**
 * @fileoverview Service Estimation - Appels API /estimate
 * 
 * Fournit des fonctions pour obtenir des estimations de prix de taxi :
 * - estimatePrice() : POST /estimate/ (principal)
 * - estimatePriceGET() : GET /estimate/ (alternative query params)
 * - getEstimateHistory() : Récupère historique local (localStorage)
 * 
 * Utilise axios via config/api.js pour authentification et gestion erreurs.
 */

import apiClient, { retryRequest } from '../config/api';
import { MESSAGES } from '../config/constants';

/**
 * @typedef {import('../models/types').EstimateRequest} EstimateRequest
 * @typedef {import('../models/types').Prediction} Prediction
 */

/**
 * Estime le prix d'un trajet taxi (endpoint principal)
 * 
 * @param {EstimateRequest} data - Données estimation
 * @returns {Promise<Prediction>} Prédiction avec prix, statut, ajustements
 * 
 * @example
 * const prediction = await estimatePrice({
 *   depart: { lat: 3.8547, lon: 11.5021 },
 *   arrivee: "Carrefour Ekounou",
 *   heure: "matin",
 *   meteo: 1
 * });
 * console.log(`Prix: ${prediction.prix_moyen} CFA (${prediction.statut})`);
 */
export const estimatePrice = async (data) => {
  try {
    // Validation basique frontend
    if (!data.depart || !data.arrivee) {
      throw new Error('Les points de départ et d\'arrivée sont requis.');
    }
    
    // Appel API avec retry automatique si erreur réseau
    const response = await retryRequest(() => 
      apiClient.post('/estimate/', data)
    );
    
    // Sauvegarder dans historique local (optionnel)
    saveToHistory(response.data);
    
    return response.data;
  } catch (error) {
    console.error('[estimatePrice] Erreur:', error);
    
    // Propager erreur avec message utilisateur
    throw {
      ...error,
      userMessage: error.userMessage || MESSAGES.ERROR_NETWORK,
    };
  }
};

/**
 * Estime le prix via GET (avec query params)
 * Utile pour liens partagés ou favoris
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.depart_lat - Latitude départ
 * @param {number} params.depart_lon - Longitude départ
 * @param {number} params.arrivee_lat - Latitude arrivée
 * @param {number} params.arrivee_lon - Longitude arrivée
 * @param {string} [params.heure] - Tranche horaire
 * @param {number} [params.meteo] - Code météo
 * @param {number} [params.type_zone] - Type zone
 * @param {number} [params.congestion_user] - Congestion 1-10
 * @returns {Promise<Prediction>}
 * 
 * @example
 * const prediction = await estimatePriceGET({
 *   depart_lat: 3.8547,
 *   depart_lon: 11.5021,
 *   arrivee_lat: 3.8667,
 *   arrivee_lon: 11.5174,
 *   heure: "matin"
 * });
 */
export const estimatePriceGET = async (params) => {
  try {
    const response = await retryRequest(() =>
      apiClient.get('/estimate/', { params })
    );
    
    saveToHistory(response.data);
    return response.data;
  } catch (error) {
    console.error('[estimatePriceGET] Erreur:', error);
    throw {
      ...error,
      userMessage: error.userMessage || MESSAGES.ERROR_NETWORK,
    };
  }
};

/**
 * Récupère l'historique des estimations (stocké localement)
 * 
 * @param {number} [limit=10] - Nombre max résultats
 * @returns {Array<Prediction & {timestamp: string}>} Historique avec timestamps
 * 
 * @example
 * const history = getEstimateHistory(5);
 * history.forEach(pred => {
 *   console.log(`${pred.details_trajet.depart.label} → ${pred.details_trajet.arrivee.label} : ${pred.prix_moyen} CFA`);
 * });
 */
export const getEstimateHistory = (limit = 10) => {
  try {
    const historyJson = localStorage.getItem('estimate_history');
    if (!historyJson) return [];
    
    const history = JSON.parse(historyJson);
    return Array.isArray(history) ? history.slice(0, limit) : [];
  } catch (error) {
    console.error('[getEstimateHistory] Erreur parsing localStorage:', error);
    return [];
  }
};

/**
 * Efface l'historique des estimations
 * 
 * @returns {void}
 */
export const clearEstimateHistory = () => {
  try {
    localStorage.removeItem('estimate_history');
    console.log('[clearEstimateHistory] Historique effacé');
  } catch (error) {
    console.error('[clearEstimateHistory] Erreur:', error);
  }
};

// ===========================================
// HELPERS INTERNES
// ===========================================

/**
 * Sauvegarde une estimation dans l'historique local
 * @private
 * @param {Prediction} prediction - Prédiction API
 */
const saveToHistory = (prediction) => {
  try {
    const history = getEstimateHistory(50); // Garder max 50
    
    const entry = {
      ...prediction,
      timestamp: new Date().toISOString(),
    };
    
    // Ajouter en début (plus récent d'abord)
    history.unshift(entry);
    
    // Limiter à 50 entrées
    const trimmed = history.slice(0, 50);
    
    localStorage.setItem('estimate_history', JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[saveToHistory] Impossible de sauvegarder (localStorage plein ou désactivé):', error);
    // Non bloquant - continuer sans sauvegarder
  }
};

export default {
  estimatePrice,
  estimatePriceGET,
  getEstimateHistory,
  clearEstimateHistory,
};
