/**
 * @fileoverview CityIndicator - Affiche la ville actuelle de l'utilisateur
 * 
 * Design discret et élégant pour indiquer la localisation.
 * Affiche "Yaoundé" par défaut si la géolocalisation échoue.
 */

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import geolocationService from '../services/geolocationService';
import { reverseSearch } from '../services/nominatimService';

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

export default function CityIndicator({ variant = 'default', className = '' }) {
  const [city, setCity] = useState('Yaoundé');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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
  }, []);

  // Variantes de style
  const variants = {
    default: {
      container: 'flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full',
      icon: 'w-3.5 h-3.5 text-[#f9d716]',
      text: 'text-xs font-semibold text-gray-600'
    },
    minimal: {
      container: 'flex items-center gap-1',
      icon: 'w-3 h-3 text-[#f9d716]',
      text: 'text-[10px] font-bold text-gray-400 uppercase tracking-wider'
    },
    hero: {
      container: 'flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20',
      icon: 'w-4 h-4 text-[#f9d716]',
      text: 'text-sm font-semibold text-white'
    },
    dark: {
      container: 'flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 rounded-full',
      icon: 'w-3.5 h-3.5 text-[#f9d716]',
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
    </motion.div>
  );
}
