import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogMessageRequest {
  companyId: string
  customerPhone: string
  customerName?: string
  messageContent: string
  messageType: string
  metadata?: any
}

interface LogMessageResponse {
  success: boolean
  logId?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { companyId, customerPhone, customerName, messageContent, messageType, metadata }: LogMessageRequest = await req.json()

    // Validações básicas
    if (!companyId || !customerPhone || !messageContent || !messageType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Preparar dados do log
    const logData = {
      company_id: companyId,
      customer_phone: customerPhone,
      customer_name: customerName || 'Unknown',
      message_content: messageContent,
      message_type: messageType,
      created_at: new Date().toISOString()
    }

    // Adicionar metadata se fornecida
    if (metadata) {
      logData.message_content += ` | Metadata: ${JSON.stringify(metadata)}`
    }

    // Inserir log
    const { data: log, error: logError } = await supabase
      .from('ai_conversation_logs')
      .insert(logData)
      .select()
      .single()

    if (logError) {
      console.error('❌ Erro ao inserir log:', logError)
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao salvar log'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log de sucesso
    console.log(`📝 Log criado: ${messageType} - ${customerPhone} - ${companyId}`)

    return new Response(JSON.stringify({
      success: true,
      logId: log.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no Message Logger:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
