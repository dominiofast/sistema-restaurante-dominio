import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { connectQZDevelopment, diagnoseQZ, diagnoseSignatureIssues } from '@/utils/qzDevConfig';

// Importar a implementação oficial do QZ Tray
import '@/utils/qz-tray-official.js';

// Declaração global para QZ Tray
declare global {
  interface Window {
    qz: any;
  }
}

interface QZTrayContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionVersion?: string;
  lastConnectionCheck?: Date;
  connectToQZ: () => Promise<boolean>;
  disconnectFromQZ: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  getPrinters: () => Promise<string[]>;
  printData: (printerName: string, data: any[]) => Promise<boolean>;
}

const QZTrayContext = createContext<QZTrayContextType | undefined>(undefined)

interface QZTrayProviderProps {
  children: ReactNode;
}

export const QZTrayProvider: React.FC<QZTrayProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionVersion, setConnectionVersion] = useState<string>()
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date>()

  // Verificar se QZ Tray está disponível
  const checkQZAvailability = useCallback(() => {
    return typeof window !== 'undefined' && window.qz && typeof window.qz.websocket !== 'undefined';
  }, [])

  // Verificar status da conexão
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      if (!checkQZAvailability()) {
        setIsConnected(false)
        return false;
      }

      const active = window.qz.websocket.isActive()
      setIsConnected(active)
      setLastConnectionCheck(new Date())
      
      if (active) {
        try {
          const version = await window.qz.websocket.getVersion()
          setConnectionVersion(version)
        } catch (error) {
          // Versão não disponível, mas ainda conectado
          setConnectionVersion('Desconhecida')
        }
      } else {
        setConnectionVersion(undefined)
      }
      
      return active;
    } catch (error) {
      setIsConnected(false)
      setConnectionVersion(undefined)
      setLastConnectionCheck(new Date())
      return false;
    }
  }, [checkQZAvailability])

  // Conectar ao QZ Tray
  const connectToQZ = useCallback(async (): Promise<boolean> => {
    if (isConnecting) {
      return isConnected;
    }

    setIsConnecting(true)
    
    try {
      if (!checkQZAvailability()) {
        const diagnosis = await diagnoseQZ()
        console.error('❌ Diagnóstico QZ Tray:', diagnosis)
        
        let errorMessage = 'QZ Tray não está disponível.';
        if (diagnosis.errors.length > 0) {
          errorMessage += ' Erros: ' + diagnosis.errors.join(', ')
        }
        
        toast.error(errorMessage + ' Verifique se o QZ Tray está instalado e rodando.')
        throw new Error(errorMessage)
      }

      // Verificar se já está conectado
      if (window.qz.websocket.isActive()) {
        setIsConnected(true)
        await checkConnection()
        return true;
      }

      // Usar configuração de desenvolvimento
      const connected = await connectQZDevelopment()
      
      if (connected) {
        setIsConnected(true)
        await checkConnection()
        
        // Salvar estado de conexão para persistência
        localStorage.setItem('qz-tray-connected', 'true')
        localStorage.setItem('qz-tray-last-connect', new Date().toISOString())
        
        toast.success('✅ Conectado ao QZ Tray com sucesso!')
        console.log('✅ QZ Tray conectado globalmente')
      } else {
        setIsConnected(false)
        toast.error('❌ Falha na conexão com QZ Tray. Verifique se está rodando.')
      }
      
      return connected;
    } catch (error: any) {
      console.error('Erro ao conectar QZ Tray:', error)
      setIsConnected(false)
      toast.error(`Erro na conexão: ${error.message}`)
      return false;
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting, isConnected, checkQZAvailability, checkConnection])

  // Desconectar do QZ Tray
  const disconnectFromQZ = useCallback(async (): Promise<void> => {
    try {
      if (checkQZAvailability() && window.qz.websocket.isActive()) {
        await window.qz.websocket.disconnect()
      }
      
      setIsConnected(false)
      setConnectionVersion(undefined)
      setLastConnectionCheck(new Date())
      
      // Limpar estado de conexão
      localStorage.removeItem('qz-tray-connected')
      localStorage.removeItem('qz-tray-last-connect')
      
      toast.info('QZ Tray desconectado')
      console.log('QZ Tray desconectado globalmente')
    } catch (error: any) {
      console.error('Erro ao desconectar QZ Tray:', error)
      toast.error(`Erro ao desconectar: ${error.message}`)
    }
  }, [checkQZAvailability])

  // Obter lista de impressoras
  const getPrinters = useCallback(async (): Promise<string[]> => {
    try {
      if (!isConnected) {
        const connected = await connectToQZ()
        if (!connected) {
          throw new Error('Não foi possível conectar ao QZ Tray')
        }
      }

      const printers = await window.qz.printers.find()
      return printers;
    } catch (error: any) {
      console.error('Erro ao obter impressoras:', error)
      
      // Se for erro de assinatura, tentar diagnóstico específico
      if (error.message && error.message.includes('sign')) {
        console.log('🔍 Detectado erro de assinatura, executando diagnóstico...')
        const diagnosis = await diagnoseSignatureIssues()
        
        if (diagnosis.issues.length > 0) {
          console.error('❌ Problemas encontrados:', diagnosis.issues)
          console.log('💡 Soluções sugeridas:', diagnosis.solutions)
          toast.error(`Erro de assinatura: ${diagnosis.issues[0]}. ${diagnosis.solutions[0]}`)
        } else {
          toast.error('Erro de assinatura resolvido. Tente novamente.')
        }
      } else {
        toast.error(`Erro ao obter impressoras: ${error.message}`)
      }
      
      return [];
    }
  }, [isConnected, connectToQZ])

  // Imprimir dados
  const printData = useCallback(async (printerName: string, data: any[]): Promise<boolean> => {
    try {
      if (!isConnected) {
        const connected = await connectToQZ()
        if (!connected) {
          throw new Error('Não foi possível conectar ao QZ Tray')
        }
      }

      const config = window.qz.configs.create(printerName)
      await window.qz.print(config, data)
      
      toast.success(`Impressão enviada para ${printerName}`)
      return true;
    } catch (error: any) {
      console.error('Erro na impressão:', error)
      toast.error(`Erro na impressão: ${error.message}`)
      return false;
    }
  }, [isConnected, connectToQZ])

  // Verificação periódica da conexão
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        await checkConnection()
      }
    }, 30000) // Verificar a cada 30 segundos

    return () => clearInterval(interval)
  }, [isConnected, checkConnection])

  // Tentar reconectar automaticamente na inicialização
  useEffect(() => {
    const initializeConnection = async () => {
      // Aguardar um pouco para garantir que a biblioteca foi carregada
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const wasConnected = localStorage.getItem('qz-tray-connected') === 'true';
      const lastConnect = localStorage.getItem('qz-tray-last-connect')
      
      // Se estava conectado recentemente (últimas 24 horas), tentar reconectar
      if (wasConnected && lastConnect) {
        const lastConnectDate = new Date(lastConnect)
        const now = new Date()
        const hoursDiff = (now.getTime() - lastConnectDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff < 24) {
          console.log('🔄 Tentando reconectar automaticamente ao QZ Tray...')
          await connectToQZ()
        }
      }
      
      // Verificar conexão atual independentemente
      await checkConnection()
    };

    initializeConnection()
  }, [connectToQZ, checkConnection])

  // Configurar callbacks para eventos de conexão
  useEffect(() => {
    if (checkQZAvailability()) {
      // Callback para quando a conexão é perdida
      window.qz.websocket.setClosedCallbacks(() => {
        console.log('🔌 Conexão QZ Tray perdida')
        setIsConnected(false)
        setConnectionVersion(undefined)
        toast.warning('Conexão com QZ Tray perdida')
      })

      // Callback para erros de conexão
      window.qz.websocket.setErrorCallbacks((error: any) => {
        console.error('❌ Erro na conexão QZ Tray:', error)
        setIsConnected(false)
        setConnectionVersion(undefined)
      })
    }
  }, [checkQZAvailability])

  const value: QZTrayContextType = {
    isConnected,
    isConnecting,
    connectionVersion,
    lastConnectionCheck,
    connectToQZ,
    disconnectFromQZ,
    checkConnection,
    getPrinters,
    printData
  };

  return (
    <QZTrayContext.Provider value={value}>
      {children}
    </QZTrayContext.Provider>
  )
};

export const useQZTray = (): QZTrayContextType => {
  const context = useContext(QZTrayContext)
  if (context === undefined) {
    throw new Error('useQZTray deve ser usado dentro de um QZTrayProvider')
  }
  return context;
};

export default QZTrayProvider;
