import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Usar service role para contornar RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔍 Buscando empresa 300 graus...')
    
    // Buscar empresa 300 graus
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id, name, slug')
      .eq('slug', '300graus')

    if (companiesError) {
      console.error('❌ Erro ao buscar empresas:', companiesError)
      throw companiesError
    }

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Empresa 300 graus não encontrada',
          companies: companies 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const company = companies[0]
    console.log('🏢 Empresa encontrada:', company)

    // Verificar se já existe configuração
    console.log('🔍 Verificando configuração existente...')
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('delivery_methods')
      .select('*')
      .eq('company_id', company.id)

    if (existingError) {
      console.error('❌ Erro ao verificar configuração existente:', existingError)
      throw existingError
    }

    console.log('📋 Configuração existente:', existing)

    let result
    if (existing && existing.length > 0) {
      // Atualizar configuração existente
      console.log('🔄 Atualizando configuração existente...')
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('delivery_methods')
        .update({
          delivery: true,
          pickup: false,
          eat_in: false,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', company.id)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError)
        throw updateError
      }

      result = updated
      console.log('✅ Configuração atualizada:', updated)
    } else {
      // Criar nova configuração
      console.log('➕ Criando nova configuração...')
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('delivery_methods')
        .insert({
          company_id: company.id,
          delivery: true,
          pickup: false,
          eat_in: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError)
        throw insertError
      }

      result = inserted
      console.log('✅ Configuração criada:', inserted)
    }

    // Verificar resultado final
    console.log('🔍 Verificando resultado final...')
    const { data: final, error: finalError } = await supabaseAdmin
      .from('delivery_methods')
      .select('*')
      .eq('company_id', company.id)

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError)
      throw finalError
    }

    console.log('🎉 Configuração final:', final)
    
    const success = final && final.length > 0 && final[0].delivery && !final[0].pickup
    
    return new Response(
      JSON.stringify({
        success: success,
        message: success 
          ? 'Configuração aplicada com sucesso - apenas delivery habilitado'
          : 'Configuração aplicada mas pode não estar como esperado',
        company: company,
        configuration: final?.[0] || null,
        action: existing && existing.length > 0 ? 'updated' : 'created'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})