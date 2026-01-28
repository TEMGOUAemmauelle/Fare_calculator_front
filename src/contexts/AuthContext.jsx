/**
 * @fileoverview AuthContext - Contexte d'authentification Firebase par téléphone
 * 
 * Gère l'état d'authentification global de l'application :
 * - Connexion par numéro de téléphone + code SMS (Firebase)
 * - Synchronisation avec le backend Django (stockage utilisateur)
 * - Persistance dans localStorage (longue durée)
 * - État utilisateur accessible partout
 * 
 * L'authentification est OPTIONNELLE - l'app fonctionne sans connexion
 * 
 * Architecture Auth :
 * 1. Firebase gère l'authentification (SMS, vérification)
 * 2. Backend Django stocke les utilisateurs (MobileUser model)
 * 3. Les deux sont synchronisés après chaque connexion
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, setupRecaptcha, sendVerificationCode, verifyCode } from '../config/firebase';
import { verifyToken as verifyBackendToken } from '../services/authService';

const AuthContext = createContext();

// Clés localStorage
const STORAGE_KEYS = {
  USER: 'fare_calculator_user',
  BACKEND_USER: 'fare_calculator_backend_user',
  PHONE: 'fare_calculator_phone',
  AUTH_PROMPTED: 'fare_calculator_auth_prompted',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null); // Données utilisateur depuis Django
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // États pour le flow d'authentification
  const [verificationStep, setVerificationStep] = useState('phone'); // 'phone' | 'code' | 'success'
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * Synchronise l'utilisateur Firebase avec le backend Django
   * @param {object} firebaseUser - Utilisateur Firebase
   */
  const syncWithBackend = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return null;
    
    try {
      // Obtenir le ID Token Firebase
      const idToken = await firebaseUser.getIdToken();
      
      // Envoyer au backend pour vérification et création/récupération utilisateur
      const response = await verifyBackendToken(idToken);
      
      if (response.success) {
        console.log(`✅ [Auth] Backend sync: ${response.is_new_user ? 'Nouvel utilisateur' : 'Utilisateur existant'}`);
        
        // Stocker les données backend
        setBackendUser(response.user);
        localStorage.setItem(STORAGE_KEYS.BACKEND_USER, JSON.stringify(response.user));
        
        return response;
      }
    } catch (error) {
      console.warn('[Auth] Erreur sync backend (non critique):', error.message);
      // Ne pas bloquer l'auth si le backend échoue - Firebase reste la source de vérité
    }
    
    return null;
  }, []);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const storedPhone = localStorage.getItem(STORAGE_KEYS.PHONE);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedBackendUser = localStorage.getItem(STORAGE_KEYS.BACKEND_USER);
        
        if (storedPhone) {
          setPhoneNumber(storedPhone);
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedBackendUser) {
          setBackendUser(JSON.parse(storedBackendUser));
        }
      } catch (error) {
        console.warn('[Auth] Erreur lecture localStorage:', error);
      }
    };

    loadStoredUser();

    // Écouter les changements d'état Firebase Auth
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber,
            lastLogin: new Date().toISOString(),
          };
          setUser(userData);
          setPhoneNumber(firebaseUser.phoneNumber);
          
          // Persister dans localStorage
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
          localStorage.setItem(STORAGE_KEYS.PHONE, firebaseUser.phoneNumber);
          
          console.log('✅ [Auth] Utilisateur Firebase connecté:', firebaseUser.phoneNumber);
          
          // Synchroniser avec le backend (async, non-bloquant)
          syncWithBackend(firebaseUser);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [syncWithBackend]);

  /**
   * Ouvre le modal d'authentification
   */
  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setVerificationStep('phone');
    setIsAuthModalOpen(true);
  }, []);

  /**
   * Ferme le modal d'authentification
   */
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setVerificationStep('phone');
    // Marquer qu'on a déjà proposé l'auth
    localStorage.setItem(STORAGE_KEYS.AUTH_PROMPTED, 'true');
  }, []);

  /**
   * Envoie le code de vérification SMS
   * @param {string} phone - Numéro de téléphone (format: +237XXXXXXXXX)
   */
  const sendCode = useCallback(async (phone, recaptchaButtonId = 'recaptcha-container') => {
    if (!auth) {
      setAuthError('Firebase non configuré');
      return false;
    }

    setIsSendingCode(true);
    setAuthError(null);

    try {
      // Setup reCAPTCHA
      setupRecaptcha(recaptchaButtonId);
      
      // Envoyer le code
      await sendVerificationCode(phone);
      
      setPhoneNumber(phone);
      setVerificationStep('code');
      console.log('📱 [Auth] Code envoyé à:', phone);
      return true;
    } catch (error) {
      console.error('[Auth] Erreur envoi code:', error);
      
      // Messages d'erreur user-friendly
      let errorMessage = 'Erreur lors de l\'envoi du code';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Vérification reCAPTCHA échouée';
      } else if (error.code === 'auth/billing-not-enabled') {
        errorMessage = 'SMS indisponible. Activez la facturation Firebase ou utilisez un numéro de test.';
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
   * @param {string} code - Code à 6 chiffres
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
      
      // Persister dans localStorage (longue durée)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.PHONE, result.user.phoneNumber);
      
      // ✅ Synchroniser avec le backend Django
      const backendResponse = await syncWithBackend(result.user);
      
      setVerificationStep('success');
      
      // Fermer le modal après animation de succès
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1500);
      
      console.log('✅ [Auth] Connexion réussie:', result.user.phoneNumber);
      if (backendResponse?.is_new_user) {
        console.log('🆕 [Auth] Nouveau compte créé dans la base de données');
      }
      
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

  /**
   * Déconnexion (rarement utilisé selon les specs)
   */
  const logout = useCallback(async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setBackendUser(null);
      setPhoneNumber(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.BACKEND_USER);
      localStorage.removeItem(STORAGE_KEYS.PHONE);
      console.log('👋 [Auth] Déconnexion');
    } catch (error) {
      console.error('[Auth] Erreur déconnexion:', error);
    }
  }, []);

  /**
   * Vérifie si on doit proposer l'authentification
   * (première visite ou après un certain temps)
   */
  const shouldPromptAuth = useCallback(() => {
    // Si déjà connecté, non
    if (user) return false;
    
    // Si Firebase non configuré, non
    if (!auth) return false;
    
    // Si déjà proposé cette session, non
    const prompted = localStorage.getItem(STORAGE_KEYS.AUTH_PROMPTED);
    if (prompted) return false;
    
    return true;
  }, [user]);

  const value = {
    // État
    user,
    backendUser, // Données utilisateur depuis Django (id, display_name, etc.)
    phoneNumber,
    isAuthenticated: !!user,
    isLoading,
    isAuthModalOpen,
    authError,
    verificationStep,
    isSendingCode,
    isVerifying,
    
    // Actions
    openAuthModal,
    closeAuthModal,
    sendCode,
    confirmCode,
    logout,
    shouldPromptAuth,
    syncWithBackend, // Pour re-sync manuel si nécessaire
    
    // Helpers
    isFirebaseConfigured: !!auth,
    displayName: backendUser?.display_name || phoneNumber || null,
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
