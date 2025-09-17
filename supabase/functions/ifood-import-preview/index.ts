import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const FIRECRAWL_API_KEY = 'FIRECRAWL_API_KEY'; // Chave para buscar no banco
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando preview com Firecrawl...');
    const { url: ifoodUrl } = await req.json();
    
    if (!ifoodUrl || !ifoodUrl.includes('ifood.com.br')) {
      console.error('❌ URL do iFood inválida:', ifoodUrl);
      return new Response(JSON.stringify({ error: 'URL do iFood inválida.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log('✅ URL recebida:', ifoodUrl);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar a chave da API do Firecrawl
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', FIRECRAWL_API_KEY)
      .single();

    if (apiKeyError || !apiKeyData?.value) {
      console.error('❌ Chave da API do Firecrawl não configurada');
      return new Response(JSON.stringify({ 
        error: 'Chave da API do Firecrawl não configurada. Configure a chave em app_settings.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const firecrawlApiKey = apiKeyData.value;
    console.log('✅ Chave da API do Firecrawl obtida');

    // Configurar o payload para o Firecrawl
    const firecrawlPayload = {
      url: ifoodUrl,
      pageOptions: {
        waitFor: 5000, // Aguardar 5 segundos para carregar conteúdo dinâmico
        screenshot: false, // Não precisamos de screenshot para extração de dados
        pdf: false
      },
      extractorOptions: {
        mode: "llm-extraction",
        extractionPrompt: `
          Extraia todos os itens do cardápio do iFood. Para cada item, retorne:
          - name: Nome do produto
          - description: Descrição do produto (se disponível)
          - price: Preço em formato numérico (apenas o valor, sem R$)
          - image: URL da imagem do produto (se disponível)
          
          Retorne apenas um array JSON com os objetos dos produtos encontrados.
          Exemplo: [{"name": "Pizza Margherita", "description": "Molho de tomate, mussarela", "price": 29.90, "image": "url_da_imagem"}]
        `,
        extractionSchema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  image: { type: "string" }
                },
                required: ["name", "price"]
              }
            }
          },
          required: ["items"]
        }
      }
    };

    console.log('📡 Chamando API do Firecrawl...');
    
    const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(firecrawlPayload)
    });

    console.log('📊 Resposta do Firecrawl - Status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Erro do Firecrawl:', errorBody);
      throw new Error(`Falha na API do Firecrawl. Status: ${response.status}`);
    }

    const firecrawlData = await response.json();
    console.log('✅ Dados recebidos do Firecrawl');

    // Extrair os itens do resultado do Firecrawl
    let items = [];
    
    if (firecrawlData.data && firecrawlData.data.llm_extraction) {
      const extraction = firecrawlData.data.llm_extraction;
      if (extraction.items && Array.isArray(extraction.items)) {
        items = extraction.items;
        console.log(`✅ ${items.length} itens extraídos via LLM`);
      }
    }

    // Fallback: se não conseguir extrair via LLM, tentar extração via seletores CSS
    if (items.length === 0 && firecrawlData.data && firecrawlData.data.html) {
      console.log('🔄 Tentando extração via seletores CSS como fallback...');
      items = extractItemsFromHTML(firecrawlData.data.html);
    }

    if (items.length === 0) {
      console.warn('⚠️ Nenhum item encontrado');
      return new Response(JSON.stringify({ 
        error: 'Nenhum item encontrado no cardápio. Verifique se a URL está correta e se o restaurante está aberto.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Limpar e validar os dados
    const cleanedItems = items
      .filter(item => item.name && item.price && !isNaN(Number(item.price)))
      .map(item => ({
        name: item.name.trim(),
        description: item.description?.trim() || '',
        price: Number(item.price),
        image: item.image || null
      }));

    console.log(`✅ ${cleanedItems.length} itens processados com sucesso`);
    
    return new Response(JSON.stringify(cleanedItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Erro geral na função:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}, { 
  auth: {
    type: 'none'
  }
});

// Função de fallback para extração via seletores CSS
function extractItemsFromHTML(html: string): any[] {
  try {
    // Usar regex para extrair informações básicas
    const items = [];
    
    // Padrões para encontrar produtos
    const productPatterns = [
      /<[^>]*class="[^"]*dish[^"]*"[^>]*>.*?<\/[^>]*>/gs,
      /<[^>]*class="[^"]*product[^"]*"[^>]*>.*?<\/[^>]*>/gs,
      /<[^>]*data-testid="[^"]*dish[^"]*"[^>]*>.*?<\/[^>]*>/gs
    ];

    for (const pattern of productPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`🔍 Encontrados ${matches.length} elementos com padrão`);
        
        for (const match of matches) {
          const item = extractItemFromHTML(match);
          if (item) {
            items.push(item);
          }
        }
        
        if (items.length > 0) break;
      }
    }

    return items;
  } catch (error) {
    console.error('❌ Erro na extração via HTML:', error);
    return [];
  }
}

function extractItemFromHTML(html: string): any {
  try {
    // Extrair nome
    const nameMatch = html.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/i) ||
                     html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
    
    // Extrair preço
    const priceMatch = html.match(/R\$\s*(\d+[,.]?\d*)/i);
    
    // Extrair descrição
    const descMatch = html.match(/<[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)<\/[^>]*>/i) ||
                     html.match(/<p[^>]*>([^<]+)<\/p>/i);
    
    // Extrair imagem
    const imgMatch = html.match(/src="([^"]+)"/i) ||
                    html.match(/data-src="([^"]+)"/i);

    if (nameMatch && priceMatch) {
      const price = parseFloat(priceMatch[1].replace(',', '.'));
      if (!isNaN(price)) {
        return {
          name: nameMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : '',
          price: price,
          image: imgMatch ? imgMatch[1] : null
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair item do HTML:', error);
    return null;
  }
} 