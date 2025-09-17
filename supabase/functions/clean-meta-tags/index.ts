import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Função para limpar caracteres invisíveis
    function cleanText(text: string): string {
      if (!text) return text;
      return text
        .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // zero-width chars
        .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // weird spaces
        .replace(/\s+/g, ' ') // normalize spaces
        .trim();
    }

    // Buscar todas as empresas
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, slug')

    if (companiesError) {
      throw companiesError;
    }

    let updatedCount = 0;
    const results = [];

    for (const company of companies || []) {
      // Limpar nome da empresa se necessário
      const cleanName = cleanText(company.name);
      
      if (cleanName !== company.name) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ name: cleanName })
          .eq('id', company.id);

        if (!updateError) {
          updatedCount++;
          results.push(`✅ Empresa ${company.slug}: Nome limpo`);
        } else {
          results.push(`❌ Empresa ${company.slug}: Erro ao limpar nome`);
        }
      } else {
        results.push(`✓ Empresa ${company.slug}: Nome já limpo`);
      }
    }

    // Buscar e limpar prompts de IA
    const { data: prompts, error: promptsError } = await supabase
      .from('ai_agent_prompts')
      .select('agent_slug, template, vars')

    if (!promptsError && prompts) {
      for (const prompt of prompts) {
        let needsUpdate = false;
        const cleanTemplate = cleanText(prompt.template);
        let cleanVars = prompt.vars;

        if (cleanTemplate !== prompt.template) {
          needsUpdate = true;
        }

        // Limpar variáveis se existirem
        if (prompt.vars && typeof prompt.vars === 'object') {
          cleanVars = {};
          for (const [key, value] of Object.entries(prompt.vars)) {
            if (typeof value === 'string') {
              cleanVars[key] = cleanText(value);
              if (cleanVars[key] !== value) {
                needsUpdate = true;
              }
            } else {
              cleanVars[key] = value;
            }
          }
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('ai_agent_prompts')
            .update({ 
              template: cleanTemplate,
              vars: cleanVars
            })
            .eq('agent_slug', prompt.agent_slug);

          if (!updateError) {
            updatedCount++;
            results.push(`✅ Prompt ${prompt.agent_slug}: Limpo`);
          } else {
            results.push(`❌ Prompt ${prompt.agent_slug}: Erro ao limpar`);
          }
        } else {
          results.push(`✓ Prompt ${prompt.agent_slug}: Já limpo`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Limpeza concluída! ${updatedCount} itens atualizados.`,
      results: results
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})