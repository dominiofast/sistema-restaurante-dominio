import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { company_id, email, password, name } = await req.json()
    
    console.log('Creating user for company:', { company_id, email, name })

    // Initialize Supabase admin client
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

    // Get company info
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('domain, name')
      .eq('id', company_id)
      .single()

    if (companyError || !company) {
      throw new Error('Empresa não encontrada')
    }

    // Create the user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        company_domain: company.domain,
        company_id: company_id,
        name: name,
        role: 'admin'
      }
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      throw createUserError
    }

    // Insert company credentials record for login tracking
    const { error: credentialsError } = await supabaseAdmin
      .from('company_credentials')
      .insert({
        company_id: company_id,
        email: email,
        password_hash: 'managed_by_auth' // Placeholder since real hash is in auth.users
      })

    if (credentialsError) {
      console.error('Error creating company credentials:', credentialsError)
      // Don't throw - this is not critical
    }

    console.log('Successfully created user:', newUser.user?.email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user?.id,
        email: email,
        message: `Usuário criado para ${company.name}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-company-user function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})