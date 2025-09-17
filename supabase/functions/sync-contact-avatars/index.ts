import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppContact {
  wa_id: string;
  profile?: {
    name?: string;
    picture?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { company_id, phone_numbers } = await req.json();

    if (!company_id) {
      return new Response(
        JSON.stringify({ error: 'company_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp integration for the company
    const { data: integration } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('company_id', company_id)
      .eq('purpose', 'primary')
      .single();

    if (!integration || !integration.access_token) {
      return new Response(
        JSON.stringify({ error: 'Integração WhatsApp não configurada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get chats without avatars or specific phone numbers
    let query = supabase
      .from('whatsapp_chats')
      .select('chat_id, contact_phone, contact_name')
      .eq('company_id', company_id)
      .is('contact_avatar', null);
    
    if (phone_numbers && phone_numbers.length > 0) {
      query = query.in('contact_phone', phone_numbers);
    } else {
      query = query.limit(50); // Limit to avoid too many API calls
    }

    const { data: chats } = await query;

    if (!chats || chats.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum chat sem avatar encontrado', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    const results: any[] = [];

    // Process each chat
    for (const chat of chats) {
      try {
        // Extract phone number without WhatsApp suffix
        const phoneNumber = chat.contact_phone?.replace(/@[cs]\.us$/, '').replace(/@s\.whatsapp\.net$/, '');
        
        if (!phoneNumber) continue;

        // Call WhatsApp Business API to get contact info
        const contactUrl = `https://graph.facebook.com/v18.0/${integration.phone_number_id}/contacts`;
        const response = await fetch(contactUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${integration.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contacts: [phoneNumber],
            fields: ['name', 'profile_pic']
          }),
        });

        if (response.ok) {
          const contactData = await response.json();
          
          if (contactData.contacts && contactData.contacts.length > 0) {
            const contact = contactData.contacts[0];
            let avatarUrl = null;
            let contactName = chat.contact_name;

            // Try to get profile picture
            if (contact.profile_pic) {
              avatarUrl = contact.profile_pic;
            }

            // Try to get updated name
            if (contact.name && contact.name.trim()) {
              contactName = contact.name.trim();
            }

            // Update chat with new avatar and/or name
            if (avatarUrl || (contactName && contactName !== chat.contact_name)) {
              const updateData: any = {};
              if (avatarUrl) updateData.contact_avatar = avatarUrl;
              if (contactName && contactName !== chat.contact_name) updateData.contact_name = contactName;

              const { error: updateError } = await supabase
                .from('whatsapp_chats')
                .update(updateData)
                .eq('chat_id', chat.chat_id)
                .eq('company_id', company_id);

              if (!updateError) {
                updatedCount++;
                results.push({
                  chat_id: chat.chat_id,
                  phone: phoneNumber,
                  avatar_updated: !!avatarUrl,
                  name_updated: !!(contactName && contactName !== chat.contact_name),
                  avatar_url: avatarUrl,
                  contact_name: contactName
                });
              }
            }
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erro ao processar chat ${chat.chat_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Sincronização concluída',
        updated: updatedCount,
        processed: chats.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});