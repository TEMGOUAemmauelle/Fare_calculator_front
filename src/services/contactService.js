/**
 * @fileoverview Service Contact - Informations de contact Fare-Calculator
 * 
 * Récupère les informations de contact (email, WhatsApp) depuis le backend.
 */

import api from '../config/api';

/**
 * Récupère les informations de contact
 * @returns {Promise<Object|null>} Infos de contact ou null si non disponibles
 */
export const getContactInfo = async () => {
  try {
    const response = await api.get('/contact-info/');
    
    // L'API retourne une liste, prendre le premier élément actif
    if (response.data && response.data.length > 0) {
      console.log('✅ [ContactService] Infos contact récupérées');
      return response.data[0];
    }
    
    console.log('⚠️ [ContactService] Aucune info contact disponible');
    return null;
  } catch (error) {
    console.error('❌ [ContactService] Erreur:', error);
    return null;
  }
};

export default {
  getContactInfo
};
