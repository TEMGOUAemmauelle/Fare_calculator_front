/**
 * @fileoverview NavbarDesktop - Navbar unifiée pour toutes les pages desktop
 * 
 * Composant réutilisable pour assurer la cohérence de la navigation
 * sur toutes les pages de la version desktop.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAppNavigate } from '../hooks/useAppNavigate';
import LanguageSwitcher from './LanguageSwitcher';
import CityIndicator from './CityIndicator';

/**
 * @param {Object} props
 * @param {string} [props.currentAddress] - Adresse actuelle pour CityIndicator (optionnel)
 * @param {boolean} [props.showCityIndicator=true] - Afficher ou non l'indicateur de ville
 */
export default function NavbarDesktop({ currentAddress, showCityIndicator = true }) {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const location = useLocation();
  
  // Déterminer la page active basée sur le pathname
  const getActiveClass = (path) => {
    const currentPath = location.pathname;
    // Nettoyer le path de la langue (ex: /fr/stats -> /stats)
    const cleanPath = currentPath.replace(/^\/(fr|en)/, '') || '/';
    
    if (path === '/' && cleanPath === '/') return true;
    if (path !== '/' && cleanPath.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/estimate', label: t('nav.estimate') || 'Estimer' },
    { path: '/trajets', label: t('all_trajets.title') || 'Trajets' },
    { path: '/stats', label: t('stats.dashboard') || 'Statistiques' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/pricing', label: 'API & Pricing' },
    { path: '/services', label: t('partners.title') || 'Partenaires' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-12 h-20 flex items-center justify-between">
      {/* Logo + Navigation */}
      <div className="flex items-center gap-12">
        {/* Logo */}
        <div 
          className="flex flex-col cursor-pointer"
          onClick={() => navigate('/')}
        >
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-none italic">
            FARE<span className="text-[#f3cd08]">CAL</span>
          </h1>
          <div className="h-1 w-8 bg-[#f3cd08] mt-1 rounded-full" />
        </div>
        
        {/* City Indicator (optionnel) */}
        {showCityIndicator && (
          <CityIndicator 
            address={currentAddress || "Yaoundé, Cameroun"} 
            variant="default" 
          />
        )}

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)} 
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                getActiveClass(item.path) 
                  ? 'text-black border-b-2 border-[#f3cd08] pb-1' 
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="bg-gray-50 rounded-2xl p-1">
          <LanguageSwitcher variant="dark" />
        </div>
        <button 
          onClick={() => navigate('/add-trajet')}
          className="px-6 py-3 bg-[#141414] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-4 h-4 text-[#f3cd08]" />
          {t('home.cta_contribute') || 'Contribuer'}
        </button>
      </div>
    </nav>
  );
}
