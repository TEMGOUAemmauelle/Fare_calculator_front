/**
 * @fileoverview PhoneAuthModal - Modal d'authentification par téléphone
 * 
 * Design minimaliste et élégant :
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

export default function PhoneAuthModal() {
  const { t } = useTranslation();
  const {
    isAuthModalOpen,
    closeAuthModal,
    verificationStep,
    authError,
    isSendingCode,
    isVerifying,
    sendCode,
    confirmCode,
  } = useAuth();

  const [phoneInput, setPhoneInput] = useState('');
  const [codeInput, setCodeInput] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  
  // Détection mobile simple
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

  // Reset on clear
  useEffect(() => {
    if (!isAuthModalOpen) {
      setTimeout(() => {
        setPhoneInput('');
        setCodeInput(['', '', '', '', '', '']);
        setLocalError('');
      }, 300);
    }
  }, [isAuthModalOpen]);

  // Réinitialiser l'erreur locale quand l'input change
  useEffect(() => {
    if (authError || localError) {
        // Optionnel : auto-dismiss after delay? Non, l'utilisateur doit corriger.
    }
  }, [phoneInput, codeInput]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneInput(value);
    setLocalError('');
  };

  const handleSendCode = async () => {
    if (!PHONE_REGEX.test(phoneInput)) {
      setLocalError(t('auth.invalid_phone_format'));
      return;
    }
    const fullNumber = `${CAMEROON_PREFIX}${phoneInput}`;
    await sendCode(fullNumber, 'recaptcha-container');
  };

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

  const displayError = localError || authError;

  // Variants Animation
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

          {/* Wrapper pour centrage desktop / bottom mobile */}
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center pointer-events-none">
            
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full md:w-[420px] bg-white rounded-t-[24px] md:rounded-[24px] shadow-2xl overflow-hidden"
            >
              {/* Contenu */}
              <div className="relative px-6 py-8 md:p-8">
                
                {/* Bouton Fermer */}
                <button 
                  onClick={closeAuthModal}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-8 pr-8">
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
                      : t('auth.phone_subtitle')
                    }
                  </p>
                </div>

                {/* Body with Height Animation */}
                <div className="min-h-[160px]">
                  <AnimatePresence mode="wait">
                    
                    {/* Étape 1 : Saisie Téléphone */}
                    {verificationStep === 'phone' && (
                      <motion.div
                        key="phone"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                         <div className="space-y-6">
                            <div className="relative group">
                              <label className="absolute -top-2 left-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white px-1 ml-1">
                                {t('auth.phone_label')}
                              </label>
                              <div className="flex items-center pb-2 border-b-2 border-gray-100 group-focus-within:border-black transition-colors pt-2">
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
                            
                            <button
                              onClick={handleSendCode}
                              disabled={isSendingCode || phoneInput.length !== 9}
                              className="w-full py-4 bg-[#141414] text-white rounded-xl font-bold text-sm tracking-wide hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-gray-200"
                            >
                              {isSendingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.send_code')}
                              {!isSendingCode && <ArrowRight className="w-4 h-4" />}
                            </button>
                         </div>
                      </motion.div>
                    )}

                    {/* Étape 2 : Saisie Code */}
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

                    {/* Étape 3 : Succès */}
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
