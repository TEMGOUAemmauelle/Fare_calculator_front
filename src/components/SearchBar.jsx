/**
 * @fileoverview Composant SearchBar - Auto-complétion POI via Mapbox
 * 
 * Barre de recherche avec suggestions en temps réel pour sélectionner
 * des points d'intérêt (POI) comme "Carrefour Ekounou", "Polytechnique Yaoundé".
 * Design moderne avec animations fluides et icônes professionnelles.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, Navigation, MapPinned } from 'lucide-react';
import { searchSuggestions, retrieveSuggestionDetails } from '../services/mapboxService';
import { getCurrentPositionWithAddress } from '../services/geolocationService';
import { UI_CONFIG } from '../config/constants';

export default function SearchBar({
  onSelect,
  placeholder = 'Rechercher un lieu...',
  initialValue = '',
  showCurrentLocation = false,
  label = null,
}) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce recherche
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
        const results = await searchSuggestions(query, { limit: 5 });
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Erreur recherche:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, UI_CONFIG.SEARCH_DEBOUNCE);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Fermer dropdown si clic extérieur
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
    setQuery(suggestion.name);
    setIsOpen(false);
    setIsFocused(false);
    
    // Récupérer détails complets
    const details = await retrieveSuggestionDetails(suggestion.mapbox_id);
    
    if (details) {
      onSelect({
        label: suggestion.name,
        coords: details.center, // [lon, lat]
        address: suggestion.place_formatted,
        quartier: suggestion.context?.neighborhood?.name || suggestion.context?.locality?.name,
        ville: suggestion.context?.place?.name || 'Yaoundé',
      });
    }
  };

  const handleCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const point = await getCurrentPositionWithAddress();
      setQuery(point.label || 'Ma position');
      onSelect({
        label: point.label || 'Ma position',
        coords: [point.coords_longitude, point.coords_latitude],
        address: `${point.quartier || ''} ${point.ville || ''}`.trim(),
        quartier: point.quartier,
        ville: point.ville,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      alert(error.userMessage || 'Impossible d\'obtenir votre position');
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
          {/* Input container avec effet de focus */}
          <div className={`relative transition-all duration-200 ${
            isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
          } rounded-xl`}>
            {/* Icône de recherche */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search className={`w-5 h-5 transition-colors duration-200 ${
                isFocused ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                suggestions.length > 0 && setIsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-blue-50/30"
            />
            
            {/* Loader ou icône de pin */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : query && (
                <MapPin className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Bouton géolocalisation */}
        {showCurrentLocation && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCurrentLocation}
            disabled={loadingLocation}
            className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-500/30 transition-all duration-200"
          >
            {loadingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            <span className="hidden sm:inline font-medium">Ma position</span>
          </motion.button>
        )}
      </div>

      {/* Dropdown suggestions avec animations */}
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
                <motion.button
                  key={suggestion.mapbox_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full px-5 py-4 text-left transition-all duration-150 flex items-start gap-3 ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <MapPinned className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    index === selectedIndex ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate mt-0.5">
                      {suggestion.place_formatted}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message si pas de résultats */}
      <AnimatePresence>
        {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-xl shadow-xl p-6 text-center"
          >
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucun lieu trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez avec un autre nom</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
