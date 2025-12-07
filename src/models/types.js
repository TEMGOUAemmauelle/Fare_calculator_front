/**
 * @fileoverview Modèles de données - Types et interfaces pour objets métier
 * 
 * Définit les structures de données utilisées dans l'application, alignées sur l'API backend.
 * Tous les types sont documentés avec JSDoc pour autocomplétion VS Code.
 * 
 * Modèles :
 * - Point : Point d'intérêt géographique (POI)
 * - Trajet : Trajet avec prix, distance, et métadonnées enrichies
 * - Prediction : Réponse estimation API
 * - EstimateRequest : Payload requête estimation
 * - AddTrajetRequest : Payload ajout trajet
 */

// ===========================================
// POINT D'INTÉRÊT (POI) - Point géographique nommé
// ===========================================

/**
 * @typedef {Object} Point
 * @property {number|null} id - ID unique (null si pas encore créé)
 * @property {number} coords_latitude - Latitude décimale (-90 à 90)
 * @property {number} coords_longitude - Longitude décimale (-180 à 180)
 * @property {string|null} label - Nom POI (ex: "Carrefour Ekounou", "Polytechnique Yaoundé")
 * @property {string|null} quartier - Quartier/sous-quartier
 * @property {string|null} ville - Ville (ex: "Yaoundé", "Douala")
 * @property {string|null} arrondissement - Commune/arrondissement (ex: "Yaoundé II")
 * @property {string|null} departement - Département administratif (ex: "Mfoundi")
 * @property {string|null} created_at - Date création ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
 * @property {string|null} updated_at - Date dernière modification ISO 8601
 */

/**
 * @typedef {Object} PointInput
 * @property {number} lat - Latitude (format simplifié pour input frontend)
 * @property {number} lon - Longitude (format simplifié pour input frontend)
 */

/**
 * @typedef {Object} PointNested
 * @property {number} coords_latitude - Latitude
 * @property {number} coords_longitude - Longitude
 * @property {string|null} [label] - Nom optionnel (auto-complété si omis)
 * @property {string|null} [quartier] - Quartier optionnel
 * @property {string|null} [ville] - Ville optionnelle
 */

// ===========================================
// TRAJET - Trajet réel avec prix et métadonnées
// ===========================================

/**
 * @typedef {Object} Trajet
 * @property {number} id - ID unique trajet
 * @property {Point} point_depart - Point départ (nested)
 * @property {Point} point_arrivee - Point arrivée (nested)
 * @property {number} distance - Distance routière en mètres (Mapbox)
 * @property {number} prix - Prix payé en CFA
 * @property {string|null} heure - Tranche horaire ("matin", "apres-midi", "soir", "nuit", null=auto)
 * @property {number|null} meteo - Code météo (0=soleil, 1=pluie légère, 2=pluie forte, 3=orage, null=auto)
 * @property {number|null} type_zone - Type zone (0=urbaine, 1=mixte, 2=rurale, null=auto)
 * @property {number|null} congestion_user - Embouteillages ressentis (1-10, null=non renseigné)
 * @property {number|null} congestion_moyen - Congestion moyenne Mapbox (0-100, null si unknown)
 * @property {number|null} sinuosite_indice - Indice sinuosité route (≥1.0, null si calcul échoué)
 * @property {string|null} route_classe_dominante - Classe route principale ("primary", "secondary", etc.)
 * @property {number|null} nb_virages - Nombre virages comptabilisés
 * @property {number|null} force_virages - Force virages en °/km
 * @property {number|null} duree_estimee - Durée trajet en secondes (Mapbox avec trafic)
 * @property {string} date_ajout - Date création ISO 8601
 * @property {string} updated_at - Date modification ISO 8601
 */

/**
 * @typedef {Object} AddTrajetRequest
 * @property {PointNested} point_depart - Point départ
 * @property {PointNested} point_arrivee - Point arrivée
 * @property {number} prix - Prix payé en CFA (>0)
 * @property {string|null} [heure] - Tranche horaire (null=auto-détecté)
 * @property {number|null} [meteo] - Code météo (null=auto-détecté via OpenMeteo)
 * @property {number|null} [type_zone] - Type zone (null=auto-détecté via Mapbox classes)
 * @property {number|null} [congestion_user] - Embouteillages ressentis (1-10, optionnel)
 */

// ===========================================
// ESTIMATION - Réponse API /estimate
// ===========================================

