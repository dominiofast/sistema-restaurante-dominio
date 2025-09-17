import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Função para renderizar templates Mustache - v3.1
function renderTemplate(template: string, vars: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

// LIMPEZA ULTRA AGRESSIVA DE URLs
function cleanUrlAgressively(input: string): string {
  if (!input) return '';
  
  // Remover apenas caracteres invisíveis problemáticos, mas manter caracteres válidos de URL
  let clean = input
    .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // zero-width
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // espaços especiais -> espaço normal
    .replace(/%E2%80%8B/gi, '') // zero-width encoded
    .replace(/[^\x20-\x7E]/g, '') // manter apenas ASCII imprimível
    .replace(/\s+/g, '') // remover espaços extras
    .trim();
    
  return clean;
}

function ensureCleanMenuUrl(raw: string): string {
  // NÃO fazer limpeza agressiva que adiciona caracteres especiais
  if (!raw) return '';
  
  // Apenas garantir que tem https e o domínio correto
  if (raw.includes('pedido.dominio.tech')) {
    return raw.replace(/[^\x20-\x7E]/g, '').trim();
  }
  
  return raw.replace(/[^\x20-\x7E]/g, '').trim();
}

function sanitizeCompleteMessage(text: string, menuUrl: string): string {
  if (!text) return text;
  
  // Limpar o texto base APENAS de caracteres invisíveis
  let clean = text
    .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '')
    .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Converter links em markdown para URL limpa antes de remover o markdown
  // Ex.: "[ver cardápio](https://pedido.dominio.tech/slug)" -> "https://pedido.dominio.tech/slug"
  clean = clean.replace(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/g, (_m, url) => url);
  // Remover sobras de markdown sem URL
  clean = clean.replace(/\[[^\]]*\]\([^)]*\)/g, '');
  // NÃO remover URLs válidas - apenas URLs com caracteres problemáticos
  clean = clean.replace(/https?:\/\/[^\s]*[\u200B-\u200F\u2060\uFEFF\u2000-\u206F][^\s]*/g, '');
  
  // NÃO manipular a URL - usar exatamente como recebida (remover invisíveis apenas)
  const cleanUrl = menuUrl?.replace(/[^\x20-\x7E]/g, '').trim() || menuUrl;

  // Detectar se já existe URL válida de cardápio no texto
  const linkRegex = /(https?:\/\/)?pedido\.dominio\.tech\/[A-Za-z0-9_-]+/i;
  const hasMenuLink = linkRegex.test(clean);

  // Sempre adicionar link do cardápio se não existir um link válido
  if (!hasMenuLink && cleanUrl && cleanUrl.includes('pedido.dominio.tech')) {
    // 1) Inserir inline após "aqui:" / "link:" mesmo que tenha emoji/símbolos depois
    // Substitui sequências como "aqui: 📎 ." ou "link: - " por "aqui: <URL>"
    const before = clean;
    clean = clean.replace(/\b(aqui|link)\b\s*:\s*(?!https?:\/\/)[^A-Za-z0-9\n]*/gi, (_m, _kw) => `${_kw}: ${cleanUrl}`);
    // 2) Também cobre frases "cardápio ... aqui:" sem URL
    clean = clean.replace(/(card[áa]pio[^\n]{0,80}?aqui)\s*:\s*(?!https?:\/\/)[^A-Za-z0-9\n]*/gi, (_m, g1) => `${g1}: ${cleanUrl}`);
    // 3) Se nada mudou, anexar como linha final
    if (before === clean) {
      clean = `${clean}\n\n🍽️ Confira nosso cardápio: ${cleanUrl}`.trim();
    }
  }
  
  return clean;
}

