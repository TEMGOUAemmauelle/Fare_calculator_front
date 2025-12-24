import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { register as registerServiceWorker } from './services/pwaService'

// Capturer l'événement d'installation PWA dès que possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // Déclencher un événement custom pour notifier les composants déjà montés
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Enregistrer le Service Worker pour la PWA
registerServiceWorker();
