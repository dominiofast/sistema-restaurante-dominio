import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppIntegration {
  host: string;
  token: string;
  instance_key: string;
}

interface WhatsAppRequest {
  phone: string;
  message: string;
  integration: WhatsAppIntegration;
}


// Helper para remover preview de links (SEM adicionar caracteres especiais)
function defangLinks(text: string): string {
  // NÃO adicionar caracteres especiais - apenas retornar o texto limpo
  return text;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, integration }: WhatsAppRequest = await req.json();

    if (!phone || !message || !integration) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: phone, message, or integration' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limpar o número de telefone (remover caracteres especiais)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Garantir que tenha código do país (Brasil = 55)
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    console.log('Enviando mensagem WhatsApp:', {
      phone: formattedPhone,
      host: integration.host,
      instance: integration.instance_key
    });

    // Construir URL da API do WhatsApp (usar mesmo endpoint das conversações)
    const apiUrl = `https://${integration.host}/rest/sendMessage/${integration.instance_key}/text`;
    
    const payload = {
      messageData: {
        to: formattedPhone,
        text: defangLinks(message),
        preview_url: false,
        linkPreview: false
      }
    };

    // Enviar mensagem via API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${integration.token}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.text();
    
    console.log('Resposta da API WhatsApp:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(`API WhatsApp error: ${response.status} - ${responseData}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        response: responseData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});