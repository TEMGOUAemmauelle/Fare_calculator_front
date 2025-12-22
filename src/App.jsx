/**
 * @fileoverview App - Application principale avec routing
 * 
 * Configuration complète avec :
 * - React Router DOM
 * - Toaster pour notifications
 * - Structure responsive
 * - Gestion erreurs globale
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import geolocationService from './services/geolocationService';
import { MESSAGES } from './config/constants';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// Pages
import HomePage from './pages/HomePage';
import EstimatePage from './pages/EstimatePageRouter';
import AddTrajetPage from './pages/AddTrajetPage';
import AllTrajetsPage from './pages/AllTrajetsPage';
import StatsPage from './pages/StatsPage';

// Components
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LanguageWrapper from './components/LanguageWrapper';

import './App.css';

function App() {
  const { t } = useTranslation();
  useEffect(() => {
    // Demander la permission de géolocalisation dès l'accès à l'interface sur mobile/desktop
    const askPermissionOnLoad = async () => {
      if (!('geolocation' in navigator)) return;
      try {
        const status = await geolocationService.checkGeolocationPermission();
        console.log('[App] Statut permission géoloc:', status);
        if (status === 'prompt') {
          // Inviter poliment l'utilisateur mais ne pas forcer le prompt automatique
          toast(t('geolocation.prompt'), { icon: '📍', duration: 6000 });
        } else if (status === 'denied') {
          // Permission bloquée : expliquer comment réactiver
          toast.error(t('geolocation.denied'), { duration: 8000 });
        }
      } catch (e) {
        console.warn('[App] Vérification permission géoloc échouée:', e);
      }
    };

    askPermissionOnLoad();
  }, []);
  return (
    <BrowserRouter>
      {/* Toaster pour notifications globales */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            fontWeight: '600',
            borderRadius: '1rem',
            padding: '1rem 1.5rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Routes nested under language wrapper */}
      <Routes>
        <Route path="/:lang" element={<LanguageWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="estimate" element={<EstimatePage />} />
          <Route path="add-trajet" element={<AddTrajetPage />} />
          <Route path="trajets" element={<AllTrajetsPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
        
        {/* Redirect unknown routes or root without lang to LanguageWrapper's logic */}
        <Route path="*" element={<LanguageWrapper />} />
      </Routes>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </BrowserRouter>
  );
}

export default App;
