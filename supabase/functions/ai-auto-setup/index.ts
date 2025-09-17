import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Supabase credentials missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const mode: string = body.mode || 'scan';
    const targetCompanyId: string | null = body.company_id || null;
    const targetSlug: string | null = body.slug || null;

    // Resolve company if slug provided
    let companyFilter: string[] = [];
    if (targetCompanyId) companyFilter = [targetCompanyId];
    if (!targetCompanyId && targetSlug) {
      const { data: c } = await supabase.from('companies').select('id').eq('slug', targetSlug).maybeSingle();
      if (c?.id) companyFilter = [c.id];
    }

    // Find companies to process
    let companies: any[] = [];
    if (companyFilter.length) {
      const { data } = await supabase.from('companies').select('id, name, slug').in('id', companyFilter);
      companies = data || [];
    } else {
      // All companies missing assistant_id
      const { data } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('created_at', { ascending: false })
        .limit(1000);
      companies = data || [];
    }

    const results: any[] = [];

    for (const company of companies) {
      // Ensure placeholder in ai_agent_assistants
      let { data: map } = await supabase
        .from('ai_agent_assistants')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();

      if (!map) {
        const placeholder = {
          company_id: company.id,
          bot_name: company.name || 'RangoBot',
          produtos_path: `${company.id}/produtos.json`,
          config_path: `${company.id}/config.json`,
          is_active: true
        };
        const { data: inserted } = await supabase
          .from('ai_agent_assistants')
          .insert([placeholder])
          .select('*')
          .maybeSingle();
        map = inserted || placeholder;
      }

      // Ensure JSON files exist
      const ensureFile = async (path: string, defaultContent: string) => {
        try {
          const { data } = await supabase.storage.from('ai-knowledge').download(path);
          if (data) return 'exists';
        } catch (_) {}
        await supabase.storage.from('ai-knowledge').upload(path, new Blob([defaultContent], { type: 'application/json' }), { upsert: true });
        return 'uploaded';
      };

      const defaultProdutos = JSON.stringify({ produtos: [], updated_at: new Date().toISOString() }, null, 2);
      const defaultConfig = JSON.stringify({ nome_restaurante: company.name, slug: company.slug, horario_atendimento: [], pagamento_aceito: [], updated_at: new Date().toISOString() }, null, 2);

      const produtosStatus = await ensureFile(map.produtos_path, defaultProdutos);
      const configStatus = await ensureFile(map.config_path, defaultConfig);

      // If assistant already exists, skip creation
      if (map.assistant_id) {
        results.push({ company_id: company.id, status: 'ok', assistant_id: map.assistant_id, produtos: produtosStatus, config: configStatus });
        continue;
      }

      // Create OpenAI Assistant
      const instructions = `Você é um atendente virtual para ${company.name}.\nSiga rigorosamente:\n- Não invente dados; use apenas o contexto fornecido.\n- Nunca mencione nomes de arquivos.\n- Valores sempre em Real (R$).\n- Pizzas: informe preço por sabor; valor total somente no cardápio digital.\n- Boas-vindas 1x por conversa; apresente-se e informe o link do cardápio.\n- Não finalize pedidos; direcione para o cardápio.\n- Para frete, peça localização.\n- Horários: use apenas 'horario_atendimento'.`;

      const createRes = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: map.bot_name || company.name || 'RangoBot', model: 'gpt-4o-mini', instructions })
      });

      if (!createRes.ok) {
        const errTxt = await createRes.text();
        results.push({ company_id: company.id, status: 'error', error: `assistant_create_failed: ${errTxt}` });
        continue;
      }
      const created = await createRes.json();
      const assistantId = created?.id;

      // Save assistant_id
      await supabase
        .from('ai_agent_assistants')
        .update({ assistant_id: assistantId })
        .eq('company_id', company.id);

      results.push({ company_id: company.id, status: 'ok', assistant_id: assistantId, produtos: produtosStatus, config: configStatus });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error('ai-auto-setup error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
