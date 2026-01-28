/**
 * @fileoverview Configuration Firebase
 * 
 * Configuration pour l'authentification Firebase par téléphone.
 * Les clés de configuration doivent être définies dans les variables d'environnement.
 * 
 * IMPORTANT: Créez un fichier .env à la racine du frontend avec:
 * VITE_FIREBASE_API_KEY=your_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your_project_id
 * VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 * VITE_FIREBASE_APP_ID=your_app_id
 */

import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialiser Firebase seulement si la config est présente
let app = null;
let auth = null;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Configurer la langue pour les SMS (français par défaut)
  auth.languageCode = 'fr';
  
  console.log('🔥 Firebase initialisé avec succès');
} else {
  console.warn('⚠️ Firebase non configuré - Variables d\'environnement manquantes');
}

/**
 * Configure le reCAPTCHA invisible pour la vérification téléphonique
 * @param {string} buttonId - ID du bouton qui déclenche la vérification
 * @returns {RecaptchaVerifier} Instance du vérificateur reCAPTCHA
 */
export const setupRecaptcha = (buttonId) => {
  if (!auth) {
    console.error('Firebase Auth non initialisé');
    return null;
  }
  
  // Nettoyer l'ancien verifier s'il existe
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      console.log('🧹 Ancien reCAPTCHA nettoyé');
    } catch (e) {
      console.warn('⚠️ Impossible de nettoyer l\'ancien reCAPTCHA:', e);
    }
    window.recaptchaVerifier = null;
  }
  
  // Nettoyer aussi les widgets reCAPTCHA orphelins dans le DOM
  const existingWidgets = document.querySelectorAll('.grecaptcha-badge, [id^="recaptcha-"]');
  existingWidgets.forEach(widget => {
    if (widget.id !== buttonId && widget.parentNode) {
      try {
        // Ne pas supprimer notre container, juste les widgets générés
        if (widget.classList.contains('grecaptcha-badge')) {
          widget.remove();
        }
      } catch (e) {
        console.warn('Cleanup widget error:', e);
      }
    }
  });
  
  // S'assurer que le container existe
  const container = document.getElementById(buttonId);
  if (!container) {
    console.error(`Container reCAPTCHA #${buttonId} non trouvé dans le DOM`);
    return null;
  }
  
  // Vider le container au cas où
  container.innerHTML = '';
  
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ reCAPTCHA résolu');
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA expiré - Veuillez réessayer');
        // Nettoyer pour permettre une nouvelle tentative
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = null;
        }
      }
    });
    
    console.log('🔐 reCAPTCHA configuré sur #' + buttonId);
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('❌ Erreur création reCAPTCHA:', error);
    throw error;
  }
};

/**
 * Envoie un code de vérification par SMS
 * @param {string} phoneNumber - Numéro de téléphone au format international (+237...)
 * @returns {Promise<ConfirmationResult>} Résultat de la confirmation
 */
export const sendVerificationCode = async (phoneNumber) => {
  if (!auth) {
    throw new Error('Firebase Auth non initialisé');
  }
  
  const appVerifier = window.recaptchaVerifier;
  if (!appVerifier) {
    throw new Error('reCAPTCHA non configuré');
  }
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    console.log('📱 Code SMS envoyé avec succès');
    return confirmationResult;
  } catch (error) {
    console.error('❌ Erreur envoi SMS:', error);
    throw error;
  }
};

/**
 * Vérifie le code SMS saisi par l'utilisateur
 * @param {string} code - Code à 6 chiffres reçu par SMS
 * @returns {Promise<UserCredential>} Credentials de l'utilisateur connecté
 */
export const verifyCode = async (code) => {
  if (!window.confirmationResult) {
    throw new Error('Aucune vérification en cours');
  }
  
  try {
    const result = await window.confirmationResult.confirm(code);
    console.log('✅ Utilisateur connecté:', result.user.phoneNumber);
    return result;
  } catch (error) {
    console.error('❌ Code invalide:', error);
    throw error;
  }
};

export { app, auth };
export default auth;
