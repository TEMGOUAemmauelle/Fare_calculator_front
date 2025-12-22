import apiClient from '../config/api';

/**
 * Récupère les statistiques globales du service.
 * @param {string} period - Période de filtrage ('all', 'month', 'week')
 * @returns {Promise<Object>} Les statistiques (total, tops, lieux populaires, etc.)
 */
export const getStats = async (period = 'all') => {
  try {
    const response = await apiClient.get(`/stats/?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
