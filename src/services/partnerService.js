
import apiClient from '../config/api';

/**
 * Service pour récupérer les partenaires depuis le backend.
 */

export const getPartners = async () => {
  try {
    const response = await apiClient.get('/partners/');
    return response.data;
  } catch (error) {
    console.error('❌ [PartnerService] Erreur API:', error);
    throw error; // On laisse l'appelant gérer l'erreur (ex: afficher un message hors-ligne)
  }
};
