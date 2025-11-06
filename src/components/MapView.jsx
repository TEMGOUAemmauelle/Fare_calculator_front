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
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const routeLayerId = useRef('route-layer');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(style);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Initialisation de la carte
  useEffect(() => {
    if (map.current) return; // Déjà initialisée

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
      console.log('✅ Carte Mapbox chargée');
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
      const routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates || route.geometry?.coordinates || [],
        },
      };

      // Source
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: routeGeoJSON,
      });

      // Outline (bordure)
      map.current.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': 8,
          'line-opacity': 0.8,
        },
      });

      // Ligne principale
      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': route.color || ROUTE_COLORS.primary,
          'line-width': 5,
          'line-opacity': 1,
        },
      });

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
      const coordinates = routeGeoJSON.geometry.coordinates;
      if (coordinates.length > 0) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

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
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      console.error('❌ Géolocalisation non supportée');
      return;
    }

    setIsTracking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 2000,
          });
        }
        
        setIsTracking(false);
        console.log('✅ Position utilisateur:', { longitude, latitude });
      },
      (error) => {
        console.error('❌ Erreur géolocalisation:', error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
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
    <div className={`relative ${className}`} style={{ height }}>
      {/* Container carte */}
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl" />

      {/* Contrôles flottants */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 flex flex-col gap-2 z-10"
        >
          {/* Zoom In */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Zoom Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </motion.button>

          {/* Fit bounds */}
          {markers.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFitBounds}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-lg border border-gray-200 transition-colors"
              title="Voir tout"
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
              title="Changer de style"
            >
              <Layers className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Bouton géolocalisation */}
      {showGeolocate && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGeolocate}
          disabled={isTracking}
          className="absolute bottom-4 right-4 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full shadow-2xl z-10 transition-colors"
          title="Ma position"
        >
          {isTracking ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Navigation className="w-6 h-6" />
            </motion.div>
          ) : (
            <Navigation className="w-6 h-6" />
          )}
        </motion.button>
      )}

      {/* Badge de chargement */}
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm z-20 rounded-2xl"
          >
            <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <MapPin className="w-6 h-6 text-blue-600" />
              </motion.div>
              <span className="font-semibold text-gray-900">Chargement de la carte...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style personnalisé pour popup */}
      <style jsx>{`
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
