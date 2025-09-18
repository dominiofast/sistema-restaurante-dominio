import { useState, useCallback } from 'react';
import { isValidEmail, isStrongPassword, frontendRateLimit } from '@/utils/securityHeaders';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface SecurityValidationHook {
  validateEmail: (email: string) => ValidationResult;
  validatePassword: (password: string) => ValidationResult;
  checkRateLimit: (key: string, maxAttempts?: number) => boolean;
  resetRateLimit: (key: string) => void;
  sanitizeInput: (input: string) => string;
}

export const useSecurityValidation = (): SecurityValidationHook => {
  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email é obrigatório')
    } else if (!isValidEmail(email)) {
      errors.push('Email inválido')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [])

  const validatePassword = useCallback((password: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Senha é obrigatória')
      return { isValid: false, errors };
    }
    
    const result = isStrongPassword(password)
    return {
      isValid: result.valid,
      errors: result.errors
    };
  }, [])

  const checkRateLimit = useCallback((
    key: string, 
    maxAttempts: number = 5
  ): boolean => {
    return frontendRateLimit.isAllowed(key, maxAttempts)
  }, [])

  const resetRateLimit = useCallback((key: string): void => {
    frontendRateLimit.reset(key)
  }, [])

  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
  }, [])

  return {
    validateEmail,
    validatePassword,
    checkRateLimit,
    resetRateLimit,
    sanitizeInput
  };
};
