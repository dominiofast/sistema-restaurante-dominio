console.log('🚨 Chamando Emergency Assistant Neutralizer...');

fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/emergency-assistant-neutralizer', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
.then(res => res.json())
.then(data => {
  console.log('🎯 RESULTADO NEUTRALIZER:', JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error('❌ ERRO NEUTRALIZER:', err);
});