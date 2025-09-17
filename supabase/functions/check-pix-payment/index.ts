import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckPixPaymentRequest {
  paymentId: string;
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
    const body: CheckPixPaymentRequest = await req.json()
    const { paymentId } = body

    console.log('🔍 Verificando status do pagamento:', paymentId)

    // Get payment record from database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('mercado_pago_payments')
      .select(`
        *,
        mercado_pago_config!inner(access_token, sandbox_mode)
      `)
      .eq('payment_id', paymentId)
      .single()

    if (paymentError || !paymentRecord) {
      console.error('❌ Pagamento não encontrado:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Pagamento não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get access token from config
    const accessToken = paymentRecord.mercado_pago_config.access_token
    const sandboxMode = paymentRecord.mercado_pago_config.sandbox_mode

    if (!accessToken) {
      console.error('❌ Access token não encontrado')
      return new Response(
        JSON.stringify({ error: 'Configuração do Mercado Pago inválida' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check payment status with Mercado Pago API
    const mpApiUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`

    console.log('🔄 Consultando Mercado Pago:', { paymentId, sandbox: sandboxMode })

    const mpResponse = await fetch(mpApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const mpResult = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('❌ Erro na API do Mercado Pago:', mpResult)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao consultar status do pagamento',
          details: mpResult
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const currentStatus = mpResult.status
    const previousStatus = paymentRecord.status

    console.log('📊 Status do pagamento:', { 
      paymentId, 
      previousStatus, 
      currentStatus,
      statusDetail: mpResult.status_detail 
    })

    // Update payment status if changed
    if (currentStatus !== previousStatus) {
      const updateData: any = {
        status: currentStatus,
        updated_at: new Date().toISOString()
      }

      // If payment was approved, save approval timestamp
      if (currentStatus === 'approved' && previousStatus !== 'approved') {
        updateData.approved_at = new Date().toISOString()
        console.log('✅ Pagamento aprovado!')
      }

      const { error: updateError } = await supabase
        .from('mercado_pago_payments')
        .update(updateData)
        .eq('payment_id', paymentId)

      if (updateError) {
        console.error('⚠️ Erro ao atualizar status no banco:', updateError)
      } else {
        console.log('✅ Status atualizado no banco:', currentStatus)
      }
    }

    // Return current payment status
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: paymentId,
          status: currentStatus,
          status_detail: mpResult.status_detail,
          external_reference: mpResult.external_reference,
          transaction_amount: mpResult.transaction_amount,
          date_approved: mpResult.date_approved,
          date_created: mpResult.date_created,
          date_of_expiration: mpResult.date_of_expiration,
          qr_code: paymentRecord.qr_code,
          qr_code_base64: paymentRecord.qr_code_base64
        }
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
