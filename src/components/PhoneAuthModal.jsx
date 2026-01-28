/**
 * @fileoverview PhoneAuthModal - Modal d'authentification multi-mode
 * 
 * Design minimaliste et élégant :
 * - MODE SMS (billing=true) : Téléphone → Code SMS + Google OAuth
 * - MODE GOOGLE ONLY (billing=false) : Seulement Google OAuth
 * 
 * - Style "Bottom Sheet" sur mobile
 * - Modal centré épuré sur desktop
 * - Animations fluides et discrètes
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  X, ArrowRight, Loader2, AlertCircle, Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Préfixes téléphoniques Cameroun
const CAMEROON_PREFIX = '+237';
const PHONE_REGEX = /^[0-9]{9}$/; 

// Icône Google personnalisée
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function PhoneAuthModal() {
  const { t } = useTranslation();
  const {
    isAuthModalOpen,
    closeAuthModal,
    verificationStep,
    setVerificationStep,
    authError,
    setAuthError,
    isSendingCode,
    isVerifying,
    sendCode,
    confirmCode,
    loginWithGoogle,
    isBillingEnabled,
  } = useAuth();

  const [phoneInput, setPhoneInput] = useState('');
  const [codeInput, setCodeInput] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  
  // Détection mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const phoneInputRef = useRef(null);
  const codeInputRefs = useRef([]);

  // Focus management
  useEffect(() => {
    if (isAuthModalOpen) {
      if (verificationStep === 'phone') {
        setTimeout(() => phoneInputRef.current?.focus(), 400); 
      } else if (verificationStep === 'code') {
        setTimeout(() => codeInputRefs.current[0]?.focus(), 400);
      }
    }
  }, [isAuthModalOpen, verificationStep]);

  // Reset on close
  useEffect(() => {
    if (!isAuthModalOpen) {
      setTimeout(() => {
        setPhoneInput('');
        setCodeInput(['', '', '', '', '', '']);
        setLocalError('');
      }, 300);
    }
  }, [isAuthModalOpen]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneInput(value);
    setLocalError('');
    if (setAuthError) setAuthError(null);
  };

  // MODE SMS : Envoyer le code
  const handleSendCode = async () => {
    if (!PHONE_REGEX.test(phoneInput)) {
      setLocalError(t('auth.invalid_phone_format'));
      return;
    }
    const fullNumber = `${CAMEROON_PREFIX}${phoneInput}`;
    await sendCode(fullNumber, 'recaptcha-container');
  };

  // MODE SMS : Gestion des inputs du code
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...codeInput];
    newCode[index] = value.slice(-1);
    setCodeInput(newCode);
    setLocalError('');
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeInput[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCodeInput(newCode);
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = async (code) => {
    await confirmCode(code);
  };

  // GOOGLE : Connexion OAuth
  const handleGoogleSignIn = async () => {
    await loginWithGoogle();
  };

  const displayError = localError || authError;

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = isMobile ? {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" }
  } : {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-none md:p-6">
            
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full md:w-[480px] md:max-h-[85vh] bg-white rounded-t-[24px] md:rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="relative px-6 py-8 md:p-8">
                
                {/* Bouton Fermer */}
                <button 
                  onClick={closeAuthModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6 pr-8">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {verificationStep === 'success' 
                      ? t('auth.success_title') 
                      : verificationStep === 'code' 
                      ? t('auth.verify_title') 
                      : t('auth.phone_title')
                    }
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 font-medium">
                    {verificationStep === 'success'
                      ? t('auth.success_subtitle')
                      : verificationStep === 'code'
                      ? <>{t('auth.code_sent_to')} <span className="text-black font-bold whitespace-nowrap">{CAMEROON_PREFIX} {phoneInput}</span></>
                      : isBillingEnabled 
                        ? t('auth.phone_subtitle') 
                        : t('auth.google_only_subtitle')
                    }
                  </p>
                </div>

                {/* Body */}
                <div className="min-h-[200px]">
                  <AnimatePresence mode="wait">
                    
                    {/* ========================================== */}
                    {/* ÉTAPE 1 : Saisie Téléphone (SMS) ou Google seul */}
                    {/* ========================================== */}
                    {verificationStep === 'phone' && (
                      <motion.div
                        key="phone"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-5">
                          
                          {/* MODE BILLING : Input Téléphone + SMS */}
                          {isBillingEnabled && (
                            <>
                              {/* Input Téléphone */}
                              <div className="relative group">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  {t('auth.phone_label')}
                                </label>
                                <div className="flex items-center pb-2 border-b-2 border-gray-100 group-focus-within:border-black transition-colors">
                                  <span className="text-lg font-medium text-gray-400 mr-3 select-none">
                                    {CAMEROON_PREFIX}
                                  </span>
                                  <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    value={phoneInput}
                                    onChange={handlePhoneChange}
                                    placeholder="6XX XXX XXX"
                                    className="w-full text-lg font-bold text-gray-900 placeholder:text-gray-200 outline-none bg-transparent"
                                    maxLength={9}
                                  />
                                </div>
                              </div>

                              {/* Error Message */}
                              {displayError && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }} 
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm"
                                >
                                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                  <span className="leading-tight">{displayError}</span>
                                </motion.div>
                              )}
                              
                              {/* Bouton Envoyer Code */}
                              <button
                                onClick={handleSendCode}
                                disabled={isSendingCode || phoneInput.length !== 9}
                                className="w-full py-4 bg-[#141414] text-white rounded-xl font-bold text-sm tracking-wide hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-gray-200"
                              >
                                {isSendingCode ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    {t('auth.send_code')}
                                    <ArrowRight className="w-4 h-4" />
                                  </>
                                )}
                              </button>

                              {/* Séparateur */}
                              <div className="flex items-center gap-4 my-2">
                                <div className="flex-1 h-px bg-gray-100"></div>
                                <span className="text-xs text-gray-400 font-medium">{t('auth.or')}</span>
                                <div className="flex-1 h-px bg-gray-100"></div>
                              </div>
                            </>
                          )}

                          {/* Error Message (MODE GOOGLE ONLY) */}
                          {!isBillingEnabled && displayError && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm"
                            >
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="leading-tight">{displayError}</span>
                            </motion.div>
                          )}

                          {/* Bouton Google (toujours visible) */}
                          <button
                            onClick={handleGoogleSignIn}
                            disabled={isVerifying}
                            className={`w-full ${isBillingEnabled ? 'py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300' : 'py-4 bg-[#141414] text-white hover:bg-black shadow-lg shadow-gray-200'} rounded-xl font-medium text-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3`}
                          >
                            {isVerifying ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <GoogleIcon />
                                {t('auth.continue_with_google')}
                              </>
                            )}
                          </button>
                          
                          {/* Lien Passer (optionnel) */}
                          <button
                            onClick={closeAuthModal}
                            className="w-full py-2 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
                          >
                            {t('auth.skip')}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ========================================== */}
                    {/* ÉTAPE 2 : Saisie Code SMS (MODE BILLING) */}
                    {/* ========================================== */}
                    {verificationStep === 'code' && (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between gap-2 mb-8">
                          {codeInput.map((digit, index) => (
                            <div key={index} className="flex-1 max-w-[50px]">
                              <input
                                ref={(el) => (codeInputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                onPaste={handleCodePaste}
                                className="w-full h-14 text-center text-2xl font-bold bg-gray-50 rounded-xl border border-gray-100 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all caret-transparent"
                                maxLength={1}
                              />
                            </div>
                          ))}
                        </div>

                        {isVerifying ? (
                          <div className="flex justify-center my-4 text-gray-400 gap-2 text-sm font-medium">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('auth.verifying')}
                          </div>
                        ) : displayError ? (
                          <p className="text-center text-red-500 text-sm mb-6 bg-red-50 p-2 rounded-lg font-medium">
                            {displayError}
                          </p>
                        ) : null}

                        <div className="text-center">
                          <button
                            onClick={handleSendCode}
                            disabled={isSendingCode} 
                            className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-wider transition-colors py-2 px-4"
                          >
                            {t('auth.resend_code')}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ========================================== */}
                    {/* ÉTAPE 3 : Succès */}
                    {/* ========================================== */}
                    {verificationStep === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-md shadow-green-50">
                          <Smartphone className="w-10 h-10" />
                        </div>
                        <p className="text-center text-gray-500 text-sm">
                          {t('auth.login_success_msg')}
                        </p>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
                
                {/* Recaptcha hidden container */}
                <div id="recaptcha-container"></div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
