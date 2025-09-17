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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Buscar empresa "Domínio Pizzas"
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name')
      .ilike('name', '%dominio%pizzas%')

    if (companiesError) {
      throw companiesError
    }

    console.log('Empresas encontradas:', companies)

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Empresa Domínio Pizzas não encontrada',
          companies: companies 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const company = companies[0]
    console.log('Empresa selecionada:', company)

    // Buscar configurações de entrega
    const { data: deliveryMethods, error: deliveryError } = await supabaseClient
      .from('delivery_methods')
      .select('*')
      .eq('company_id', company.id)

    if (deliveryError) {
      throw deliveryError
    }

    console.log('Métodos de entrega:', deliveryMethods)

    return new Response(
      JSON.stringify({
        company: company,
        deliveryMethods: deliveryMethods,
        debug: {
          foundCompanies: companies.length,
          hasDeliveryConfig: deliveryMethods && deliveryMethods.length > 0
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