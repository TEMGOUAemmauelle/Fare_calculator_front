/**
 * @fileoverview Service Authentification - Appels API /auth/*
 * 
 * Gère la synchronisation de l'authentification Firebase avec le backend Django :
 * - verifyToken() : POST /auth/verify-token/ (enregistre/vérifie l'utilisateur en base)
 * - getProfile() : GET /auth/me/ (récupère le profil utilisateur)
 * - updateProfile() : PATCH /auth/profile/ (met à jour le nom d'affichage)
 * 
 * IMPORTANT : Ces endpoints n'utilisent PAS l'ApiKey mais un Bearer token Firebase.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

/**
 * Instance Axios spécifique pour l'authentification Firebase.
 * N'utilise PAS l'ApiKey mais un Bearer token.
 */
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour logs en dev
authClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🔐 [Auth API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('🔴 [Auth API Request Error]', error);
    return Promise.reject(error);
  }
);

authClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ [Auth API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        success: response.data?.success,
      });
    }
    return response;
  },
  (error) => {
    console.error('🔴 [Auth API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * @typedef {Object} BackendUser
 * @property {number} id - ID dans la base Django
 * @property {string} phone_number - Numéro de téléphone (+237...)
 * @property {string|null} display_name - Nom d'affichage
 * @property {boolean} is_active - Compte actif
 * @property {string} created_at - Date de création ISO
 * @property {string|null} last_login - Dernière connexion ISO
 */

/**
 * @typedef {Object} VerifyTokenResponse
 * @property {boolean} success - Succès de l'opération
 * @property {string} message - Message (Bienvenue / Connexion réussie)
 * @property {BackendUser} user - Données utilisateur
 * @property {boolean} is_new_user - Première connexion
 */

/**
 * Vérifie le token Firebase avec le backend et crée/récupère l'utilisateur en base.
 * 
 * @param {string} idToken - Token JWT Firebase ID
 * @param {string} [authMethod] - Méthode d'auth utilisée ('phone_sms', 'phone_password', 'google')
 * @returns {Promise<VerifyTokenResponse>} Réponse avec données utilisateur backend
 * 
 * @example
 * // Après authentification Firebase réussie
 * const firebaseUser = auth.currentUser;
 * const idToken = await firebaseUser.getIdToken();
 * const response = await verifyToken(idToken, 'phone_sms');
 * console.log(`Utilisateur ${response.is_new_user ? 'créé' : 'retrouvé'}: ${response.user.phone_number}`);
 */
export const verifyToken = async (idToken, authMethod = null) => {
  try {
    const payload = { id_token: idToken };
    if (authMethod) {
      payload.auth_method = authMethod;
    }
    
    const response = await authClient.post('/auth/verify-token/', payload);
    
    return response.data;
  } catch (error) {
    // Gérer les erreurs spécifiques
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error(data.detail || 'Token Firebase invalide ou expiré');
      }
      if (status === 403) {
        throw new Error(data.detail || 'Votre compte a été désactivé');
      }
      if (status === 500) {
        throw new Error(data.detail || 'Erreur serveur - Réessayez plus tard');
      }
      
      throw new Error(data.error || data.detail || 'Erreur de vérification');
    }
    
    throw new Error('Erreur réseau - Vérifiez votre connexion');
  }
};

/**
 * Récupère le profil de l'utilisateur connecté depuis le backend.
 * 
 * @param {string} idToken - Token JWT Firebase ID
 * @returns {Promise<BackendUser>} Données utilisateur
 */
export const getProfile = async (idToken) => {
  try {
    const response = await authClient.get('/auth/me/', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });
    
    if (response.data.success) {
      return response.data.user;
    }
    
    throw new Error(response.data.error || 'Erreur récupération profil');
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expirée - Reconnectez-vous');
    }
    if (error.response?.status === 404) {
      throw new Error('Profil non trouvé');
    }
    throw error;
  }
};

/**
 * Met à jour le nom d'affichage de l'utilisateur.
 * 
 * @param {string} idToken - Token JWT Firebase ID
 * @param {string} displayName - Nouveau nom d'affichage
 * @returns {Promise<BackendUser>} Données utilisateur mises à jour
 */
export const updateProfile = async (idToken, displayName) => {
  try {
    const response = await authClient.patch('/auth/profile/', 
      { display_name: displayName },
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      }
    );
    
    if (response.data.success) {
      return response.data.user;
    }
    
    throw new Error(response.data.error || 'Erreur mise à jour profil');
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expirée - Reconnectez-vous');
    }
    throw error;
  }
};

export default {
  verifyToken,
  getProfile,
  updateProfile,
};
