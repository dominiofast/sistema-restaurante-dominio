import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (_req) => {
  try {
    const data = { message: 'Hello from Supabase Functions!' }
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}, { 
  auth: {
    type: 'none'
  }
}) 