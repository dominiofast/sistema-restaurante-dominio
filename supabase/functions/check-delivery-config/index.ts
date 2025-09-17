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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Buscar todas as empresas com "dominio" no nome
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name')
      .ilike('name', '%dominio%')

    if (companiesError) {
      throw companiesError
    }

    const results = []
    
    for (const company of companies || []) {
      // Buscar configuração de entrega
      const { data: deliveryMethods, error: deliveryError } = await supabaseClient
        .from('delivery_methods')
        .select('*')
        .eq('company_id', company.id)
        .single()

      results.push({
        company: company,
        deliveryMethods: deliveryMethods,
        error: deliveryError?.message || null,
        hasPickup: deliveryMethods?.pickup || false,
        hasDelivery: deliveryMethods?.delivery || false
      })
    }

    return new Response(
      JSON.stringify({
        companies: results,
        summary: {
          total: results.length,
          withPickup: results.filter(r => r.hasPickup).length,
          withDelivery: results.filter(r => r.hasDelivery).length,
          withoutConfig: results.filter(r => r.error).length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
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