// Script para debugar problemas de login
console.log('🔍 Debugando login...');

// Testar fetch diretamente
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'contato@dominio.tech',
    password: 'Admin123!@#'
  })
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Dados:', data);
})
.catch(error => {
  console.error('Erro:', error);
});




