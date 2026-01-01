/**
 * @fileoverview Service Marketplace - Gestion des services de la maison
 * 
 * Récupère les services marketplace (Hayden Go, Flip Management, etc.)
 * depuis l'API backend.
 */

import api from '../config/api';

/**
 * Récupère tous les services marketplace actifs
 * @returns {Promise<Array>} Liste des services marketplace
 */
export const getMarketplaceServices = async () => {
  try {
    const response = await api.get('/services-marketplace/');
    console.log('✅ [MarketplaceService] Services récupérés:', response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error('❌ [MarketplaceService] Erreur:', error);
    // Retourner des données mock en cas d'erreur pour le développement
    return getMockMarketplaceServices();
  }
};

/**
 * Récupère un service marketplace par son ID
 * @param {number} id - ID du service
 * @returns {Promise<Object>} Détails du service
 */
export const getMarketplaceServiceById = async (id) => {
  try {
    const response = await api.get(`/services-marketplace/${id}/`);
    return response.data;
  } catch (error) {
    console.error('❌ [MarketplaceService] Erreur détail:', error);
    throw error;
  }
};

/**
 * Données mock pour le développement/fallback
 */
const getMockMarketplaceServices = () => [
  {
    id: 1,
    nom: "Hayden Go",
    description: "Transport VTC premium pour vos déplacements professionnels et personnels.",
    description_en: "Premium VTC transport for your professional and personal trips.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0--KBlo5YjDnxEQgsTN1gea8BZm9QGIlVA&s",
    lien_redirection: "https://haydengo.cm",
    is_active: true
  },
  {
    id: 2,
    nom: "Flip Management",
    description: "Gestion de flotte et optimisation des trajets pour entreprises.",
    description_en: "Fleet management and trip optimization for businesses.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0--KBlo5YjDnxEQgsTN1gea8BZm9QGIlVA&s",
    lien_redirection: "https://flipmanagement.cm",
    is_active: true
  },
  {
    id: 3,
    nom: "CamTaxi Pro",
    description: "L'application de taxi la plus fiable au Cameroun.",
    description_en: "The most reliable taxi app in Cameroon.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0--KBlo5YjDnxEQgsTN1gea8BZm9QGIlVA&s",
    lien_redirection: "https://camtaxipro.cm",
    is_active: true
  },
  {
    id: 4,
    nom: "Livraison Express CM",
    description: "Livraison rapide de colis dans tout le Cameroun.",
    description_en: "Fast parcel delivery throughout Cameroon.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0--KBlo5YjDnxEQgsTN1gea8BZm9QGIlVA&s",
    lien_redirection: "https://livraisonexpress.cm",
    is_active: true
  },
  {
    id: 5,
    nom: "AutoAssure CM",
    description: "Assurance auto instantanée et abordable.",
    description_en: "Instant and affordable car insurance.",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0--KBlo5YjDnxEQgsTN1gea8BZm9QGIlVA&s",
    lien_redirection: "https://autoassure.cm",
    is_active: true
  }
];

export default {
  getMarketplaceServices,
  getMarketplaceServiceById,
  getMockMarketplaceServices
};
