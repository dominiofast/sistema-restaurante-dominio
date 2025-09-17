import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePixPaymentRequest {
  companyId: string;
  amount: number;
  description: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  externalReference?: string;
}

interface MercadoPagoPixResponse {
  id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  date_of_expiration: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const body: CreatePixPaymentRequest = await req.json()
    const { companyId, amount, description, customerEmail, customerName, customerPhone, externalReference } = body

    console.log('🔄 Criando cobrança PIX:', { companyId, amount, description })

    // Get Mercado Pago configuration
    const { data: mpConfig, error: mpError } = await supabase
      .from('mercado_pago_config')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    if (mpError || !mpConfig) {
      console.error('❌ Configuração do Mercado Pago não encontrada:', mpError)
      return new Response(
        JSON.stringify({ error: 'Mercado Pago não configurado para esta empresa' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!mpConfig.access_token || !mpConfig.pix_enabled) {
      console.error('❌ Mercado Pago não configurado corretamente')
      return new Response(
        JSON.stringify({ error: 'PIX não habilitado ou credenciais não configuradas' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate expiration date (default 30 minutes)
    const expirationMinutes = mpConfig.pix_expiration_minutes || 30
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes)

    // Prepare payment data for Mercado Pago API
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      external_reference: externalReference || `order-${Date.now()}`,
      date_of_expiration: expirationDate.toISOString(),
      payer: {
        email: customerEmail || 'customer@example.com',
        first_name: customerName || 'Cliente',
        identification: {
          type: 'CPF',
          number: '11111111111' // Default CPF for test
        }
      },
      notification_url: `${supabaseUrl}/functions/v1/mercado-pago-webhook`
    }

    // Make request to Mercado Pago API
    const mpApiUrl = mpConfig.sandbox_mode 
      ? 'https://api.mercadopago.com/v1/payments'
      : 'https://api.mercadopago.com/v1/payments'

    console.log('🔄 Enviando para Mercado Pago:', { url: mpApiUrl, sandbox: mpConfig.sandbox_mode })

    const mpResponse = await fetch(mpApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpConfig.access_token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${companyId}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    })

    const mpResult = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('❌ Erro na API do Mercado Pago:', mpResult)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao gerar cobrança PIX',
          details: mpResult
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Cobrança PIX criada com sucesso:', mpResult.id)

    // Extract PIX data
    const pixData: MercadoPagoPixResponse = {
      id: mpResult.id,
      status: mpResult.status,
      qr_code: mpResult.point_of_interaction?.transaction_data?.qr_code || '',
      qr_code_base64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64 || '',
      ticket_url: mpResult.point_of_interaction?.transaction_data?.ticket_url || '',
      date_of_expiration: mpResult.date_of_expiration
    }

    // Store payment record in database for tracking
    const { error: dbError } = await supabase
      .from('mercado_pago_payments')
      .insert({
        company_id: companyId,
        payment_id: mpResult.id,
        external_reference: externalReference,
        amount: amount,
        status: mpResult.status,
        qr_code: pixData.qr_code,
        qr_code_base64: pixData.qr_code_base64,
        expires_at: expirationDate.toISOString(),
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('⚠️ Erro ao salvar no banco, mas PIX foi criado:', dbError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: pixData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
