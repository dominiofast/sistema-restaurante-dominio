import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helpers
function log(...args: any[]) { console.log("[process-campaigns]", ...args); }

function formatPhoneBR(phone: string, country: string = 'BR'): string {
  let clean = (phone || '').replace(/\D/g, '');
  if (country === 'BR' && !clean.startsWith('55')) clean = '55' + clean;
  if (!clean.endsWith('@s.whatsapp.net')) clean += '@s.whatsapp.net';
  return clean;
}

function parseTime(t: string | null | undefined): { h: number; m: number } {
  const [h, m] = (t || '00:00').split(':').map((v) => parseInt(v, 10));
  return { h: h || 0, m: m || 0 };
}

function getTzOffsetMs(tz: string) {
  const tzNow = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const nowUtc = new Date();
  return tzNow.getTime() - nowUtc.getTime();
}

function nextDailyRun(timeOfDay: string, tz: string): Date {
  const { h, m } = parseTime(timeOfDay);
  const nowUtc = new Date();
  const offset = getTzOffsetMs(tz);
  const tzNow = new Date(nowUtc.getTime() + offset);
  const targetTz = new Date(tzNow);
  targetTz.setHours(h, m, 0, 0);
  let targetUtc = new Date(targetTz.getTime() - offset);
  if (targetUtc <= nowUtc) {
    // add 1 day in tz then convert back
    const nextTz = new Date(targetTz.getTime());
    nextTz.setDate(nextTz.getDate() + 1);
    targetUtc = new Date(nextTz.getTime() - offset);
  }
  return targetUtc;
}

function nextWeeklyRun(daysOfWeek: number[], timeOfDay: string, tz: string): Date {
  const { h, m } = parseTime(timeOfDay);
  const nowUtc = new Date();
  const offset = getTzOffsetMs(tz);
  const tzNow = new Date(nowUtc.getTime() + offset);
  const todayDow = tzNow.getDay(); // 0-6

  // sort days asc 0..6
  const sorted = [...new Set(daysOfWeek)].sort((a, b) => a - b);
  for (let i = 0; i < 7; i++) {
    const candidateDow = (todayDow + i) % 7;
    if (sorted.includes(candidateDow)) {
      const targetTz = new Date(tzNow);
      targetTz.setDate(tzNow.getDate() + i);
      targetTz.setHours(h, m, 0, 0);
      const candidateUtc = new Date(targetTz.getTime() - offset);
      if (candidateUtc > nowUtc) return candidateUtc;
    }
  }
  // fallback: next week's first day selected
  const first = sorted[0] ?? todayDow;
  const daysAhead = (first + 7 - todayDow) % 7 || 7;
  const targetTz = new Date(tzNow);
  targetTz.setDate(tzNow.getDate() + daysAhead);
  targetTz.setHours(h, m, 0, 0);
  return new Date(targetTz.getTime() - offset);
}

