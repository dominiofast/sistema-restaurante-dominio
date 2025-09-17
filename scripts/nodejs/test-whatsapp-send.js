const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/send-whatsapp-message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '69992254080',
    message: '🧪 **TESTE DO SISTEMA** 🧪\n\nOlá! Este é um teste das funcionalidades do sistema.\n\n✅ Integração WhatsApp funcionando\n✅ Agente IA operacional\n✅ Sistema de mensagens ativo\n\nSe você recebeu esta mensagem, tudo está funcionando perfeitamente! 🚀\n\n---\nTeste realizado em: ' + new Date().toLocaleString('pt-BR'),
    integration: {
      host: 'apinocode01.megaapi.com.br',
      token: 'MDT3OHEGIyu',
      instance_key: 'megacode-MDT3OHEGIyu'
    }
  })
});

const result = await response.json();
console.log('📱 RESULTADO DO TESTE WHATSAPP:', JSON.stringify(result, null, 2));