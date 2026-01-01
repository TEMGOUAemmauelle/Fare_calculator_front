/**
 * @fileoverview QuickPriceModal - Mini modal pour ajouter rapidement un prix
 * 
 * Utilisé après une estimation de trajet "inconnu" pour permettre
 * à l'utilisateur de contribuer rapidement s'il connaît le prix,
 * sans aller sur la page complète d'ajout de trajet.
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Heart, 
  Loader2, 
  CheckCircle, 
  Coins,
  MapPin,
  Navigation,
  Sparkles
} from 'lucide-react';
import { addTrajet } from '../services/trajetService';
import showToast from '../utils/customToast';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - État d'ouverture du modal
 * @param {Function} props.onClose - Callback de fermeture
 * @param {Object} props.trajetData - Données du trajet (depart, arrivee, meteo, heure, distance, duree)
 * @param {Function} props.onSuccess - Callback après ajout réussi
 */
export default function QuickPriceModal({ isOpen, onClose, trajetData, onSuccess }) {
  const { t } = useTranslation();
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!price || parseInt(price) < 50) {
      showToast.error(t('quick_price.error_min_price'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Format attendu par l'API addTrajet
      const payload = {
        point_depart: {
          coords_latitude: trajetData.depart?.lat || trajetData.depart?.latitude,
          coords_longitude: trajetData.depart?.lon || trajetData.depart?.longitude,
          label: trajetData.depart?.label || 'Départ',
        },
        point_arrivee: {
          coords_latitude: trajetData.arrivee?.lat || trajetData.arrivee?.latitude,
          coords_longitude: trajetData.arrivee?.lon || trajetData.arrivee?.longitude,
          label: trajetData.arrivee?.label || 'Arrivée',
        },
        prix: parseInt(price),
        meteo: trajetData.meteo ?? 0,
        heure: trajetData.heure || 'matin',
        type_zone: trajetData.type_zone ?? 0,
      };

      await addTrajet(payload);
      setIsSuccess(true);
      showToast.success(t('quick_price.success'));
      
      // Afficher le succès pendant 2s puis fermer
      setTimeout(() => {
        setIsSuccess(false);
        setPrice('');
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Error adding quick price:', error);
      showToast.error(t('quick_price.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPrice('');
      setIsSuccess(false);
      onClose();
    }
  };

  // Prix suggérés rapides
  const quickPrices = [100, 150, 200, 250, 300, 350, 400, 500];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#141414] to-[#2a2a2a] px-6 py-5 text-white">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#f3cd08] rounded-xl">
                    <Heart className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">
                      {t('quick_price.title') || 'Vous connaissez ce prix ?'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('quick_price.subtitle') || 'Aidez la communauté en 10 secondes'}
                    </p>
                  </div>
                </div>

                {/* Mini résumé trajet */}
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl mt-3">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3 h-3 text-[#f3cd08] shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        {trajetData?.depart?.label || 'Départ'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs font-semibold truncate text-gray-300">
                        {trajetData?.arrivee?.label || 'Arrivée'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">
                    {t('quick_price.thank_you') || 'Merci !'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {t('quick_price.contribution_saved') || 'Votre contribution aide des milliers de Camerounais'}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Sparkles className="w-5 h-5 text-[#f3cd08] animate-pulse" />
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Input Prix */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      {t('quick_price.price_label') || 'Prix payé pour ce trajet'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-[#f3cd08] rounded-xl">
                        <Coins className="w-5 h-5 text-black" />
                      </div>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="200"
                        min="50"
                        step="25"
                        className="w-full pl-16 pr-20 py-4 text-2xl font-black text-gray-900 bg-gray-50 border-2 border-transparent focus:border-[#f3cd08] rounded-2xl outline-none transition-all placeholder:text-gray-300"
                        autoFocus
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                        FCFA
                      </span>
                    </div>
                  </div>

                  {/* Quick prices */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {t('quick_price.quick_select') || 'Sélection rapide'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrices.map((qp) => (
                        <button
                          key={qp}
                          type="button"
                          onClick={() => setPrice(qp.toString())}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            price === qp.toString()
                              ? 'bg-[#141414] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {qp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !price}
                    className="w-full py-4 bg-[#141414] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#f3cd08]" />
                    ) : (
                      <>
                        <Heart className="w-4 h-4 text-[#f3cd08]" />
                        {t('quick_price.submit') || 'Contribuer'}
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-400">
                    {t('quick_price.disclaimer') || 'Votre contribution est anonyme et aide la communauté'}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
