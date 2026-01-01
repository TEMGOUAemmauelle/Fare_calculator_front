/**
 * @fileoverview MarketplaceCard - Carte de service marketplace
 * 
 * Composant réutilisable pour afficher un service du marketplace
 * avec design moderne et animations.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Users, Sparkles, ImageOff } from 'lucide-react';

/**
 * Carte de service marketplace
 * @param {Object} service - Données du service
 * @param {string} service.nom - Nom du service
 * @param {string} service.description - Description courte
 * @param {string} service.url | service.lien_redirection - URL externe
 * @param {string} service.logo_url | service.image_url - URL du logo/image
 * @param {string} service.categorie - Catégorie (transport, delivery, etc.)
 * @param {boolean} service.featured - Si le service est mis en avant
 * @param {string} variant - 'default' | 'compact' | 'featured'
 */
const MarketplaceCard = ({ service, variant = 'default' }) => {
  const [imageError, setImageError] = useState(false);
  
  // Support pour les deux formats d'URL (logo_url ou image_url, url ou lien_redirection)
  const imageUrl = service.logo_url || service.image_url;
  const linkUrl = service.url || service.lien_redirection;
  
  const getCategoryColor = (categorie) => {
    const colors = {
      transport: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      delivery: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      tech: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      finance: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      default: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colors[categorie?.toLowerCase()] || colors.default;
  };

  const categoryStyle = getCategoryColor(service.categorie);

  // Variante compacte (pour sections homepage)
  if (variant === 'compact') {
    return (
      <motion.a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="block bg-white rounded-2xl border border-gray-100 hover:border-[#f3cd08] hover:shadow-lg transition-all group overflow-hidden h-full"
      >
        {/* Image - Hauteur réduite pour un look plus fin */}
        <div className="w-full h-20 bg-gray-100 relative">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={service.nom}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ImageOff className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        <div className="p-2.5">
          <h4 className="font-bold text-gray-900 truncate group-hover:text-[#f3cd08] transition-colors text-[11px] leading-tight">
            {service.nom}
          </h4>
          <p className="text-[9px] text-gray-400 truncate mt-0.5">
            {service.description}
          </p>
        </div>
      </motion.a>
    );
  }

  // Variante featured (mise en avant)
  if (variant === 'featured' || service.featured) {
    return (
      <motion.a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -6 }}
        className="relative block bg-gradient-to-br from-[#141414] to-[#2a2a2a] rounded-3xl overflow-hidden group h-full min-h-[280px]"
      >
        {/* Image de fond */}
        {imageUrl && !imageError && (
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt={service.nom}
              className="w-full h-full object-cover opacity-20"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
          </div>
        )}
        
        {/* Badge Featured */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-[#f3cd08] rounded-full">
            <Sparkles className="w-3 h-3 text-black" />
            <span className="text-[9px] font-black uppercase tracking-wide text-black">Featured</span>
          </div>
        </div>

        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Logo + Info */}
          <div className="flex items-start gap-4 mb-4">
            {imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt={service.nom}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-black text-white">
                  {service.nom?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-1 group-hover:text-[#f3cd08] transition-colors">
                {service.nom}
              </h3>
              <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${categoryStyle.bg} ${categoryStyle.text}`}>
                {service.categorie || 'Service'}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
            {service.description}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Users className="w-4 h-4" />
              <span>Service partenaire</span>
            </div>
            <div className="flex items-center gap-2 text-[#f3cd08] font-bold text-sm group-hover:gap-3 transition-all">
              <span>Découvrir</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.a>
    );
  }

  // Variante default
  return (
    <motion.a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -20px rgba(0,0,0,0.15)' }}
      className="block bg-white rounded-2xl border border-gray-100 hover:border-[#f3cd08] transition-all group overflow-hidden h-full min-h-[280px] flex flex-col"
    >
      {/* Image */}
      <div className="w-full h-36 bg-gray-100 relative">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={service.nom}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Badge catégorie sur l'image */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${categoryStyle.bg} ${categoryStyle.text}`}>
            {service.categorie || 'Service'}
          </span>
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#f3cd08] transition-colors">
            {service.nom}
          </h3>
          <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[#f3cd08] transition-colors shrink-0 mt-1" />
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {service.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>Partenaire</span>
          </div>
          <span className="text-[#f3cd08] text-xs font-bold">Visiter →</span>
        </div>
      </div>
    </motion.a>
  );
};

export default MarketplaceCard;
