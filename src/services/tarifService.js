/**
 * @fileoverview Service Tarifs Standards - Appels API /tarifs-standards
 * 
 * Fournit des fonctions pour obtenir les tarifs officiels des taxis au Cameroun,
 * fixés par le Ministère des Transports.
 * 
 * Ces tarifs sont affichés à côté des estimations pour informer l'utilisateur
 * des prix officiels de référence.
 * 
 * Endpoint public (pas d'API Key requise) :
 * - GET /api/tarifs-standards/ : Tous les tarifs
 * - GET /api/tarifs-standards/?heure=matin : Tarifs adaptés à la tranche horaire
 */

import axios from 'axios';

// Récupérer l'URL de base depuis les variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * @typedef {Object} TarifsStandards
 * @property {number} tarif_taxi_jour - Tarif taxi partagé de jour (300 FCFA par défaut)
 * @property {number} tarif_taxi_nuit - Tarif taxi partagé de nuit (350 FCFA par défaut)
 * @property {number} tarif_course_jour - Tarif course/dépôt de jour (3500 FCFA par défaut)
 * @property {number} tarif_course_nuit - Tarif course/dépôt de nuit (4000 FCFA par défaut)
 * @property {string} source - Source officielle des tarifs
 * @property {string|null} notes - Notes ou commentaires
 * @property {string} derniere_modification - Date de dernière modification
 */

/**
 * @typedef {Object} TarifsContextuels
 * @property {number} tarif_taxi - Tarif taxi applicable selon l'heure
 * @property {number} tarif_course - Tarif course applicable selon l'heure
 * @property {string} periode - Période (jour ou nuit)
 * @property {Object} tous_tarifs - Tous les tarifs pour référence
 * @property {string} source - Source officielle des tarifs
 */

// Cache local pour éviter les appels répétés
let cachedTarifs = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Vérifie si le cache est encore valide
 * @returns {boolean}
 */
const isCacheValid = () => {
  if (!cachedTarifs || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

/**
 * Récupère tous les tarifs standards
 * 
 * @param {boolean} [forceRefresh=false] - Force le rafraîchissement du cache
 * @returns {Promise<TarifsStandards>} Tous les tarifs standards
 * 
 * @example
 * const tarifs = await getTarifsStandards();
 * console.log(`Taxi jour: ${tarifs.tarif_taxi_jour} FCFA`);
 */
export const getTarifsStandards = async (forceRefresh = false) => {
  try {
    // Utiliser le cache si valide
    if (!forceRefresh && isCacheValid()) {
      console.log('[tarifService] Tarifs récupérés du cache');
      return cachedTarifs;
    }

    console.log('[tarifService] Appel API tarifs-standards/');
    
    // Pas besoin d'API Key pour cet endpoint (public)
    const response = await axios.get(`${API_BASE_URL}/tarifs-standards/`, {
      timeout: 10000, // 10 secondes timeout
    });

    // Mettre en cache
    cachedTarifs = response.data;
    cacheTimestamp = Date.now();

    console.log('[tarifService] Tarifs récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('[tarifService] Erreur récupération tarifs:', error);
    
    // Retourner les valeurs par défaut en cas d'erreur
    return getDefaultTarifs();
  }
};

/**
 * Récupère les tarifs adaptés à une tranche horaire spécifique
 * 
 * @param {string} heure - Tranche horaire ('matin', 'apres-midi', 'soir', 'nuit')
 * @returns {Promise<TarifsContextuels>} Tarifs adaptés à l'heure
 * 
 * @example
 * const tarifs = await getTarifsForHeure('nuit');
 * console.log(`Taxi nuit: ${tarifs.tarif_taxi} FCFA`);
 * console.log(`Période: ${tarifs.periode}`); // "nuit"
 */
export const getTarifsForHeure = async (heure) => {
  try {
    console.log(`[tarifService] Appel API tarifs-standards/?heure=${heure}`);
    
    const response = await axios.get(`${API_BASE_URL}/tarifs-standards/`, {
      params: { heure },
      timeout: 10000,
    });

    console.log('[tarifService] Tarifs contextuels récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('[tarifService] Erreur récupération tarifs contextuels:', error);
    
    // Retourner les valeurs par défaut adaptées à l'heure
    return getDefaultTarifsForHeure(heure);
  }
};

/**
 * Retourne les tarifs par défaut en cas d'erreur API
 * Basés sur les tarifs officiels du Ministère des Transports
 * 
 * @returns {TarifsStandards}
 */
export const getDefaultTarifs = () => ({
  tarif_taxi_jour: 300,
  tarif_taxi_nuit: 350,
  tarif_course_jour: 3500,
  tarif_course_nuit: 4000,
  source: 'Ministère des Transports du Cameroun (valeurs par défaut)',
  notes: null,
  derniere_modification: null,
});

/**
 * Retourne les tarifs par défaut adaptés à l'heure en cas d'erreur API
 * 
 * @param {string} heure - Tranche horaire
 * @returns {TarifsContextuels}
 */
export const getDefaultTarifsForHeure = (heure) => {
  const defaults = getDefaultTarifs();
  const isNuit = heure === 'nuit' || heure === 'soir';
  
  return {
    tarif_taxi: isNuit ? defaults.tarif_taxi_nuit : defaults.tarif_taxi_jour,
    tarif_course: isNuit ? defaults.tarif_course_nuit : defaults.tarif_course_jour,
    periode: isNuit ? 'nuit' : 'jour',
    tous_tarifs: {
      tarif_taxi_jour: defaults.tarif_taxi_jour,
      tarif_taxi_nuit: defaults.tarif_taxi_nuit,
      tarif_course_jour: defaults.tarif_course_jour,
      tarif_course_nuit: defaults.tarif_course_nuit,
    },
    source: defaults.source,
  };
};

/**
 * Formate un tarif pour l'affichage
 * 
 * @param {number} tarif - Tarif en FCFA
 * @returns {string} Tarif formaté (ex: "300 FCFA")
 */
export const formatTarif = (tarif) => {
  if (!tarif && tarif !== 0) return '-';
  return `${tarif.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Détermine la période (jour/nuit) à partir de la tranche horaire
 * 
 * @param {string} heure - Tranche horaire ('matin', 'apres-midi', 'soir', 'nuit')
 * @returns {'jour' | 'nuit'}
 */
export const getPeriodeFromHeure = (heure) => {
  return (heure === 'nuit' || heure === 'soir') ? 'nuit' : 'jour';
};

/**
 * Vide le cache des tarifs
 * Utile pour forcer un rafraîchissement
 */
export const clearTarifsCache = () => {
  cachedTarifs = null;
  cacheTimestamp = null;
  console.log('[tarifService] Cache vidé');
};

// Export par défaut
export default {
  getTarifsStandards,
  getTarifsForHeure,
  getDefaultTarifs,
  getDefaultTarifsForHeure,
  formatTarif,
  getPeriodeFromHeure,
  clearTarifsCache,
};
