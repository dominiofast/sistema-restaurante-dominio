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
    const { company_id, company_domain, company_name } = await req.json()
    
    console.log('Creating admin user for company:', { company_id, company_domain, company_name })

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

    // Generate admin email and temporary password
    const adminEmail = `${company_domain}@dominiopizzas.com.br`
    const tempPassword = `admin${company_domain}123` // Senha temporária que deve ser alterada

    // Create the admin user
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        company_domain: company_domain,
        company_id: company_id,
        name: `Admin ${company_name}`,
        role: 'admin'
      }
    })

    if (createUserError) {
      console.error('Error creating admin user:', createUserError)
      throw createUserError
    }

    // Insert company credentials record for login tracking
    const { error: credentialsError } = await supabaseAdmin
      .from('company_credentials')
      .insert({
        company_id: company_id,
        email: adminEmail,
        password_hash: 'managed_by_auth' // Placeholder since real hash is in auth.users
      })

    if (credentialsError) {
      console.error('Error creating company credentials:', credentialsError)
      // Don't throw - this is not critical
    }

    console.log('Successfully created admin user:', newUser.user?.email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        admin_email: adminEmail,
        message: `Admin user created for ${company_name}`,
        temp_password: tempPassword 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-company-admin function:', error)
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