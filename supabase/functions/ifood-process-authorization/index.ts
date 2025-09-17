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
    const { authorizationCode, deviceCode, environment, companyId, storeName } = body

    if (!authorizationCode || !deviceCode || !companyId) {
      return new Response(
        JSON.stringify({ error: 'Código de autorização, device code e company ID são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // iFood API base URL
    const baseUrl = environment === 'production' 
      ? 'https://merchant-api.ifood.com.br/authentication/v1.0' 
      : 'https://merchant-api-sandbox.ifood.com.br/authentication/v1.0'

    console.log(`🔐 Processando código de autorização para ambiente: ${environment}`)

    try {
      // Step 2: Exchange authorization code for access token
      const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grantType': 'authorization_code',
          'clientId': clientId,
          'clientSecret': clientSecret,
          'authorizationCode': authorizationCode,
          'authorizationCodeVerifier': deviceCode,
        }),
      })

      const tokenData = await tokenResponse.json()
      console.log('🔐 Token exchange response:', { 
        status: tokenResponse.status,
        hasAccessToken: !!tokenData.accessToken,
        hasRefreshToken: !!tokenData.refreshToken
      })

      if (tokenResponse.ok && tokenData.accessToken) {
        // Step 3: Get merchant information using the access token
        const merchantResponse = await fetch(`${baseUrl.replace('/authentication/v1.0', '')}/merchant/v1.0/merchants`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenData.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        const merchantData = await merchantResponse.json()
        console.log('🏪 Merchant data response:', { 
          status: merchantResponse.status,
          merchantCount: merchantData?.length || 0
        })

        let merchantId = null
        let merchantName = storeName || 'Loja iFood'

        if (merchantResponse.ok && merchantData && merchantData.length > 0) {
          // Use the first merchant (usually there's only one per authorization)
          const merchant = merchantData[0]
          merchantId = merchant.id
          merchantName = merchant.name || merchantName
          console.log('🏪 Merchant encontrado:', { id: merchantId, name: merchantName })
        }

        // Step 4: Create integration record in database
        const { data: integration, error: dbError } = await supabase
          .from('ifood_integrations')
          .insert({
            company_id: companyId,
            merchant_id: merchantId,
            store_name: merchantName,
            environment: environment || 'sandbox',
            is_active: true,
            notes: `Integração criada via código de autorização em ${new Date().toLocaleDateString('pt-BR')}`,
            created_by: user.id
          })
          .select()
          .single()

        if (dbError) {
          console.error('❌ Erro ao salvar integração:', dbError)
          throw new Error(`Erro ao salvar integração: ${dbError.message}`)
        }

        console.log('✅ Integração criada com sucesso:', integration.id)

        return new Response(
          JSON.stringify({ 
            success: true,
            integration: {
              id: integration.id,
              merchantId: merchantId,
              storeName: merchantName,
              environment: environment || 'sandbox'
            },
            message: 'Integração iFood criada com sucesso!'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } else {
        console.error('❌ Erro no token exchange:', tokenData)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Código de autorização inválido ou expirado: ${tokenData.message || 'Erro desconhecido'}` 
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
          error: `Erro ao processar autorização: ${apiError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Erro na função ifood-process-authorization:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})