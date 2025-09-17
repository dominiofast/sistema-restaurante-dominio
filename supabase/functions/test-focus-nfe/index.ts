import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  console.log('=== TESTE FOCUS NFE START ===');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { company_id } = await req.json();
    
    console.log('🏢 Company ID:', company_id);
    
    // Buscar configuração fiscal
    const { data: fiscalConfig } = await supabase
      .from('company_fiscal_config')
      .select('*')
      .eq('company_id', company_id)
      .single();

    if (!fiscalConfig) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuração fiscal não encontrada',
        recommendation: 'Configure primeiro os dados fiscais da empresa'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📋 Configuração fiscal encontrada');
    
    // Validar usando função do banco
    const { data: validation } = await supabase
      .rpc('validate_fiscal_config', { p_company_id: company_id });
    
    console.log('✅ Validação:', validation);
    
    // Testar conectividade com Focus NFe
    let focusTest = null;
    if (fiscalConfig.focus_nfe_token) {
      try {
        console.log('🌐 Testando conectividade Focus NFe...');
        
        const ambiente = fiscalConfig.focus_nfe_ambiente || 'homologacao';
        const baseUrl = ambiente === 'producao' 
          ? 'https://api.focusnfe.com.br' 
          : 'https://homologacao.focusnfe.com.br';
        
        // Fazer requisição de teste (consulta simples)
        const testUrl = `${baseUrl}/v2/info`;
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${btoa(fiscalConfig.focus_nfe_token + ':')}`
          }
        });
        
        if (response.ok) {
          const infoData = await response.json();
          focusTest = {
            success: true,
            status: response.status,
            ambiente: ambiente,
            info: infoData,
            message: 'Conectividade Focus NFe OK'
          };
        } else {
          const errorData = await response.text();
          focusTest = {
            success: false,
            status: response.status,
            ambiente: ambiente,
            error: errorData,
            message: 'Erro na conectividade Focus NFe'
          };
        }
        
      } catch (error) {
        focusTest = {
          success: false,
          error: error.message,
          message: 'Erro ao conectar com Focus NFe'
        };
      }
    }
    
    // Atualizar status do último teste
    await supabase
      .from('company_fiscal_config')
      .update({
        ultimo_teste_nfce: new Date().toISOString(),
        status_ultimo_teste: validation?.valid ? 'sucesso' : 'erro_configuracao'
      })
      .eq('company_id', company_id);
    
    // Retornar resultado completo
    return new Response(JSON.stringify({
      success: true,
      company_id: company_id,
      validation: validation,
      focus_connectivity: focusTest,
      fiscal_config: {
        cnpj: fiscalConfig.cnpj,
        razao_social: fiscalConfig.razao_social,
        certificado_validade: fiscalConfig.certificado_validade,
        focus_nfe_ambiente: fiscalConfig.focus_nfe_ambiente,
        certificado_instalado_focus: fiscalConfig.certificado_instalado_focus,
        focus_nfe_habilitado: fiscalConfig.focus_nfe_habilitado
      },
      recommendations: generateRecommendations(validation, focusTest, fiscalConfig),
      integration_status: calculateIntegrationStatus(validation, focusTest)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      integration_status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateRecommendations(validation: any, focusTest: any, fiscalConfig: any): string[] {
  const recommendations = [];
  
  if (validation?.errors?.length > 0) {
    recommendations.push(...validation.errors.map((error: string) => `🔴 ${error}`));
  }
  
  if (validation?.warnings?.length > 0) {
    recommendations.push(...validation.warnings.map((warning: string) => `🟡 ${warning}`));
  }
  
  if (focusTest && !focusTest.success) {
    recommendations.push('🔴 Verificar token Focus NFe - conectividade falhando');
  }
  
  if (!fiscalConfig.certificado_instalado_focus) {
    recommendations.push('🟡 Instalar certificado no Focus NFe');
  }
  
  if (!fiscalConfig.focus_nfe_habilitado) {
    recommendations.push('🟡 Habilitar empresa no Focus NFe (contatar suporte Focus)');
  }
  
  if (new Date(fiscalConfig.certificado_validade) < new Date()) {
    recommendations.push('🔴 URGENTE: Renovar certificado digital vencido');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Configuração está adequada para geração de NFCe');
  }
  
  return recommendations;
}

function calculateIntegrationStatus(validation: any, focusTest: any): string {
  if (validation?.valid && focusTest?.success) {
    return 'ready'; // 100%
  }
  
  if (validation?.valid && !focusTest?.success) {
    return 'config_ok_connectivity_issue'; // 85%
  }
  
  if (!validation?.valid && focusTest?.success) {
    return 'connectivity_ok_config_issue'; // 70%
  }
  
  return 'needs_setup'; // < 50%
}