import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { environment = 'sandbox' } = body

    // Get global iFood credentials
    const clientId = Deno.env.get('IFOOD_CLIENT_ID')
    const clientSecret = Deno.env.get('IFOOD_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciais iFood não configuradas. Entre em contato com o suporte.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // iFood API base URL based on environment
    const baseUrl = environment === 'production' 
      ? 'https://merchant-api.ifood.com.br/authentication/v1.0' 
      : 'https://merchant-api-sandbox.ifood.com.br/authentication/v1.0'

    console.log(`🔗 Solicitando código de vínculo para ambiente: ${environment}`)

    try {
      // Fluxo para aplicativo centralizado - Client Credentials
      console.log(`🔗 Solicitando token de acesso (aplicativo centralizado)...`)
      console.log(`📍 URL: ${baseUrl}/oauth/token`)
      console.log(`🔑 Client ID: ${clientId}`)
      
      const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grantType: 'client_credentials',
          clientId: clientId,
          clientSecret: clientSecret,
        }),
      })

      console.log(`📡 Status da resposta: ${tokenResponse.status}`)
      
      const responseText = await tokenResponse.text()
      console.log(`📝 Resposta bruta: ${responseText}`)
      
      let tokenData
      try {
        tokenData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta JSON:', parseError)
        console.error('📝 Resposta que causou erro:', responseText)
        throw new Error(`Resposta inválida da API iFood: ${responseText}`)
      }
      
      console.log('🔗 iFood token response:', { 
        status: tokenResponse.status, 
        hasAccessToken: !!tokenData.accessToken,
        expiresIn: tokenData.expiresIn,
        fullResponse: tokenData
      })

      if (tokenResponse.ok && tokenData.accessToken) {
        // Para aplicativo centralizado, já temos o token de acesso
        // Vamos salvar na tabela ifood_integrations
        const { data: integration, error: integrationError } = await supabase
          .from('ifood_integrations')
          .upsert({
            company_id: (await supabase
              .from('companies')
              .select('id')
              .eq('user_id', user.id)
              .single()).data?.id,
            environment,
            is_active: true,
            store_name: 'Loja Principal',
            notes: `Token obtido automaticamente em ${new Date().toLocaleString('pt-BR')}`,
            created_by: user.id
          }, {
            onConflict: 'company_id,environment'
          })
          .select()
          .single()

        if (integrationError) {
          console.error('❌ Erro ao salvar integração:', integrationError)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            accessToken: tokenData.accessToken,
            expiresIn: tokenData.expiresIn,
            environment,
            message: `Token de acesso obtido com sucesso! Integração configurada automaticamente.`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        console.error('❌ Erro ao solicitar token:', tokenData)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao obter token de acesso: ${tokenData.message || tokenData.error || 'Erro desconhecido'}` 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } catch (apiError) {
      console.error('❌ Erro na API do iFood:', apiError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao conectar com iFood: ${apiError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Erro na função ifood-request-linking-code:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})