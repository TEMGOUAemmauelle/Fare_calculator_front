/**
 * @fileoverview Export centralisé de la configuration
 * 
 * Permet des imports simplifiés :
 * import { apiClient, METEO_CODES, ROUTES } from './config';
 */

export { default as apiClient, isApiKeyConfigured, getApiBaseUrl, formatValidationErrors, retryRequest } from './api';
export * from './constants';

// Exports par défaut groupés
import apiClient from './api';
import constants from './constants';

export default {
  apiClient,
  ...constants,
};
