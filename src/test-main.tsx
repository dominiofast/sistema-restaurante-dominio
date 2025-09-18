import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('Test main.tsx carregado')

function TestApp() {
  console.log('TestApp renderizando')
  return (
    <div>
      <h1>React Test App Funcionando!</h1>
      <p>Se você está vendo isso, o React está funcionando.</p>
    </div>
  )
}

try {
  console.log('Tentando criar root...')
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  console.log('Root criado, tentando renderizar...')
  root.render(<TestApp />)
  console.log('Renderização concluída!')
} catch (error) {
  console.error('Erro durante a renderização:', error)
}
