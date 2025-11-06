/**
 * @fileoverview Composant ErrorMessage - Gestion élégante des erreurs
 * 
 * Affichage professionnel des messages d'erreur avec :
 * - Design moderne et rassurant
 * - Icônes contextuelles
 * - Animations subtiles
 * - Actions de récupération
 */

import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Wifi, 
  RefreshCw,
  Info,
  MapPin,
  Server,
  Key,
  X
} from 'lucide-react';

// Types d'erreur avec configuration
const ERROR_TYPES = {
  network: {
    icon: Wifi,
    title: 'Problème de connexion',
    color: 'amber',
    bgGradient: 'from-amber-50 to-orange-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  api: {
    icon: Server,
    title: 'Erreur serveur',
    color: 'red',
    bgGradient: 'from-red-50 to-rose-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  auth: {
    icon: Key,
    title: 'Authentification requise',
    color: 'purple',
    bgGradient: 'from-purple-50 to-pink-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  geolocation: {
    icon: MapPin,
    title: 'Géolocalisation indisponible',
    color: 'blue',
    bgGradient: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  validation: {
    icon: AlertCircle,
    title: 'Données invalides',
    color: 'orange',
    bgGradient: 'from-orange-50 to-amber-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  default: {
    icon: AlertTriangle,
    title: 'Une erreur est survenue',
    color: 'gray',
    bgGradient: 'from-gray-50 to-slate-50',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200',
  },
};

export default function ErrorMessage({
  error,
  type = 'default',
  message,
  title,
  onRetry,
  onDismiss,
  showIcon = true,
  className = '',
  variant = 'card', // 'card', 'banner', 'inline', 'modal'
}) {
  // Extraire message d'erreur
  const errorMessage = message || 
    (typeof error === 'string' ? error : error?.message) || 
    'Une erreur inattendue s\'est produite';

  // Configuration selon type
  const config = ERROR_TYPES[type] || ERROR_TYPES.default;
  const Icon = config.icon;
  const errorTitle = title || config.title;

  // Variantes de rendu
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`w-full bg-gradient-to-r ${config.bgGradient} border-l-4 ${config.borderColor} p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className={`p-2 ${config.iconBg} rounded-lg flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm">
              {errorTitle}
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              {errorMessage}
            </p>
            
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </motion.button>
            )}
          </div>

          {onDismiss && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 text-sm ${className}`}
      >
        {showIcon && <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />}
        <span className="text-gray-700">{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`ml-2 font-medium ${config.iconColor} hover:underline`}
          >
            Réessayer
          </button>
        )}
      </motion.div>
    );
  }

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header avec icône */}
          <div className={`bg-gradient-to-br ${config.bgGradient} px-6 py-8 text-center`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className={`inline-flex items-center justify-center w-20 h-20 ${config.iconBg} rounded-full mb-4`}
            >
              <Icon className={`w-10 h-10 ${config.iconColor}`} />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {errorTitle}
            </h3>
            
            <p className="text-gray-700 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 flex gap-3">
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className={`flex-1 py-3 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 border ${config.borderColor} rounded-xl font-bold text-gray-900 transition-all flex items-center justify-center gap-2`}
              >
                <RefreshCw className="w-5 h-5" />
                Réessayer
              </motion.button>
            )}
            
            {onDismiss && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDismiss}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
              >
                Fermer
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Variant 'card' (défaut)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg border-2 ${config.borderColor} overflow-hidden ${className}`}
    >
      {/* Barre de couleur supérieure */}
      <div className={`h-2 bg-gradient-to-r ${config.bgGradient}`} />

      <div className="p-6">
        <div className="flex items-start gap-4">
          {showIcon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={`p-3 ${config.iconBg} rounded-2xl flex-shrink-0`}
            >
              <Icon className={`w-7 h-7 ${config.iconColor}`} />
            </motion.div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {errorTitle}
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              {errorMessage}
            </p>

            {/* Détails techniques (si objet error) */}
            {error && typeof error === 'object' && error.stack && (
              <details className="mt-3">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              {onRetry && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 border ${config.borderColor} rounded-xl font-bold text-gray-900 transition-all shadow-sm`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </motion.button>
              )}

              {onDismiss && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onDismiss}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
                >
                  Ignorer
                </motion.button>
              )}
            </div>
          </div>

          {onDismiss && !onRetry && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
