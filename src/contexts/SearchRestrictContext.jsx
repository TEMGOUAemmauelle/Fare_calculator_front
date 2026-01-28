/**
 * @fileoverview SearchRestrictContext - Contexte pour la restriction de zone de recherche
 * 
 * Gère l'état global du switch de restriction de recherche :
 * - true = recherche limitée à la ville actuelle (Yaoundé par défaut)
 * - false = recherche dans tout le Cameroun
 */

import { createContext, useContext, useState, useEffect } from 'react';

const SearchRestrictContext = createContext();

// Clé localStorage pour persister le choix
const STORAGE_KEY = 'fare_calculator_search_restricted';

// Viewbox pour différentes villes camerounaises
export const CITY_VIEWBOXES = {
  'Yaoundé': '11.3,3.7,11.7,4.05',
  'Douala': '9.6,3.95,9.85,4.15',
  'Garoua': '13.3,9.2,13.5,9.4',
  'Bamenda': '10.1,5.9,10.2,6.0',
  'Maroua': '14.25,10.55,14.4,10.65',
  'Bafoussam': '10.35,5.45,10.55,5.55',
  'default': '8.0,1.5,16.5,13.5', // Tout le Cameroun
};

export function SearchRestrictProvider({ children }) {
  // Par défaut, la recherche est restreinte à la ville
  const [isRestricted, setIsRestricted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Ville actuelle détectée
  const [currentCity, setCurrentCity] = useState('Yaoundé');

  // Persister le choix dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isRestricted));
  }, [isRestricted]);

  // Toggle la restriction
  const toggleRestriction = () => {
    setIsRestricted(prev => !prev);
  };

  // Obtenir le viewbox approprié
  const getViewbox = () => {
    if (!isRestricted) {
      return CITY_VIEWBOXES.default;
    }
    return CITY_VIEWBOXES[currentCity] || CITY_VIEWBOXES['Yaoundé'];
  };

  // Options de recherche Nominatim
  const getSearchOptions = () => ({
    bounded: isRestricted,
    viewbox: getViewbox(),
  });

  const value = {
    isRestricted,
    setIsRestricted,
    toggleRestriction,
    currentCity,
    setCurrentCity,
    getViewbox,
    getSearchOptions,
  };

  return (
    <SearchRestrictContext.Provider value={value}>
      {children}
    </SearchRestrictContext.Provider>
  );
}

export function useSearchRestrict() {
  const context = useContext(SearchRestrictContext);
  if (context === undefined) {
    throw new Error('useSearchRestrict must be used within a SearchRestrictProvider');
  }
  return context;
}

export default SearchRestrictContext;
