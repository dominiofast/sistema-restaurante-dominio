import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoRequest {
  nome: string;
  telefone: string;
  email: string;
  tipoEstabelecimento: string;
  tipoOperacao: string;
  desafios: string[];
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Send demo request function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const demoData: DemoRequest = await req.json();
    console.log("📝 Demo request received:", demoData);

    // Email para o comercial
    const comercialEmailResponse = await resend.emails.send({
      from: "Demonstrações <onboarding@resend.dev>",
      to: ["comercial@seusistema.com"], // Altere para o email do comercial
      subject: "🎯 Nova Solicitação de Demonstração",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px; text-align: center;">
              🎯 Nova Solicitação de Demonstração
            </h1>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #334155; margin-top: 0;">Dados do Cliente:</h2>
              <p><strong>Nome:</strong> ${demoData.nome}</p>
              <p><strong>Telefone:</strong> ${demoData.telefone}</p>
              <p><strong>Email:</strong> ${demoData.email}</p>
              <p><strong>Tipo de Estabelecimento:</strong> ${demoData.tipoEstabelecimento}</p>
              <p><strong>Tipo de Operação:</strong> ${demoData.tipoOperacao || 'Não informado'}</p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #166534; margin-top: 0;">Principais Desafios:</h2>
              <ul style="color: #166534;">
                ${demoData.desafios.map(desafio => `<li>${desafio}</li>`).join('')}
              </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #92400e; margin: 0;"><strong>⏰ Solicitação feita em:</strong> ${new Date(demoData.timestamp).toLocaleString('pt-BR')}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${demoData.email}" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                📧 Responder Cliente
              </a>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ Email para comercial enviado:", comercialEmailResponse);

    // Email de confirmação para o cliente
    const clientEmailResponse = await resend.emails.send({
      from: "SeuSistema <onboarding@resend.dev>",
      to: [demoData.email],
      subject: "✅ Demonstração solicitada - Entraremos em contato!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #1e40af; margin-bottom: 20px; text-align: center;">
              ✅ Demonstração Solicitada!
            </h1>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Olá <strong>${demoData.nome}</strong>,
            </p>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Obrigado por solicitar uma demonstração! Recebemos sua solicitação e nossa equipe comercial entrará em contato com você em breve.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #334155; margin-top: 0; font-size: 18px;">O que você verá na demonstração:</h2>
              <ul style="color: #334155; line-height: 1.8;">
                <li>🤖 Como configurar seu agente IA no WhatsApp</li>
                <li>📱 Sistema completo de pedidos pelo WhatsApp</li>
                <li>🎯 Ferramentas de marketing automatizado</li>
                <li>📊 Dashboard e relatórios em tempo real</li>
                <li>🔗 Integrações com sistemas existentes</li>
              </ul>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0;">📞 Entraremos em contato através do:</h3>
              <p style="color: #166534; margin: 0; font-size: 16px;">
                <strong>Telefone:</strong> ${demoData.telefone}<br>
                <strong>Email:</strong> ${demoData.email}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; font-size: 14px;">
                Se tiver alguma dúvida, responda este email ou entre em contato conosco.
              </p>
            </div>

            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                SeuSistema - Automatize seu negócio com WhatsApp
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ Email de confirmação enviado:", clientEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demonstração solicitada com sucesso!" 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("❌ Erro ao processar solicitação:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);