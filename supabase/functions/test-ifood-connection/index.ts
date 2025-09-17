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

    // Check if user is authenticated and is super admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is super admin
    const userRole = user.user_metadata?.role || user.raw_user_meta_data?.role
    if (userRole !== 'super_admin') {
      console.log('User role:', userRole, 'Not super admin')
      return new Response(
        JSON.stringify({ error: 'Acesso negado - apenas super admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { environment } = body

    // Get credentials from environment variables
    const clientId = Deno.env.get('IFOOD_CLIENT_ID')
    const clientSecret = Deno.env.get('IFOOD_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Credenciais iFood não configuradas. Configure primeiro as credenciais.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test iFood API connection - usar o endpoint correto da documentação oficial
    const baseUrl = environment === 'production' 
      ? 'https://merchant-api.ifood.com.br/authentication/v1.0' 
      : 'https://merchant-api-sandbox.ifood.com.br/authentication/v1.0'

    console.log(`Testing iFood connection to ${baseUrl}`)

    try {
      // Try to get OAuth token usando o endpoint oficial da documentação
      const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'grantType': 'client_credentials',
          'clientId': clientId,
          'clientSecret': clientSecret,
        }),
      })

      const tokenData = await tokenResponse.json()
      console.log('Token response:', { status: tokenResponse.status, hasData: !!tokenData })

      if (tokenResponse.ok && tokenData.accessToken) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Conexão com iFood ${environment} funcionando perfeitamente!` 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Erro na autenticação iFood: ${tokenData.message || 'Credenciais inválidas'}` 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } catch (apiError) {
      console.error('iFood API Error:', apiError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro ao conectar com iFood: ${apiError.message}` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in test-ifood-connection:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})