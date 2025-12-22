/**
 * @fileoverview Composant MapView - Carte interactive Mapbox
 * 
 * Carte élégante multi-fonctions avec :
 * - Affichage itinéraire avec ligne animée
 * - Markers départ/arrivée personnalisés
 * - Contrôles zoom/position
 * - Géolocalisation temps réel
 * - Isochrones (zones accessibles)
 * - Clustering de POIs
 * - Styles sombre/clair
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Maximize2, Clock, Route as RouteIcon, List, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from './LottieAnimation';
import yellowTaxiAnimation from '../assets/lotties/yellow taxi.json';
import geolocationService from '../services/geolocationService';
import { toast } from 'react-hot-toast';

// Configuration Mapbox
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

// Styles de carte disponibles
const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

// Couleurs pour l'itinéraire
const ROUTE_COLORS = {
  primary: '#3B82F6', // Blue
  alternative: '#8B5CF6', // Purple
  // unknown traffic will be shown with the primary blue for readability
  unknown: '#3B82F6', // Blue (use primary when traffic data unavailable)
  congestion: {
    low: '#10B981', // Green
    moderate: '#F59E0B', // Amber
    heavy: '#EF4444', // Red
    severe: '#991B1B', // Dark red
  },
};

export default function MapView({
  center = [11.5167, 3.8667], // Yaoundé par défaut
  zoom = 12,
  style = 'streets',
  markers = [],
  route = null,
  showControls = true,
  showGeolocate = true,
  showStyleSwitcher = false,
  isochrones = null,
  onMapClick = null,
  onMarkerClick = null,
  className = '',
  height = '100%',
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const routeLayerId = useRef('route-layer');
  const userMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(style);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Initialisation de la carte
  useEffect(() => {
    if (map.current) return; // Déjà initialisée

    // Debug: vérifier taille du conteneur
    if (mapContainer.current) {
      const rect = mapContainer.current.getBoundingClientRect();
      console.log('📐 Container size:', { width: rect.width, height: rect.height });
      
      if (rect.height === 0) {
        console.error('❌ Container height is 0! Map will be blank.');
      }
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[currentStyle] || MAP_STYLES.streets,
      center,
      zoom,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });

    // Événements carte
    map.current.on('load', () => {
      setMapLoaded(true);
      // Force resize pour éviter render issues
      setTimeout(() => {
        map.current?.resize();
        console.log('✅ Carte Mapbox chargée + resized');
      }, 100);
    });

    // Click sur la carte
    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
      });
    }

    // Nettoyage
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Changement de style
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    map.current.setStyle(MAP_STYLES[currentStyle] || MAP_STYLES.streets);
  }, [currentStyle, mapLoaded]);

  // Gestion des markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Supprimer anciens markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter nouveaux markers
    markers.forEach((markerData, index) => {
      const { coordinates, type, label, color } = markerData;
      
      // Valider coordonnées
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        console.warn('Marker ignoré - coordonnées invalides:', markerData);
        return;
      }
      
      const [lng, lat] = coordinates;
      if (isNaN(lng) || isNaN(lat)) {
        console.warn('Marker ignoré - NaN:', { lng, lat, markerData });
        return;
      }

      // Créer élément DOM personnalisé
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      
      // Icône selon type
      const markerColor = color || (type === 'depart' ? '#3B82F6' : type === 'arrivee' ? '#EF4444' : '#8B5CF6');
      el.innerHTML = `
        <div class="relative flex items-center justify-center w-full h-full">
          <div class="absolute inset-0 bg-white rounded-full shadow-lg"></div>
          <div class="absolute inset-1 rounded-full animate-pulse" style="background: ${markerColor}20;"></div>
          <svg class="relative w-6 h-6 z-10" style="color: ${markerColor};" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      // Créer marker
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(coordinates)
        .addTo(map.current);

      // Popup si label
      if (label) {
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          className: 'custom-popup',
        }).setHTML(`
          <div class="px-3 py-2">
            <p class="font-semibold text-sm text-gray-900">${label}</p>
          </div>
        `);
        marker.setPopup(popup);
      }

      // Click handler
      if (onMarkerClick) {
        el.addEventListener('click', () => {
          onMarkerClick(markerData, index);
        });
      }

      markersRef.current.push(marker);
    });

    // Ajuster vue si plusieurs markers
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(m => bounds.extend(m.coordinates));
      map.current.fitBounds(bounds, { 
        padding: 80,
        maxZoom: 15,
        duration: 1000,
      });
    } else if (markers.length === 1) {
      map.current.flyTo({
        center: markers[0].coordinates,
        zoom: 14,
        duration: 1000,
      });
    }
  }, [markers, mapLoaded, onMarkerClick]);

  // Gestion de l'itinéraire
  useEffect(() => {
    if (!map.current || !mapLoaded || !route) return;

    const sourceId = 'route-source';
    const layerId = routeLayerId.current;

    // Supprimer ancien itinéraire
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getLayer(`${layerId}-outline`)) {
      map.current.removeLayer(`${layerId}-outline`);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Ajouter nouvel itinéraire
    try {
      console.log('🛣️ Route reçue:', route);
      
      // Si on a des données de congestion par segment, créer une LineString avec propriétés
      let routeGeoJSON;
      
      if (route.congestion_segments && route.congestion_segments.length > 0) {
        // Mode segmenté : créer une FeatureCollection avec un segment par niveau de congestion
        console.log('🚦 Congestion par segments:', route.congestion_segments.length, 'segments');
        
        // Log des premiers segments pour debug
        console.log('🔍 Premier segment:', route.congestion_segments[0]);
        
        routeGeoJSON = {
          type: 'FeatureCollection',
          features: route.congestion_segments.map((segment, index) => ({
            type: 'Feature',
            properties: {
              congestion: segment.congestion || 'unknown',
            },
            geometry: {
              type: 'LineString',
              coordinates: segment.coordinates,
            },
          })),
        };
        
        console.log('📦 GeoJSON créé:', routeGeoJSON.features.length, 'features');
        console.log('🔍 Première feature:', JSON.stringify(routeGeoJSON.features[0]));
      } else {
        // Mode simple : une seule ligne
        console.log('📍 Mode simple (pas de segments)');
        routeGeoJSON = {
          type: 'Feature',
          properties: {
            congestion: route.congestion_level || 'unknown',
          },
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates || route.geometry?.coordinates || [],
          },
        };
      }

      const coordinates = route.coordinates || route.geometry?.coordinates || [];
      console.log('📍 Coordonnées itinéraire:', coordinates.length, 'points');

      if (coordinates.length === 0) {
        console.error('❌ Aucune coordonnée dans l\'itinéraire!');
        return;
      }

      // Source
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Outline (subtle dark border to increase contrast)
      map.current.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          // use a low-opacity dark outline so colored line remains visible on light backgrounds
          'line-color': 'rgba(17,24,39,0.12)',
          'line-width': 8,
          'line-opacity': 1,
        },
      });

      // Ligne principale - Couleur par data-driven styling (congestion)
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'congestion'],
            'low', ROUTE_COLORS.congestion.low,        // Vert (fluide)
            'moderate', ROUTE_COLORS.primary,           // Bleu (modéré)
            'heavy', ROUTE_COLORS.congestion.moderate,  // Orange (dense)
            'severe', ROUTE_COLORS.congestion.heavy,    // Rouge (saturé)
            'unknown', ROUTE_COLORS.unknown,            // Jaune (pas de données)
            ROUTE_COLORS.unknown // Défaut: jaune (si données manquantes)
          ],
          'line-width': 6,
          'line-opacity': 1,
        },
      });
      
      console.log('✅ Couches ajoutées:', `${layerId}-outline`, '+', layerId);

      // Animation de tracé (effet drawing)
      let dashArraySequence = [
        [0, 4, 3],
        [0.5, 4, 2.5],
        [1, 4, 2],
        [1.5, 4, 1.5],
        [2, 4, 1],
        [2.5, 4, 0.5],
        [3, 4, 0],
        [0, 0.5, 3, 3.5],
        [0, 1, 3, 3],
        [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],
        [0, 2.5, 3, 1.5],
        [0, 3, 3, 1],
        [0, 3.5, 3, 0.5],
      ];
      let step = 0;

      function animateDashArray() {
        step = (step + 1) % dashArraySequence.length;
        if (map.current && map.current.getLayer(layerId)) {
          map.current.setPaintProperty(layerId, 'line-dasharray', dashArraySequence[step]);
        }
        requestAnimationFrame(animateDashArray);
      }

      animateDashArray();

      // Ajuster vue sur l'itinéraire
      const routeCoords = route.coordinates || route.geometry?.coordinates || [];
      if (routeCoords.length > 0) {
        const bounds = routeCoords.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(routeCoords[0], routeCoords[0]));

        map.current.fitBounds(bounds, {
          padding: 80,
          duration: 1500,
        });
      }

      console.log('✅ Itinéraire ajouté à la carte');
    } catch (error) {
      console.error('❌ Erreur ajout itinéraire:', error);
    }
  }, [route, mapLoaded]);

  // Gestion isochrones
  useEffect(() => {
    if (!map.current || !mapLoaded || !isochrones) return;

    const sourceId = 'isochrone-source';
    const layerId = 'isochrone-layer';

    // Supprimer ancien
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Ajouter isochrone
    try {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: isochrones,
      });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.15,
          'fill-outline-color': '#3B82F6',
        },
      });

      console.log('✅ Isochrone ajoutée');
    } catch (error) {
      console.error('❌ Erreur ajout isochrone:', error);
    }
  }, [isochrones, mapLoaded]);

  // Géolocalisation
  const handleGeolocate = async () => {
    if (!navigator.geolocation) {
      toast.error(t('map.unsupported'));
      return;
    }

    setIsTracking(true);
    try {
      // Vérifier le statut de permission avant de déclencher la requête
      const status = await geolocationService.checkGeolocationPermission();
      console.log('[MapView] Statut permission géoloc:', status);

      if (status === 'denied') {
        // Ne pas tenter de re-prompt (impossible) ; indiquer la marche à suivre
        toast.error('Permission géolocalisation bloquée. Ouvrez les paramètres du site (icône cadenas) et autorisez la localisation.', { duration: 7000 });
        setIsTracking(false);
        return;
      }

      // Si 'prompt' ou 'granted', tenter d'obtenir la position (le navigateur affichera la popup si nécessaire)
      const position = await geolocationService.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const { longitude, latitude } = position.coords;
      setUserLocation([longitude, latitude]);

      if (map.current) {
        // Supprimer ancien marker utilisateur
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Créer marker utilisateur avec cercle pulsant (jaune thème)
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.innerHTML = `
          <div class="relative w-10 h-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-[#f3cd08] rounded-full opacity-30 animate-ping"></div>
            <div class="relative w-5 h-5 bg-[#f3cd08] border-4 border-white rounded-full shadow-lg"></div>
          </div>
        `;

        userMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Zoom sur position
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 2000,
        });
      }

      toast.success(t('map.localized'));
      console.log('✅ Position utilisateur:', { longitude, latitude });
    } catch (error) {
      // Gestion d'erreur claire
      console.warn('⚠️ Géolocalisation échouée:', error.message || error.userMessage || error);
      if (error.code === 1) {
        toast.error(t('geolocation.denied'));
      } else {
        toast.error(error.userMessage || t('geolocation.unknown_error'));
      }
    } finally {
      setIsTracking(false);
    }
  };

  // Contrôles zoom
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn({ duration: 500 });
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut({ duration: 500 });
    }
  };

  const handleFitBounds = () => {
    if (map.current && markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(m => bounds.extend(m.coordinates));
      map.current.fitBounds(bounds, { 
        padding: 80,
        duration: 1000,
      });
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height, minHeight: height }}>
      {/* Container carte */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Contrôles flottants */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-25 right-4 flex flex-col gap-2 z-10"
        >
          {/* Zoom In */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title={t('map.zoom_in')}
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Zoom Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title={t('map.zoom_out')}
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Bouton Liste Trajets */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/trajets')}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title={t('map.see_all')}
          >
            <List className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Bouton Statistiques */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/stats')}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title={t('map.see_stats')}
          >
            <BarChart2 className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Bouton géolocalisation - Jaune */}
          {showGeolocate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeolocate}
              disabled={isTracking}
              className="p-3 bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 rounded-xl shadow-lg border border-yellow-300 transition-colors"
              title={t('geolocation.my_position')}
            >
              {isTracking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Navigation className="w-5 h-5 text-[#231f0f]" />
                </motion.div>
              ) : (
                <Navigation className="w-5 h-5 text-[#231f0f]" />
              )}
            </motion.button>
          )}

          {/* Fit bounds */}
          {markers.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFitBounds}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
              title={t('map.see_all')}
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}

          {/* Style switcher */}
          {showStyleSwitcher && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const styles = Object.keys(MAP_STYLES);
                const currentIndex = styles.indexOf(currentStyle);
                const nextIndex = (currentIndex + 1) % styles.length;
                setCurrentStyle(styles[nextIndex]);
              }}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
              title={t('map.change_style')}
            >
              <Layers className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Badge de chargement - Lottie grand au centre */}
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20"
          >
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4">
                <LottieAnimation 
                  animationData={yellowTaxiAnimation}
                  loop={true}
                />
              </div>
              <p className="text-[#231f0f] text-lg font-semibold">{t('map.loading')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boîte info trajet (distance/temps/congestion) */}
      <AnimatePresence>
        {route && route.distance && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 bg-white rounded-2xl shadow-2xl p-4 z-20 min-w-[170px]"
          >
          <div className="space-y-3">
            {/* Distance */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RouteIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">{t('map.distance')}</div>
                <div className="text-lg font-black text-gray-900">
                  {(route.distance / 1000).toFixed(1)} km
                </div>
              </div>
            </div>

            {/* Durée */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase">{t('map.duration')}</div>
                <div className="text-lg font-black text-gray-900">
                  {Math.ceil(route.duration / 60)} min
                </div>
              </div>
            </div>

            {/* Congestion si disponible */}
            {route.congestion_level && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{t('map.traffic')}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    route.congestion_level === 'low' ? 'bg-green-100 text-green-700' :
                    route.congestion_level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                    route.congestion_level === 'heavy' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {route.congestion_level === 'low' ? t('map.traffic_low') :
                     route.congestion_level === 'moderate' ? t('map.traffic_moderate') :
                     route.congestion_level === 'heavy' ? t('map.traffic_heavy') : t('map.traffic_severe')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Style personnalisé pour popup */}
      <style>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .mapboxgl-popup-tip {
          display: none;
        }
      `}</style>
    </div>
  );
}
