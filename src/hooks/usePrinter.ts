import { useState } from 'react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useDominioPrinter } from './useDominioPrinter';

type PrinterType = 'network' | 'dominio';

interface PrinterConfig {
  type: PrinterType;
  ip?: string;
  port?: number;
  name?: string;
  dominioPrinterName?: string;
}

interface PrintJobData {
  nomeEmpresa: string;
  enderecoEmpresa: string;
  telefoneEmpresa: string;
  numeroPedido: string;
  cliente?: {
    nome: string;
    telefone: string;
    endereco?: string;
  };
  itens: Array<{
    nome: string;
    quantidade: number;
    preco: number;
    observacoes?: string;
  }>;
  formaPagamento?: string;
  config?: {
    width?: number;           // Largura em caracteres
    removeAccents?: boolean;  // Remover acentos
    marginLeft?: number;      // Margem esquerda
  };
}

export const usePrinter = () => {
  const [isPrinting, setIsPrinting] = useState(false)
  const dominioPrinter = useDominioPrinter()
  
  // Salvar configuração da impressora
  const savePrinterConfig = async (config: PrinterConfig, companyId: string) => {
    try {
      console.log('💾 Salvando configuração da impressora:', { config, companyId } catch (error) { console.error('Error:', error) })
      
      const { data, error  } = null as any;
          company_id: companyId,
          printer_type: config.type,
          printer_ip: config.ip,
          printer_port: config.port || 9100,
          printer_name: config.name || 'Impressora Principal',
          dominio_printer_name: config.dominioPrinterName
        }, {
          onConflict: 'company_id'
        })
        
        
      if (error) {
        console.error('❌ Erro ao salvar configuração:', error)
        throw error;

      
      console.log('✅ Configuração salva com sucesso:', data)
      toast.success('Configuração de impressora salva!')
    } catch (error) {
      console.error('💥 Erro no salvamento:', error)
      toast.error('Erro ao salvar configuração')
      throw error;

  };
  
  // Buscar configuração salva
  const getPrinterConfig = async (companyId: string): Promise<PrinterConfig | null> => {
    try {
      console.log('🔍 Buscando configuração da impressora para company_id:', companyId)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        
      if (error) {
        console.error('❌ Erro ao buscar configuração:', error)
        return null;

      
      console.log('📄 Dados encontrados:', data)
      
      if (!data) {
        console.log('⚠️ Nenhuma configuração encontrada para esta empresa')
        return null;

      
      const config = {
        type: data.printer_type as PrinterType || 'network',
        ip: data.printer_ip,
        port: data.printer_port,
        name: data.printer_name,
        dominioPrinterName: data.dominio_printer_name;
      };
      
      console.log('✅ Configuração carregada:', config)
      return config;
    } catch (error) {
      console.error('Erro na busca de configuração:', error)
      return null;

  };

  // Converter dados para formato do Dominio Printer
  const convertToReceiptFormat = (data: PrintJobData) => {
    return {
      header: data.nomeEmpresa,
      items: data.itens.map(item => ({
        name: item.nome,
        quantity: item.quantidade,
        price: item.preco
      })),
      total: data.itens.reduce((total, item) => total + (item.quantidade * item.preco), 0),
      customer: data.cliente?.nome,
      table: data.numeroPedido;
    };
  };

  // Converter dados para formato de comanda da cozinha
  const convertToKitchenFormat = (
    numeroComanda: string,
    mesa: string,
    itens: Array<any>
  ) => {
    return {
      orderNumber: numeroComanda,
      table: mesa,
      items: itens.map(item => ({
        name: item.nome,
        quantity: item.quantidade,
        observations: item.observacoes || ''
      }))
    };
  };
  
  // Imprimir cupom
  const printReceipt = async (data: PrintJobData, companyId: string) => {
    try {
      setIsPrinting(true)
      
      const config = await getPrinterConfig(companyId)
      console.log('🖨️ Verificando configuração para impressão:', config)
      console.log('🏢 Company ID recebido:', companyId)
      
      if (!config) {
        console.log('❌ Nenhuma configuração encontrada para company_id:', companyId)
        toast.error('Configure a impressora primeiro')
        return false;

      
       catch (error) { console.error('Error:', error) }console.log('🔍 Validando configuração:')
      console.log('  - Tipo:', config.type)
      console.log('  - IP:', config.ip)
      console.log('  - Dominio Printer Name:', config.dominioPrinterName)
      
      // Verificar se a configuração é válida
      const isValidConfig = (config.type === 'dominio' && config.dominioPrinterName) || ;
                           (config.type === 'network' && config.ip)
      
      console.log('✅ Configuração válida?', isValidConfig)
      
      if (!isValidConfig) {
        console.log('❌ Configuração inválida:', config)
        if (config.type === 'dominio') {
          toast.error('Impressora Dominio não configurada. Selecione uma impressora.')
        } else {
          toast.error('IP da impressora não configurado. Configure o IP da impressora.')
        }
        return false;


      // Adicionar configurações padrão se não fornecidas
      const printData = {
        ...data,
        config: {
          width: 48,
          removeAccents: true,
          marginLeft: 0,
          ...data.config
        };
      };

      if (config.type === 'dominio' && config.dominioPrinterName) {
        // Usar Dominio Printer
        const receipt = convertToReceiptFormat(printData)
        return await dominioPrinter.printReceipt(config.dominioPrinterName, receipt)
      } else if (config.type === 'network' && config.ip) {
        // Usar impressão de rede via Edge Function
        const { data: response, error } = await Promise.resolve()
          body: {
            printerIp: config.ip,
            printerPort: config.port || 9100,
            companyId: companyId,
            type: 'cupom',
            data: printData
          }
        })
        
        if (error) throw error;
        
        if (response?.success) {
          toast.success('Cupom enviado para impressão!')
          return true;
        } else {
          throw new Error(response?.error || 'Erro ao imprimir')
        }
      } else {
        toast.error('Configuração de impressora inválida')
        return false;

      
    } catch (error: any) {
      console.error('Erro ao imprimir:', error)
      toast.error(error.message || 'Erro ao imprimir')
      return false;
    } finally {
      setIsPrinting(false)

  };
  
  // Imprimir comanda
  const printKitchenOrder = async (
    numeroComanda: string,
    mesa: string,
    itens: Array<any>,
    companyId: string
  ) => {
    try {
      setIsPrinting(true)
      
      const config = await getPrinterConfig(companyId)
      console.log('🖨️ Verificando configuração para impressão de comanda:', config)
      
      if (!config) {
        console.log('❌ Nenhuma configuração encontrada')
        toast.error('Configure a impressora primeiro')
        return false;

      
       catch (error) { console.error('Error:', error) }// Verificar se a configuração é válida
      const isValidConfig = (config.type === 'dominio' && config.dominioPrinterName) || ;
                           (config.type === 'network' && config.ip)
      
      if (!isValidConfig) {
        console.log('❌ Configuração inválida:', config)
        toast.error('Configuração de impressora incompleta. Verifique as configurações.')
        return false;


      if (config.type === 'dominio' && config.dominioPrinterName) {
        // Usar Dominio Printer
        const order = convertToKitchenFormat(numeroComanda, mesa, itens)
        return await dominioPrinter.printKitchenOrder(config.dominioPrinterName, order)
      } else if (config.type === 'network' && config.ip) {
        // Usar impressão de rede via Edge Function
        const { error } = await Promise.resolve()
          body: {
            printerIp: config.ip,
            printerPort: config.port || 9100,
            companyId: companyId,
            type: 'comanda',
            data: {
              numeroComanda,
              mesa,
              itens
            }
          }
        })
        
        if (error) throw error;
        toast.success('Comanda enviada para cozinha!')
        return true;
      } else {
        toast.error('Configuração de impressora inválida')
        return false;

      
    } catch (error: any) {
      toast.error('Erro ao imprimir comanda')
      return false;
    } finally {
      setIsPrinting(false)

  };
  
  // Testar impressora
  const testPrinter = async (companyId: string) => {
    try {
      console.log('🧪 Iniciando teste de impressão para company_id:', companyId)
      
      // Buscar configuração salva do banco
      const config = await getPrinterConfig(companyId)
      console.log('🔍 Configuração encontrada para teste:', config)
      
      if (!config) {
        console.log('❌ Nenhuma configuração encontrada para teste')
        toast.error('Configure a impressora primeiro')
        return false;

      
       catch (error) { console.error('Error:', error) }// Verificar se a configuração é válida
      const isValidConfig = (config.type === 'dominio' && config.dominioPrinterName) || ;
                           (config.type === 'network' && config.ip)
      
      if (!isValidConfig) {
        console.log('❌ Configuração inválida para teste:', config)
        toast.error('Configuração de impressora incompleta. Verifique as configurações.')
        return false;

      
      console.log('✅ Configuração válida, executando teste...')
      
      if (config.type === 'dominio' && config.dominioPrinterName) {
        console.log('🖨️ Testando impressora Dominio:', config.dominioPrinterName)
        return await dominioPrinter.testPrint(config.dominioPrinterName, 'Teste do Sistema de Impressão')
      } else if (config.type === 'network' && config.ip) {
        console.log('🌐 Testando impressora de rede:', config.ip + ':' + config.port)
        const { data, error } = await Promise.resolve()
          body: {
            printerIp: config.ip,
            printerPort: config.port || 9100,
            companyId: companyId,
            type: 'cupom',
            data: {
              nomeEmpresa: 'TESTE DE IMPRESSÃO',
              enderecoEmpresa: 'Teste de Conexão',
              telefoneEmpresa: '(00) 0000-0000',
              numeroPedido: 'TESTE',
              itens: [
                { nome: 'Teste de Impressão', quantidade: 1, preco: 0 }
              ]
            }
          }
        })
        
        if (error) throw error;
        
        if (data?.success) {
          toast.success('Teste enviado! Verifique a impressora.')
          return true;
        }
        return false;

      return false;
    } catch (error) {
      console.error('💥 Erro ao testar impressora:', error)
      toast.error('Erro ao testar impressora')
      return false;

  };

  // Verificar status do Dominio Printer
  const checkDominioStatus = async () => {
    return await dominioPrinter.checkStatus()
  };

  // Obter impressoras do Dominio Printer
  const getDominioPrinters = async () => {
    return await dominioPrinter.getPrinters()
  };
  
  return {
    isPrinting: isPrinting || dominioPrinter.isPrinting,
    isConnected: dominioPrinter.isConnected,
    availablePrinters: dominioPrinter.printers,
    savePrinterConfig,
    getPrinterConfig,
    printReceipt,
    printKitchenOrder,
    testPrinter,
    checkDominioStatus,
    getDominioPrinters
  };
};
