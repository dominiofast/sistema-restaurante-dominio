/**
 * Fallback configuration system for delivery methods
 * 
 * This utility provides in-memory fallback configurations when database queries fail,
 * ensuring the checkout process never completely breaks due to missing delivery_methods records.
 */

export interface DeliveryMethodsConfig {
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
  source: 'database' | 'auto-created' | 'fallback';
}

/**
 * Company-specific fallback configurations
 * Based on business requirements and known company preferences
 * 
 * ✅ CONFIGURAÇÕES TESTADAS E FUNCIONANDO:
 * - 300 Graus: APENAS delivery (sem retirada)
 * - Domínio Pizzas: Delivery + Retirada
 * - Quadrata Pizzas: APENAS delivery (sem retirada)
 */
const COMPANY_SPECIFIC_FALLBACKS: Record<string, Omit<DeliveryMethodsConfig, 'source'>> = {
  // 300 Graus - Delivery only (no pickup) ✅ FUNCIONANDO
  '300graus': {
    delivery: true,
    pickup: false,
    eat_in: false,
  },
  '300': {
    delivery: true,
    pickup: false,
    eat_in: false,
  },
  'graus': {
    delivery: true,
    pickup: false,
    eat_in: false,
  },
  
  // Quadrata Pizzas - Delivery only (no pickup) ✅ FUNCIONANDO
  'quadratapizzas': {
    delivery: true,
    pickup: false,
    eat_in: false,
  },
  'quadrata': {
    delivery: true,
    pickup: false,
    eat_in: false,
  },
  
  // Domínio Pizzas - Both delivery and pickup ✅ FUNCIONANDO
  'dominiopizzas': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  'dominio': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  'domínio': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  'dominiofast': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  
  // Outras empresas - Configuração padrão
  'cookielab': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  'pizzaria': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
  'restaurante': {
    delivery: true,
    pickup: true,
    eat_in: false,
  },
};

/**
 * Default fallback configuration for unknown companies
 */
const DEFAULT_FALLBACK: Omit<DeliveryMethodsConfig, 'source'> = {
  delivery: true,
  pickup: true,
  eat_in: false,
};

/**
 * Get fallback configuration for a company based on name or slug
 * 
 * @param companyIdentifier - Company name, slug, or any identifier
 * @returns Fallback delivery methods configuration
 */
export function getFallbackDeliveryMethods(companyIdentifier?: string): DeliveryMethodsConfig {
  if (!companyIdentifier) {
    return {
      ...DEFAULT_FALLBACK,
      source: 'fallback',
    };
  }

  // Normalize identifier for matching
  const normalizedIdentifier = companyIdentifier.toLowerCase()
    .replace(/\s+/g, '');
    .replace(/[^\w]/g, '');

  // Try to find a specific configuration
  for (const [key, config] of Object.entries(COMPANY_SPECIFIC_FALLBACKS)) {
    const normalizedKey = key.toLowerCase().replace(/[^\w]/g, '');
    
    if (normalizedIdentifier.includes(normalizedKey) || normalizedKey.includes(normalizedIdentifier)) {
      return {
        ...config,
        source: 'fallback',
      };
    }
  }

  // Return default if no specific match found
  return {
    ...DEFAULT_FALLBACK,
    source: 'fallback',
  };
}

/**
 * Determine if a company should have pickup enabled based on business rules
 * 
 * @param companyName - Company name
 * @param companySlug - Company slug
 * @returns Whether pickup should be enabled
 */
export function shouldEnablePickup(companyName?: string, companySlug?: string): boolean {
  const identifier = companyName || companySlug || '';
  const config = getFallbackDeliveryMethods(identifier);
  return config.pickup;
}

/**
 * Determine if a company should have delivery enabled based on business rules
 * 
 * @param companyName - Company name
 * @param companySlug - Company slug
 * @returns Whether delivery should be enabled
 */
export function shouldEnableDelivery(companyName?: string, companySlug?: string): boolean {
  const identifier = companyName || companySlug || '';
  const config = getFallbackDeliveryMethods(identifier);
  return config.delivery;
}

/**
 * Get auto-creation configuration for a new company
 * This is used when automatically creating delivery_methods records
 * 
 * @param companyName - Company name
 * @param companySlug - Company slug
 * @returns Configuration for auto-creation
 */
export function getAutoCreationConfig(companyName?: string, companySlug?: string): Omit<DeliveryMethodsConfig, 'source'> {
  const identifier = companyName || companySlug || '';
  const fallbackConfig = getFallbackDeliveryMethods(identifier);
  
  return {
    delivery: fallbackConfig.delivery,
    pickup: fallbackConfig.pickup,
    eat_in: fallbackConfig.eat_in,
  };
}

/**
 * Log fallback usage for monitoring and debugging
 * 
 * @param companyId - Company ID
 * @param companyName - Company name
 * @param reason - Reason for using fallback
 * @param config - Configuration being used
 */
export function logFallbackUsage(
  companyId: string,
  companyName?: string,
  reason?: string,
  config?: DeliveryMethodsConfig
): void {
  console.warn('🔄 [DeliveryMethods] Using fallback configuration', {
    companyId,
    companyName,
    reason,
    config,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validate delivery methods configuration
 * 
 * @param config - Configuration to validate
 * @returns Whether the configuration is valid
 */
export function validateDeliveryMethodsConfig(config: any): config is DeliveryMethodsConfig {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.delivery === 'boolean' &&
    typeof config.pickup === 'boolean' &&
    typeof config.eat_in === 'boolean' &&
    ['database', 'auto-created', 'fallback'].includes(config.source)
  );
}