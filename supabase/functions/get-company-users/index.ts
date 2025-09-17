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
    const { company_id } = await req.json()
    
    console.log('Fetching users for company:', company_id)

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

    // Get users associated with this company from user_companies table
    const { data: userCompanies, error: userCompaniesError } = await supabaseAdmin
      .from('user_companies')
      .select('user_id, role, is_active')
      .eq('company_id', company_id)
      .eq('is_active', true)

    if (userCompaniesError) {
      console.error('Error fetching user companies:', userCompaniesError)
      throw userCompaniesError
    }

    console.log('User companies found:', userCompanies?.length || 0)

    if (!userCompanies || userCompanies.length === 0) {
      console.log('No user companies found for company:', company_id)
      return new Response(
        JSON.stringify({ 
          success: true, 
          users: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get auth users data for these user IDs
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      throw authError
    }

    // Create a map of user companies for easy lookup
    const userCompanyMap = new Map(userCompanies.map(uc => [uc.user_id, uc]))

    // Filter and transform users
    const users = authUsers.users
      ?.filter(user => userCompanyMap.has(user.id))
      .map(user => {
        const userCompany = userCompanyMap.get(user.id)
        return {
          id: user.id,
          email: user.email,
          company_id: company_id,
          created_at: user.created_at,
          name: user.user_metadata?.name || user.raw_user_meta_data?.name || 'Nome não informado',
          role: userCompany?.role || 'user'
        }
      }) || []

    console.log('Found users:', users.length)

    return new Response(
      JSON.stringify({ 
        success: true, 
        users
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-company-users function:', error)
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