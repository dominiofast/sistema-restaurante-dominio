import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  companyId: string;
  role?: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🔄 Starting user creation process...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, companyId, role = 'user', name }: CreateUserRequest = await req.json();
    
    console.log('📝 Request data:', {
      email,
      companyId,
      role,
      name: name || 'Not provided'
    });

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('🔐 Supabase clients initialized');
    
    // Admin client for creating users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Regular client for other operations
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);

    // 1. Check if email already exists and provide context
    console.log('🔍 Checking if email already exists:', email);
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao verificar usuários existentes',
          code: 'CHECK_ERROR'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const existingUserWithEmail = existingUser.users.find(user => user.email === email);
    if (existingUserWithEmail) {
      console.log('⚠️ Email already exists:', email, 'User ID:', existingUserWithEmail.id);
      
      // Check if user is already associated with this company
      const { data: existingAssociation } = await supabaseAdmin
        .from('user_companies')
        .select('*')
        .eq('user_id', existingUserWithEmail.id)
        .eq('company_id', companyId)
        .single();

      if (existingAssociation) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Este usuário já está associado a esta empresa',
            code: 'USER_ALREADY_ASSOCIATED',
            suggestion: 'Tente fazer login ou redefina a senha se necessário'
          }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Este email já está cadastrado no sistema',
            code: 'EMAIL_EXISTS',
            suggestion: 'Usuário existe mas não está associado a esta empresa. Entre em contato com o administrador para associar o usuário.',
            existingUserId: existingUserWithEmail.id
          }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // 2. Create user with Supabase Admin API
    console.log('👤 Creating user in Supabase Auth...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name || email.split('@')[0],
        company_id: companyId,
        role: role
      }
    });

    if (createError || !newUser.user) {
      console.error('❌ Error creating user:', createError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError?.message || 'Erro ao criar usuário' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ User created in Auth:', newUser.user.id);

    // 3. Create user-company association using admin client
    console.log('🔗 Creating user-company association...');
    const { error: associationError } = await supabaseAdmin
      .from('user_companies')
      .insert({
        user_id: newUser.user.id,
        company_id: companyId,
        role: role,
        is_active: true
      });

    if (associationError) {
      console.error('❌ Error creating user-company association:', associationError);
      // Try to cleanup the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao associar usuário à empresa' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ User-company association created');

    // 4. Mark any pending creation as completed
    await supabase
      .from('pending_user_creation')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        user_id: newUser.user.id
      })
      .eq('email', email)
      .eq('company_id', companyId)
      .eq('status', 'pending');

    console.log('✅ User creation process completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário criado com sucesso!',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role: role
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('💥 Unexpected error in user creation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);