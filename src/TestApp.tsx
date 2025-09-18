import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Teste - React está funcionando!</h1>
      <p>Se você está vendo esta mensagem, o React está rodando corretamente.</p>
      <p>Hora: {new Date().toLocaleTimeString()}</p>
    </div>
  )
} 
