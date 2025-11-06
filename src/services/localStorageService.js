/**
 * @fileoverview Service LocalStorage - Gestion historique utilisateur
 * 
 * Stockage anonyme côté client pour :
 * - Historique des estimations
 * - Raccourcis Home/Work
 * - Trajets favoris
 * - Dernières recherches
 */

const STORAGE_KEYS = {
  ESTIMATES_HISTORY: 'fare_calculator_estimates_history',
  SHORTCUTS: 'fare_calculator_shortcuts',
  FAVORITES: 'fare_calculator_favorites',
  RECENT_SEARCHES: 'fare_calculator_recent_searches',
  USER_PREFERENCES: 'fare_calculator_preferences',
};

const MAX_HISTORY_ITEMS = 50;
const MAX_RECENT_SEARCHES = 10;

/**
 * Vérifie si localStorage est disponible
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('⚠️ LocalStorage non disponible:', e);
    return false;
  }
}

/**
 * Récupère une valeur du localStorage
 */
function getItem(key) {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`❌ Erreur lecture localStorage [${key}]:`, error);
    return null;
  }
}

/**
 * Sauvegarde une valeur dans localStorage
 */
function setItem(key, value) {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture localStorage [${key}]:`, error);
    return false;
  }
}

/**
 * Supprime une clé du localStorage
 */
function removeItem(key) {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ Erreur suppression localStorage [${key}]:`, error);
    return false;
  }
}

// ============================================
// HISTORIQUE DES ESTIMATIONS
// ============================================

/**
 * Ajoute une estimation à l'historique
 * @param {Object} estimation - Objet estimation avec prediction, depart, arrivee, timestamp
 */
export function addEstimateToHistory(estimation) {
  const history = getItem(STORAGE_KEYS.ESTIMATES_HISTORY) || [];
  
  const newEstimate = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    depart: estimation.depart,
    arrivee: estimation.arrivee,
    prix_moyen: estimation.prediction?.prix_moyen,
    distance: estimation.prediction?.details_trajet?.distance_estimee,
    duree: estimation.prediction?.details_trajet?.duree_estimee,
    statut: estimation.prediction?.statut,
  };
  
  // Ajouter en début de liste
  history.unshift(newEstimate);
  
  // Limiter la taille
  const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
  
  setItem(STORAGE_KEYS.ESTIMATES_HISTORY, trimmedHistory);
  console.log('✅ Estimation ajoutée à l\'historique');
  
  return newEstimate;
}

/**
 * Récupère l'historique des estimations
 * @param {number} limit - Nombre max d'items à retourner
 */
export function getEstimatesHistory(limit = MAX_HISTORY_ITEMS) {
  const history = getItem(STORAGE_KEYS.ESTIMATES_HISTORY) || [];
  return history.slice(0, limit);
}

/**
 * Supprime une estimation de l'historique
 */
export function deleteEstimateFromHistory(estimateId) {
  const history = getItem(STORAGE_KEYS.ESTIMATES_HISTORY) || [];
  const filtered = history.filter(item => item.id !== estimateId);
  setItem(STORAGE_KEYS.ESTIMATES_HISTORY, filtered);
  console.log('✅ Estimation supprimée de l\'historique');
}

/**
 * Vide tout l'historique
 */
export function clearEstimatesHistory() {
  setItem(STORAGE_KEYS.ESTIMATES_HISTORY, []);
  console.log('✅ Historique vidé');
}

// ============================================
// RACCOURCIS (HOME / WORK)
// ============================================

/**
 * Définit un raccourci (home ou work)
 * @param {string} type - 'home' ou 'work'
 * @param {Object} location - { label, coordinates, place_name }
 */
export function setShortcut(type, location) {
  const shortcuts = getItem(STORAGE_KEYS.SHORTCUTS) || {};
  
  shortcuts[type] = {
    label: location.label,
    coordinates: location.coordinates,
    place_name: location.place_name || location.label,
    timestamp: new Date().toISOString(),
  };
  
  setItem(STORAGE_KEYS.SHORTCUTS, shortcuts);
  console.log(`✅ Raccourci ${type} défini:`, location.label);
  
  return shortcuts[type];
}

/**
 * Récupère un raccourci
 */
export function getShortcut(type) {
  const shortcuts = getItem(STORAGE_KEYS.SHORTCUTS) || {};
  return shortcuts[type] || null;
}

/**
 * Récupère tous les raccourcis
 */
export function getAllShortcuts() {
  return getItem(STORAGE_KEYS.SHORTCUTS) || {};
}

/**
 * Supprime un raccourci
 */
export function deleteShortcut(type) {
  const shortcuts = getItem(STORAGE_KEYS.SHORTCUTS) || {};
  delete shortcuts[type];
  setItem(STORAGE_KEYS.SHORTCUTS, shortcuts);
  console.log(`✅ Raccourci ${type} supprimé`);
}

