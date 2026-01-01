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
    
    // L'API peut retourner différents formats:
    // 1. { status: 200, data: {...} } - Format wrapper
    // 2. {...} - Données directes
    // 3. [...] - Liste (ancien format)
    
    let contactData = response.data;
    
    // Si c'est un wrapper avec status/data
    if (contactData && typeof contactData === 'object' && 'data' in contactData) {
      contactData = contactData.data;
    }
    
    // Si c'est une liste, prendre le premier élément
    if (Array.isArray(contactData) && contactData.length > 0) {
      contactData = contactData[0];
    }
    
    // Vérifier qu'on a bien des données
    if (contactData && typeof contactData === 'object' && contactData.has_any_info !== false) {
      console.log('✅ [ContactService] Infos contact récupérées:', contactData);
      return contactData;
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
