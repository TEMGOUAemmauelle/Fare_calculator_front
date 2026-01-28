/**
 * @fileoverview AuthContext - Contexte d'authentification Firebase Multi-Mode
 * 
 * Gère l'état d'authentification global avec 3 modes :
 * 
 * 1. MODE SMS (VITE_FIREBASE_BILLING_ENABLED=true) :
 *    - Connexion par numéro de téléphone + code SMS
 *    - Nécessite plan Firebase Blaze (payant)
 * 
 * 2. MODE MOT DE PASSE (VITE_FIREBASE_BILLING_ENABLED=false) :
 *    - Connexion par numéro de téléphone + mot de passe
 *    - Gratuit, utilise Firebase Email/Password en interne
 * 
 * 3. GOOGLE SIGN-IN (toujours disponible) :
 *    - Connexion OAuth Google
 *    - Compatible avec les autres modes
 * 
 * Les comptes sont compatibles entre les modes grâce au linking Firebase.
 * L'authentification reste OPTIONNELLE - l'app fonctionne sans connexion.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  auth, 
  FIREBASE_BILLING_ENABLED,
  setupRecaptcha, 
  sendVerificationCode, 
  verifyCode,
  signInWithGoogle,
  emailToPhone
} from '../config/firebase';
import { verifyToken as verifyBackendToken } from '../services/authService';

const AuthContext = createContext();

// Clés localStorage
const STORAGE_KEYS = {
  USER: 'fare_calculator_user',
  BACKEND_USER: 'fare_calculator_backend_user',
  PHONE: 'fare_calculator_phone',
  AUTH_PROMPT_COUNT: 'fare_calculator_auth_prompt_count',
  AUTH_METHOD: 'fare_calculator_auth_method', // 'phone_sms' | 'google'
};

// Modes d'authentification
export const AUTH_MODES = {
  PHONE_SMS: 'phone_sms',         // Mode billing activé
  GOOGLE: 'google',               // OAuth Google
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // États pour le flow d'authentification
  const [verificationStep, setVerificationStep] = useState('phone'); // 'phone' | 'code' | 'password' | 'success'
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // Mode utilisé pour la connexion courante

  /**
   * Détermine le mode d'auth principal (SMS ou Mot de passe)
   */
  const primaryAuthMode = FIREBASE_BILLING_ENABLED ? AUTH_MODES.PHONE_SMS : AUTH_MODES.GOOGLE;

  /**
   * Synchronise l'utilisateur Firebase avec le backend Django
   */
  const syncWithBackend = useCallback(async (firebaseUser, authMethodUsed = null) => {
    if (!firebaseUser) return null;
    
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await verifyBackendToken(idToken, authMethodUsed);
      
      if (response.success) {
        console.log(`✅ [Auth] Backend sync: ${response.is_new_user ? 'Nouvel utilisateur' : 'Utilisateur existant'}`);
        setBackendUser(response.user);
        localStorage.setItem(STORAGE_KEYS.BACKEND_USER, JSON.stringify(response.user));
        return response;
      }
    } catch (error) {
      console.warn('[Auth] Erreur sync backend (non critique):', error.message);
    }
    
    return null;
  }, []);

  /**
   * Extrait le numéro de téléphone depuis un utilisateur Firebase
   */
  const extractPhoneNumber = useCallback((firebaseUser) => {
    // Mode SMS : numéro dans phoneNumber
    if (firebaseUser.phoneNumber) {
      return firebaseUser.phoneNumber;
    }
    
    // Mode mot de passe : numéro dans displayName ou email simulé
    if (firebaseUser.displayName && firebaseUser.displayName.startsWith('+')) {
      return firebaseUser.displayName;
    }
    
    if (firebaseUser.email && firebaseUser.email.endsWith('@farecalc.phone')) {
      return emailToPhone(firebaseUser.email);
    }
    
    // Google : pas de numéro de téléphone
    return null;
  }, []);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const storedPhone = localStorage.getItem(STORAGE_KEYS.PHONE);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedBackendUser = localStorage.getItem(STORAGE_KEYS.BACKEND_USER);
        const storedMethod = localStorage.getItem(STORAGE_KEYS.AUTH_METHOD);
        
        if (storedPhone) setPhoneNumber(storedPhone);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedBackendUser) setBackendUser(JSON.parse(storedBackendUser));
        if (storedMethod) setAuthMethod(storedMethod);
      } catch (error) {
        console.warn('[Auth] Erreur lecture localStorage:', error);
      }
    };

    loadStoredUser();

    // Écouter les changements d'état Firebase Auth
    if (auth) {
      let syncInProgress = false; // Éviter les appels multiples
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const phone = extractPhoneNumber(firebaseUser);
          
          const userData = {
            uid: firebaseUser.uid,
            phoneNumber: phone,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            lastLogin: new Date().toISOString(),
          };
          
          setUser(userData);
          if (phone) setPhoneNumber(phone);
          
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          if (phone) localStorage.setItem(STORAGE_KEYS.PHONE, phone);
          
          console.log('✅ [Auth] Utilisateur Firebase connecté:', phone || firebaseUser.email);
          
          // Sync backend (une seule fois)
          if (!syncInProgress) {
            syncInProgress = true;
            await syncWithBackend(firebaseUser, authMethod);
            syncInProgress = false;
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [syncWithBackend, extractPhoneNumber, authMethod]);

  // ===========================================================================
  // ACTIONS COMMUNES
  // ===========================================================================

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setVerificationStep('phone');
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setVerificationStep('phone');
    const currentCount = Number(localStorage.getItem(STORAGE_KEYS.AUTH_PROMPT_COUNT) || 0);
    localStorage.setItem(STORAGE_KEYS.AUTH_PROMPT_COUNT, String(currentCount + 1));
  }, []);

  // ===========================================================================
  // MODE SMS (BILLING ENABLED)
  // ===========================================================================

  /**
   * Envoie le code de vérification SMS
   */
  const sendCode = useCallback(async (phone, recaptchaButtonId = 'recaptcha-container') => {
    if (!auth) {
      setAuthError('Firebase non configuré');
      return false;
    }

    setIsSendingCode(true);
    setAuthError(null);

    try {
      setupRecaptcha(recaptchaButtonId);
      await sendVerificationCode(phone);
      
      setPhoneNumber(phone);
      setAuthMethod(AUTH_MODES.PHONE_SMS);
      setVerificationStep('code');
      console.log('📱 [Auth] Code envoyé à:', phone);
      return true;
    } catch (error) {
      console.error('[Auth] Erreur envoi code:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi du code';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Vérification reCAPTCHA échouée';
      } else if (error.code === 'auth/billing-not-enabled') {
        errorMessage = 'SMS indisponible. Le plan Firebase Blaze n\'est pas activé.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'Quota SMS atteint. Réessayez plus tard.';
      }
      
      setAuthError(errorMessage);
      return false;
    } finally {
      setIsSendingCode(false);
    }
  }, []);

  /**
   * Vérifie le code SMS saisi
   */
  const confirmCode = useCallback(async (code) => {
    setIsVerifying(true);
    setAuthError(null);

    try {
      const result = await verifyCode(code);
      
      const userData = {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
        lastLogin: new Date().toISOString(),
      };
      
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.PHONE, result.user.phoneNumber);
      localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, AUTH_MODES.PHONE_SMS);
      
      await syncWithBackend(result.user, AUTH_MODES.PHONE_SMS);
      
      setVerificationStep('success');
      setTimeout(() => setIsAuthModalOpen(false), 1500);
      
      console.log('✅ [Auth] Connexion SMS réussie:', result.user.phoneNumber);
      return true;
    } catch (error) {
      console.error('[Auth] Erreur vérification code:', error);
      
      let errorMessage = 'Code invalide';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Code incorrect. Vérifiez et réessayez.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Code expiré. Demandez un nouveau code.';
      }
      
      setAuthError(errorMessage);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [syncWithBackend]);

  // ===========================================================================
  // GOOGLE SIGN-IN
  // ===========================================================================

  /**
   * Connexion avec Google
   */
  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      setAuthError('Firebase non configuré');
      return false;
    }

    setIsVerifying(true);
    setAuthError(null);

    try {
      const { user: firebaseUser, isNewUser, email, displayName, photoURL } = await signInWithGoogle();
      
      const userData = {
        uid: firebaseUser.uid,
        phoneNumber: null, // Google n'a pas de téléphone
        email,
        displayName,
        photoURL,
        lastLogin: new Date().toISOString(),
      };
      
      setUser(userData);
      setPhoneNumber(null);
      setAuthMethod(AUTH_MODES.GOOGLE);
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.removeItem(STORAGE_KEYS.PHONE); // Pas de téléphone avec Google
      localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, AUTH_MODES.GOOGLE);
      
      await syncWithBackend(firebaseUser, AUTH_MODES.GOOGLE);
      
      setVerificationStep('success');
      setTimeout(() => setIsAuthModalOpen(false), 1500);
      
      console.log(`✅ [Auth] Connexion Google ${isNewUser ? '(nouveau compte)' : ''}: ${email}`);
      return true;
    } catch (error) {
      console.error('[Auth] Erreur connexion Google:', error);
      
      let errorMessage = 'Erreur de connexion Google';
      if (error.message === 'POPUP_CLOSED') {
        errorMessage = null; // Pas d'erreur si l'utilisateur ferme la popup
      } else if (error.message === 'ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL') {
        errorMessage = 'Ce compte Google est déjà associé à un numéro de téléphone.';
      }
      
      if (errorMessage) setAuthError(errorMessage);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [syncWithBackend]);

  // ===========================================================================
  // DÉCONNEXION
  // ===========================================================================

  const logout = useCallback(async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setBackendUser(null);
      setPhoneNumber(null);
      setAuthMethod(null);
      
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.BACKEND_USER);
      localStorage.removeItem(STORAGE_KEYS.PHONE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_METHOD);
      
      console.log('👋 [Auth] Déconnexion');
    } catch (error) {
      console.error('[Auth] Erreur déconnexion:', error);
    }
  }, []);

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  const shouldPromptAuth = useCallback(() => {
    if (user) return false;
    if (!auth) return false;
    const promptCount = Number(localStorage.getItem(STORAGE_KEYS.AUTH_PROMPT_COUNT) || 0);
    if (promptCount === 0) return true;
    return Math.random() < 0.1;
  }, [user]);

  // ===========================================================================
  // CONTEXT VALUE
  // ===========================================================================

  const value = {
    // État
    user,
    backendUser,
    phoneNumber,
    isAuthenticated: !!user,
    isLoading,
    isAuthModalOpen,
    authError,
    verificationStep,
    isSendingCode,
    isVerifying,
    authMethod,
    
    // Mode d'auth
    primaryAuthMode,
    isBillingEnabled: FIREBASE_BILLING_ENABLED,
    AUTH_MODES,
    
    // Actions communes
    openAuthModal,
    closeAuthModal,
    logout,
    shouldPromptAuth,
    syncWithBackend,
    setVerificationStep,
    setAuthError,
    
    // Mode SMS (billing)
    sendCode,
    confirmCode,
    
    // Google
    loginWithGoogle,
    
    // Helpers
    isFirebaseConfigured: !!auth,
    displayName: backendUser?.display_name || user?.displayName || phoneNumber || user?.email || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
