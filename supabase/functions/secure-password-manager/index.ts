import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LoginRequest {
  action: 'secure_login';
  email: string;
  password: string;
}

interface HashPasswordRequest {
  action: 'hash_password';
  password: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, email, password } = await req.json()
    
    console.log(`🔐 Secure Password Manager: Action ${action} for email ${email?.substring(0, 3)}***`)

    if (action === 'secure_login') {
      return await handleSecureLogin(supabaseClient, email, password)
    } else if (action === 'hash_password') {
      return await handleHashPassword(password, email)
    } else {
      throw new Error('Ação não reconhecida')
    }

  } catch (error) {
    console.error('❌ Secure Password Manager Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleSecureLogin(supabaseClient: any, email: string, password: string) {
  try {
    // Buscar credencial no banco
    const { data: credential, error } = await supabaseClient
      .from('company_credentials')
      .select('password_hash, is_hashed, company_id')
      .eq('email', email?.toLowerCase()?.trim())
      .single()

    if (error) {
      console.log(`⚠️ Credencial não encontrada para ${email}:`, error.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Credencial não encontrada' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Se a senha não está hashada, fazer comparação direta (inseguro - será migrado)
    if (!credential.is_hashed) {
      const isValid = password === credential.password_hash
      console.log(`🔑 Login texto plano para ${email}: ${isValid ? 'SUCESSO' : 'FALHA'}`)
      
      // Log de segurança para senhas em texto plano
      await supabaseClient
        .from('ai_security_logs')
        .insert({
          company_id: credential.company_id,
          event_type: 'plaintext_password_login',
          severity: 'HIGH',
          description: `Login tentativa com senha em texto plano para ${email}`,
          metadata: { success: isValid, email }
        })

      return new Response(
        JSON.stringify({ success: isValid }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Para senhas hashadas, usar bcrypt
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
    const isValid = await bcrypt.compare(password, credential.password_hash)
    
    console.log(`🔐 Login hashado para ${email}: ${isValid ? 'SUCESSO' : 'FALHA'}`)

    // Log de segurança
    await supabaseClient
      .from('ai_security_logs')
      .insert({
        company_id: credential.company_id,
        event_type: 'secure_login_attempt',
        severity: isValid ? 'INFO' : 'MEDIUM',
        description: `Tentativa de login ${isValid ? 'bem-sucedida' : 'falhada'} para ${email}`,
        metadata: { success: isValid, email, hashed: true }
      })

    return new Response(
      JSON.stringify({ success: isValid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Erro no login seguro:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno na verificação de senha' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

async function handleHashPassword(password: string, email?: string) {
  try {
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts')
    const saltRounds = 12 // Segurança alta
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    console.log(`🔐 Senha hashada com sucesso para ${email || 'email não fornecido'}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        hashedPassword,
        message: 'Senha hashada com sucesso' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('❌ Erro no hash da senha:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro ao fazer hash da senha' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}