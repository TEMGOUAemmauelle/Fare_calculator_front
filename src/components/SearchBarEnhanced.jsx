
import { useState, useEffect, useRef } from 'react';
import { searchPlaces } from '../services/nominatimService';
import { useSearchRestrict } from '../contexts/SearchRestrictContext';

/**
 * Composant de recherche "Headless" ou presque.
 * Gère la logique de debounce et d'appel API, mais laisse l'affichage des suggestions au parent via callback.
 */
export default function SearchBarEnhanced({
  value = '',
  onChange, // (text) => void
  onSuggestions, // (results) => void
  onLoading, // (bool) => void
  placeholder = "Rechercher...",
  autoFocus = false,
  className = "",
  minChars = 2,
  debounceTime = 250, // Plus rapide
  inputRef, // Pour passer une ref externe
  ...props
}) {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimer = useRef(null);
  
  // Récupérer les options de recherche du contexte
  const { getSearchOptions } = useSearchRestrict();
  
  // Sync prop value -> internal state
  useEffect(() => {
    if (value !== internalValue) {
        setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const text = e.target.value;
    setInternalValue(text);
    if (onChange) onChange(text);

    // Debounce Logic
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.length < minChars) {
       onSuggestions([]);
       onLoading(false);
       return;
    }

    onLoading(true);
    debounceTimer.current = setTimeout(async () => {
        try {
            // Utiliser les options du contexte (bounded + viewbox)
            const searchOptions = getSearchOptions();
            const results = await searchPlaces(text, { 
                limit: 8,
                ...searchOptions
            });
            onSuggestions(results);
        } catch (error) {
            console.warn("Search error:", error);
            onSuggestions([]);
        } finally {
            onLoading(false);
        }
    }, debounceTime);
  };

  return (
    <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
        {...props}
    />
  );
}
