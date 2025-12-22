/**
 * @fileoverview SearchBar CORRIGÉ
 * 
 * Corrections :
 * - Suppression emojis UI
 * - Fix erreurs API Mapbox 400
 * - Focus ring jaune
 * - Gestion erreurs silencieuse
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, Navigation, MapPinned } from 'lucide-react';
import showToast from '../utils/customToast';
import { useTranslation } from 'react-i18next';
import { searchPlaces } from '../services/nominatimService';
import { getCurrentPositionWithAddress } from '../services/geolocationService';
import geolocationService from '../services/geolocationService';

export default function SearchBar({
  onSelect,
  placeholder,
  initialValue = '',
  showCurrentLocation = false,
  label = null,
  value = null, // Ajout prop value pour mode controlé
  externalLoading = false, // Ajout prop pour loading externe
}) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('search.placeholder');
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [justSelected, setJustSelected] = useState(false); // Flag pour éviter re-trigger
  
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  // Combiner loading interne et externe
  const showLoading = loadingLocation || externalLoading;

  // Synchroniser query avec value externe (mode controlé)
  // MAIS éviter de re-synchroniser juste après une sélection
  useEffect(() => {
    console.log('🔍 [SearchBar] useEffect value sync - value:', value, 'query:', query, 'justSelected:', justSelected);
    if (value !== null && value !== query && !justSelected) {
      console.log('🔍 [SearchBar] Mise à jour query avec value:', value);
      setQuery(value);
    }
    // Reset flag après montage
    if (justSelected) {
      const timer = setTimeout(() => setJustSelected(false), 100);
      return () => clearTimeout(timer);
    }
  }, [value, justSelected]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        // Utiliser Nominatim au lieu de Mapbox
        const results = await searchPlaces(query, { 
          limit: 10,
          bounded: true, // Limiter à Yaoundé
          viewbox: '11.4,3.78,11.6,3.95',
        });
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.warn('Erreur recherche:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (suggestion) => {
    setJustSelected(true); // Flag pour éviter re-trigger
    setQuery(suggestion.name);
    setIsOpen(false);
    setIsFocused(false);
    setIsLoading(false); // Arrêter loading immédiatement
    setSuggestions([]); // Vider suggestions
    
    // Format uniforme: coordinates + longitude/latitude séparés
    const coords = suggestion.coordinates || [suggestion.longitude, suggestion.latitude];
    
    onSelect({
      label: suggestion.name,
      coordinates: coords,
      longitude: coords[0],
      latitude: coords[1],
      address: suggestion.place_formatted,
      place_name: suggestion.place_formatted,
    });
  };

  const handleCurrentLocation = async () => {
    setJustSelected(true); // Flag pour éviter re-trigger
    setLoadingLocation(true);
    setIsLoading(false);
    setSuggestions([]);
    
    // Afficher toast pendant la recherche
    const loadingToast = showToast.loading(t('geolocation.detecting'));
    
    try {
      // Vérifier permission avant de déclencher
      const status = await geolocationService.checkGeolocationPermission();
      console.log('[SearchBar] Statut permission géoloc:', status);

      if (status === 'denied') {
        showToast.error(t('geolocation.denied'));
        setLoadingLocation(false);
        return;
      }

      const point = await getCurrentPositionWithAddress();
      console.log('📍 Position obtenue:', point);
      
      // Dismiss loading toast
      showToast.dismiss(loadingToast);
      
      const locationLabel = point.label || t('geolocation.my_position');
      setQuery(locationLabel);
      
      const coords = [point.coords_longitude, point.coords_latitude];
      
      onSelect({
        label: locationLabel,
        coordinates: coords,
        longitude: coords[0],
        latitude: coords[1],
        address: `${point.quartier || ''} ${point.ville || ''}`.trim(),
      });
      setIsOpen(false);
      setIsFocused(false);
      
      showToast.info(locationLabel, '📍');
    } catch (error) {
      console.error('❌ Erreur position complète:', {
        error,
        code: error.code,
        message: error.message,
        userMessage: error.userMessage
      });
      
      // Dismiss loading toast
      showToast.dismiss(loadingToast);
      setQuery('');
      
      // Afficher message spécifique selon le CODE d'erreur (pas le message)
      if (error.code === 1) {
        // Permission réellement refusée
        showToast.error(t('geolocation.denied'));
      } else if (error.code === 2) {
        // Position indisponible (pas de GPS, pas de réseau)
        showToast.error(t('geolocation.unavailable'));
      } else if (error.code === 3) {
        // Timeout
        showToast.error(t('geolocation.timeout'));
      } else {
        // Erreur inconnue
        showToast.error(t('geolocation.unknown_error'));
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className={`relative transition-all duration-200 ${
            isFocused ? 'ring-2 ring-[#f3cd08] ring-opacity-50' : ''
          } rounded-xl`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search className={`w-5 h-5 transition-colors duration-200 ${
                isFocused ? 'text-[#f3cd08]' : 'text-gray-400'
              }`} />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                suggestions.length > 0 && setIsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={defaultPlaceholder}
              className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-[#f3cd08] focus:ring-2 focus:ring-[#f3cd08]/20"
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#f3cd08] animate-spin" />
              ) : query && (
                <MapPin className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {showCurrentLocation && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCurrentLocation}
            disabled={showLoading}
            className="px-4 py-4 bg-[#f3cd08] text-[#231f0f] rounded-xl hover:bg-[#e0bc07] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-200"
            title={t('search.use_current')}
          >
            {showLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.mapbox_id || index}
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full px-5 py-4 text-left transition-all duration-150 flex items-start gap-3 ${
                    index === selectedIndex 
                      ? 'bg-[#fef9e6] border-l-4 border-[#f3cd08]' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <MapPinned className={`w-5 h-5 mt-0.5 shrink-0 ${
                    index === selectedIndex ? 'text-[#f3cd08]' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate mt-0.5">
                      {suggestion.place_formatted}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center"
          >
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{t('search.no_results')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('search.try_another')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}