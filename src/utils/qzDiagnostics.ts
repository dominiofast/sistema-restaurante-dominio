/**
 * Utilitários de Diagnóstico para QZ Tray
 * 
 * Este arquivo contém funções para diagnosticar problemas comuns
 * com a conexão e configuração do QZ Tray
 */

import * as qz from 'qz-tray';

export interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
  solution?: string[];
}

export interface SystemDiagnostic {
  qzInstalled: DiagnosticResult;
  qzRunning: DiagnosticResult;
  qzVersion: DiagnosticResult;
  certificates: DiagnosticResult;
  connection: DiagnosticResult;
  printers: DiagnosticResult;
}

/**
 * Verifica se o QZ Tray está instalado e acessível
 */
export const checkQZInstallation = async (): Promise<DiagnosticResult> => {
  try {
    // Tentar acessar o objeto qz
    if (typeof qz === 'undefined') {
      return {
        status: 'error',
        message: 'Biblioteca QZ Tray não encontrada',
        details: ['A biblioteca qz-tray não está importada corretamente'],
        solution: [
          'Verifique se a dependência qz-tray está instalada',
          'Execute: npm install qz-tray',
          'Verifique a importação: import * as qz from "qz-tray"'
        ]
      };
    }

    return {
      status: 'success',
      message: 'Biblioteca QZ Tray encontrada',
      details: ['A biblioteca está corretamente importada']
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Erro ao verificar instalação do QZ Tray',
      details: [error.message],
      solution: ['Reinstale a biblioteca qz-tray', 'Verifique a configuração do projeto']
    };
  }
};

/**
 * Verifica se o QZ Tray está rodando
 */
