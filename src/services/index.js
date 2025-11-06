/**
 * @fileoverview Export centralisé de tous les services
 * 
 * Permet des imports simplifiés :
 * import { estimatePrice, addTrajet, getCurrentPosition } from './services';
 * 
 * Au lieu de :
 * import { estimatePrice } from './services/estimateService';
 * import { addTrajet } from './services/trajetService';
 * etc.
 */

// Services API Backend
export * from './estimateService';
export * from './trajetService';
export * from './pointService';

// Services externes
export * from './geolocationService';
export * from './mapboxService';
export * from './weatherService';

// Service localStorage (historique anonyme)
export * from './localStorageService';

// Exports par défaut groupés (optionnel)
import estimateService from './estimateService';
import trajetService from './trajetService';
import pointService from './pointService';
import geolocationService from './geolocationService';
import mapboxService from './mapboxService';
import weatherService from './weatherService';

export default {
  estimate: estimateService,
  trajet: trajetService,
  point: pointService,
  geolocation: geolocationService,
  mapbox: mapboxService,
  weather: weatherService,
};
