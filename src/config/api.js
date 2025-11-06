/**
 * @fileoverview Configuration API Axios avec intercepteurs
 * 
 * Crée une instance Axios configurée pour communiquer avec le backend Django REST Framework.
 * Inclut :
 * - Base URL depuis .env
 * - Headers Authorization avec clé API
 * - Intercepteurs pour logging, gestion erreurs, retry automatique
 * - Timeout configurable
 * 
 * Utilisé par : Tous les services (estimateService, trajetService, etc.)
 */

import axios from 'axios';

// ===========================================
// CONFIGURATION DEPUIS VARIABLES D'ENVIRONNEMENT
// ===========================================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

/**
 * Instance Axios configurée pour le backend
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===========================================
// INTERCEPTEUR REQUEST - Ajout Authorization Header
// ===========================================
apiClient.interceptors.request.use(
  (config) => {
    // Ajouter clé API si disponible (sauf pour endpoint public /health)
    if (API_KEY && !config.url?.includes('/health')) {
      config.headers['Authorization'] = `ApiKey ${API_KEY}`;
    }
    
    // Log en développement
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ===========================================
// INTERCEPTEUR RESPONSE - Gestion erreurs globales
// ===========================================
apiClient.interceptors.response.use(
  (response) => {
    // Log succès en dev
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Extraction informations erreur
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url;
    
    console.error(`[API Error] ${status} ${url}`, {
      status,
      data,
      message: error.message,
    });
    
    // Gestion par type d'erreur
    if (!error.response) {
      // Erreur réseau (pas de réponse serveur)
      error.userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion Internet.';
    } else if (status === 401) {
      // Erreur authentification
      error.userMessage = 'Clé API invalide ou manquante. Contactez l\'administrateur.';
    } else if (status === 400) {
      // Erreur validation
      const validationErrors = [];
      if (typeof data === 'object') {
        Object.entries(data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            validationErrors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            validationErrors.push(`${field}: ${messages}`);
          }
        });
      }
      error.userMessage = validationErrors.length > 0
        ? validationErrors.join(' | ')
        : data?.error || 'Paramètres invalides.';
    } else if (status === 404) {
      error.userMessage = 'Ressource non trouvée.';
    } else if (status === 500) {
      error.userMessage = data?.error || 'Erreur serveur. Réessayez plus tard.';
    } else if (status === 503) {
      error.userMessage = 'Service temporairement indisponible.';
    } else {
      error.userMessage = data?.error || `Erreur ${status}`;
    }
    
    return Promise.reject(error);
  }
);

// ===========================================
// HELPERS - Fonctions utilitaires API
// ===========================================

/**
 * Vérifie si la clé API est configurée
 * @returns {boolean}
 */
export const isApiKeyConfigured = () => {
  return Boolean(API_KEY && API_KEY.length > 10);
};

/**
 * Obtient l'URL de base de l'API
 * @returns {string}
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

/**
 * Formatte les erreurs de validation pour affichage
 * @param {Object} errorData - Données erreur depuis API
 * @returns {Array<{field: string, message: string}>}
 */
export const formatValidationErrors = (errorData) => {
  const errors = [];
  
  if (!errorData || typeof errorData !== 'object') {
    return errors;
  }
  
  Object.entries(errorData).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      messages.forEach(msg => errors.push({ field, message: msg }));
    } else if (typeof messages === 'string') {
      errors.push({ field, message: messages });
    }
  });
  
  return errors;
};

/**
 * Retry automatique pour requêtes échouées (network errors seulement)
 * @param {Function} requestFn - Fonction Axios
 * @param {number} maxRetries - Nombre max tentatives
 * @param {number} delay - Délai entre tentatives (ms)
 * @returns {Promise}
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Retry uniquement pour erreurs réseau (pas 400/401/404)
      if (error.response) {
        throw error; // Erreur HTTP serveur, pas de retry
      }
      
      // Si dernière tentative, throw
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Attendre avant retry
      console.log(`[Retry] Tentative ${attempt + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  
  throw lastError;
};

// Export instance par défaut
export default apiClient;