/**
 * @typedef {Object} DetailsTrajet
 * @property {PointDetails} depart - Détails point départ
 * @property {PointDetails} arrivee - Détails point arrivée
 * @property {number} distance_metres - Distance routière en mètres
 * @property {number} duree_secondes - Durée en secondes
 * @property {string|null} heure - Tranche horaire
 * @property {number|null} meteo - Code météo
 * @property {string|null} meteo_label - Label météo (ex: "Soleil", "Pluie forte")
 * @property {number|null} type_zone - Type zone
 * @property {string|null} type_zone_label - Label type zone (ex: "Urbaine", "Mixte")
 * @property {number|null} congestion_mapbox - Congestion Mapbox (0-100)
 * @property {string|null} route_classe - Classe route dominante
 */

/**
 * @typedef {Object} PointDetails
 * @property {string} label - Nom POI
 * @property {[number, number]} coords - [latitude, longitude]
 * @property {string|null} quartier - Quartier
 * @property {string|null} ville - Ville
 */

/**
 * @typedef {Object} AjustementsAppliques
 * @property {number|null} congestion_actuelle - Congestion Mapbox actuelle (0-100)
 * @property {number|null} ajustement_congestion_pourcent - % ajustement prix lié congestion
 * @property {number|null} distance_extra_metres - Distance extra pour trajet similaire (m)
 * @property {number|null} ajustement_distance_cfa - Ajustement prix lié distance (CFA)
 * @property {number|null} facteur_ajustement_total - Facteur multiplicateur total
 * @property {MeteoOpposee|null} meteo_opposee - Estimation météo opposée (toujours retourné)
 * @property {HeureOpposee|null} heure_opposee - Estimation heure opposée (toujours retourné)
 */

/**
 * @typedef {Object} MeteoOpposee
 * @property {number} code - Code météo opposé
 * @property {string} label - Label météo (ex: "Soleil")
 * @property {number} prix_estime - Prix estimé pour cette météo
 * @property {string|null} message - Message explicatif
 */

/**
 * @typedef {Object} HeureOpposee
 * @property {string} tranche - Tranche horaire opposée (ex: "nuit")
 * @property {number} prix_estime - Prix estimé pour cette heure
 * @property {string|null} message - Message explicatif
 */

/**
 * @typedef {Object} FeaturesUtilisees
 * @property {number} distance_metres - Distance en mètres utilisée pour la prédiction
 * @property {number} duree_secondes - Durée en secondes utilisée pour la prédiction
 * @property {number|null} congestion - Congestion Mapbox (0-100) ou null si inconnue
 * @property {number} sinuosite - Indice de sinuosité utilisé
 * @property {number} nb_virages - Nombre de virages estimé
 * @property {string} heure - Tranche horaire utilisée
 * @property {number} meteo - Code météo utilisé
 * @property {number} type_zone - Type de zone utilisé
 *
 * @typedef {Object} EstimationsSupplementaires
 * @property {number|null} ml_prediction - Prix ML (CFA, null si modèle indisponible)
 * @property {FeaturesUtilisees|null} features_utilisees - Features passées au modèle (transparence)
 */

/**
 * @typedef {Object} DetailsEstimations
 * @property {string|null} ml_prediction - Explication ML (null si indisponible)
 * @property {string|null} note - Note générale sur le fallback (inconnu)
 */

/**
 * @typedef {Object} Prediction
 * @property {"exact"|"similaire"|"inconnu"} statut - Type de match trouvé
 * @property {number} prix_moyen - Prix moyen estimé en CFA
 * @property {number|null} prix_min - Prix minimum (null si inconnu)
 * @property {number|null} prix_max - Prix maximum (null si inconnu)
 * @property {number} fiabilite - Score fiabilité 0.0-1.0 (0.5=faible, 0.75=moyenne, 0.95=haute)
 * @property {string} message - Message explicatif estimation
 * @property {number} nb_trajets_utilises - Nombre trajets BD utilisés (0 si inconnu)
 * @property {DetailsTrajet} details_trajet - Informations complètes trajet
 * @property {AjustementsAppliques} ajustements_appliques - Détails ajustements prix
 * @property {EstimationsSupplementaires|null} estimations_supplementaires - Estimations alternatives (si inconnu)
 * @property {DetailsEstimations|null} details_estimations - Explications estimations alternatives (si inconnu)
 * @property {string[]} suggestions - Conseils utilisateur
 */

/**
 * @typedef {Object} EstimateRequest
 * @property {PointInput|string} depart - Point départ (coords {lat,lon} OU nom lieu string)
 * @property {PointInput|string} arrivee - Point arrivée (coords {lat,lon} OU nom lieu string)
 * @property {string|null} [heure] - Tranche horaire (null=auto)
 * @property {number|null} [meteo] - Code météo (null=auto)
 * @property {number|null} [type_zone] - Type zone (null=auto)
 * @property {number|null} [congestion_user] - Embouteillages (1-10, optionnel)
 */

