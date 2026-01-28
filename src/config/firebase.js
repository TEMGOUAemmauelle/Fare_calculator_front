/**
 * @fileoverview Configuration Firebase Multi-Mode
 * 
 * Gère 3 modes d'authentification selon la variable VITE_FIREBASE_BILLING_ENABLED :
 * 
 * 1. MODE SMS (billing=true) : Authentification classique par SMS OTP
 *    - L'utilisateur entre son numéro, reçoit un SMS, entre le code
 *    - Nécessite un plan Firebase Blaze (payant)
 * 
 * 2. MODE MOT DE PASSE (billing=false) : Authentification téléphone + mot de passe
 *    - L'utilisateur entre son numéro et un mot de passe
 *    - Utilise Firebase Email/Password avec email simulé (phone@farecalc.local)
 *    - Gratuit, pas de SMS
 * 
 * 3. GOOGLE SIGN-IN : Authentification OAuth Google (toujours disponible)
 *    - L'utilisateur clique "Continuer avec Google"
 *    - Compatible avec les 2 autres modes (Firebase Link Providers)
 * 
 * Les comptes sont compatibles entre les modes grâce au linking Firebase.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  updateProfile
} from 'firebase/auth';

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Mode billing Firebase (SMS réel vs mot de passe)
export const FIREBASE_BILLING_ENABLED = import.meta.env.VITE_FIREBASE_BILLING_ENABLED === 'true';

// Initialiser Firebase seulement si la config est présente
let app = null;
let auth = null;
let googleProvider = null;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Configurer la langue pour les SMS (français par défaut)
  auth.languageCode = 'fr';
  
  // Configurer Google Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account' // Force la sélection du compte
  });
  
  console.log(`🔥 Firebase initialisé (mode: ${FIREBASE_BILLING_ENABLED ? 'SMS' : 'Mot de passe'})`);
} else {
  console.warn('⚠️ Firebase non configuré - Variables d\'environnement manquantes');
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Convertit un numéro de téléphone en email simulé pour Firebase Email Auth
 * @param {string} phoneNumber - Numéro de téléphone (ex: +237699999999)
 * @returns {string} Email simulé (ex: 237699999999@farecalc.phone)
 */
export const phoneToEmail = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return `${cleaned}@farecalc.phone`;
};

/**
 * Extrait le numéro de téléphone depuis un email simulé
 * @param {string} email - Email simulé
 * @returns {string|null} Numéro de téléphone ou null
 */
export const emailToPhone = (email) => {
  if (!email || !email.endsWith('@farecalc.phone')) return null;
  const digits = email.replace('@farecalc.phone', '');
  if (digits.startsWith('237')) {
    return `+${digits}`;
  }
  return `+${digits}`;
};

// ============================================================================
// MODE SMS (BILLING ENABLED)
// ============================================================================

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
  
  // Nettoyer les widgets reCAPTCHA orphelins
  const existingWidgets = document.querySelectorAll('.grecaptcha-badge');
  existingWidgets.forEach(widget => {
    try { widget.remove(); } catch (e) {}
  });
  
  // S'assurer que le container existe
  const container = document.getElementById(buttonId);
  if (!container) {
    console.error(`Container reCAPTCHA #${buttonId} non trouvé dans le DOM`);
    return null;
  }
  
  container.innerHTML = '';
  
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ reCAPTCHA résolu');
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA expiré - Veuillez réessayer');
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (e) {}
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
 * Envoie un code de vérification par SMS (MODE BILLING)
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
 * Vérifie le code SMS saisi par l'utilisateur (MODE BILLING)
 * @param {string} code - Code à 6 chiffres reçu par SMS
 * @returns {Promise<UserCredential>} Credentials de l'utilisateur connecté
 */
export const verifyCode = async (code) => {
  if (!window.confirmationResult) {
    throw new Error('Aucune vérification en cours');
  }
  
  try {
    const result = await window.confirmationResult.confirm(code);
    console.log('✅ Utilisateur connecté (SMS):', result.user.phoneNumber);
    return result;
  } catch (error) {
    console.error('❌ Code invalide:', error);
    throw error;
  }
};

// ============================================================================
// MODE MOT DE PASSE (BILLING DISABLED)
// ============================================================================

/**
 * Crée un compte ou connecte avec téléphone + mot de passe (MODE SANS BILLING)
 * @param {string} phoneNumber - Numéro de téléphone (+237...)
 * @param {string} password - Mot de passe choisi
 * @returns {Promise<{user: User, isNewUser: boolean}>}
 */
export const signInWithPhonePassword = async (phoneNumber, password) => {
  if (!auth) {
    throw new Error('Firebase Auth non initialisé');
  }
  
  const email = phoneToEmail(phoneNumber);
  
  try {
    // D'abord essayer de se connecter
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Connexion réussie (téléphone+mdp):', phoneNumber);
    return { user: result.user, isNewUser: false };
  } catch (signInError) {
    // Si l'utilisateur n'existe pas, créer le compte
    if (signInError.code === 'auth/user-not-found' || 
        signInError.code === 'auth/invalid-credential') {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Mettre à jour le profil avec le numéro de téléphone comme displayName
        await updateProfile(result.user, {
          displayName: phoneNumber
        });
        
        console.log('🆕 Nouveau compte créé (téléphone+mdp):', phoneNumber);
        return { user: result.user, isNewUser: true };
      } catch (createError) {
        // Si le compte existe avec un autre provider (Google par ex.)
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error('ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL');
        }
        throw createError;
      }
    }
    
    // Mauvais mot de passe
    if (signInError.code === 'auth/wrong-password') {
      throw new Error('WRONG_PASSWORD');
    }
    
    throw signInError;
  }
};

/**
 * Vérifie si un compte existe pour ce numéro de téléphone
 * @param {string} phoneNumber - Numéro de téléphone
 * @returns {Promise<boolean>}
 */
export const checkPhoneAccountExists = async (phoneNumber) => {
  if (!auth) return false;
  
  const email = phoneToEmail(phoneNumber);
  
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.warn('Erreur vérification compte:', error);
    return false;
  }
};

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

/**
 * Connexion avec Google OAuth
 * @returns {Promise<{user: User, isNewUser: boolean, email: string, displayName: string}>}
 */
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase ou Google Provider non configuré');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Vérifier si c'est un nouvel utilisateur
    const isNewUser = result._tokenResponse?.isNewUser ?? 
                      user.metadata.creationTime === user.metadata.lastSignInTime;
    
    console.log(`✅ Connexion Google ${isNewUser ? '(nouveau)' : ''}: ${user.email}`);
    
    return {
      user,
      isNewUser,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error('❌ Erreur connexion Google:', error);
    
    // Gestion spéciale: compte existant avec autre méthode
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL');
    }
    
    // Popup fermée par l'utilisateur
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('POPUP_CLOSED');
    }
    
    throw error;
  }
};

/**
 * Lie un compte Google à un compte existant (téléphone)
 * @param {string} googleIdToken - Token Google
 * @returns {Promise<UserCredential>}
 */
export const linkGoogleToPhone = async (googleIdToken) => {
  if (!auth?.currentUser) {
    throw new Error('Aucun utilisateur connecté');
  }
  
  try {
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const result = await linkWithCredential(auth.currentUser, credential);
    console.log('✅ Compte Google lié au compte téléphone');
    return result;
  } catch (error) {
    console.error('❌ Erreur liaison Google:', error);
    throw error;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export { app, auth, googleProvider };
export default auth;
