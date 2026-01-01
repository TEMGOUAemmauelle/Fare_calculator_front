/**
 * @fileoverview Service Pricing - Gestion des offres d'abonnement et souscriptions
 */

import api from '../config/api';

/**
 * Récupère toutes les offres d'abonnement disponibles
 * @returns {Promise<Array>} Liste des offres
 */
export const getOffresAbonnement = async () => {
  try {
    const response = await api.get('/offres-abonnement/');
    console.log('✅ [PricingService] Offres récupérées:', response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error('❌ [PricingService] Erreur offres:', error);
    // Retourner des données mock en cas d'erreur
    return getMockOffres();
  }
};

/**
 * Soumet une nouvelle souscription partenaire
 * @param {Object} data - Données de souscription
 * @returns {Promise<Object>} Réponse de création
 */
export const createSouscription = async (data) => {
  try {
    const response = await api.post('/publicites/', data);
    console.log('✅ [PricingService] Souscription créée');
    return response.data;
  } catch (error) {
    console.error('❌ [PricingService] Erreur souscription:', error);
    throw error;
  }
};

/**
 * Données mock pour le développement/fallback
 */
const getMockOffres = () => [
  {
    id: 1,
    nom: "Starter",
    duree_mois: 1,
    prix: 15000,
    description: "Idéal pour tester notre plateforme",
    avantages: [
      "1 mois d'affichage",
      "Visibilité sur la page d'accueil",
      "Support par email"
    ],
    ordre_affichage: 1,
    is_active: true
  },
  {
    id: 2,
    nom: "Business",
    duree_mois: 3,
    prix: 35000,
    description: "Le choix populaire pour les PME",
    avantages: [
      "3 mois d'affichage",
      "Visibilité prioritaire",
      "Statistiques d'engagement",
      "Support prioritaire"
    ],
    ordre_affichage: 2,
    is_active: true
  },
  {
    id: 3,
    nom: "Premium",
    duree_mois: 6,
    prix: 60000,
    description: "Maximisez votre visibilité",
    avantages: [
      "6 mois d'affichage",
      "Position premium garantie",
      "Statistiques détaillées",
      "Support dédié 24/7",
      "Badge partenaire officiel"
    ],
    ordre_affichage: 3,
    is_active: true
  }
];

export default {
  getOffresAbonnement,
  createSouscription,
  getMockOffres
};
