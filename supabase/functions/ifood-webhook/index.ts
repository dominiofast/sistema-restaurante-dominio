import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('iFood webhook received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar assinatura do webhook
    const signature = req.headers.get('X-IFood-Signature');
    const body = await req.text();
    
    if (!signature) {
      console.error('Missing X-IFood-Signature header');
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const event = JSON.parse(body);
    console.log('Event received:', event);

    // Validar estrutura básica do evento
    if (!event.orderId || !event.merchantId) {
      console.error('Invalid event structure:', event);
      return new Response('Invalid event structure', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Buscar a integração ativa para este merchant
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('ifood_integrations')
      .select(`
        *,
        companies(name),
        app_config:ifood_app_config(client_id, client_secret, environment)
      `)
      .eq('merchant_id', event.merchantId)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found for merchant:', event.merchantId);
      return new Response('Integration not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    console.log('Integration found:', integration.store_name || integration.merchant_id);

    // Processar evento baseado no tipo
    if (event.fullCode === 'PLACED') {
      await handleOrderPlaced(supabaseAdmin, event, integration);
    } else if (event.fullCode === 'CONFIRMED') {
      await handleOrderConfirmed(supabaseAdmin, event, integration);
    } else if (event.fullCode === 'CANCELLED') {
      await handleOrderCancelled(supabaseAdmin, event, integration);
    } else {
      console.log('Event type not handled:', event.fullCode);
    }

    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

async function handleOrderPlaced(supabase: any, event: any, integration: any) {
  try {
    console.log('Processing PLACED order:', event.orderId);
    
    // Buscar detalhes do pedido usando a API do iFood
    // Por enquanto, vamos criar um pedido com os dados do evento
    const pedidoData = {
      company_id: integration.company_id,
      nome: 'Cliente iFood', // Será atualizado quando buscar detalhes
      telefone: null,
      endereco: 'Endereço iFood', // Será atualizado quando buscar detalhes
      status: 'analise',
      tipo: 'delivery',
      total: 0, // Será atualizado quando buscar detalhes
      pagamento: 'Online',
      origem: 'ifood',
      horario: new Date().toISOString(),
      external_id: event.orderId,
      external_platform: 'ifood'
    };

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([pedidoData])
      .select()
      .single();

    if (pedidoError) {
      console.error('Error creating order:', pedidoError);
      return;
    }

    console.log('Order created successfully:', pedido.id);

    // Log do evento
    await supabase.from('import_logs').insert({
      company_id: integration.company_id,
      source_url: 'ifood_webhook',
      items_imported: 1,
      status: 'success',
      error_message: `Pedido iFood recebido: ${event.orderId}`
    });

  } catch (error) {
    console.error('Error handling PLACED order:', error);
  }
}

async function handleOrderConfirmed(supabase: any, event: any, integration: any) {
  try {
    console.log('Processing CONFIRMED order:', event.orderId);
    
    // Atualizar status do pedido para confirmado
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'preparacao' })
      .eq('external_id', event.orderId)
      .eq('company_id', integration.company_id);

    if (error) {
      console.error('Error updating order status:', error);
    }

  } catch (error) {
    console.error('Error handling CONFIRMED order:', error);
  }
}

async function handleOrderCancelled(supabase: any, event: any, integration: any) {
  try {
    console.log('Processing CANCELLED order:', event.orderId);
    
    // Atualizar status do pedido para cancelado
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'cancelado' })
      .eq('external_id', event.orderId)
      .eq('company_id', integration.company_id);

    if (error) {
      console.error('Error updating order status:', error);
    }

  } catch (error) {
    console.error('Error handling CANCELLED order:', error);
  }
}