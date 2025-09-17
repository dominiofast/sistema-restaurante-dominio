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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // ID da Domínio Pizzas
    const dominioId = '550e8400-e29b-41d4-a716-446655440001'
    
    console.log('🔍 TESTE: Verificando configuração da Domínio...')

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', dominioId)
      .single()

    console.log('📋 Empresa:', company?.name)

    // Buscar configuração AI
    const { data: aiConfig } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('company_id', dominioId)
      .eq('is_active', true)
      .single()

    console.log('🤖 Config AI:', aiConfig?.agent_name)

    // Buscar integração WhatsApp
    const { data: integration } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', dominioId)
      .eq('purpose', 'primary')
      .single()

    console.log('📱 WhatsApp Integration:', integration?.instance_key)

    // Testar chamada ao AI processor
    console.log('🧠 Testando AI processor...')
    
    const aiResult = await fetch(`${supabaseUrl}/functions/v1/ai-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Olá, quem é você?',
        phoneNumber: '69999999999',
        companyId: dominioId,
        customerName: 'Teste',
        context: `Empresa: ${company?.name}`
      })
    })

    const aiData = await aiResult.json()
    console.log('🎯 Resposta AI:', aiData)

    return new Response(JSON.stringify({
      success: true,
      company: company?.name,
      aiAgent: aiConfig?.agent_name,
      integration: integration?.instance_key,
      aiResponse: aiData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})