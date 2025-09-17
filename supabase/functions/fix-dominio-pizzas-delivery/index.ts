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

    // Verificar se já existe configuração de entrega
    const { data: existingMethods, error: checkError } = await supabaseClient
      .from('delivery_methods')
      .select('*')
      .eq('company_id', company.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    let result
    if (existingMethods) {
      // Atualizar configuração existente para garantir que pickup está habilitado
      const { data: updatedMethods, error: updateError } = await supabaseClient
        .from('delivery_methods')
        .update({
          delivery: true,
          pickup: true,
          eat_in: false
        })
        .eq('company_id', company.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      result = {
        action: 'updated',
        company: company,
        deliveryMethods: updatedMethods,
        message: 'Configuração atualizada com sucesso'
      }
    } else {
      // Criar nova configuração
      const { data: newMethods, error: insertError } = await supabaseClient
        .from('delivery_methods')
        .insert({
          company_id: company.id,
          delivery: true,
          pickup: true,
          eat_in: false
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      result = {
        action: 'created',
        company: company,
        deliveryMethods: newMethods,
        message: 'Configuração criada com sucesso'
      }
    }

    return new Response(
      JSON.stringify(result),
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