// ===========================================
// STATISTIQUES - Réponse /trajets/stats
// ===========================================

/**
 * @typedef {Object} TrajetStats
 * @property {number} total_trajets - Nombre total trajets en BD
 * @property {PrixStats} prix - Statistiques prix
 * @property {DistanceStats} distance - Statistiques distances
 * @property {Object<string, number>} repartition_heure - Nombre trajets par tranche
 * @property {Object<string, number>} repartition_meteo - Nombre trajets par météo
 * @property {Object<string, number>} repartition_zone - Nombre trajets par type zone
 * @property {TopQuartier[]} top_quartiers_depart - Top quartiers départ
 * @property {TopQuartier[]} top_quartiers_arrivee - Top quartiers arrivée
 */

/**
 * @typedef {Object} PrixStats
 * @property {number} moyen - Prix moyen (CFA)
 * @property {number} min - Prix minimum (CFA)
 * @property {number} max - Prix maximum (CFA)
 * @property {number} mediane - Prix médian (CFA)
 */

/**
 * @typedef {Object} DistanceStats
 * @property {number} moyenne - Distance moyenne (m)
 * @property {number} min - Distance minimum (m)
 * @property {number} max - Distance maximum (m)
 */

/**
 * @typedef {Object} TopQuartier
 * @property {string} quartier - Nom quartier
 * @property {number} count - Nombre trajets
 */

// ===========================================
// HEALTH CHECK - Réponse /health
// ===========================================

/**
 * @typedef {Object} HealthCheck
 * @property {"healthy"|"unhealthy"} status - Statut global
 * @property {string} timestamp - Date check ISO 8601
 * @property {string} version - Version API
 * @property {Object<string, "ok"|"error"|"timeout">} checks - Statut services externes
 * @property {HealthStats} stats - Stats rapides
 * @property {string[]} [errors] - Messages erreurs (si unhealthy)
 */

/**
 * @typedef {Object} HealthStats
 * @property {number} total_trajets - Nombre trajets BD
 * @property {number} total_points - Nombre points BD
 * @property {number} total_api_keys - Nombre clés API actives
 */

// ===========================================
// PAGINATION - Réponses listes paginées
// ===========================================

/**
 * @typedef {Object} PaginatedResponse
 * @property {number} count - Nombre total résultats
 * @property {string|null} next - URL page suivante (null si dernière)
 * @property {string|null} previous - URL page précédente (null si première)
 * @property {Array} results - Résultats page actuelle
 */

/**
 * @typedef {PaginatedResponse} PaginatedTrajets
 * @property {Trajet[]} results - Liste trajets
 */

/**
 * @typedef {PaginatedResponse} PaginatedPoints
 * @property {Point[]} results - Liste points
 */

// ===========================================
// GÉOLOCALISATION - Helpers navigator.geolocation
// ===========================================

/**
 * @typedef {Object} GeolocationPosition
 * @property {GeolocationCoordinates} coords - Coordonnées
 * @property {number} timestamp - Timestamp position
 */

/**
 * @typedef {Object} GeolocationCoordinates
 * @property {number} latitude - Latitude
 * @property {number} longitude - Longitude
 * @property {number|null} accuracy - Précision en mètres
 * @property {number|null} altitude - Altitude en mètres
 * @property {number|null} altitudeAccuracy - Précision altitude
 * @property {number|null} heading - Direction (degrés)
 * @property {number|null} speed - Vitesse (m/s)
 */

/**
 * @typedef {Object} GeolocationError
 * @property {number} code - Code erreur (1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT)
 * @property {string} message - Message erreur
 */

// ===========================================
// MAPBOX - Types spécifiques
// ===========================================

/**
 * @typedef {Object} MapboxFeature
 * @property {string} type - "Feature"
 * @property {Object} geometry - GeoJSON geometry
 * @property {Object} properties - Propriétés feature
 * @property {string} id - ID unique
 * @property {string} place_name - Nom lieu complet
 * @property {string} text - Nom court
 * @property {[number, number]} center - [longitude, latitude]
 * @property {string[]} place_type - Types lieu (ex: ["poi", "address"])
 * @property {Object} context - Contexte administratif (quartier, ville, etc.)
 */

/**
 * @typedef {Object} MapboxSuggestion
 * @property {string} name - Nom suggestion
 * @property {string} mapbox_id - ID Mapbox
 * @property {string} feature_type - Type (poi, place, address)
 * @property {string} place_formatted - Adresse formatée
 * @property {Object} context - Contexte (quartier, ville, etc.)
 */

// Export types pour utilisation externe (si TypeScript)
export {};
