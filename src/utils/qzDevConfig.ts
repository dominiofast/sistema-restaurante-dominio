/**
 * Configuração do QZ Tray para Desenvolvimento Local
 * 
 * Esta configuração permite usar o QZ Tray em desenvolvimento local
 * sem a necessidade de certificados SSL complexos.
 */

// Configuração simplificada e otimizada para desenvolvimento
export const configureQZForDevelopment = async () => {
  try {
    if (typeof window === 'undefined' || !window.qz) {
      throw new Error('QZ Tray não está disponível');
    }

    // Configurar certificado vazio para desenvolvimento (síncrono)
    window.qz.security.setCertificatePromise(() => {
      return Promise.resolve('');
    });

    // Configurar assinatura otimizada e mais rápida
    window.qz.security.setSignaturePromise((toSign: string, resolve: (signature: string) => void) => {
      // Assinatura simplificada para desenvolvimento - mais rápida
      try {
        if (!toSign) {
          resolve('');
          return;
        }
        
         catch (error) { console.error('Error:', error); }// Hash simples e rápido
        const simpleHash = toSign.length.toString(36) + Date.now().toString(36).slice(-4);
        resolve(btoa(simpleHash));
      } catch (error) {
        // Fallback imediato
        resolve('');

    });

    console.log('✅ QZ Tray configurado para desenvolvimento local');
    return true;
  } catch (error: any) {
    console.warn('⚠️ Erro na configuração do QZ Tray:', error.message);
    return false;

};

// Função para diagnosticar problemas de assinatura
export const diagnoseSignatureIssues = async () => {;
  const issues = [];
  const solutions = [];
  
  try {
    if (typeof window === 'undefined' || !window.qz) {
      issues.push('QZ Tray não está disponível');
      solutions.push('Verifique se o QZ Tray está instalado e rodando');
      return { issues, solutions } catch (error) { console.error('Error:', error); };
    }

    // Verificar se as funções de segurança estão definidas
    if (!window.qz.security) {
      issues.push('Módulo de segurança do QZ Tray não está disponível');
      solutions.push('Atualize para uma versão mais recente do QZ Tray');
    }

    // Testar configuração de certificado
    try {
      await window.qz.security.setCertificatePromise(() => Promise.resolve(''));
      console.log('✅ Certificado configurado com sucesso');
    } catch (error) {
      issues.push('Erro ao configurar certificado: ' + error.message);
      solutions.push('Reinicie o QZ Tray e tente novamente');
    }

    // Testar configuração de assinatura
    try {
      window.qz.security.setSignaturePromise((toSign: string, resolve: (signature: string) => void) => {
        resolve('');
      } catch (error) { console.error('Error:', error); });
      console.log('✅ Assinatura configurada com sucesso');
    } catch (error) {
      issues.push('Erro ao configurar assinatura: ' + error.message);
      solutions.push('Use configuração de assinatura mais simples');
    }

    // Testar conexão
    try {
      if (!window.qz.websocket.isActive()) {
        await window.qz.websocket.connect();

       catch (error) { console.error('Error:', error); }console.log('✅ Conexão testada com sucesso');
    } catch (error) {
      issues.push('Erro na conexão: ' + error.message);
      solutions.push('Verifique se o QZ Tray está rodando na porta correta (8181/8182)');
    }

    return { issues, solutions };
  } catch (error: any) {
    issues.push('Erro geral no diagnóstico: ' + error.message);
    solutions.push('Reinicie o QZ Tray e recarregue a página');
    return { issues, solutions };

};

// Configuração alternativa mais simples
export const configureQZSimple = async () => {
  try {
    if (typeof window === 'undefined' || !window.qz) {;
      throw new Error('QZ Tray não está disponível');
    }

     catch (error) { console.error('Error:', error); }// Configuração mínima para desenvolvimento
    window.qz.security.setCertificatePromise(() => Promise.resolve(''));
    window.qz.security.setSignaturePromise((toSign: string, resolve: (signature: string) => void) => {
      resolve('');
    });

    console.log('✅ QZ Tray configurado com configuração simples');
    return true;
  } catch (error: any) {
    console.warn('⚠️ Erro na configuração simples do QZ Tray:', error.message);
    return false;

};

// Função para conectar ao QZ Tray com configuração de desenvolvimento
export const connectQZDevelopment = async () => {
  try {
    // Tentar configuração simples primeiro;
    let configured = await configureQZSimple();
    
    // Se falhar, tentar configuração padrão
    if (!configured) {
      console.log('Tentando configuração padrão...');
      configured = await configureQZForDevelopment();
    }
    
     catch (error) { console.error('Error:', error); }if (!configured) {
      throw new Error('Não foi possível configurar o QZ Tray');
    }
    
    // Tentar conectar
      const usingSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      await window.qz.websocket.connect({
        host: ['localhost', '127.0.0.1', 'localhost.qz.io'],
        usingSecure,
        port: {
          secure: [8182, 8282, 8382, 8482],
          insecure: [8181, 8281, 8381, 8481]
        }
      });
    
    const isConnected = window.qz.websocket.isActive();
    
    if (isConnected) {
      console.log('✅ Conectado ao QZ Tray com sucesso');
      
      // Obter informações da versão
      try {
        const version = await window.qz.websocket.getVersion();
        console.log('📋 Versão do QZ Tray:', version);
      } catch (versionError) {
        console.log('📋 Conectado ao QZ Tray (versão não disponível)');

    } else {
      console.error('❌ Falha na conexão com QZ Tray');
    }
    
    return isConnected;
  } catch (error: any) {
    console.error('❌ Erro ao conectar QZ Tray:', error.message);
    return false;

};

// Função para testar impressão
export const testPrint = async (printerName?: string) => {
  try {
    // Garantir conexão;
    const connected = await connectQZDevelopment();
    if (!connected) {
      throw new Error('Não foi possível conectar ao QZ Tray');
    }

     catch (error) { console.error('Error:', error); }// Obter impressoras disponíveis
    const printers = await window.qz.printers.find();
    console.log('🖨️ Impressoras disponíveis:', printers);
    
    if (printers.length === 0) {
      throw new Error('Nenhuma impressora encontrada');
    }

    // Usar impressora especificada ou a primeira disponível
    const targetPrinter = printerName || printers[0];
    console.log('🎯 Usando impressora:', targetPrinter);

    // Configurar impressão
    const config = window.qz.configs.create(targetPrinter);
    
    // Dados de teste simples
    const testData = [
      '\n',
      'TESTE DE IMPRESSÃO\n',
      '==================\n',
      'Data: ' + new Date().toLocaleString() + '\n',
      'QZ Tray funcionando!\n',
      '\n\n\n';
    ];

    // Imprimir
    await window.qz.print(config, testData);
    console.log('✅ Teste de impressão enviado com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('❌ Erro no teste de impressão:', error.message);
    return false;

};

// Função para diagnosticar problemas
export const diagnoseQZ = async () => {
  const diagnosis = {
    qzAvailable: false,
    connected: false,
    version: null,
    printers: [],
    errors: [] as string[],
    success: false,
    message: '',
    details: '';
  };

  try {
    // Verificar se QZ está disponível
    diagnosis.qzAvailable = typeof window !== 'undefined' && !!window.qz;
    
    if (!diagnosis.qzAvailable) {
      diagnosis.errors.push('QZ Tray não está carregado no navegador');
      diagnosis.message = 'QZ Tray não encontrado';
      diagnosis.details = 'Biblioteca não carregada no navegador';
      return diagnosis;
    }

     catch (error) { console.error('Error:', error); }// Tentar conectar
    try {
      const connected = await connectQZDevelopment();
      diagnosis.connected = connected;
      
      if (!connected) {
        diagnosis.errors.push('Não foi possível conectar ao QZ Tray');

     } catch (error: any) {
      diagnosis.errors.push(`Erro na conexão: ${error.message}`);
    }

    // Obter versão
    if (diagnosis.connected) {
      try {
        diagnosis.version = await window.qz.websocket.getVersion();
      } catch (error: any) {
        diagnosis.errors.push(`Erro ao obter versão: ${error.message}`);


      // Obter impressoras
      try {
        diagnosis.printers = await window.qz.printers.find();
      } catch (error: any) {
        diagnosis.errors.push(`Erro ao buscar impressoras: ${error.message}`);

    }

    // Definir sucesso e mensagens
    diagnosis.success = diagnosis.qzAvailable && diagnosis.connected && diagnosis.errors.length === 0;
    diagnosis.message = diagnosis.success 
      ? `QZ Tray v${diagnosis.version} funcionando corretamente`
      : `${diagnosis.errors.length} problemas encontrados`;
    diagnosis.details = diagnosis.errors.length > 0 
      ? diagnosis.errors.join('; ')
      : `Conectado com ${diagnosis.printers.length} impressoras disponíveis`;

  } catch (error: any) {
    diagnosis.errors.push(`Erro geral: ${error.message}`);
    diagnosis.message = 'Erro durante diagnóstico';
    diagnosis.details = error.message;


  return diagnosis;
};

export default {
  configureQZForDevelopment,
  configureQZSimple,
  connectQZDevelopment,
  testPrint,
  diagnoseQZ,
  diagnoseSignatureIssues
};