/**
 * @fileoverview Composant FormInput - Champ de saisie réutilisable
 * 
 * Input élégant et flexible avec :
 * - Validation intégrée
 * - Messages d'erreur
 * - Icônes optionnelles
 * - États loading/disabled
 * - Support types variés
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  autoComplete,
  min,
  max,
  step,
  pattern,
  maxLength,
  rows = 3,
  className = '',
  inputClassName = '',
  containerClassName = '',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isTextarea = type === 'textarea';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const hasError = Boolean(error);
  const hasValue = Boolean(value);

  // Classes selon état
  const borderColor = hasError 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : isFocused
    ? 'border-blue-500 ring-4 ring-blue-500/10'
    : 'border-gray-200 hover:border-gray-300';

  const iconColor = hasError 
    ? 'text-red-500'
    : isFocused || hasValue
    ? 'text-blue-600'
    : 'text-gray-400';

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  };

  const inputProps = {
    id: name,
    name,
    value: value || '',
    onChange,
    onBlur: (e) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    onFocus: () => setIsFocused(true),
    placeholder,
    required,
    disabled: disabled || loading,
    autoComplete,
    min,
    max,
    step,
    pattern,
    maxLength,
    className: `
      w-full px-4 py-3 
      ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${(clearable && hasValue) || isPassword || loading ? 'pr-12' : ''}
      bg-white disabled:bg-gray-50 
      border-2 ${borderColor}
      rounded-xl
      text-gray-900 placeholder:text-gray-400
      text-base font-medium
      transition-all duration-200
      focus:outline-none
      disabled:cursor-not-allowed disabled:text-gray-500
      ${inputClassName}
    `,
  };

  const InputComponent = isTextarea ? 'textarea' : 'input';

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-red-500 text-base">*</span>
          )}
        </label>
      )}

      {/* Container input */}
      <div className={`relative ${className}`}>
        {/* Icône gauche */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className={`w-5 h-5 ${iconColor} transition-colors`} />
          </div>
        )}

        {/* Input/Textarea */}
        <InputComponent
          {...inputProps}
          type={isTextarea ? undefined : inputType}
          rows={isTextarea ? rows : undefined}
        />

        {/* Icônes droite */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Loading */}
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 text-blue-600" />
            </motion.div>
          )}

          {/* Clear button */}
          {clearable && hasValue && !loading && !disabled && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              tabIndex={-1}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </motion.button>
          )}

          {/* Toggle password visibility */}
          {isPassword && !loading && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </motion.button>
          )}

          {/* Icône validation */}
          {!loading && !hasError && hasValue && !isPassword && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}

          {/* Icône erreur */}
          {hasError && !loading && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* Icône droite (si configurée) */}
        {Icon && iconPosition === 'right' && !clearable && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className={`w-5 h-5 ${iconColor} transition-colors`} />
          </div>
        )}
      </div>

      {/* Messages helper/erreur */}
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-start gap-1.5"
          >
            {hasError && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${hasError ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Composant FormSelect - Select stylisé
 */
export function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  className = '',
  containerClassName = '',
}) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error);
  
  const displayPlaceholder = placeholder || t('common.select');

  const borderColor = hasError 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : isFocused
    ? 'border-blue-500 ring-4 ring-blue-500/10'
    : 'border-gray-200 hover:border-gray-300';

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={name}
          className="mb-2 text-sm font-semibold text-gray-900 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 text-base">*</span>}
        </label>
      )}

      <div className={`relative ${className}`}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon className={`w-5 h-5 ${hasError ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-400'} transition-colors`} />
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            ${Icon ? 'pl-12' : ''}
            pr-10
            bg-white disabled:bg-gray-50 
            border-2 ${borderColor}
            rounded-xl
            text-gray-900
            text-base font-medium
            transition-all duration-200
            focus:outline-none
            disabled:cursor-not-allowed
            appearance-none
            cursor-pointer
          `}
        >
          {displayPlaceholder && (
            <option value="" disabled>
              {displayPlaceholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.labelKey ? t(option.labelKey) : option.label}
            </option>
          ))}
        </select>

        {/* Flèche custom */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-start gap-1.5"
          >
            {hasError && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${hasError ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
