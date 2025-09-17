// Testar sincronização de todos os assistants
const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/sync-all-assistants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});

const result = await response.json();
console.log('✅ Resultado da sincronização global:', result);