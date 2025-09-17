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

    // Try to get the secrets from Supabase
    const clientId = Deno.env.get('IFOOD_CLIENT_ID')
    const clientSecret = Deno.env.get('IFOOD_CLIENT_SECRET')

    const hasConfig = !!(clientId && clientSecret)

    console.log('🔍 iFood config check:', { 
      hasConfig, 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length,
      clientSecretLength: clientSecret?.length 
    })

    // Return configuration status
    return new Response(
      JSON.stringify({
        hasConfig,
        environment: 'sandbox', // Default value, can be changed in UI
        is_active: true, // Default value, can be changed in UI
        ...(hasConfig && {
          credentialsStatus: 'configured',
          lastUpdated: new Date().toISOString()
        })
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-ifood-config:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})