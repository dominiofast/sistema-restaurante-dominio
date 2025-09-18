/**
 * Auto-configuration service for delivery methods
 * 
 * This service handles automatic creation of delivery_methods records
 * for companies that don't have them, using intelligent business rules.
 */

// SUPABASE REMOVIDO
import { getAutoCreationConfig, DeliveryMethodsConfig } from '@/utils/deliveryMethodsFallback';
import { recoverFromError, logError, categorizeError } from '@/utils/errorRecovery';
import { recordDeliveryMethodsAutoCreated } from '@/utils/deliveryMethodsMonitoring';

export interface AutoConfigResult {
  success: boolean;
  data?: DeliveryMethodsConfig;
  error?: string;
  created?: boolean;
}

/**
 * Auto-create delivery methods configuration for a company
 * 
 * @param companyId - Company UUID
 * @param companyName - Company name for business rules
 * @param companySlug - Company slug for business rules
 * @returns Promise with the result of auto-configuration
 */
export async function autoCreateDeliveryMethods(
  companyId: string,
  companyName?: string,
  companySlug?: string
): Promise<AutoConfigResult> {
  try {
    console.log('🔧 [AutoConfig] Iniciando auto-configuração para:', { companyId, companyName, companySlug });

    // Verificar se já existe registro (double-check)
    const { data: existing, error: checkError } = /* await supabase REMOVIDO */ null
      /* .from REMOVIDO */ ; //'delivery_methods')
      /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
      /* .eq\( REMOVIDO */ ; //'company_id', companyId)
      /* .single\( REMOVIDO */ ; //);

    if (existing && !checkError) {
      console.log('✅ [AutoConfig] Registro já existe, retornando configuração existente');
      return {
        success: true,
        data: {
          ...existing,
          source: 'database'
        },
        created: false
      };
    }

    // Obter configuração baseada nas regras de negócio
    const config = getAutoCreationConfig(companyName, companySlug);
    
    console.log('📝 [AutoConfig] Criando registro com configuração:', config);

    // Criar o registro
    const { data: newRecord, error: insertError } = /* await supabase REMOVIDO */ null
      /* .from REMOVIDO */ ; //'delivery_methods')
      /* .insert\( REMOVIDO */ ; //{
        company_id: companyId,
        delivery: config.delivery,
        pickup: config.pickup,
        eat_in: config.eat_in
      })
      /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
      /* .single\( REMOVIDO */ ; //);

    if (insertError) {
      console.error('❌ [AutoConfig] Erro ao inserir registro:', insertError);
      
      // Verificar se é erro de duplicata (race condition)
      if (insertError.code === '23505') {
        console.log('🔄 [AutoConfig] Registro criado por outro processo, buscando existente');
        
        // Tentar buscar o registro que foi criado
        const { data: raceData, error: raceError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'delivery_methods')
          /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
          /* .eq\( REMOVIDO */ ; //'company_id', companyId)
          /* .single\( REMOVIDO */ ; //);

        if (raceData && !raceError) {
          return {
            success: true,
            data: {
              ...raceData,
              source: 'database'
            },
            created: false
          };
        }
      }

      return {
        success: false,
        error: `Erro ao criar configurações: ${insertError.message}`,
      };
    }

    console.log('✅ [AutoConfig] Registro criado com sucesso:', newRecord);

    const resultConfig = {
      ...newRecord,
      source: 'auto-created' as const
    };

    // Record auto-creation event
    recordDeliveryMethodsAutoCreated(companyId, companyName, resultConfig);

    return {
      success: true,
      data: resultConfig,
      created: true
    };

  } catch (error) {
    console.error('❌ [AutoConfig] Erro inesperado:', error);
    return {
      success: false,
      error: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Validate that a company has delivery methods configuration
 * If not, auto-create it
 * 
 * @param companyId - Company UUID
 * @param companyName - Company name
 * @param companySlug - Company slug
 * @returns Promise with delivery methods configuration
 */
export async function ensureDeliveryMethodsExist(
  companyId: string,
  companyName?: string,
  companySlug?: string
): Promise<DeliveryMethodsConfig> {
  const context = `ensureDeliveryMethods for ${companyName || companyId}`;
  
  const operation = async (): Promise<DeliveryMethodsConfig> => {
    // Primeiro, tentar buscar configuração existente
    const { data: existing, error: fetchError } = /* await supabase REMOVIDO */ null
      /* .from REMOVIDO */ ; //'delivery_methods')
      /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
      /* .eq\( REMOVIDO */ ; //'company_id', companyId)
      /* .single\( REMOVIDO */ ; //);

    if (existing && !fetchError) {
      return {
        ...existing,
        source: 'database'
      };
    }

    // Se não existe, auto-criar
    if (fetchError?.code === 'PGRST116') {
      console.log('📝 [EnsureConfig] Configuração não encontrada, auto-criando...');
      
      const result = await autoCreateDeliveryMethods(companyId, companyName, companySlug);
      
      if (result.success && result.data) {
        return result.data;
      }
      
      // Se falhou ao criar, lançar erro para tentar recovery
      throw new Error(`Auto-creation failed: ${result.error}`);
    }

    // Outros erros
    throw fetchError || new Error('Unknown fetch error');
  };

  const fallback = (): DeliveryMethodsConfig => {
    console.warn('⚠️ [EnsureConfig] Usando configuração de fallback');
    const fallbackConfig = getAutoCreationConfig(companyName, companySlug);
    return {
      ...fallbackConfig,
      source: 'fallback'
    };
  };

  const recoveryResult = await recoverFromError(
    operation,
    fallback,
    {
      context,
      retryConfig: {
        maxAttempts: 2, // Menos tentativas para operações de configuração
        baseDelay: 1000,
        maxDelay: 3000
      }
    }
  );

  if (recoveryResult.success && recoveryResult.data) {
    return recoveryResult.data;
  }

  // Se tudo falhou, log do erro e usar fallback final
  if (recoveryResult.error) {
    logError(recoveryResult.error, context, {
      companyId,
      companyName,
      companySlug,
      attempts: recoveryResult.attempts,
      recoveryMethod: recoveryResult.recoveryMethod
    });
  }

  // Fallback final garantido
  return fallback();
}

/**
 * Batch create delivery methods for multiple companies
 * Useful for migrations or bulk operations
 * 
 * @param companies - Array of company data
 * @returns Promise with results for each company
 */
export async function batchCreateDeliveryMethods(
  companies: Array<{ id: string; name?: string; slug?: string }>
): Promise<Array<{ companyId: string; result: AutoConfigResult }>> {
  const results: Array<{ companyId: string; result: AutoConfigResult }> = [];

  for (const company of companies) {
    try {
      const result = await autoCreateDeliveryMethods(company.id, company.name, company.slug);
      results.push({
        companyId: company.id,
        result
      });
    } catch (error) {
      results.push({
        companyId: company.id,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      });
    }
  }

  return results;
}

/**
 * Repair inconsistent delivery methods configurations
 * Ensures all companies have at least one delivery option enabled
 * 
 * @param companyId - Company UUID (optional, if not provided, repairs all)
 * @returns Promise with repair results
 */
export async function repairDeliveryMethods(companyId?: string): Promise<{
  repaired: number;
  errors: Array<{ companyId: string; error: string }>;
}> {
  try {
    let query = supabase
      /* .from REMOVIDO */ ; //'delivery_methods')
      /* .select\( REMOVIDO */ ; //'company_id, delivery, pickup, eat_in');

    if (companyId) {
      query = query/* .eq\( REMOVIDO */ ; //'company_id', companyId);
    }

    const { data: allConfigs, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    const toRepair = allConfigs?.filter(config => 
      !config.delivery && !config.pickup && !config.eat_in
    ) || [];

    console.log(`🔧 [Repair] Encontradas ${toRepair.length} configurações para reparar`);

    let repaired = 0;
    const errors: Array<{ companyId: string; error: string }> = [];

    for (const config of toRepair) {
      try {
        // Habilitar pickup como padrão para configurações inválidas
        const { error: updateError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'delivery_methods')
          /* .update\( REMOVIDO */ ; //{
            pickup: true,
            updated_at: new Date().toISOString()
          })
          /* .eq\( REMOVIDO */ ; //'company_id', config.company_id);

        if (updateError) {
          errors.push({
            companyId: config.company_id,
            error: updateError.message
          });
        } else {
          repaired++;
          console.log(`✅ [Repair] Reparada configuração para empresa: ${config.company_id}`);
        }
      } catch (error) {
        errors.push({
          companyId: config.company_id,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return { repaired, errors };

  } catch (error) {
    console.error('❌ [Repair] Erro no processo de reparo:', error);
    return {
      repaired: 0,
      errors: [{
        companyId: companyId || 'all',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }]
    };
  }
}