function renderResponseToText(jsonData: any, cardapioUrl: string): string {
  try {
  // USAR URL LIMPA SEM MANIPULAÇÃO ADICIONAL
  const ultraCleanUrl = cardapioUrl?.replace(/[^\x20-\x7E]/g, '').trim() || cardapioUrl;
    
    // Se é uma mensagem de saudação (greeting)
    if (jsonData.type === 'greeting' && jsonData.messages) {
      let text = jsonData.messages.join(' ');
      return sanitizeCompleteMessage(text, ultraCleanUrl);
    }
    
    // Se tem mensagens e links (padrão do sistema)
    if (jsonData.type === 'answer' && jsonData.messages && jsonData.links) {
      let text = jsonData.messages.join(' ');
      return sanitizeCompleteMessage(text, ultraCleanUrl);
    }
    
    // Se tem produtos/promoções
    if (jsonData.produtos || jsonData.promocoes) {
      let text = '';
      
      if (jsonData.produtos && Array.isArray(jsonData.produtos)) {
        text += '🍽️ *Nossos Produtos:*\n\n';
        jsonData.produtos.forEach((produto: any) => {
          text += `📌 *${produto.name}*\n`;
          if (produto.description) text += `${produto.description}\n`;
          
          if (produto.is_promotional && produto.promotional_price) {
            text += `💸 ~~R$ ${produto.price.toFixed(2)}~~ → *R$ ${produto.promotional_price.toFixed(2)}* 🔥\n`;
          } else {
            text += `💰 R$ ${produto.price.toFixed(2)}\n`;
          }
          text += '\n';
        });
      }
      
      if (jsonData.promocoes && Array.isArray(jsonData.promocoes)) {
        text += '🔥 *Promoções Ativas:*\n\n';
        jsonData.promocoes.forEach((promo: any) => {
          text += `🎯 *${promo.titulo}*\n`;
          if (promo.descricao) text += `${promo.descricao}\n`;
          if (promo.preco) text += `💰 R$ ${promo.preco.toFixed(2)}\n`;
          text += '\n';
        });
      }
      
      text += `\n🔗 *Faça seu pedido:* ${ultraCleanUrl}`;
      return sanitizeCompleteMessage(text, ultraCleanUrl);
    }
    
    // Se é uma resposta simples com texto
    if (jsonData.resposta || jsonData.message) {
      return sanitizeCompleteMessage(jsonData.resposta || jsonData.message, ultraCleanUrl);
    }
    
    // Fallback: retornar o JSON como string se não conseguir processar
    return JSON.stringify(jsonData);
    
  } catch (error) {
    console.log('❌ Erro ao renderizar JSON:', error);
    return JSON.stringify(jsonData);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 [VERSÃO 3.2] Iniciando agente IA conversa');
    
    const { slug_empresa, user_message, historico, customer_phone, customer_name } = await req.json();
    console.log('📨 [VERSÃO 3.2] Dados recebidos:', { slug_empresa, user_message: user_message?.substring(0, 100), historico, customer_phone, customer_name });
    console.log('👤 [VERSÃO 3.2] Nome do cliente recebido:', customer_name);
    console.log('🔍 [VERSÃO 3.2] INÍCIO DO PROCESSAMENTO - Slug:', slug_empresa);

    // ====== VERIFICAÇÃO DE EMERGÊNCIA - PRIMEIRA COISA ======
    const { data: emergencyCheck } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'emergency_ai_disabled')
      .maybeSingle();
    
    if (emergencyCheck?.value === 'true') {
      console.log('🚨 EMERGÊNCIA: IA DESABILITADA GLOBALMENTE (AGENTE)');
      return new Response(JSON.stringify({ 
        resposta: "IA desabilitada por medida de emergência",
        emergency: true,
        paused: true 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    // ========================================================

    // ============ VERIFICAÇÃO DE PAUSA - CRÍTICA ============
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🚨 VERIFICAR SE O CHAT ESTÁ PAUSADO ANTES DE PROSSEGUIR
    if (customer_phone && slug_empresa) {
      // Buscar empresa primeiro para ter o company_id
      const { data: companyData } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", slug_empresa)
        .maybeSingle();
      
      if (companyData?.id) {
        const chatId = customer_phone + '@s.whatsapp.net';
        console.log(`🔍 VERIFICAÇÃO DE PAUSA ESPECÍFICA - Chat: ${chatId} | Company: ${companyData.id}`);
        
        const { data: pausedChat } = await supabase
          .from('whatsapp_chats')
          .select('ai_paused, chat_id, company_id')
          .eq('company_id', companyData.id)
          .eq('chat_id', chatId)
          .eq('ai_paused', true)
          .maybeSingle();

        if (pausedChat) {
          console.log('⏸️ CHAT PAUSADO CONFIRMADO - não responder ao Assistant:', chatId, 'Company:', companyData.id);
          return new Response(JSON.stringify({ 
            resposta: "Chat pausado para este cliente específico",
            paused: true,
            chat_id: chatId,
            company_id: companyData.id
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          console.log('✅ CHAT ATIVO - prosseguindo com processamento:', chatId, 'Company:', companyData.id);
        }
      }
    }
    // ======================================================
    
    // Sanitização de segurança rigorosa para prevenir prompt injection
    const sanitizedMessage = user_message
      .replace(/[<>&"']/g, '') // Remove caracteres HTML
      .replace(/\$\{.*?\}/g, '') // Remove template literals
      .replace(/`.*?`/g, '') // Remove backticks
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/data:/gi, '') // Remove data:
      .replace(/(prompt|ignore|system|assistant|user):\s*/gi, '') // Remove prompt injection
      .replace(/\n{3,}/g, '\n\n') // Limita quebras de linha consecutivas
      .trim();
    
    if (!user_message) {
      console.log('❌ Mensagem do usuário não fornecida');
      return new Response(JSON.stringify({ error: "user_message é obrigatório" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar chave OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.log('❌ Chave OpenAI não configurada');
      return new Response(JSON.stringify({ error: "OpenAI API key não configurada" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar credenciais do Edge Config
    const edgeConfigUrl = Deno.env.get("EDGE_CONFIG_URL");
    const edgeConfigRead = Deno.env.get("EDGE_CONFIG_READ");

    // Buscar configuração global do OpenAI
    const { data: globalConfig } = await supabase
      .from("ai_global_config")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    console.log('🔧 Configuração global AI:', globalConfig);

    // Buscar empresa por slug se fornecido
    let company = null;
    if (slug_empresa && slug_empresa !== 'test-empresa') {
      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug_empresa)
        .maybeSingle();
      company = companyData;
    }

    console.log('🏢 Empresa encontrada:', company);

    // CRÍTICO: Buscar PROMPT PERSONALIZADO da tela primeiro
    let customPrompt = null;
    if (company?.slug) {
      const { data: promptData } = await supabase
        .from('ai_agent_prompts')
        .select('template, vars')
        .eq('agent_slug', company.slug)
        .maybeSingle();
      customPrompt = promptData;
      console.log('🎯 Prompt personalizado encontrado:', !!customPrompt?.template);
    }

    // Buscar configuração do agente na tabela ai_agent_config
    let config = null;
    if (slug_empresa && slug_empresa !== 'test-empresa') {
      const { data: configData } = await supabase
        .from("ai_agent_config")
        .select("*")
        .eq("company_id", company?.id)
        .maybeSingle();
      config = configData;
    }

    console.log('🤖 Configuração do agente:', config);

    // Buscar informações completas da empresa
    let companyInfo = null;
    let companyAddress = null;
    let horarioFuncionamento = null;
    
    if (company?.id) {
      // Buscar informações da empresa
      const { data: infoData } = await supabase
        .from("company_info")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();
      companyInfo = infoData;

      // Buscar endereço principal
      const { data: addressData } = await supabase
        .from("company_addresses")
        .select("*")
        .eq("company_id", company.id)
        .eq("is_principal", true)
        .maybeSingle();
      companyAddress = addressData;

      // Buscar horário de funcionamento
      const { data: horarioData } = await supabase
        .from("horario_funcionamento")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();
      horarioFuncionamento = horarioData;

      // Buscar horários específicos se disponível
      if (horarioData?.tipo_disponibilidade === 'especificos') {
        const { data: horariosDetalhados } = await supabase
          .from("horarios_dias")
          .select("*")
          .eq("horario_funcionamento_id", horarioData.id)
          .eq("ativo", true)
          .order("dia_semana");
        
        if (horariosDetalhados?.length) {
          // Formatar horários por dia da semana
          const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const horariosFormatados = horariosDetalhados.map(h => 
            `${diasSemana[h.dia_semana]}: ${h.horario_inicio.slice(0,5)} às ${h.horario_fim.slice(0,5)}`
          ).join('\n');
          
          horarioFuncionamento = {
            ...horarioData,
            horarios_detalhados: horariosFormatados
          };
        }
      }
    }

    console.log('🏪 Informações da empresa:', companyInfo);
    console.log('📍 Endereço da empresa:', companyAddress);
    console.log('⏰ Horário de funcionamento:', horarioFuncionamento);

    // Buscar mapeamento para Assistants (por loja)
    let assistantMap: any = null;
    if (company?.id) {
      const { data: mapData, error: mapErr } = await supabase
        .from('ai_agent_assistants')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();
      if (mapErr) {
        console.log('⚠️ Erro ao buscar ai_agent_assistants:', mapErr);
      } else {
        console.log('✅ [DEBUG INVESTIGAÇÃO] Dados retornados da query ai_agent_assistants:', JSON.stringify(mapData, null, 2));
        console.log('✅ [DEBUG INVESTIGAÇÃO] use_direct_mode value:', mapData?.use_direct_mode);
        console.log('✅ [DEBUG INVESTIGAÇÃO] use_direct_mode type:', typeof mapData?.use_direct_mode);
        console.log('✅ [DEBUG INVESTIGAÇÃO] use_direct_mode === true:', mapData?.use_direct_mode === true);
      }
      assistantMap = mapData || null;
      
      // 🚀 NOVA LÓGICA: Se use_direct_mode está ativo, redirecionar para ai-chat-direct
      if (assistantMap?.use_direct_mode === true) {
        console.log('🔄 [MODO DIRETO] Redirecionando para ai-chat-direct...');
        
        try {
          // Preparar payload para ai-chat-direct
          const directPayload = {
            company_id: company.id,
            company_slug: company.slug || slug_empresa,
            user_message: user_message,
            conversation_history: historico || [],
            customer_phone: customer_phone,
            customer_name: customer_name
          };
          
          console.log('🚀 [MODO DIRETO] Enviando para ai-chat-direct:', { 
            company_id: company.id, 
            company_slug: company.slug,
            message_preview: user_message?.substring(0, 50) 
          });
          
          // Chamar ai-chat-direct
          const { data: directResponse, error: directError } = await supabase.functions.invoke('ai-chat-direct', {
            body: directPayload
          });
          
          if (directError) {
            console.log('❌ [MODO DIRETO] Erro ao chamar ai-chat-direct:', directError);
            // Fallback para o modo legado se der erro
            console.log('🔄 [FALLBACK] Continuando com modo legado devido ao erro...');
          } else {
            console.log('✅ [MODO DIRETO] Resposta recebida de ai-chat-direct:', directResponse);
            
            // Retornar resposta do modo direto
            return new Response(JSON.stringify({
              resposta: directResponse?.response || directResponse?.content || 'Resposta gerada pelo modo direto',
              mode: 'direct',
              assistant_used: true
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } catch (error) {
          console.log('❌ [MODO DIRETO] Erro na chamada:', error);
          console.log('🔄 [FALLBACK] Continuando com modo legado devido ao erro...');
        }
      }
    }

    const nomeEmpresa = company?.name || "Minha Empresa";
    const nomeAssistente = assistantMap?.bot_name || config?.agent_name || "Assistente Virtual";

    // Buscar cardápio da empresa
    let itens = [];
    if (company) {
      const { data: produtos } = await supabase
        .from("produtos")
        .select("*")
        .eq("company_id", company.id)
        .eq("is_available", true)
        .order("name", { ascending: true });
      
      itens = produtos || [];
    }

    console.log('📋 Itens do cardápio encontrados:', itens?.length || 0);

    const hoje = new Date().toISOString().split("T")[0];

    // Filtrar promoções válidas baseadas no is_promotional
    const promocoesValidas = itens.filter(i =>
      i.is_promotional &&
      i.promotional_price &&
      i.promotional_price < i.price
    );

    const formatPreco = (p: any) =>
      typeof p === "number" ? p.toFixed(2).replace(".", ",") : p;

    // Formatar cardápio conforme especificado
    const cardapioFormatado = itens.length ? 
      itens.map(p => {
        const precoAtual = p.is_promotional && p.promotional_price ? p.promotional_price : p.price;
        const isPromocao = p.is_promotional && p.promotional_price;
        const textoItem = `• ${p.name} – R$ ${formatPreco(precoAtual)}`;
        
        if (isPromocao) {
          return `${textoItem} (**promoção**)`;
        }
        
        if (p.description) {
          return `${textoItem} - ${p.description}`;
        }
        
        return textoItem;
      }).join("\n") 
      : "Cardápio em atualização.";

    // Criar link do cardápio limpo, garantindo remoção de TODOS os caracteres problemáticos
    // 1) Tentar extrair o slug do cardapio_url salvo no assistant (se houver)
    const assistantSlugMatch = assistantMap?.cardapio_url
      ? String(assistantMap.cardapio_url).match(/pedido\.dominio\.tech\/([A-Za-z0-9_-]+)/i)
      : null;
    const slugFromAssistant = assistantSlugMatch?.[1] || '';
    // 2) Fallbacks: companies.slug -> slug_empresa recebido
    const computedSlug = (slugFromAssistant
      || (company?.slug ? company.slug : '')
      || (slug_empresa || '')
    ).trim().replace(/[^\w-]/g, '');

    let linkCardapio = computedSlug
      ? `https://pedido.dominio.tech/${computedSlug}`
      : "https://pedido.dominio.tech";
    
    // NÃO limpar demais - manter caracteres essenciais da URL
    linkCardapio = linkCardapio.replace(/[^\x20-\x7E]/g, '').trim();
    
    console.log('🔗 Link do cardápio gerado:', linkCardapio, { slugFromAssistant, companySlug: company?.slug, slug_empresa });

    // Verificar se é primeira mensagem (mensagem simples como "Olá", "Oi", etc.)
    const isFirstMessage = user_message.toLowerCase().trim().match(/^(oi|olá|ola|hello|hi|bom dia|boa tarde|boa noite)!?$/i);
    
    console.log(`🔍 Análise da mensagem: "${user_message}" - É primeira mensagem: ${!!isFirstMessage}`);
    
    // SEMPRE ENVIAR CARDÁPIO NA PRIMEIRA MENSAGEM (somente quando NÃO há assistant configurado)
    // 🚨 MODO DIRETO OBRIGATÓRIO - BLOQUEAR LÓGICA LEGADA
    if (assistantMap?.use_direct_mode === true) {
      console.log('🚫 [AGENTE-IA-CONVERSA] BLOQUEADO - Modo direto ativo, não processar aqui');
      return new Response(JSON.stringify({ 
        resposta: "Modo direto ativo - função legada bloqueada",
        blocked: true,
        redirect_to_direct: true
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Lógica legada (só para empresas SEM modo direto)
    if (isFirstMessage && company && !(assistantMap?.assistant_id)) {
      // Criar mensagem mais conversacional e natural
      const nomeCliente = customer_name && customer_name !== 'Cliente' ? customer_name : '';
      const saudacao = nomeCliente ? `Oi ${nomeCliente}! 😊` : 'Oi! Tudo bem? 😊';
      const nomeAssistenteBemVindo = config?.agent_name || 'Assistente Virtual';
      
      const safeMenu = ensureCleanMenuUrl(linkCardapio);
      // Garantir que o link seja incluído diretamente - URL hardcoded para garantir funcionamento
      const cardapioUrl = `https://pedido.dominio.tech/${cleanSlug || 'dominiopizzas'}`;
      const welcomeMessage = `${saudacao}\n\nSou ${nomeAssistenteBemVindo} da ${nomeEmpresa}!\n\nVou te ajudar com o seu pedido.\n\n🍽️ Confira nosso cardápio: ${cardapioUrl}\n\nO que você gostaria de pedir hoje? 🍕`;
      
      console.log('📋 Primeira mensagem detectada (sem assistant) - enviando cardápio:', welcomeMessage);
      return new Response(JSON.stringify({ resposta: welcomeMessage }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 🎯 PRIORIDADE: Buscar template PERSONALIZADO da tela primeiro
    let globalTemplate = null;
    let isCustomTemplate = false;
    
    console.log('🔍 Verificando template personalizado para slug:', company?.slug);
    if (customPrompt?.template) {
      console.log('✅ Template PERSONALIZADO encontrado - priorizando sobre template global');
      globalTemplate = {
        template: customPrompt.template,
        default_vars: customPrompt.vars || {}
      };
      isCustomTemplate = true;
    } else {
      // Fallback: buscar template global se não há personalizado
      console.log('📡 Buscando template global ativo...');
      const { data: globalTemplateData, error: globalTemplateError } = await supabase
        .from('ai_global_prompt_template')
        .select('template, default_vars')
        .eq('is_active', true)
        .maybeSingle();
      
      if (globalTemplateError) {
        console.log('❌ Erro ao buscar template global:', globalTemplateError);
      }
      if (globalTemplateData) {
        globalTemplate = globalTemplateData;
        console.log('✅ Template global encontrado no Supabase (sem personalização)');
      } else {
        console.log('⚠️ Nenhum template encontrado - usando fallback');
      }
    }

    let system_prompt;
    
    if (globalTemplate?.template) {
      // Usar template global com variáveis dinâmicas
      console.log('🎨 Renderizando template global');
      
      // Preparar informações da empresa para o template
      const companyDetails = {
        // Informações básicas
        nome_estabelecimento: companyInfo?.nome_estabelecimento || nomeEmpresa,
        cnpj_cpf: companyInfo?.cnpj_cpf || '',
        razao_social: companyInfo?.razao_social || nomeEmpresa,
        segmento: companyInfo?.segmento || 'Alimentação',
        instagram: companyInfo?.instagram || '',
        telefone_principal: companyInfo?.contato || '',
        telefone_secundario: companyInfo?.telefone2 || '',
        
        // Endereço
        endereco_completo: companyAddress ? 
          `${companyAddress.logradouro}, ${companyAddress.numero}${companyAddress.complemento ? ', ' + companyAddress.complemento : ''}, ${companyAddress.bairro}, ${companyAddress.cidade} - ${companyAddress.estado}${companyAddress.cep ? ', CEP: ' + companyAddress.cep : ''}` 
          : companyInfo?.endereco || '',
        endereco_rua: companyAddress?.logradouro || '',
        endereco_numero: companyAddress?.numero || '',
        endereco_complemento: companyAddress?.complemento || '',
        endereco_bairro: companyAddress?.bairro || '',
        endereco_cidade: companyAddress?.cidade || '',
        endereco_estado: companyAddress?.estado || '',
        endereco_cep: companyAddress?.cep || '',
        endereco_referencia: companyAddress?.referencia || '',
        
        // Horário de funcionamento - VERIFICAR SE ESTÁ ABERTO AGORA
        horario_funcionamento: await (async () => {
          let statusFuncionamento = 'Sempre aberto';
          let proximaAbertura = '';
          
          if (horarioFuncionamento?.tipo_disponibilidade === 'especificos') {
            // Buscar horários específicos
            const { data: horariosDetalhados } = await supabase
              .from("horarios_dias")
              .select("*")
              .eq("horario_funcionamento_id", horarioFuncionamento.id)
              .eq("ativo", true);
            
            if (horariosDetalhados?.length) {
              const now = new Date();
              const fusoHorario = horarioFuncionamento.fuso_horario || 'America/Sao_Paulo';
              
              // Converter para o fuso horário correto
              const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: fusoHorario}));
              const currentDayOfWeek = timeInTimezone.getDay();
              const currentTimeString = timeInTimezone.toTimeString().slice(0, 5);
              
              const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
              
              console.log('🕐 VERIFICAÇÃO DE HORÁRIO:', {
                fusoHorario,
                currentDayOfWeek,
                nomeDia: diasSemana[currentDayOfWeek],
                currentTimeString,
                horarios: horariosDetalhados.filter(h => h.dia_semana === currentDayOfWeek)
              });
              
              // Verificar horários de hoje
              const todaySchedules = horariosDetalhados.filter(h => h.dia_semana === currentDayOfWeek);
              
              if (todaySchedules.length === 0) {
                // Procurar próxima abertura
                for (let i = 1; i <= 7; i++) {
                  const proximoDia = (currentDayOfWeek + i) % 7;
                  const horariosProximoDia = horariosDetalhados.filter(h => h.dia_semana === proximoDia);
                  
                  if (horariosProximoDia.length > 0) {
                    const primeiroHorario = horariosProximoDia[0];
                    const inicioHorario = primeiroHorario.horario_inicio.slice(0, 5);
                    if (i === 1) {
                      proximaAbertura = `amanhã (${diasSemana[proximoDia]}) às ${inicioHorario}`;
                    } else {
                      proximaAbertura = `${diasSemana[proximoDia]} às ${inicioHorario}`;
                    }
                    break;
                  }
                }
                statusFuncionamento = `Fechado hoje - ${proximaAbertura ? 'Abre ' + proximaAbertura : 'sem horário definido'}`;
              } else {
                // Verificar se está aberto agora
                const isOpenNow = todaySchedules.some(schedule => {
                  const inicio = schedule.horario_inicio.slice(0, 5);
                  const fim = schedule.horario_fim.slice(0, 5);
                  return currentTimeString >= inicio && currentTimeString <= fim;
                });
                
                if (isOpenNow) {
                  const scheduleAtual = todaySchedules.find(schedule => {
                    const inicio = schedule.horario_inicio.slice(0, 5);
                    const fim = schedule.horario_fim.slice(0, 5);
                    return currentTimeString >= inicio && currentTimeString <= fim;
                  });
                  const fechaAs = scheduleAtual?.horario_fim.slice(0, 5);
                  statusFuncionamento = `Aberto agora até ${fechaAs}`;
                } else {
                  // Procurar próximo horário hoje ou nos próximos dias
                  let proximoHorario = null;
                  
                  // Primeiro, verificar se há mais horários hoje
                  for (const horario of todaySchedules) {
                    const inicioHorario = horario.horario_inicio.slice(0, 5);
                    if (currentTimeString < inicioHorario) {
                      proximoHorario = `hoje às ${inicioHorario}`;
                      break;
                    }
                  }
                  
                  // Se não há mais horários hoje, buscar próximos dias
                  if (!proximoHorario) {
                    for (let i = 1; i <= 7; i++) {
                      const proximoDia = (currentDayOfWeek + i) % 7;
                      const horariosProximoDia = horariosDetalhados.filter(h => h.dia_semana === proximoDia);
                      
                      if (horariosProximoDia.length > 0) {
                        const primeiroHorario = horariosProximoDia[0];
                        const inicioHorario = primeiroHorario.horario_inicio.slice(0, 5);
                        if (i === 1) {
                          proximoHorario = `amanhã (${diasSemana[proximoDia]}) às ${inicioHorario}`;
                        } else {
                          proximoHorario = `${diasSemana[proximoDia]} às ${inicioHorario}`;
                        }
                        break;
                      }
                    }
                  }
                  
                  statusFuncionamento = `Fechado - ${proximoHorario ? 'Abre ' + proximoHorario : 'sem horário definido'}`;
                }
              }
            }
          } else if (horarioFuncionamento?.tipo_disponibilidade === 'fechado') {
            statusFuncionamento = 'Fechado permanentemente';
          }
          
          console.log('📊 STATUS CALCULADO:', statusFuncionamento);
          return horarioFuncionamento?.horarios_detalhados || 
                 config?.working_hours || 
                 horarioFuncionamento?.tipo_disponibilidade || 
                 '24/7';
        })(),
        working_hours: await (async () => {
          // Status atual calculado para o template
          let statusFuncionamento = 'Sempre aberto';
          
          if (horarioFuncionamento?.tipo_disponibilidade === 'especificos') {
            const { data: horariosDetalhados } = await supabase
              .from("horarios_dias")
              .select("*")
              .eq("horario_funcionamento_id", horarioFuncionamento.id)
              .eq("ativo", true);
            
            if (horariosDetalhados?.length) {
              const now = new Date();
              const fusoHorario = horarioFuncionamento.fuso_horario || 'America/Sao_Paulo';
              const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: fusoHorario}));
              const currentDayOfWeek = timeInTimezone.getDay();
              const currentTimeString = timeInTimezone.toTimeString().slice(0, 5);
              const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
              
              const todaySchedules = horariosDetalhados.filter(h => h.dia_semana === currentDayOfWeek);
              
              if (todaySchedules.length === 0) {
                statusFuncionamento = 'Fechado hoje';
              } else {
                const isOpenNow = todaySchedules.some(schedule => {
                  const inicio = schedule.horario_inicio.slice(0, 5);
                  const fim = schedule.horario_fim.slice(0, 5);
                  return currentTimeString >= inicio && currentTimeString <= fim;
                });
                
                if (isOpenNow) {
                  const scheduleAtual = todaySchedules.find(schedule => {
                    const inicio = schedule.horario_inicio.slice(0, 5);
                    const fim = schedule.horario_fim.slice(0, 5);
                    return currentTimeString >= inicio && currentTimeString <= fim;
                  });
                  const fechaAs = scheduleAtual?.horario_fim.slice(0, 5);
                  statusFuncionamento = `Aberto agora até ${fechaAs}`;
                } else {
                  // Procurar próximo horário hoje
                  let proximoHorario = null;
                  for (const horario of todaySchedules) {
                    const inicioHorario = horario.horario_inicio.slice(0, 5);
                    if (currentTimeString < inicioHorario) {
                      proximoHorario = `hoje às ${inicioHorario}`;
                      break;
                    }
                  }
                  
                  if (!proximoHorario) {
                    // Buscar próximos dias
                    for (let i = 1; i <= 7; i++) {
                      const proximoDia = (currentDayOfWeek + i) % 7;
                      const horariosProximoDia = horariosDetalhados.filter(h => h.dia_semana === proximoDia);
                      
                      if (horariosProximoDia.length > 0) {
                        const primeiroHorario = horariosProximoDia[0];
                        const inicioHorario = primeiroHorario.horario_inicio.slice(0, 5);
                        if (i === 1) {
                          proximoHorario = `amanhã (${diasSemana[proximoDia]}) às ${inicioHorario}`;
                        } else {
                          proximoHorario = `${diasSemana[proximoDia]} às ${inicioHorario}`;
                        }
                        break;
                      }
                    }
                  }
                  
                  statusFuncionamento = `Fechado - ${proximoHorario ? 'Abre ' + proximoHorario : 'sem horário definido'}`;
                }
              }
            }
          } else if (horarioFuncionamento?.tipo_disponibilidade === 'fechado') {
            statusFuncionamento = 'Fechado permanentemente';
          }
          
          return statusFuncionamento;
        })(),
        fuso_horario: horarioFuncionamento?.fuso_horario || 'America/Sao_Paulo'
      };

      const templateVars = {
        ...globalTemplate.default_vars,
        company_slug: company?.slug || 'test',
        agent_name: config?.agent_name || nomeAssistente,
        company_name: nomeEmpresa,
        customer_name: customer_name || 'Cliente', // Nome do cliente do WhatsApp
        menu_data: cardapioFormatado,
        menu_markdown: cardapioFormatado,
        personality: config?.personality === 'vendedor' ? 'Persuasiva e destaque benefícios' : 
          config?.personality === 'profissional' ? 'Formal e direta' :
          config?.personality === 'consultivo' ? 'Educativa e informativa' :
          config?.personality === 'descontraido' ? 'Descontraída e próxima' : 'Calorosa e amigável',
        sales_phrases: config?.sales_phrases || 'Confira nossos destaques! Posso te sugerir algo especial?',
        cardapio_url: linkCardapio,  // CORRIGIDO: usar cardapio_url (variável padrão)
        // Adicionar todas as informações da empresa
        ...companyDetails
      };
      
      console.log('🔍 DEBUG - customer_name recebido:', customer_name);
      console.log('🔍 DEBUG - templateVars customer_name:', templateVars.customer_name);
      console.log('🔍 DEBUG - templateVars cardapio_url:', templateVars.cardapio_url);
      console.log('🔍 DEBUG - linkCardapio original:', linkCardapio);
      console.log('🔍 DEBUG - template antes:', globalTemplate.template.substring(0, 200));
      console.log('🔍 DEBUG - isCustomTemplate:', isCustomTemplate);
      
      system_prompt = renderTemplate(globalTemplate.template, templateVars);
      
      console.log('🔍 DEBUG - template depois da renderização:', system_prompt.substring(0, 500));
      console.log(`✅ Prompt renderizado com template ${isCustomTemplate ? 'PERSONALIZADO da tela' : 'GLOBAL padrão'}`);
      console.log('🎭 Template vars usadas:', { 
        customer_name: templateVars.customer_name, 
        agent_name: templateVars.agent_name,
        customer_name_original: customer_name,
        cardapio_url: templateVars.cardapio_url,
        template_contains_cardapio_url: globalTemplate.template.includes('{{cardapio_url}}')
      });
      
    } else {
      console.log('📝 Usando prompt fallback mínimo (template ausente)');
      system_prompt = `
Você é ${config?.agent_name || nomeAssistente}, assistente virtual da ${nomeEmpresa}.
Siga as melhores práticas de atendimento e seja objetivo e cordial.
Responda sempre com base nas informações dos produtos que você possui.
      `.trim();
    }

    console.log('📝 System prompt criado');

    const structuredRules = `
🚨 REGRA DE LINKS
- Use APENAS esta URL exata do cardápio: ${linkCardapio}
- Envie o link na primeira resposta (após a saudação).
- Nas respostas seguintes, só repita o link quando fizer sentido (cliente pedir, falar de ver opções, preço total, finalizar pedido).

🧭 TOM E CONDUÇÃO
- Positivo e acolhedor, sem ser invasivo.
- Sem CTA: não faça perguntas adicionais se o cliente não pediu recomendações.
- Responda SOMENTE o que foi perguntado. Evite perguntas como “Prefere X ou Y?”.
- Só sugira itens se o cliente pedir recomendações explicitamente.
- Quando pertinente, oriente a pedir pelo link do cardápio (sem insistência).

⏰ STATUS DE FUNCIONAMENTO
- Status calculado para agora (use para responder “estamos abertos?”): ${templateVars.working_hours}

📋 INSTRUÇÕES
Use ferramentas (tools) para informações factuais (produtos, preços, horários). Não invente dados.

Schema:
{
  "type": "greeting|answer|handover|ask_location",
  "messages": ["..."],
  "products": [{"name": "...", "description": "...", "price_min": 0, "price_max": 0}],
  "links": {"menu":"${linkCardapio}","orders":""},
  "handover": false
}

Se não houver dados para algum campo, omita-o.
Para pizzas, informe preço por sabor e que o total aparece no cardápio.
SEMPRE use o link exato: ${linkCardapio}
`;

    // Concatenar instruções extras do prompt da loja, quando disponíveis
    let extraInstructionsText = '';
    try {
      const { data: promptData } = await supabase
        .from('ai_agent_prompts')
        .select('vars')
        .eq('agent_slug', company?.slug || 'test')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const extra = promptData?.vars?.extra_instructions;
      if (typeof extra === 'string' && extra.trim().length > 0) {
        extraInstructionsText = `\n\n🔧 INSTRUÇÕES EXTRAS (Específicas da Loja):\n${extra.trim()}`;
      }
    } catch (_) {}

    const messages = [
      { role: "system", content: system_prompt + "\n\n" + structuredRules + extraInstructionsText },
      ...(historico || []),
      { role: "user", content: sanitizedMessage }
    ];

    console.log('🚀 Preparando chamada ao OpenAI...');
    console.log('🔍 [UPDATED] DEBUG - assistantMap:', assistantMap);
    console.log('🔍 [UPDATED] DEBUG - use_direct_mode:', assistantMap?.use_direct_mode);
    console.log('🔍 [UPDATED] DEBUG - assistant_id:', assistantMap?.assistant_id);
    console.log('🔍 [UPDATED] DEBUG - empresa ID:', company?.id);

    // NOVO: Verificar se deve usar modo direto (Chat Completions) ou legado (Assistants) - FORÇA UPDATE
    if (assistantMap?.use_direct_mode === true) {
      console.log('🔥 Usando MODO DIRETO (Chat Completions) para empresa:', company?.id);
      console.log('🔍 DEBUG - Company slug:', company?.slug);
      console.log('🔍 DEBUG - customPrompt encontrado?', !!customPrompt);
      console.log('🔍 DEBUG - Dados sendo enviados para ai-chat-direct:', {
        company_id: company?.id,
        company_slug: company?.slug,
        user_message: sanitizedMessage.substring(0, 50),
        customer_name: customer_name
      });
      
      // Chamar ai-chat-direct diretamente
      const directResponse = await supabase.functions.invoke('ai-chat-direct', {
        body: {
          company_id: company?.id,
          company_slug: company?.slug,
          user_message: sanitizedMessage,
          conversation_history: historico || [],
          customer_phone: customer_phone,
          customer_name: customer_name,
          chat_id: customer_phone + '@s.whatsapp.net'
        }
      });

      if (directResponse.error) {
        console.error('❌ Erro na função ai-chat-direct:', directResponse.error);
        console.error('❌ Erro detalhado:', JSON.stringify(directResponse.error, null, 2));
        throw new Error(`Erro no modo direto: ${directResponse.error.message}`);
      }

      console.log('🔍 DEBUG - directResponse completa:', directResponse);

      if (!directResponse.data?.success) {
        console.error('❌ Modo direto retornou erro:', directResponse.data?.error);
        console.error('❌ Data completa:', JSON.stringify(directResponse.data, null, 2));
        throw new Error(`Erro no modo direto: ${directResponse.data?.error}`);
      }

      console.log('✅ Resposta do modo direto recebida:', directResponse.data.response?.substring(0, 100));
      const finalResponse = sanitizeCompleteMessage(directResponse.data.response, linkCardapio);
      
      return new Response(JSON.stringify({ 
        resposta: finalResponse, 
        mode: 'direct',
        tokens_used: directResponse.data.tokens_used,
        response_time_ms: directResponse.data.response_time_ms
      }), {
        headers: corsHeaders,
        status: 200
      });
    }

    // Se a loja tiver assistant_id configurado, usar Assistants API (MODO LEGADO)
    if (assistantMap?.assistant_id) {
      console.log('🧠 Usando MODO LEGADO (Assistant ID):', assistantMap.assistant_id);

      // Carregar JSONs do Storage (privado)
      let produtosText = '';
      let configText = '';
      try {
        if (assistantMap.produtos_path) {
          const { data } = await supabase.storage.from('ai-knowledge').download(assistantMap.produtos_path);
          if (data) produtosText = await data.text();
        }
      } catch (err) {
        console.log('⚠️ Não foi possível carregar produtos.json:', err);
      }
      try {
        if (assistantMap.config_path) {
          const { data } = await supabase.storage.from('ai-knowledge').download(assistantMap.config_path);
          if (data) configText = await data.text();
        }
      } catch (err) {
        console.log('⚠️ Não foi possível carregar config.json:', err);
      }

      // Fallback: se não houver arquivos no Storage, montar JSON a partir do banco
      if (!produtosText || !produtosText.trim()) {
        try {
          const lista = (itens || []).map((p: any) => ({
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            promotional_price: p.promotional_price != null ? Number(p.promotional_price) : null,
            is_promotional: !!(p.is_promotional && p.promotional_price && Number(p.promotional_price) < Number(p.price)),
            is_available: !!p.is_available
          }));
          produtosText = JSON.stringify({ produtos: lista }, null, 2);
        } catch (_) {
          // mantém vazio se falhar
        }
      }
      if (!configText || !configText.trim()) {
        try {
          const cfg = {
            restaurante: nomeEmpresa,
            horario_atendimento: config?.working_hours || '24/7',
            moeda: 'BRL',
            cardapio_url: linkCardapio
          };
          configText = JSON.stringify(cfg, null, 2);
        } catch (_) {
          // mantém vazio se falhar
        }
      }

      const cardapioUrl = assistantMap.cardapio_url || linkCardapio;

      const additionalInstructions = `
INSTRUÇÕES CRÍTICAS PARA ${nomeAssistente} DA ${nomeEmpresa}:

🚨 REGRA FUNDAMENTAL DE LINKS:
- Use APENAS esta URL exata sem modificações: ${cardapioUrl}
- JAMAIS adicione caracteres especiais, espaços ou pontuação na URL
- Mencione o cardápio apenas quando solicitado ou na saudação inicial
- Use o link limpo do cardápio quando apropriado: ${cardapioUrl}
- Evite repetir o link múltiplas vezes na mesma conversa

📋 REGRAS OBRIGATÓRIAS:
- Nunca invente informações. Use apenas dados do CONTEXTO JSON
- Nunca mencione nomes de arquivos técnicos
- Valores sempre em Real brasileiro (R$ 0,00)
- Para promoções: verifique "is_promotional": true no JSON
- Para pizzas: informe preço por sabor, valor total no cardápio
- Boas-vindas: apresente-se, cite ${nomeEmpresa}, link ${cardapioUrl}
- Não finalize pedidos; direcione para o cardápio
- Para entregas: peça localização do cliente
- Para horários: use apenas "horario_atendimento" do JSON

🚨 REGRAS CRÍTICAS:
- Mencione o cardápio quando solicitado ou na saudação
- Use sempre o link limpo: ${cardapioUrl}
- Evite repetir o link na mesma conversa

Responda sempre que possível no JSON abaixo (sem texto extra):
{
  "type": "greeting|answer|handover|ask_location",
  "messages": ["..."],
  "products": [{"name": "...", "description": "...", "price_min": 0, "price_max": 0}],
  "links": {"menu":"${cardapioUrl}","orders":""},
  "handover": false
}

Se não conseguir responder em JSON, retorne texto simples com o link correto.`;

      // REMOVIDO: Sincronização automática que estava sobrescrevendo o template personalizado
      // A sincronização deve ser feita apenas pela função sync-assistant
      console.log('⚠️ Sincronização automática removida - use sync-assistant para atualizar instruções');

      // Montar mensagens do thread (histórico + contexto + última mensagem)
      const threadMessages: Array<{role: string; content: string}> = [];
      if (Array.isArray(historico)) {
        for (const m of historico) {
          if (m?.role && m?.content) {
            const role = m.role === 'assistant' ? 'assistant' : 'user';
            threadMessages.push({ role, content: String(m.content) });
          }
        }
      }

      // Injetar contexto vivo (JSONs) sem citar nomes de arquivos
      const contextoCompacto = `CONTEXT\nLoja: ${nomeEmpresa}\nCardápio URL: ${cardapioUrl}\nRegras acima.\nCONFIG JSON (fonte da loja):\n${configText || '(indisponível)'}\n\nPRODUTOS JSON (fonte da loja):\n${produtosText || '(indisponível)'}\n--- FIM DO CONTEXTO ---`;
      threadMessages.push({ role: 'user', content: contextoCompacto });
      threadMessages.push({ role: 'user', content: sanitizedMessage });

      // Criar Thread
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json', 'OpenAI-Beta': 'assistants=v2' },
        body: JSON.stringify({ messages: threadMessages })
      });
      if (!threadRes.ok) {
        console.log('❌ Erro ao criar thread:', await threadRes.text());
        throw new Error(`Erro ao criar thread (${threadRes.status})`);
      }
      const thread = await threadRes.json();

      // Iniciar Run
      const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json', 'OpenAI-Beta': 'assistants=v2' },
        body: JSON.stringify({ assistant_id: assistantMap.assistant_id, additional_instructions: additionalInstructions })
      });
      if (!runRes.ok) {
        console.log('❌ Erro ao iniciar run:', await runRes.text());
        throw new Error(`Erro ao iniciar run (${runRes.status})`);
      }
      const run = await runRes.json();

      // Poll ultra-otimizado para velocidade máxima
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      let status = run.status;
      let safetyStop = 0;
      let pollInterval = 50; // Começar com 50ms (máxima velocidade)
      
      while (!['completed', 'failed', 'cancelled', 'expired'].includes(status) && safetyStop < 30) {
        await sleep(pollInterval);
        const chk = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'OpenAI-Beta': 'assistants=v2' }
        });
        const chkJson = await chk.json();
        status = chkJson.status;
        safetyStop++;
        
        // Aumentar gradualmente mas mantendo velocidade
        if (safetyStop > 2) pollInterval = 75;   // Após 2 tentativas: 75ms
        if (safetyStop > 5) pollInterval = 100;  // Após 5 tentativas: 100ms
        if (safetyStop > 10) pollInterval = 150; // Após 10 tentativas: 150ms
        if (safetyStop > 20) pollInterval = 250; // Após 20 tentativas: 250ms
        
        console.log(`⚡ Poll ${safetyStop}: status=${status}, interval=${pollInterval}ms`);
      }

      if (status !== 'completed') {
        console.log('⚠️ Run não completou. Status:', status);
        // Fallback breve com resposta padrão
        return new Response(JSON.stringify({ resposta: 'No momento não consegui finalizar sua resposta. Pode repetir por favor?' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Buscar última mensagem do assistant
      const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages?limit=10&order=desc`, {
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'OpenAI-Beta': 'assistants=v2' }
      });
      const msgs = await msgsRes.json();
      let resposta = 'Desculpe, não consegui processar sua mensagem agora.';
      if (msgs?.data?.length) {
        const first = msgs.data.find((m: any) => m.role === 'assistant') || msgs.data[0];
        if (first?.content?.length) {
          const textPart = first.content.find((c: any) => c.type === 'text');
          resposta = textPart?.text?.value || first.content[0]?.text?.value || resposta;
        }
      }

      // Processar resposta para renderização amigável
      let finalResponse = resposta;
      try {
        // Tentar detectar se é JSON
        const jsonMatch = resposta.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          finalResponse = renderResponseToText(jsonData, cardapioUrl);
        }
      } catch (err) {
        // Se não for JSON válido, manter resposta original
        console.log('📝 Resposta não é JSON, mantendo original');
      }

      // CRÍTICO: Substituir variáveis do template mesmo se não for JSON
      if (finalResponse.includes('{{cardapio_url}}')) {
        finalResponse = finalResponse.replace(/\{\{cardapio_url\}\}/g, cardapioUrl);
        console.log('🔗 Substituiu {{cardapio_url}} por:', cardapioUrl);
      }
      if (finalResponse.includes('{{company_name}}')) {
        finalResponse = finalResponse.replace(/\{\{company_name\}\}/g, nomeEmpresa);
        console.log('🏢 Substituiu {{company_name}} por:', nomeEmpresa);
      }

      // NÃO sanitizar se já contém link válido
      const safeMenu = ensureCleanMenuUrl(cardapioUrl);
      if (!finalResponse.includes('pedido.dominio.tech') && safeMenu) {
        finalResponse = sanitizeCompleteMessage(finalResponse, safeMenu);
      }

      return new Response(JSON.stringify({ resposta: finalResponse, assistant_id: assistantMap.assistant_id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // Chat Completions com Function Calling (sem assistant_id)
    // Definição das TOOLS (funções)
    const tools = [
      {
        type: "function",
        function: {
          name: "search_products",
          description: "Busca produtos por termo e retorna min/max e flags.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              limit: { type: "number" }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_hours",
          description: "Retorna status de abertura e tempos estimados.",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "ask_delivery_location",
          description: "Retorna instrução para o cliente compartilhar localização.",
          parameters: { type: "object", properties: {} }
        }
      }
    ];

    const safeJsonParse = (txt: string) => {
      try { return JSON.parse(txt); } catch { return null; }
    };

    async function searchProductsImpl(query: string, limit = 6) {
      const term = (query || '').trim();
      if (!company?.id || !term) return { results: [] };
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('id, name, description, price, promotional_price, is_promotional, is_available')
        .eq('company_id', company.id)
        .eq('is_available', true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .order('name', { ascending: true })
        .limit(limit);
      if (error) {
        console.log('⚠️ searchProductsImpl erro:', error);
        return { results: [] };
      }
      const results = (produtos || []).map((p: any) => {
        const current = (p.is_promotional && p.promotional_price) ? Number(p.promotional_price) : Number(p.price);
        const nameLower = String(p.name || '').toLowerCase();
        const is_pizza = nameLower.includes('pizza') || nameLower.includes('pizzas');
        return {
          name: p.name,
          description: p.description || '',
          price_min: current,
          price_max: current,
          required_options: [],
          optional_options: [],
          is_pizza
        };
      });
      return { results, any_pizza: results.some((r: any) => r.is_pizza) };
    }

    async function getHoursImpl() {
      const working = (config?.working_hours || '24/7').toLowerCase();
      const aberto = working.includes('24/7') || working.includes('24x7');
      // Valores padrão conservadores; podem ser refinados conforme sua fonte real de horários
      return { aberto, entregaMin: 30, retiradaMin: 15, working_hours: config?.working_hours || '24/7' };
    }

    function askDeliveryLocationImpl() {
      return {
        message_lines: [
          'Para verificar se entregamos e o valor do frete, preciso da sua localização 📍',
          '',
          'Por favor, compartilhe sua localização aqui para eu consultar.'
        ]
      };
    }

    // Primeira chamada com tools - otimizada
    const completion1 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: globalConfig?.openai_model || "gpt-5-mini-2025-08-07", // Modelo mais rápido
        max_completion_tokens: globalConfig?.max_tokens || 100, // Reduzido para 100 tokens para mais velocidade
        // temperature removido para GPT-5+ (não suportado)
        tools,
        messages,
        timeout: 5000 // Timeout reduzido para 5 segundos
      })
    });

    if (!completion1.ok) {
      console.log('❌ Erro na API OpenAI (tools round 1):', completion1.status, completion1.statusText);
      throw new Error(`OpenAI API error: ${completion1.status}`);
    }

    const result1 = await completion1.json();
    const msg1 = result1.choices?.[0]?.message || {};
    const toolCalls = msg1.tool_calls || [];

    // Se houver tool calls, executar e fazer segunda chamada com resultados
    if (Array.isArray(toolCalls) && toolCalls.length) {
      console.log('🛠️ Tools chamadas:', toolCalls.map((c: any) => c.function?.name));
      const toolMessages: any[] = [];

      for (const call of toolCalls) {
        const fn = call.function?.name;
        const args = safeJsonParse(call.function?.arguments || '{}') || {};
        let content: any = null;
        try {
          if (fn === 'search_products') {
            content = await searchProductsImpl(args.query, args.limit || 6);
          } else if (fn === 'get_hours') {
            content = await getHoursImpl();
          } else if (fn === 'ask_delivery_location') {
            content = askDeliveryLocationImpl();
          } else {
            content = { error: 'função não implementada' };
          }
        } catch (err) {
          console.log('⚠️ Erro executando tool', fn, err);
          content = { error: String(err) };
        }
        toolMessages.push({ role: 'tool', tool_call_id: call.id, name: fn, content: JSON.stringify(content) });
      }

      const completion2 = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: globalConfig?.openai_model || "gpt-5-mini-2025-08-07", // Modelo mais rápido
          max_completion_tokens: globalConfig?.max_tokens || 100, // Reduzido para 100 tokens para mais velocidade  
          // temperature removido para GPT-5+ (não suportado)
          messages: [...messages, msg1, ...toolMessages],
          timeout: 5000 // Timeout reduzido para 5 segundos
        })
      });

      if (!completion2.ok) {
        console.log('❌ Erro na API OpenAI (tools round 2):', completion2.status, completion2.statusText);
        throw new Error(`OpenAI API error: ${completion2.status}`);
      }

      const result2 = await completion2.json();
      const finalMsg = result2.choices?.[0]?.message || {};
      let raw = finalMsg.content || '';
      
      // LIMPEZA AGRESSIVA DA RESPOSTA COM TOOLS
      raw = raw
        .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // Zero-width chars
        .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Weird spaces
        .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only safe ASCII + line breaks
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      const payload = typeof raw === 'string' ? safeJsonParse(raw) : null;

      return new Response(JSON.stringify({
        resposta: typeof raw === 'string' ? raw : 'OK',
        payload,
        tools_used: toolCalls.map((c: any) => c.function?.name)
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sem tool calls: processar resposta para renderização amigável
    let raw = msg1.content || 'Desculpe, não consegui processar sua mensagem agora.';
    
    // LIMPEZA AGRESSIVA DE QUALQUER RESPOSTA DA IA
    raw = raw
      .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // Zero-width chars
      .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Weird spaces
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only safe ASCII + line breaks
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    const payload = typeof raw === 'string' ? safeJsonParse(raw) : null;
    
    let finalResponse = typeof raw === 'string' ? raw : 'OK';
    try {
      // Tentar detectar se é JSON
      const jsonMatch = finalResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        finalResponse = renderResponseToText(jsonData, linkCardapio);
      }
    } catch (err) {
      // Se não for JSON válido, manter resposta original
      console.log('📝 Resposta não é JSON, mantendo original');
    }

    // NÃO sanitizar se já contém link válido
    if (!finalResponse.includes('pedido.dominio.tech') && linkCardapio) {
      finalResponse = sanitizeCompleteMessage(finalResponse, linkCardapio);
    }

    // LIMPEZA FINAL MAIS SUAVE - preservar URLs e emojis
    finalResponse = finalResponse
      .replace(/[\u200B-\u200F\u2060\uFEFF\u2000-\u206F]/g, '') // Zero-width chars
      .replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Weird spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    return new Response(JSON.stringify({ resposta: finalResponse, payload }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (e) {
    console.error('❌ Erro no agente IA:', e);
    return new Response(JSON.stringify({ 
      error: `Erro interno: ${(e as Error).message}` 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});