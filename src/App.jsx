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
import { useEffect } from 'react';

// Pages
import HomePage from './pages/HomePage';
import EstimatePage from './pages/EstimatePageRouter';
import AddTrajetPage from './pages/AddTrajetPage';

// Components
import PWAInstallPrompt from './components/PWAInstallPrompt';

import './App.css';

function App() {
  useEffect(() => {
    // Demander la permission de géolocalisation dès l'accès à l'interface sur mobile/desktop
    const askPermissionOnLoad = async () => {
      if (!('geolocation' in navigator)) return;
      try {
        const status = await geolocationService.checkGeolocationPermission();
        console.log('[App] Statut permission géoloc:', status);
        if (status === 'prompt') {
          // Inviter poliment l'utilisateur mais ne pas forcer le prompt automatique
          toast('Autorisez la géolocalisation pour une meilleure expérience (tapez sur l\'icône de localisation ou sur le bouton ma position).', { icon: '📍', duration: 6000 });
        } else if (status === 'denied') {
          // Permission bloquée : expliquer comment réactiver
          toast.error('Géolocalisation bloquée. Ouvrez les paramètres du site (icône cadenas) et autorisez la localisation.', { duration: 8000 });
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

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/estimate" element={<EstimatePage />} />
        <Route path="/add-trajet" element={<AddTrajetPage />} />
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </BrowserRouter>
  );
}

export default App;
