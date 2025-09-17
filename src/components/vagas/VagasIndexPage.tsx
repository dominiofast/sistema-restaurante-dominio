
import React from 'react';

const VagasIndexPage = () => {
  console.log('VagasIndexPage loaded');
  
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Portal de Vagas</h1>
      <p>Para visualizar as oportunidades de uma empresa, acesse o link no formato: <br/><strong>/nome-da-empresa</strong></p>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Debug: Página index do portal de vagas carregada com sucesso
      </div>
    </div>
  );
};

export default VagasIndexPage;
