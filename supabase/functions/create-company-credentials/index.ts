import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, companyId } = await req.json();

    console.log('Creating credentials for:', { email, companyId });

    // First, try to update existing credentials
    const { data: existing, error: checkError } = await supabase
      .from('company_credentials')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('company_credentials')
        .update({
          password_hash: password,
          is_hashed: false,
          company_id: companyId,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        throw updateError;
      }

      console.log('Updated existing credentials');
    } else {
      // Create new
      const { error: insertError } = await supabase
        .from('company_credentials')
        .insert({
          email,
          password_hash: password,
          is_hashed: false,
          company_id: companyId
        });

      if (insertError) {
        throw insertError;
      }

      console.log('Created new credentials');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error creating credentials:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);