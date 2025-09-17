import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  companyId: string;
  role?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting invitation process...');
    
    const { email, companyId, role = 'admin' }: InvitationRequest = await req.json();
    console.log('📝 Request data:', { email, companyId, role });

    // Initialize Supabase client with service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔐 Supabase client initialized');

    // Generate invitation token
    const invitationToken = crypto.randomUUID() + '-' + Date.now().toString(36);
    console.log('🎫 Generated token:', invitationToken.substring(0, 10) + '...');

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('email', email)
      .eq('company_id', companyId)
      .single();

    let invitation;
    
    if (existingInvitation) {
      console.log('📧 Invitation already exists, updating token and expiry...');
      
      // Update existing invitation with new token and expiry
      const { data: updatedInvitation, error: updateError } = await supabase
        .from('user_invitations')
        .update({
          token: invitationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', existingInvitation.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw new Error(`Erro ao atualizar convite: ${updateError.message}`);
      }
      
      invitation = updatedInvitation;
    } else {
      console.log('📧 Creating new invitation...');
      
      // Create new invitation
      const { data: newInvitation, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          company_id: companyId,
          role,
          token: invitationToken,
          invited_by: null, // Permitir NULL por enquanto
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (inviteError) {
        console.error('❌ Database error:', inviteError);
        throw new Error(`Erro ao criar convite: ${inviteError.message}`);
      }
      
      invitation = newInvitation;
    }

    console.log('✅ Invitation created:', invitation.id);

    // Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    const companyName = company?.name || 'Sistema';
    console.log('🏢 Company name:', companyName);

    // Check if Resend is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email');
      return new Response(
        JSON.stringify({ 
          success: true, 
          invitationId: invitation.id,
          message: 'Convite criado. Email não enviado (Resend não configurado)'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    console.log('📧 Resend initialized');

    // Prepare email content
    const acceptUrl = `${req.headers.get('origin') || 'https://conta.dominio.tech'}/auth/accept-invitation?token=${invitationToken}`;
    console.log('🔗 Accept URL:', acceptUrl);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Convite para ${companyName}</h1>
        
        <p>Olá!</p>
        
        <p>Você foi convidado para fazer parte da empresa <strong>${companyName}</strong> em nosso sistema.</p>
        
        <p><strong>Cargo:</strong> ${role === 'admin' ? 'Administrador' : role}</p>
        
        <div style="margin: 30px 0;">
          <a href="${acceptUrl}" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Aceitar Convite
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
        </p>
        
        <p style="color: #666; font-size: 12px;">
          Link direto: <a href="${acceptUrl}">${acceptUrl}</a>
        </p>
      </div>
    `;

    // Send email
    console.log('📤 Sending email to:', email);
    const emailResponse = await resend.emails.send({
      from: `${companyName} <noreply@dominio.tech>`,
      to: [email],
      subject: `Convite para ${companyName}`,
      html: emailHtml,
    });

    console.log('✅ Email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitationId: invitation.id,
        emailResponse,
        acceptUrl
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('💥 Error in send-user-invitation:', error);
    console.error('📋 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);