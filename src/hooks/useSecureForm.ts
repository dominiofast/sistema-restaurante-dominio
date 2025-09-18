import { useState, useCallback } from 'react';
import { validateInput, checkRateLimit, ValidationPresets, type ValidationConfig } from '@/utils/inputValidator';
import { useToast } from '@/hooks/use-toast';

interface FieldConfig extends ValidationConfig {
  name: string;
}

interface UseSecureFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  rateLimitKey?: string;
  maxSubmissions?: number;
}

export const useSecureForm = ({
  fields,
  onSubmit,
  rateLimitKey,
  maxSubmissions = 5
}: UseSecureFormProps) => {
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name: string, value: string) => {
    const fieldConfig = fields.find(f => f.name === name)
    if (!fieldConfig) return { isValid: true, sanitizedValue: value, errors: [] };

    return validateInput(value, fieldConfig)
  }, [fields])

  const handleChange = useCallback((name: string, value: string) => {
    const validation = validateField(name, value)
    
    setValues(prev => ({
      ...prev,
      [name]: validation.sanitizedValue
    }))

    setErrors(prev => ({
      ...prev,
      [name]: validation.errors
    }))
  }, [validateField])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting
    if (rateLimitKey && !checkRateLimit(rateLimitKey, maxSubmissions)) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente.",
        variant: "destructive",
      })
      return;
    }

    setIsSubmitting(true)

    try {
      // Validar todos os campos
      const validationResults: Record<string, any> = {} catch (error) { console.error('Error:', error) };
      const newErrors: Record<string, string[]> = {};
      let hasErrors = false;

      for (const field of fields) {
        const value = values[field.name] || '';
        const validation = validateField(field.name, value)
        
        validationResults[field.name] = validation.sanitizedValue;
        newErrors[field.name] = validation.errors;
        
        if (!validation.isValid) {
          hasErrors = true;
        }
      }

      setErrors(newErrors)

      if (hasErrors) {
        toast({
          title: "Erro de validação",
          description: "Corrija os erros nos campos marcados.",
          variant: "destructive",
        })
        return;
      }

      // Submeter com dados sanitizados
      await onSubmit(validationResults)
      
      // Limpar formulário em caso de sucesso
      setValues({})
      setErrors({})

    } catch (error) {
      console.error('Erro no envio do formulário:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [values, fields, validateField, onSubmit, rateLimitKey, maxSubmissions, toast])

  const getFieldError = useCallback((name: string) => {
    return errors[name]?.[0] || '';
  }, [errors])

  const isFieldInvalid = useCallback((name: string) => {
    return !!(errors[name] && errors[name].length > 0)
  }, [errors])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    getFieldError,
    isFieldInvalid,
    // Preset configurations
    emailField: { ...ValidationPresets.email, name: 'email' },
    passwordField: { ...ValidationPresets.password, name: 'password' },
    phoneField: { ...ValidationPresets.phone, name: 'phone' },
    nameField: { ...ValidationPresets.name, name: 'name' },
  };
};
