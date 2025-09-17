async function testMapsAPI() {
  try {
    const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/get-maps-config', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg'
      }
    });
    
    const data = await response.json();
    console.log('Resposta da API:', data);
    
    if (data.apiKey && data.apiKey.startsWith('AIza')) {
      console.log('✅ Chave do Google Maps válida encontrada!');
    } else {
      console.log('❌ Chave inválida:', data.apiKey);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

testMapsAPI();
