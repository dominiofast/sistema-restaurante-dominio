// TESTAR COMPONENTES ISOLADOS
const SUPABASE_URL = 'https://epqppxteicfuzdblbluq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.Iskwd4R2xwTSEr3ao07FxTn8ba51FnyTg4UJravf9Pc';

async function testarComponentesIsolados() {
  console.log('🧪 TESTANDO COMPONENTES ISOLADOS');
  console.log('==================================');

  const testData = {
    phoneNumber: '556992254080',
    message: 'Teste de componentes isolados',
    companyId: '550e8400-e29b-41d4-a716-446655440001',
    customerName: 'Teste Componentes',
    instanceKey: 'megacode-MDT3OHEGIyu'
  };

  try {
    // 1. TESTAR MESSAGE LOGGER
    console.log('\n1️⃣ Testando Message Logger...');
    
    const loggerResponse = await fetch(`${SUPABASE_URL}/functions/v1/message-logger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId: testData.companyId,
        customerPhone: testData.phoneNumber,
        customerName: testData.customerName,
        messageContent: 'Teste do Message Logger isolado',
        messageType: 'test_logger',
        metadata: { test: true, timestamp: new Date().toISOString() }
      })
    });

    const loggerResult = await loggerResponse.json();
    console.log('📝 Message Logger:', loggerResult.success ? '✅' : '❌', loggerResult);

    // 2. TESTAR AI PROCESSOR
    console.log('\n2️⃣ Testando AI Processor...');
    
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: testData.message,
        phoneNumber: testData.phoneNumber,
        companyId: testData.companyId,
        customerName: testData.customerName,
        context: 'Teste de processamento isolado'
      })
    });

    const aiResult = await aiResponse.json();
    console.log('🤖 AI Processor:', aiResult.success ? '✅' : '❌', aiResult);

    // 3. TESTAR WHATSAPP SENDER (se AI funcionou)
    if (aiResult.success && aiResult.response) {
      console.log('\n3️⃣ Testando WhatsApp Sender...');
      
      const senderResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-sender`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: testData.phoneNumber,
          message: aiResult.response,
          instanceKey: testData.instanceKey,
          companyId: testData.companyId,
          customerName: testData.customerName
        })
      });

      const senderResult = await senderResponse.json();
      console.log('📤 WhatsApp Sender:', senderResult.success ? '✅' : '❌', senderResult);
    }

    // 4. RESUMO
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log('Message Logger:', loggerResult.success ? '✅ FUNCIONOU' : '❌ FALHOU');
    console.log('AI Processor:', aiResult.success ? '✅ FUNCIONOU' : '❌ FALHOU');
    
    if (aiResult.success) {
      console.log('WhatsApp Sender:', aiResult.success ? '✅ FUNCIONOU' : '❌ FALHOU');
    }

    // 5. PRÓXIMOS PASSOS
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('==================');
    console.log('1. Fazer deploy dos componentes: supabase functions deploy');
    console.log('2. Atualizar webhook principal para usar componentes');
    console.log('3. Testar fluxo completo');

  } catch (error) {
    console.error('❌ ERRO NOS TESTES:', error);
  }
}

// Executar testes
testarComponentesIsolados();