// ============================================
// RECHERCHES RÉCENTES
// ============================================

/**
 * Ajoute une recherche récente
 * @param {Object} search - { label, coordinates, place_name, type }
 */
export function addRecentSearch(search) {
  const recent = getItem(STORAGE_KEYS.RECENT_SEARCHES) || [];
  
  // Éviter les doublons
  const filtered = recent.filter(
    item => item.label !== search.label || 
    (item.coordinates[0] !== search.coordinates[0] && item.coordinates[1] !== search.coordinates[1])
  );
  
  const newSearch = {
    ...search,
    timestamp: new Date().toISOString(),
  };
  
  filtered.unshift(newSearch);
  
  const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, trimmed);
  
  return newSearch;
}

/**
 * Récupère les recherches récentes
 */
export function getRecentSearches(limit = MAX_RECENT_SEARCHES) {
  const recent = getItem(STORAGE_KEYS.RECENT_SEARCHES) || [];
  return recent.slice(0, limit);
}

/**
 * Vide les recherches récentes
 */
export function clearRecentSearches() {
  setItem(STORAGE_KEYS.RECENT_SEARCHES, []);
  console.log('✅ Recherches récentes vidées');
}

// ============================================
// FAVORIS
// ============================================

/**
 * Ajoute un lieu aux favoris
 * @param {Object} place - { label, coordinates, place_name, category }
 */
export function addFavorite(place) {
  const favorites = getItem(STORAGE_KEYS.FAVORITES) || [];
  
  // Éviter doublons
  const exists = favorites.some(
    fav => fav.coordinates[0] === place.coordinates[0] && 
           fav.coordinates[1] === place.coordinates[1]
  );
  
  if (exists) {
    console.log('⚠️ Lieu déjà en favoris');
    return null;
  }
  
  const newFavorite = {
    id: Date.now(),
    ...place,
    timestamp: new Date().toISOString(),
  };
  
  favorites.push(newFavorite);
  setItem(STORAGE_KEYS.FAVORITES, favorites);
  console.log('✅ Lieu ajouté aux favoris');
  
  return newFavorite;
}

/**
 * Récupère les favoris
 */
export function getFavorites() {
  return getItem(STORAGE_KEYS.FAVORITES) || [];
}

/**
 * Supprime un favori
 */
export function deleteFavorite(favoriteId) {
  const favorites = getItem(STORAGE_KEYS.FAVORITES) || [];
  const filtered = favorites.filter(fav => fav.id !== favoriteId);
  setItem(STORAGE_KEYS.FAVORITES, filtered);
  console.log('✅ Favori supprimé');
}

// ============================================
// PRÉFÉRENCES UTILISATEUR
// ============================================

/**
 * Sauvegarde les préférences utilisateur
 */
export function setUserPreferences(preferences) {
  const current = getItem(STORAGE_KEYS.USER_PREFERENCES) || {};
  const updated = { ...current, ...preferences };
  setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  console.log('✅ Préférences sauvegardées');
  return updated;
}

/**
 * Récupère les préférences utilisateur
 */
export function getUserPreferences() {
  return getItem(STORAGE_KEYS.USER_PREFERENCES) || {
    theme: 'light',
    defaultMeteo: 0, // Ensoleillé
    defaultHeure: 'matin',
    notifications: true,
  };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Récupère les statistiques d'utilisation
 */
export function getUsageStats() {
  const history = getEstimatesHistory();
  const favorites = getFavorites();
  const recent = getRecentSearches();
  
  return {
    totalEstimates: history.length,
    totalFavorites: favorites.length,
    totalRecentSearches: recent.length,
    lastActivity: history[0]?.timestamp || null,
  };
}

/**
 * Exporte toutes les données (pour backup)
 */
export function exportAllData() {
  return {
    estimates: getEstimatesHistory(),
    shortcuts: getAllShortcuts(),
    favorites: getFavorites(),
    recentSearches: getRecentSearches(),
    preferences: getUserPreferences(),
    exportDate: new Date().toISOString(),
  };
}

/**
 * Importe des données (depuis backup)
 */
export function importAllData(data) {
  try {
    if (data.estimates) setItem(STORAGE_KEYS.ESTIMATES_HISTORY, data.estimates);
    if (data.shortcuts) setItem(STORAGE_KEYS.SHORTCUTS, data.shortcuts);
    if (data.favorites) setItem(STORAGE_KEYS.FAVORITES, data.favorites);
    if (data.recentSearches) setItem(STORAGE_KEYS.RECENT_SEARCHES, data.recentSearches);
    if (data.preferences) setItem(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
    
    console.log('✅ Données importées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur import données:', error);
    return false;
  }
}

/**
 * Vide TOUTES les données localStorage
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => removeItem(key));
  console.log('✅ Toutes les données localStorage supprimées');
}