export const checkQZRunning = async (): Promise<DiagnosticResult> => {
  try {
    const isActive = await qz.websocket.isActive();
    
    if (isActive) {
      return {
        status: 'success',
        message: 'QZ Tray está rodando e ativo',
        details: ['Conexão WebSocket estabelecida']
      };
    } else {
      return {
        status: 'warning',
        message: 'QZ Tray não está ativo',
        details: ['O serviço pode não estar rodando ou não está conectado'],
        solution: [
          'Baixe e instale o QZ Tray de https://qz.io/download/',
          'Inicie o QZ Tray manualmente',
          'Verifique se está rodando na porta 8181',
          'Verifique o ícone na bandeja do sistema'
        ]
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Erro ao verificar se QZ Tray está rodando',
      details: [error.message],
      solution: [
        'Verifique se o QZ Tray está instalado',
        'Reinicie o QZ Tray',
        'Verifique se a porta 8181 não está bloqueada'
      ]
    };
  }
};

/**
 * Verifica a versão do QZ Tray
 */
export const checkQZVersion = async (): Promise<DiagnosticResult> => {
  try {
    const isActive = await qz.websocket.isActive();
    
    if (!isActive) {
      return {
        status: 'warning',
        message: 'Não é possível verificar a versão',
        details: ['QZ Tray não está conectado'],
        solution: ['Conecte ao QZ Tray primeiro']
      };
    }

    const version = await qz.websocket.getVersion();
    const versionNumber = parseFloat(version);
    
    if (versionNumber >= 2.2) {
      return {
        status: 'success',
        message: `Versão do QZ Tray: ${version}`,
        details: ['Versão compatível encontrada']
      };
    } else {
      return {
        status: 'warning',
        message: `Versão do QZ Tray: ${version} (pode ser antiga)`,
        details: ['Recomenda-se versão 2.2 ou superior'],
        solution: [
          'Baixe a versão mais recente de https://qz.io/download/',
          'Desinstale a versão antiga antes de instalar a nova'
        ]
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Erro ao verificar versão do QZ Tray',
      details: [error.message],
      solution: ['Verifique a conexão com o QZ Tray']
    };
  }
};

/**
 * Verifica o status dos certificados
 */
export const checkCertificates = async (): Promise<DiagnosticResult> => {
  try {
    // Tentar conectar para verificar certificados
    const isActive = await qz.websocket.isActive();
    
    if (!isActive) {
      try {
        await qz.websocket.connect();
        return {
          status: 'success',
          message: 'Certificados configurados corretamente',
          details: ['Conexão estabelecida sem problemas de certificado']
        };
      } catch (connectError: any) {
        if (connectError.message?.includes('certificate') || connectError.message?.includes('SSL')) {
          return {
            status: 'error',
            message: 'Problema com certificados SSL',
            details: [connectError.message],
            solution: [
              'Configure certificados na aba "Certificados"',
              'Aceite o certificado no diálogo do QZ Tray',
              'Verifique se o certificado não expirou',
              'Gere um novo certificado se necessário'
            ]
          };
        } else {
          throw connectError;
        }
      }
    } else {
      return {
        status: 'success',
        message: 'Certificados funcionando',
        details: ['Conexão já estabelecida com certificados válidos']
      };
    }
  } catch (error: any) {
    return {
      status: 'warning',
      message: 'Não foi possível verificar certificados',
      details: [error.message],
      solution: ['Verifique a conexão com o QZ Tray primeiro']
    };
  }
};

/**
 * Verifica a conexão geral
 */
export const checkConnection = async (): Promise<DiagnosticResult> => {
  try {
    const isActive = await qz.websocket.isActive();
    
    if (!isActive) {
      await qz.websocket.connect();
    }
    
    const finalActive = await qz.websocket.isActive();
    const version = await qz.websocket.getVersion();
    
    if (finalActive) {
      return {
        status: 'success',
        message: 'Conexão estabelecida com sucesso',
        details: [`Versão: ${version}`, 'WebSocket ativo']
      };
    } else {
      return {
        status: 'error',
        message: 'Falha na conexão',
        details: ['Não foi possível estabelecer conexão'],
        solution: [
          'Verifique se o QZ Tray está rodando',
          'Reinicie o QZ Tray',
          'Verifique certificados',
          'Verifique firewall/antivírus'
        ]
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Erro na conexão',
      details: [error.message],
      solution: [
        'Verifique se o QZ Tray está instalado e rodando',
        'Verifique a porta 8181',
        'Configure certificados se necessário'
      ]
    };
  }
};

/**
 * Verifica as impressoras disponíveis
 */
export const checkPrinters = async (): Promise<DiagnosticResult> => {
  try {
    const isActive = await qz.websocket.isActive();
    
    if (!isActive) {
      return {
        status: 'warning',
        message: 'Não é possível verificar impressoras',
        details: ['QZ Tray não está conectado'],
        solution: ['Conecte ao QZ Tray primeiro']
      };
    }

    const printers = await qz.printers.find();
    const defaultPrinter = await qz.printers.getDefault();
    
    if (printers.length === 0) {
      return {
        status: 'warning',
        message: 'Nenhuma impressora encontrada',
        details: ['O sistema não detectou impressoras instaladas'],
        solution: [
          'Verifique se há impressoras instaladas no sistema',
          'Instale drivers de impressora',
          'Verifique se as impressoras estão ligadas',
          'Tente o botão "Descobrir Impressoras"'
        ]
      };
    } else {
      return {
        status: 'success',
        message: `${printers.length} impressora(s) encontrada(s)`,
        details: [
          `Impressoras: ${printers.join(', ')}`,
          `Padrão: ${defaultPrinter || 'Nenhuma'}`
        ]
      };
    }
  } catch (error: any) {
    return {
      status: 'error',
      message: 'Erro ao verificar impressoras',
      details: [error.message],
      solution: ['Verifique a conexão com o QZ Tray']
    };
  }
};

/**
 * Executa diagnóstico completo do sistema
 */
export const runFullDiagnostic = async (): Promise<SystemDiagnostic> => {
  console.log('🔍 Iniciando diagnóstico completo do QZ Tray...');
  
  const results: SystemDiagnostic = {
    qzInstalled: await checkQZInstallation(),
    qzRunning: await checkQZRunning(),
    qzVersion: await checkQZVersion(),
    certificates: await checkCertificates(),
    connection: await checkConnection(),
    printers: await checkPrinters()
  };
  
  console.log('✅ Diagnóstico completo finalizado');
  return results;
};

/**
 * Gera relatório de diagnóstico em texto
 */
export const generateDiagnosticReport = (diagnostic: SystemDiagnostic): string => {
  const lines = [
    '=== RELATÓRIO DE DIAGNÓSTICO QZ TRAY ===',
    `Data: ${new Date().toLocaleString()}`,
    '',
    '📋 RESULTADOS:',
    ''
  ];
  
  Object.entries(diagnostic).forEach(([key, result]) => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    lines.push(`${icon} ${title}: ${result.message}`);
    
    if (result.details) {
      result.details.forEach(detail => {
        lines.push(`   • ${detail}`);
      });
    }
    
    if (result.solution) {
      lines.push('   💡 Soluções:');
      result.solution.forEach(solution => {
        lines.push(`   → ${solution}`);
      });
    }
    
    lines.push('');
  });
  
  return lines.join('\n');
};

export default {
  checkQZInstallation,
  checkQZRunning,
  checkQZVersion,
  checkCertificates,
  checkConnection,
  checkPrinters,
  runFullDiagnostic,
  generateDiagnosticReport
};
