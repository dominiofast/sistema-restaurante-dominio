fetch('https://epqppxteicfuzdblbluq.supabase.co/functions/v1/agente-ia-conversa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userMessage: "Olá, quero fazer um pedido",
    customerPhone: "5511999999999",
    customerName: "Cliente Teste", 
    slug_empresa: "quadrata-pizzas"
  })
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(data => {
  console.log('Resposta:', data);
}).catch(err => {
  console.error('Erro:', err);
});