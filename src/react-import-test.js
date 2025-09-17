console.log('Iniciando teste de importação do React...');

try {
  console.log('Tentando importar React...');
  import('react').then(React => {
    console.log('React importado com sucesso:', React);
    console.log('Versão do React:', React.version);
    
    // Tentar importar ReactDOM
    return import('react-dom/client');
  }).then(ReactDOM => {
    console.log('ReactDOM importado com sucesso:', ReactDOM);
    
    // Tentar criar um elemento React simples
    return import('react');
  }).then(React => {
    console.log('Tentando criar elemento React...');
    const element = React.createElement('h1', null, 'React Element Criado!');
    console.log('Elemento React criado:', element);
    
    document.getElementById('root').innerHTML = '<p>Importações do React bem-sucedidas! Veja o console.</p>';
  }).catch(error => {
    console.error('Erro durante importação/criação do React:', error);
    document.getElementById('root').innerHTML = '<p style="color: red;">Erro: ' + error.message + '</p>';
  });
} catch (error) {
  console.error('Erro na importação do React:', error);
  document.getElementById('root').innerHTML = '<p style="color: red;">Erro na importação: ' + error.message + '</p>';
}
