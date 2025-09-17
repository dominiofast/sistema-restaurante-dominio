// VERIFICAR TOKEN WEBHOOK
const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

async function verificarTokenWebhook() {
  console.log('🔍 VERIFICANDO TOKEN DO WEBHOOK');
  console.log('================================');

  try {
    // 1. VERIFICAR CONFIGURAÇÃO COMPLETA
    console.log('\n1️⃣ Configuração completa:');
    
    const configResponse = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_integrations?instance_key=eq.megacode-MDT3OHEGIyu&purpose=eq.primary&select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });

    const configs = await configResponse.json();
    
    if (configs.length === 0) {
      console.log('❌ Configuração não encontrada!');
      return;
    }

    const config = configs[0];
    console.log('📋 Configuração completa:');
    console.log(JSON.stringify(config, null, 2));

    // 2. VERIFICAR SE HÁ OUTRAS INTEGRAÇÕES
    console.log('\n2️⃣ Todas as integrações:');
    
    const allIntegrationsResponse = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_integrations?select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });

    const allIntegrations = await allIntegrationsResponse.json();
    
    console.log('📋 Todas as integrações:');
    allIntegrations.forEach((integration, index) => {
      console.log(`\n${index + 1}. Integração ${integration.id}:`);
      console.log(`   Instance Key: ${integration.instance_key}`);
      console.log(`   Token: ${integration.token}`);
      console.log(`   Host: ${integration.host}`);
      console.log(`   Purpose: ${integration.purpose}`);
      console.log(`   Webhook: ${integration.webhook}`);
    });

    // 3. COMPARAR TOKENS
    console.log('\n3️⃣ Comparação de tokens:');
    console.log('Token correto (MegaAPI): MDT3OHEGIyu');
    console.log('Token no banco:', config.token);
    console.log('São iguais?', config.token === 'MDT3OHEGIyu' ? '✅' : '❌');

    if (config.token !== 'MDT3OHEGIyu') {
      console.log('\n🔧 PRECISA CORRIGIR O TOKEN NO BANCO!');
    }

  } catch (error) {
    console.error('❌ ERRO:', error);
  }
}

// Executar verificação
verificarTokenWebhook();
