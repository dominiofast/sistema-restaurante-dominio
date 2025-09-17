// Supabase Edge Function: printnode-proxy
// Proxies requests to PrintNode API using a secret API key

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const PRINTNODE_BASE = 'https://api.printnode.com';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
    ...init,
  });
}

function buildChildHeaders(payload: any): HeadersInit {
  const headers: Record<string, string> = {};
  if (payload?.childAccountId) headers['X-Child-Account-By-Id'] = String(payload.childAccountId);
  if (payload?.childAccountEmail) headers['X-Child-Account-By-Email'] = String(payload.childAccountEmail);
  if (payload?.childAccountCreatorRef) headers['X-Child-Account-By-CreatorRef'] = String(payload.childAccountCreatorRef);
  return headers;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PRINTNODE_API_KEY');
    if (!apiKey) {
      return json({ error: 'PRINTNODE_API_KEY não configurada nas Secrets das Edge Functions.' }, { status: 400 });
    }

    let payload: any = {};
    if (req.method === 'POST') {
      payload = await req.json().catch(() => ({}));
    }
    const action = payload.action;

    if (!action) {
      return json({ error: 'Ação não informada. Use { action: "whoami" | "printers" | "controllable" | "create_account" | "print" }' }, { status: 400 });
    }

    const authHeader = 'Basic ' + btoa(`${apiKey}:`);
    const childHeaders = buildChildHeaders(payload);

    switch (action) {
      case 'whoami': {
        const r = await fetch(`${PRINTNODE_BASE}/whoami`, {
          headers: { Authorization: authHeader, Accept: 'application/json', ...childHeaders },
        });
        const body = await r.text();
        try {
          return json(JSON.parse(body), { status: r.status });
        } catch {
          return json({ raw: body }, { status: r.status });
        }
      }
      case 'printers': {
        const r = await fetch(`${PRINTNODE_BASE}/printers`, {
          headers: { Authorization: authHeader, Accept: 'application/json', ...childHeaders },
        });
        const body = await r.text();
        try {
          return json(JSON.parse(body), { status: r.status });
        } catch {
          return json({ raw: body }, { status: r.status });
        }
      }
      case 'controllable': {
        const r = await fetch(`${PRINTNODE_BASE}/account/controllable`, {
          headers: { Authorization: authHeader, Accept: 'application/json' },
        });
        const body = await r.text();
        try {
          return json(JSON.parse(body), { status: r.status });
        } catch {
          return json({ raw: body }, { status: r.status });
        }
      }
      case 'create_account': {
        const accountPayload: any = {
          email: payload?.email,
          firstname: payload?.firstname,
          lastname: payload?.lastname,
          password: payload?.password,
          creatorRef: payload?.creatorRef,
        };
        const r = await fetch(`${PRINTNODE_BASE}/account`, {
          method: 'POST',
          headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(accountPayload),
        });
        const body = await r.text();
        try {
          return json(JSON.parse(body), { status: r.status });
        } catch {
          return json({ raw: body }, { status: r.status });
        }
      }
      case 'print': {
        const printPayload = {
          printerId: payload?.printerId,
          title: payload?.title || 'Teste via API',
          contentType: payload?.contentType || 'raw_base64',
          content: payload?.content,
          source: payload?.source || 'App POS',
          options: payload?.options || {},
        };
        const r = await fetch(`${PRINTNODE_BASE}/printjobs`, {
          method: 'POST',
          headers: { Authorization: authHeader, 'Content-Type': 'application/json', Accept: 'application/json', ...childHeaders },
          body: JSON.stringify(printPayload),
        });
        const body = await r.text();
        try {
          return json(JSON.parse(body), { status: r.status });
        } catch {
          return json({ raw: body }, { status: r.status });
        }
      }
      default:
        return json({ error: `Ação '${action}' não suportada.` }, { status: 400 });
    }
  } catch (err) {
    console.error('printnode-proxy error', err);
    return json({ error: 'Erro interno na função', detail: String(err) }, { status: 500 });
  }
});