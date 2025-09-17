import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Declarar variáveis aqui para acesso no try/catch
  let company_id;
  let source_url;

  try {
    const body = await req.json();
    company_id = body.company_id;
    source_url = body.source_url;
    const { items } = body;

    if (!company_id || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Dados inválidos fornecidos.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const produtosParaInserir = items.map(item => ({
      company_id: company_id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      categoria_id: item.categoria_id,
      is_available: true,
      destaque: false,
    }));

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('produtos')
      .insert(produtosParaInserir)
      .select();

    if (insertError) {
      throw insertError;
    }

    const itemsImportedCount = insertedData ? insertedData.length : 0;

    // Log da importação
    await supabaseAdmin.from('import_logs').insert({
      company_id,
      source_url,
      items_imported: itemsImportedCount,
      status: 'success',
    });

    return new Response(JSON.stringify({ message: `${itemsImportedCount} itens importados com sucesso!` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Log do erro
    if (company_id) {
        await createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '').from('import_logs').insert({
        company_id,
        source_url,
        items_imported: 0,
        status: 'failed',
        error_message: error.message,
      });
    }

    console.error('Erro na função ifood-import-execute:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 