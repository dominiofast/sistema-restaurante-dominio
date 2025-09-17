// Forçar sincronização do assistant da Quadrata Pizzas
const response = await fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/force-sync-assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assistant_id: 'asst_GT1zpufvYCgo0qzakqcZuDVT'
  })
});

const result = await response.json();
console.log('✅ Resultado da sincronização:', result);