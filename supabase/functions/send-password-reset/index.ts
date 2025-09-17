import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    // Criar cliente Supabase para verificar rate limit
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar rate limit
    console.log(`Checking rate limit for email: ${email}`);
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_email_rate_limit', {
        user_email: email,
        req_type: 'password_reset',
        max_requests: 3, // Máximo 3 tentativas
        time_window_minutes: 60 // Por hora
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    } else if (rateLimitData && !rateLimitData.allowed) {
      console.log('Rate limit exceeded for email:', email, rateLimitData);
      
      // Log da tentativa bloqueada
      await supabase.from('email_audit_logs').insert({
        email: email,
        email_type: 'password_reset',
        status: 'blocked',
        error_details: {
          reason: rateLimitData.reason,
          blocked_until: rateLimitData.blocked_until
        },
        metadata: {
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

      return new Response(JSON.stringify({ 
        error: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
        details: rateLimitData.reason === 'rate_limit_exceeded' 
          ? 'Limite de tentativas excedido. Aguarde 30 minutos.' 
          : 'Conta temporariamente bloqueada.',
        retry_after: rateLimitData.blocked_until
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    console.log(`Rate limit passed. Processing password reset for: ${email}`);

    // Usar o domínio próprio correto
    const baseUrl = 'https://conta.dominio.tech'; // Domínio de autenticação
    const redirectUrl = `${baseUrl}/reset-password`;
    
    console.log('Using domain:', baseUrl);
    console.log('Redirect URL:', redirectUrl);

    // Gerar link de reset personalizado
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      throw new Error(`Erro ao gerar link: ${resetError.message}`);
    }

    if (!data.properties?.action_link) {
      throw new Error('Link de recuperação não foi gerado corretamente');
    }

    const resetLink = data.properties.action_link;
    console.log('Generated reset link:', resetLink);

    const currentTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const emailResponse = await resend.emails.send({
      from: "Suporte Seguro <suporte@dominio.tech>",
      to: [email],
      subject: "🔐 Redefinir senha - Dominio.tech",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir senha - Dominio.tech</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background-color: #f8fafc;
                    line-height: 1.6;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: #3b4a7d;
                    padding: 40px 30px;
                    text-align: center;
                }
                
                .logo {
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 10px;
                    letter-spacing: -1px;
                }
                
                .logo .d-symbol {
                    font-size: 40px;
                    margin-right: 10px;
                }
                
                .subtitle {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 16px;
                    font-weight: 300;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .alert-icon {
                    text-align: center;
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .main-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #3b4a7d;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .message {
                    font-size: 16px;
                    color: #4a5568;
                    margin-bottom: 25px;
                    line-height: 1.7;
                }
                
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b4a7d 0%, #e91e63 50%, #ff9800 100%);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                    margin: 20px 0;
                    width: 100%;
                    box-sizing: border-box;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 15px rgba(59, 74, 125, 0.3);
                }
                
                .cta-button:hover {
                    transform: translateY(-2px);
                }
                
                .alternative-link {
                    background-color: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                
                .alternative-link p {
                    font-size: 14px;
                    color: #4a5568;
                    margin-bottom: 10px;
                }
                
                .alternative-link code {
                    background-color: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 12px;
                    color: #2d3748;
                    word-break: break-all;
                    display: block;
                }
                
                .security-warning {
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                }
                
                .security-warning h3 {
                    color: #dc2626;
                    font-size: 16px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }
                
                .security-warning ul {
                    color: #7f1d1d;
                    font-size: 14px;
                    padding-left: 20px;
                }
                
                .security-warning li {
                    margin-bottom: 5px;
                }
                
                .expiration-info {
                    background-color: #fff8e1;
                    border-left: 4px solid #ff9800;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 0 4px 4px 0;
                }
                
                .expiration-info p {
                    font-size: 14px;
                    color: #f57c00;
                    margin: 0;
                    font-weight: 500;
                }
                
                .request-info {
                    background-color: #f0f4ff;
                    border: 1px solid #bfd4ff;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                    color: #3b4a7d;
                }
                
                .footer {
                    background-color: #f7fafc;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer p {
                    font-size: 14px;
                    color: #718096;
                    margin-bottom: 10px;
                }
                
                .footer a {
                    color: #3b4a7d;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .footer a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 600px) {
                    .container {
                        margin: 0;
                        box-shadow: none;
                    }
                    
                    .header, .content, .footer {
                        padding: 30px 20px;
                    }
                    
                    .logo {
                        font-size: 24px;
                    }
                    
                    .logo .d-symbol {
                        font-size: 30px;
                    }
                    
                    .main-title {
                        font-size: 20px;
                    }
                    
                    .alert-icon {
                        font-size: 36px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">
                        <span class="d-symbol">◐</span>DOMINIO<span style="opacity: 0.9;">.TECH</span>
                    </div>
                    <div class="subtitle">Redefinição de Senha</div>
                </div>
                
                <div class="content">
                    <div class="alert-icon">🔐</div>
                    <h1 class="main-title">Solicitação de Nova Senha</h1>
                    
                    <p class="message">
                        Olá! Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Dominio.tech</strong>.
                    </p>
                    
                    <p class="message">
                        Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <a href="${resetLink}" class="cta-button">
                        🔑 Redefinir minha senha
                    </a>
                    
                    <div class="expiration-info">
                        <p><strong>⏰ Tempo limite:</strong> Este link expira em 1 hora por motivos de segurança.</p>
                    </div>
                    
                    <div class="alternative-link">
                        <p><strong>Problema com o botão?</strong> Copie e cole este link no seu navegador:</p>
                        <code>${resetLink}</code>
                    </div>
                    
                    <div class="request-info">
                        <p><strong>📋 Detalhes da solicitação:</strong></p>
                        <p>• Data/Hora: ${currentTime}</p>
                        <p>• IP: ${req.headers.get('x-forwarded-for') || 'Não identificado'}</p>
                        <p>• Email: ${email}</p>
                    </div>
                    
                    <div class="security-warning">
                        <h3>🚨 Importante - Informações de Segurança</h3>
                        <ul>
                            <li><strong>Não solicitou?</strong> Se você não pediu para redefinir sua senha, ignore este email. Sua conta permanece segura.</li>
                            <li><strong>Link único:</strong> Este link só pode ser usado uma vez e expira automaticamente.</li>
                            <li><strong>Senha forte:</strong> Escolha uma senha com pelo menos 8 caracteres, incluindo letras, números e símbolos.</li>
                            <li><strong>Suspeita de atividade maliciosa?</strong> Entre em contato conosco imediatamente.</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este email foi enviado para <strong>${email}</strong></p>
                    <p>
                        <a href="mailto:suporte@dominio.tech">Precisa de ajuda?</a> | 
                        <a href="mailto:suporte@dominio.tech">Reportar problema</a>
                    </p>
                    <p style="margin-top: 20px; color: #a0aec0;">
                        © 2025 Dominio.tech - Todos os direitos reservados
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    console.log("Reset link used in email:", resetLink);
    console.log("Password reset email sent successfully:", emailResponse);

    // Log de sucesso
    await supabase.from('email_audit_logs').insert({
      email: email,
      email_type: 'password_reset',
      status: 'sent',
      message_id: emailResponse.data?.id,
      metadata: {
        user_agent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        requests_remaining: rateLimitData?.requests_remaining || 0,
        reset_at: rateLimitData?.reset_at || null
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: 'Email de recuperação enviado com sucesso!',
      security_info: {
        attempts_remaining: rateLimitData?.requests_remaining || 0,
        window_reset: rateLimitData?.reset_at || null
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    
    // Log de erro
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('email_audit_logs').insert({
        email: req.headers.get('email') || 'unknown',
        email_type: 'password_reset',
        status: 'failed',
        error_details: {
          message: error.message,
          stack: error.stack
        },
        metadata: {
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do sistema',
        details: 'Não foi possível processar a solicitação. Tente novamente em alguns minutos.',
        support: 'Se o problema persistir, entre em contato com suporte@dominio.tech'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);