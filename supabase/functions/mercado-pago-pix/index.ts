import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePixRequest {
  companyId: string;
  amount: number;
  description: string;
  customerName?: string;
  customerPhone?: string;
  externalReference?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body: CreatePixRequest = await req.json()
    const { companyId, amount, description, customerName, customerPhone, externalReference } = body

    console.log('🔄 Criando PIX REAL via Mercado Pago:', { companyId, amount })

    // Buscar configuração do Mercado Pago
    const { data: mpConfig, error: configError } = await supabase
      .from('mercado_pago_config')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    if (configError || !mpConfig) {
      throw new Error('Configuração do Mercado Pago não encontrada')
    }

    if (!mpConfig.access_token || !mpConfig.pix_enabled) {
      throw new Error('PIX não habilitado ou credenciais não configuradas')
    }

    // Calcular data de expiração
    const expirationMinutes = mpConfig.pix_expiration_minutes || 30
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes)

    // Dados para API do Mercado Pago
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      external_reference: externalReference || `order-${Date.now()}`,
      date_of_expiration: expirationDate.toISOString(),
      payer: {
        email: customerPhone ? `${customerPhone.replace(/\D/g, '')}@temp.com` : 'customer@example.com',
        first_name: customerName || 'Cliente',
        identification: {
          type: 'CPF',
          number: '11111111111'
        }
      }
    }

    console.log('🔄 Enviando para API Mercado Pago...')

    // Chamar API REAL do Mercado Pago
    const mpApiUrl = mpConfig.sandbox_mode 
      ? 'https://api.mercadopago.com/v1/payments'
      : 'https://api.mercadopago.com/v1/payments'

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
      console.error('❌ Erro na API Mercado Pago:', mpResult)
      throw new Error(mpResult.message || 'Erro ao criar pagamento PIX')
    }

    console.log('✅ PIX REAL criado:', mpResult.id)

    // Salvar no banco para rastreamento
    const { error: dbError } = await supabase
      .from('mercado_pago_payments')
      .insert({
        company_id: companyId,
        payment_id: mpResult.id,
        external_reference: externalReference,
        amount: amount,
        status: mpResult.status,
        qr_code: mpResult.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64,
        expires_at: expirationDate.toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone
      })

    if (dbError) {
      console.error('⚠️ Erro ao salvar no banco:', dbError)
    }

    // Retornar dados REAIS do Mercado Pago
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: mpResult.id,
          status: mpResult.status,
          qr_code: mpResult.point_of_interaction?.transaction_data?.qr_code || '',
          qr_code_base64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64 || '',
          ticket_url: mpResult.point_of_interaction?.transaction_data?.ticket_url || '',
          date_of_expiration: mpResult.date_of_expiration,
          transaction_amount: mpResult.transaction_amount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
