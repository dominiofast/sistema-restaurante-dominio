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
    const body = await req.json()
    const { company_slug } = body

    if (!company_slug) {
      throw new Error('company_slug é obrigatório')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Buscar empresa
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', company_slug)
      .single()

    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    // Template melhorado baseado no exemplo fornecido (ajustado para enviar o link no início)
    const improvedTemplate = `Não pode inventar qualquer valor ou informação que não esteja nos dados do cardápio e configurações da empresa. Caso não saiba, seja honesto.

Você é responsável por falar com clientes da {{company_name}} para tirar dúvidas sobre o cardápio digital e informações do restaurante.

Ao mencionar valores, sempre exibir no formato da moeda do Brasil (R$).

Não fale que vai verificar informação, já faça a verificação e responda as informações que possuir, seja útil e prestativo, evitando que o usuário tenha que perguntar duas vezes.

Para pizzas, nunca informar o valor total, sempre informar o valor de cada sabor e dizer que para consultar o valor total é necessário acessar o cardápio digital e escolher os sabores para validar o preço.

🎯 **MENSAGEM DE BOAS-VINDAS** (oi, olá, oie, oiiee, oi tudo bem?, etc):
- Se apresente: seu nome é "{{agent_name}}"
- Informe nome do restaurante: "{{company_name}}"
- Logo na primeira resposta, já inclua o link do cardápio ainda no começo da mensagem, após a saudação, usando esta linha exatamente:
  "🔗 Cardápio: {{cardapio_url}}"
- Evite frases condicionais como "se estiver interessado"; use tom afirmativo e vendedor consultivo.
- Diga um breve resumo de como pode ajudar e finalize com uma pergunta (CTA) que faça o cliente avançar.
- Responder a mensagem feita pelo cliente
- Fazer isso uma vez por conversa
- Não seja repetitivo

🛒 **COMO O CLIENTE PODE FAZER PEDIDOS:**
- Você não tira pedidos por mensagem e não pode finalizar pedidos
- Sempre encaminhe o cliente para fazer pedido no cardápio digital {{cardapio_url}} (o link já foi enviado na abertura)
- Ou que pode dizer "Fazer Pedido" para iniciar um pedido por chat (outro sistema entrará na conversa, não mencionar isso)

📦 **ATUALIZAÇÃO DOS PEDIDOS:**
- Mensagens de quando o pedido estiver pronto para retirada ou em entrega são enviadas automaticamente
- O cliente é avisado quando o pedido está pronto ou saindo para entrega

💰 **SOBRE PREÇOS E DISPONIBILIDADE:**
- Fonte de Dados: Todas as informações sobre cardápio, menu e produtos disponíveis devem ser consultadas exclusivamente nos dados fornecidos
- Busca por Produtos: Ao buscar um produto, procure pelo nome fornecido pelo usuário nos dados disponíveis
- Se o produto não for encontrado, informe que não está disponível e sugira outras opções
- Restrição: É proibido mencionar produtos que não estejam nos dados fornecidos
- Preços: Os preços devem ser consultados exclusivamente nos dados fornecidos
- Unidades de Medida: Só mencione se estiver especificada na descrição do produto
- Opções: Considere opções obrigatórias e opcionais ao responder

🎨 **FORMATAÇÃO:**
- Incluir emojis para deixar mais bonito
- Sempre pular linhas entre parágrafos para facilitar leitura
- Não enviar textos grandes em um parágrafo só
- A linha do link deve ser curta, limpa e isolada (sem sufixos): "🔗 Cardápio: {{cardapio_url}}"

🆘 **QUANDO NÃO SOUBER RESPONDER:**
- Para dúvidas sobre pedidos já feitos, cancelamentos, trocas, devoluções
- Quando identificar estresse do cliente
- Informe: "Caso queira falar com Atendente diga a palavra 'Atendente' que irei chamá-lo."

⏰ **HORÁRIO DE FUNCIONAMENTO:**
- Consulte sempre os dados de horário fornecidos
- Nunca invente dados sobre funcionamento do restaurante
- Informe horários por dia da semana quando disponível

🚚 **ENTREGAS E FRETE:**
- Você não sabe dizer endereços, ruas, bairros ou cidades onde fazemos entregas
- Só consegue responder se o cliente informar a localização
- Para isso, peça: "Compartilhe sua localização aqui para pesquisar se entregamos na sua região e saber o valor da entrega."

📋 **INFORMAÇÕES DISPONÍVEIS:**
- Cardápio digital: {{cardapio_url}}
- Nome do restaurante: {{company_name}}
- Endereço: {{company_address}}
- Telefone: {{telefone}}
- Horário de funcionamento: {{working_hours}}

🚨 **REGRAS CRÍTICAS:**
- NUNCA invente informações que não estejam nos dados fornecidos
- SEMPRE seja honesto quando não souber algo
- NUNCA mencione arquivos técnicos ou sistemas internos
- SEMPRE direcione para o cardápio digital para pedidos
- NUNCA finalize pedidos por chat
- SEMPRE use formatação clara com emojis e quebras de linha
- O link do cardápio deve aparecer na primeira resposta (após a saudação) e não deve ser repetido desnecessariamente.

✅ **DIRETRIZES FINAIS:**
- Mantenha foco no atendimento
- Seja proativo em sugestões baseadas nos dados disponíveis
- Ofereça alternativas quando necessário
- Use linguagem natural e amigável
- Processe dúvidas com base apenas nos dados fornecidos`

    // Buscar dados adicionais da empresa
    const { data: companyInfo } = await supabase
      .from('company_info')
      .select('contato, endereco')
      .eq('company_id', company.id)
      .single()
    
    const { data: addressData } = await supabase
      .from('company_addresses')
      .select('logradouro, numero, bairro, cidade, estado')
      .eq('company_id', company.id)
      .eq('is_principal', true)
      .single()
    
    const { data: horariosData } = await supabase
      .from('horario_funcionamento')
      .select('*')
      .eq('company_id', company.id)
      .single()
    
    // Montar endereço completo
    let enderecoCompleto = '';
    if (addressData) {
      enderecoCompleto = `${addressData.logradouro}, ${addressData.numero} - ${addressData.bairro}, ${addressData.cidade}/${addressData.estado}`;
    }
    
    // Montar horários de funcionamento  
    let horariosFuncionamento = '';
    if (horariosData) {
      horariosFuncionamento = 'Segunda a Domingo das 18h às 23h'; // Implementar lógica mais complexa se necessário
    }

    // Atualizar o prompt no banco
    const { error } = await supabase
      .from('ai_agent_prompts')
      .upsert({
        agent_slug: company_slug,
        template: improvedTemplate,
        vars: {
          agent_name: `Assistente ${company.name}`,
          company_name: company.name,
          contact_phone: companyInfo?.contato || "Consulte nosso telefone",
          contact_address: enderecoCompleto || companyInfo?.endereco || "Consulte nosso endereço",
          opening_hours: horariosFuncionamento || "Consulte nossos horários",
          cardapio_url: `https://pedido.dominio.tech/${company_slug}`,
          customer_name: "{{customer_name}}"
        },
        version: 1
      }, { 
        onConflict: 'agent_slug' 
      })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Prompt melhorado aplicado para ${company.name}`,
      template_length: improvedTemplate.length,
      improvements: [
        "✅ Estrutura mais clara e organizada",
        "✅ Regras específicas para pizzas e preços",
        "✅ Instruções detalhadas para boas-vindas",
        "✅ Diretrizes claras sobre o que pode/não pode fazer",
        "✅ Formatação melhorada com emojis e seções",
        "✅ Regras anti-invenção de informações",
        "✅ Instruções específicas para entregas",
        "✅ Escalação para atendente quando necessário"
      ]
    }), {
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