import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, amount, description, customerName, customerPhone, customerCpf } = await req.json();

    console.log('🔄 Iniciando criação de pagamento Asaas para empresa:', companyId);

    // Buscar configuração do Asaas
    const { data: asaasConfig, error: configError } = await supabaseClient
      .from('asaas_config')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (configError || !asaasConfig) {
      console.error('❌ Configuração Asaas não encontrada:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do Asaas não encontrada' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!asaasConfig.is_active || !asaasConfig.pix_enabled || !asaasConfig.api_key) {
      console.error('❌ Configuração Asaas inválida');
      return new Response(
        JSON.stringify({ success: false, error: 'Asaas não configurado corretamente' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determinar URL da API
    const baseUrl = asaasConfig.sandbox_mode 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';

    console.log('🔄 Usando Asaas URL:', baseUrl);

    // Email baseado no telefone ou padrão
    const customerEmail = customerPhone 
      ? `${customerPhone.replace(/\D/g, '')}@temp.com`
      : 'cliente@temp.com';

    // Criar cobrança no Asaas
    const paymentPayload = {
      billingType: 'PIX',
      value: amount,
      description: description,
      dueDate: new Date().toISOString().split('T')[0], // Hoje
      customer: {
        name: customerName || 'Cliente',
        email: customerEmail,
        cpfCnpj: customerCpf?.replace(/\D/g, '') || ''
      }
    };

    console.log('🔄 Payload para Asaas:', JSON.stringify(paymentPayload, null, 2));

    // Criar cobrança
    const paymentResponse = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': asaasConfig.api_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error('❌ Erro ao criar cobrança no Asaas:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro na API do Asaas: ${paymentResponse.status}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const paymentData = await paymentResponse.json();
    console.log('✅ Cobrança criada:', paymentData.id);

    // Buscar QR Code da cobrança
    const qrCodeResponse = await fetch(`${baseUrl}/payments/${paymentData.id}/pixQrCode`, {
      method: 'GET',
      headers: {
        'access_token': asaasConfig.api_key,
        'Content-Type': 'application/json'
      }
    });

    if (!qrCodeResponse.ok) {
      console.error('❌ Erro ao buscar QR Code:', qrCodeResponse.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao gerar QR Code PIX' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const qrCodeData = await qrCodeResponse.json();
    console.log('✅ QR Code obtido');

    // Salvar pagamento no banco
    const { error: saveError } = await supabaseClient
      .from('asaas_payments')
      .insert({
        company_id: companyId,
        payment_id: paymentData.id,
        amount: amount,
        payment_method: 'PIX',
        status: paymentData.status,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_cpf: customerCpf,
        pix_qr_code: qrCodeData.payload,
        pix_qr_code_base64: qrCodeData.encodedImage,
        pix_expires_at: qrCodeData.expirationDate,
        asaas_response: paymentData,
        external_reference: `payment_${Date.now()}`
      });

    if (saveError) {
      console.error('❌ Erro ao salvar pagamento:', saveError);
    }

    // Resposta de sucesso
    const response = {
      success: true,
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.value,
        qr_code: qrCodeData.payload,
        qr_code_base64: qrCodeData.encodedImage,
        expires_at: qrCodeData.expirationDate
      }
    };

    console.log('✅ Pagamento PIX criado com sucesso');

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});