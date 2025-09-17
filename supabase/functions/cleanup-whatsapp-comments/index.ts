import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id } = await req.json().catch(() => ({ company_id: null }));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const cleanPattern = "^(?:\\s*//\\s*Ajusta\\s+cores\\s+e\\s+adiciona\\s+caudas\\s*\\n?)+";

    const { data: msgs } = await supabase
      .from('whatsapp_messages')
      .select('id, message_content, company_id')
      .ilike('message_content', '%Ajusta cores e adiciona caudas%')
      .limit(10000);

    let updatedMessages = 0;
    if (msgs && msgs.length) {
      const toUpdate = msgs
        .filter(m => !company_id || m.company_id === company_id)
        .map(m => ({
          id: m.id,
          message_content: (m.message_content || '').replace(new RegExp(cleanPattern, 'i'), '').trim()
        }));

      for (const chunk of toUpdate.reduce((acc: any[], _, i) => (i % 500 ? acc : [...acc, toUpdate.slice(i, i + 500)]), [] as any[])) {
        const { error } = await supabase.from('whatsapp_messages').upsert(chunk, { onConflict: 'id' });
        if (!error) updatedMessages += chunk.length;
      }
    }

    const { data: logs } = await supabase
      .from('ai_conversation_logs')
      .select('id, message_content, company_id')
      .ilike('message_content', '%Ajusta cores e adiciona caudas%')
      .limit(10000);

    let updatedLogs = 0;
    if (logs && logs.length) {
      const toUpdate = logs
        .filter(l => !company_id || l.company_id === company_id)
        .map(l => ({
          id: l.id,
          message_content: (l.message_content || '').replace(new RegExp(cleanPattern, 'i'), '').trim()
        }));

      for (const chunk of toUpdate.reduce((acc: any[], _, i) => (i % 500 ? acc : [...acc, toUpdate.slice(i, i + 500)]), [] as any[])) {
        const { error } = await supabase.from('ai_conversation_logs').upsert(chunk, { onConflict: 'id' });
        if (!error) updatedLogs += chunk.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, updatedMessages, updatedLogs }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});