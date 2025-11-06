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
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import EstimatePage from './pages/EstimatePageRouter';
import AddTrajetPage from './pages/AddTrajetPage';
import './App.css';

function App() {
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
    </BrowserRouter>
  );
}

export default App;
