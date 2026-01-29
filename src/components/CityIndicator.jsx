/**
 * @fileoverview CityIndicator - Affiche la ville actuelle + Switch restriction zone
 * 
 * Design discret et élégant pour indiquer la localisation.
 * Inclut un switch pour restreindre la recherche à la ville ou tout le Cameroun.
 * Affiche "Yaoundé" par défaut si la géolocalisation échoue.
 */

import { useState, useEffect } from 'react';
import { MapPin, Globe, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';
import { useSearchRestrict } from '../contexts/SearchRestrictContext';

/**
 * Extrait le nom de la ville à partir d'une adresse complète Nominatim
 * @param {string} fullAddress - Adresse complète (ex: "Nlongkak, Yaoundé, Centre, Cameroun")
 * @returns {string} - Nom de la ville
 */
const extractCityFromAddress = (fullAddress) => {
  if (!fullAddress) return 'Yaoundé';
  
  // Liste des villes camerounaises principales
  const cameroonCities = [
    'Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Maroua', 'Bafoussam', 
    'Ngaoundéré', 'Bertoua', 'Kribi', 'Limbe', 'Buea', 'Ebolowa',
    'Edea', 'Kumba', 'Nkongsamba', 'Foumban', 'Dschang', 'Mbalmayo'
  ];
  
  // Chercher si une ville connue est dans l'adresse
  for (const city of cameroonCities) {
    if (fullAddress.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // Sinon, essayer d'extraire la ville depuis les segments (format: quartier, ville, région, pays)
  const parts = fullAddress.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    // La ville est souvent le 2ème ou 3ème élément
    return parts[1] || 'Yaoundé';
  }
  
  return 'Yaoundé';
};

export default function CityIndicator({ variant = 'default', className = '', showSwitch = true }) {
  const { t } = useTranslation();
  const [city, setCity] = useState('Yaoundé');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Contexte de restriction de recherche
  const { isRestricted, toggleRestriction, setCurrentCity } = useSearchRestrict();

  useEffect(() => {
    const detectCity = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const position = await geolocationService.getCurrentPosition({ timeout: 10000 });
        
        if (position?.coords) {
          const { latitude, longitude } = position.coords;
          const address = await reverseSearch(latitude, longitude);
          
          if (address) {
            const detectedCity = extractCityFromAddress(address);
            setCity(detectedCity);
            setCurrentCity(detectedCity); // Mettre à jour le contexte
          }
        }
      } catch (error) {
        console.warn('[CityIndicator] Géolocalisation échouée, utilisation par défaut:', error);
        setHasError(true);
        // Garder "Yaoundé" par défaut
      } finally {
        setIsLoading(false);
      }
    };

    detectCity();
  }, [setCurrentCity]);

  // Variantes de style
  const variants = {
    default: {
      container: 'flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full',
      icon: 'w-3.5 h-3.5 text-[#fabd16]',
      text: 'text-xs font-semibold text-gray-600'
    },
    minimal: {
      container: 'flex items-center gap-2',
      icon: 'w-3 h-3 text-[#fabd16]',
      text: 'text-[10px] font-bold text-gray-400 uppercase tracking-wider'
    },
    hero: {
      container: 'flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20',
      icon: 'w-4 h-4 text-[#fabd16]',
      text: 'text-sm font-semibold text-white'
    },
    dark: {
      container: 'flex items-center gap-3 px-3 py-1.5 bg-gray-800/50 rounded-full',
      icon: 'w-3.5 h-3.5 text-[#fabd16]',
      text: 'text-xs font-semibold text-gray-300'
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${style.container} ${className}`}
    >
      <MapPin className={style.icon} />
      {isLoading ? (
        <span className={`${style.text} animate-pulse`}>...</span>
      ) : (
        <span className={style.text}>{city}</span>
      )}
      
      {/* Switch de restriction de zone */}
      {showSwitch && (
        <>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={toggleRestriction}
            className="flex items-center gap-1.5 group relative"
            title={isRestricted ? t('search_restrict.city_only') : t('search_restrict.all_cameroon')}
          >
            {/* Icon qui change selon l'état */}
            {isRestricted ? (
              <Target className="w-3.5 h-3.5 text-[#fabd16]" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-blue-500" />
            )}
            
            {/* Mini switch visuel */}
            <div className={`relative w-8 h-4 rounded-full transition-colors ${
              isRestricted ? 'bg-[#fabd16]' : 'bg-blue-500'
            }`}>
              <motion.div
                initial={false}
                animate={{ x: isRestricted ? 2 : 16 }}
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
              />
            </div>
            
            {/* Tooltip au hover */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold bg-gray-900 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {isRestricted ? t('search_restrict.city_only') : t('search_restrict.all_cameroon')}
            </span>
          </button>
        </>
      )}
    </motion.div>
  );
}
