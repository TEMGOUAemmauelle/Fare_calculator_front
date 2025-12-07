import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrajets } from '../services/trajetService';
import { ArrowLeft, MapPin, Clock, Cloud, Search, Filter, Calendar, X } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import yellowTaxiAnimation from '../assets/lotties/yellow taxi.json';
import { motion, AnimatePresence } from 'framer-motion';

const AllTrajetsPage = () => {
  const navigate = useNavigate();
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHeure, setFilterHeure] = useState('all');
  const [filterMeteo, setFilterMeteo] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        const data = await getTrajets({ ordering: 'point_depart__label' });
        const list = data.results || data;
        setTrajets(list);
      } catch (err) {
        console.error("Erreur chargement trajets:", err);
        setError("Impossible de charger la liste des trajets.");
      } finally {
        // Petit délai artificiel pour laisser voir l'animation si c'est trop rapide
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchTrajets();
  }, []);

  // Filtrage des trajets
  const filteredTrajets = useMemo(() => {
    return trajets.filter(trajet => {
      // Recherche textuelle (départ ou arrivée)
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        (trajet.point_depart?.label || '').toLowerCase().includes(searchLower) ||
        (trajet.point_arrivee?.label || '').toLowerCase().includes(searchLower);

      // Filtre Heure
      const matchHeure = filterHeure === 'all' || trajet.heure === filterHeure;

      // Filtre Météo
      const matchMeteo = filterMeteo === 'all' || String(trajet.meteo) === filterMeteo;

      return matchSearch && matchHeure && matchMeteo;
    });
  }, [trajets, searchTerm, filterHeure, filterMeteo]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getMeteoLabel = (code) => {
    const meteos = { 0: 'Soleil', 1: 'Pluie légère', 2: 'Pluie forte', 3: 'Orage' };
    return meteos[code] || 'Inconnue';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Jaune & Blanc */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-yellow-50 rounded-full transition-colors text-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Trajets <span className="text-yellow-500">Communautaires</span>
            </h1>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un point de départ ou d'arrivée..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all outline-none text-gray-700 placeholder-gray-400"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${showFilters ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-200 text-gray-500'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filtres Expandable */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 flex flex-wrap gap-3">
                  <select 
                    value={filterHeure}
                    onChange={(e) => setFilterHeure(e.target.value)}
                    className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-yellow-400 outline-none"
                  >
                    <option value="all">Toutes les heures</option>
                    <option value="matin">Matin</option>
                    <option value="apres-midi">Après-midi</option>
                    <option value="soir">Soir</option>
                    <option value="nuit">Nuit</option>
                  </select>

                  <select 
                    value={filterMeteo}
                    onChange={(e) => setFilterMeteo(e.target.value)}
                    className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-yellow-400 outline-none"
                  >
                    <option value="all">Toutes météos</option>
                    <option value="0">Soleil</option>
                    <option value="1">Pluie légère</option>
                    <option value="2">Pluie forte</option>
                    <option value="3">Orage</option>
                  </select>

                  {(filterHeure !== 'all' || filterMeteo !== 'all') && (
                    <button 
                      onClick={() => { setFilterHeure('all'); setFilterMeteo('all'); }}
                      className="px-4 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Réinitialiser
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-48 h-48">
              <LottieAnimation animationData={yellowTaxiAnimation} loop={true} />
            </div>
            <p className="text-gray-500 font-medium mt-4 animate-pulse">Chargement des trajets...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrajets.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Aucun trajet trouvé</h3>
                <p className="text-gray-500 mt-1">Essayez de modifier vos filtres de recherche.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredTrajets.map((trajet, index) => (
                  <motion.div
                    key={trajet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all group"
                  >
                    {/* Route Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Timeline visuelle */}
                      <div className="flex flex-col items-center gap-1 mt-1.5">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 ring-4 ring-yellow-50"></div>
                        <div className="w-0.5 h-10 bg-gray-100 border-l border-dashed border-gray-300"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-900 ring-4 ring-gray-50"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Départ</p>
                          <p className="text-gray-900 font-bold text-lg leading-tight truncate">
                            {trajet.point_depart?.label || 'Point inconnu'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Arrivée</p>
                          <p className="text-gray-900 font-bold text-lg leading-tight truncate">
                            {trajet.point_arrivee?.label || 'Point inconnu'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <div className="bg-yellow-400 text-[#231f0f] px-4 py-2 rounded-xl font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                          {formatPrice(trajet.prix)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Calendar className="w-3 h-3" />
                          {formatDate(trajet.date_ajout)}
                        </div>
                      </div>
                    </div>

                    {/* Details Footer */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="capitalize font-medium">{trajet.heure || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600">
                        <Cloud className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{getMeteoLabel(trajet.meteo)}</span>
                      </div>

                      {trajet.distance && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-600 ml-auto">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{(trajet.distance / 1000).toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTrajetsPage;
