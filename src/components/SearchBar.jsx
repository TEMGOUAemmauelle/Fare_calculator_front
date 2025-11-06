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
import { searchSuggestions } from '../services/mapboxService';
import { getCurrentPositionWithAddress } from '../services/geolocationService';

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
        const results = await searchSuggestions(query, { 
          limit: 5,
          proximity: [11.5021, 3.8480],
        });
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
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
    setQuery(suggestion.name);
    setIsOpen(false);
    setIsFocused(false);
    
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
    setLoadingLocation(true);
    try {
      const point = await getCurrentPositionWithAddress();
      setQuery(point.label || 'Ma position');
      
      const coords = [point.coords_longitude, point.coords_latitude];
      
      onSelect({
        label: point.label || 'Ma position',
        coordinates: coords,
        longitude: coords[0],
        latitude: coords[1],
        address: `${point.quartier || ''} ${point.ville || ''}`.trim(),
      });
      setIsOpen(false);
    } catch (error) {
      // Silencieux
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
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-4 bg-white border-1 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-[#f3cd08] focus:ring-2 focus:ring-[#f3cd08]/20"
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
            disabled={loadingLocation}
            className="px-5 py-4 bg-[#f3cd08] text-[#231f0f] rounded-xl hover:bg-[#e0bc07] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg transition-all duration-200"
          >
            {loadingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            <span className="hidden sm:inline font-medium">Position</span>
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
                  <MapPinned className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
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
            <p className="text-gray-600 font-medium">Aucun lieu trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez avec un autre nom</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}