// Função limpa SEM caracteres especiais
function defangLinks(text: string): string {
  // NÃO adicionar caracteres especiais que corrompem URLs
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const { limit = 100 } = (await req.json().catch(() => ({})));
    const nowIso = new Date().toISOString();

    // Fetch due campaigns
    const { data: campaigns, error: campErr } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('is_active', true)
      .in('recurrence_type', ['once', 'daily', 'weekly'])
      .order('created_at', { ascending: true });

    if (campErr) throw campErr;

    let sentCount = 0;
    for (const c of campaigns || []) {
      if (sentCount >= limit) break;

      const tz = c.timezone || 'America/Sao_Paulo';
      let due = false;

      // Determine next_run_at if missing
      let nextRun: Date | null = null;
      if (c.recurrence_type === 'once') {
        nextRun = c.scheduled_date ? new Date(c.scheduled_date) : null;
        due = !!(nextRun && nextRun <= new Date());
      } else if (c.recurrence_type === 'daily') {
        nextRun = c.next_run_at ? new Date(c.next_run_at) : nextDailyRun(c.time_of_day || '00:00', tz);
        due = nextRun <= new Date();
      } else if (c.recurrence_type === 'weekly') {
        const days = Array.isArray(c.days_of_week) ? c.days_of_week : [];
        nextRun = c.next_run_at ? new Date(c.next_run_at) : nextWeeklyRun(days, c.time_of_day || '00:00', tz);
        due = nextRun <= new Date();
      }

      if (!due) {
        // update missing next_run_at if null
        if (!c.next_run_at && nextRun) {
          await supabase.from('whatsapp_campaigns').update({ next_run_at: nextRun.toISOString() }).eq('id', c.id);
        }
        continue;
      }

      // Get integration
      const { data: integ, error: intErr } = await supabase
        .from('whatsapp_integrations' as any)
        .select('*')
        .eq('company_id', c.company_id)
        .eq('purpose', 'marketing')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (intErr || !integ) {
        log('No integration for company', c.company_id, intErr);
        continue;
      }

      // Fetch clients
      let clientQuery = supabase
        .from('clientes' as any)
        .select('id, nome, telefone, email, status')
        .eq('company_id', c.company_id)
        .not('telefone', 'is', null)
        .neq('telefone', '');
      if (c.audience === 'clientes-ativos') clientQuery = clientQuery.eq('status', 'ativo');

      const { data: clientes, error: cliErr } = await clientQuery;
      if (cliErr) {
        log('Erro clientes', cliErr);
        continue;
      }

      const hasMedia = !!c.media_base64 && !!c.media_type && !!c.media_mime_type;

      // Send loop
      for (const cli of clientes || []) {
        if (sentCount >= limit) break;
        const to = formatPhoneBR(cli.telefone, c.country || 'BR');
        try {
          if (hasMedia) {
            const url = `https://${integ.host}/rest/sendMessage/${integ.instance_key}/mediaBase64`;
            const payload = {
              messageData: {
                to,
                base64: c.media_base64,
                fileName: c.media_file_name || 'midia',
                type: c.media_type,
                caption: defangLinks(c.message),
                mimeType: c.media_mime_type,
              },
            };
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${integ.token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            let result: any = null; try { result = await resp.json(); } catch {}
            const hasApiError = !resp.ok || (result && (result.error || result.status === 'error' || result.name === 'NOT_FOUND' || (typeof result.statusCode === 'number' && result.statusCode >= 400)));
            if (hasApiError) throw new Error(`Media send failed: ${resp.status}`);
          } else {
            const url = `https://${integ.host}/rest/sendMessage/${integ.instance_key}/text`;
            const payload = { messageData: { to, text: defangLinks(c.message), linkPreview: false, preview_url: false } };
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${integ.token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            let result: any = null; try { result = await resp.json(); } catch {}
            const hasApiError = !resp.ok || (result && (result.error || result.status === 'error' || result.name === 'NOT_FOUND' || (typeof result.statusCode === 'number' && result.statusCode >= 400)));
            if (hasApiError) throw new Error(`Text send failed: ${resp.status}`);
          }
          sentCount++;
        } catch (err) {
          log('Send error for', to, err);
        }
      }

      // Update campaign next run
      let newStatus = c.status;
      let isActive = c.is_active;
      let next_run_at: string | null = null;
      if (c.recurrence_type === 'once') {
        newStatus = 'sent';
        isActive = false;
        next_run_at = null;
      } else if (c.recurrence_type === 'daily') {
        next_run_at = nextDailyRun(c.time_of_day || '00:00', tz).toISOString();
      } else if (c.recurrence_type === 'weekly') {
        const days = Array.isArray(c.days_of_week) ? c.days_of_week : [];
        next_run_at = nextWeeklyRun(days, c.time_of_day || '00:00', tz).toISOString();
      }

      await supabase
        .from('whatsapp_campaigns')
        .update({ last_run_at: new Date().toISOString(), next_run_at, status: newStatus, is_active: isActive })
        .eq('id', c.id);
    }

    return new Response(JSON.stringify({ ok: true, processed: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log('Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});