import { useState, useEffect } from 'react';
import { toast } from 'sonner';
// SUPABASE REMOVIDO
interface DominioPrinter {
  name: string;
  connected: boolean;
  status: string;
}

interface PrintOptions {
  align?: boolean;
  cut?: boolean;
}

interface KitchenOrderItem {
  name: string;
  quantity: number;
  observations?: string;
  additions?: string[];
}

interface KitchenOrder {
  orderNumber: string;
  table: string;
  customer?: string;
  items: KitchenOrderItem[];
  observations?: string;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface Receipt {
  header: string;
  items: ReceiptItem[];
  total: number;
  customer?: string;
  table?: string;
}

export const useDominioPrinter = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printers, setPrinters] = useState<string[]>([])
  const [paperWidth, setPaperWidth] = useState(48) // Largura padrão em caracteres
  
  const baseUrl = 'http://localhost:3001/api';
  
  // Carregar configuração de largura do banco de dados
  useEffect(() => {
    const loadPrinterConfig = async () => {
      try {
        // Buscar company_id atual (assumindo que está no contexto ou localStorage)
        const currentCompanyStr = localStorage.getItem('currentCompany')
        if (!currentCompanyStr) return;
        
        const currentCompany = JSON.parse(currentCompanyStr)
        const companyId = currentCompany.id;
        
        const { data, error }  catch (error) { console.error('Error:', error) }= 
          
          
          
          
          

        if (error) {
          console.warn('Erro ao carregar configuração de impressora:', error)
          return;
        }

        if (data && data.largura_papel) {
          setPaperWidth(data.largura_papel)
          console.log('📏 Largura carregada do banco (useDominioPrinter):', data.largura_papel)
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error)

    };

    loadPrinterConfig()
  }, [])
  
  // Função para atualizar largura do papel (agora salva no banco)
  const updatePaperWidth = async (width: number) => {
    setPaperWidth(width)
    
    try {
      // Buscar company_id atual
      const currentCompanyStr = localStorage.getItem('currentCompany')
      if (!currentCompanyStr) return;
      
      const currentCompany = JSON.parse(currentCompanyStr)
      const companyId = currentCompany.id;
      
      // Verificar se já existe configuração
      const { data: existingConfig }  catch (error) { console.error('Error:', error) }= 
        
        
        
        

      if (existingConfig) {
        // Atualizar configuração existente
        
          
          
          
      } else {
        // Criar nova configuração
        
          
          
            company_id: companyId,
            printer_name: 'Configuração Padrão',
            largura_papel: width,
            is_active: true,
            is_default: true
          })

      
      console.log('📏 Largura salva no banco:', width)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)

  };

  // Verificar status da API (v2.0.1 usa /api/status)
  const checkStatus = async (): Promise<boolean> => {
    console.log('🔍 [useDominioPrinter] Verificando em:', baseUrl + '/status')
    try {
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/status`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        console.log('❌ Response não ok:', response.statusText)
        setIsConnected(false)
        return false;

      
      const result = await response.json()
      console.log('📊 Resultado da API:', result)
      
      // API v2.0.1 retorna {status: 'online'} em vez de {success: true}
      if (result.status === 'online' || result.success) {
        console.log('✅ Dominio Printer conectado com sucesso')
        setIsConnected(true)
        return true;

      
      console.log('❌ API retornou status diferente de online:', result.status)
      setIsConnected(false)
      return false;
    } catch (error) {
      console.error('💥 Erro ao conectar com Dominio Printer:', error)
      setIsConnected(false)
      return false;

  };

  // Listar impressoras disponíveis (v2.0.1 usa /api/printers)
  const getPrinters = async (): Promise<string[]> => {
    console.log('🖨️ Buscando impressoras disponíveis...')
    try {
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/printers`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status para printers:', response.status)
      
      if (!response.ok) {
        console.error('❌ Erro na resposta de impressoras:', response.statusText)
        return [];

      
      const result = await response.json()
      console.log('🔍 Resultado das impressoras:', result)
      
      // Verificar diferentes estruturas de resposta da API v2.0.1
      let printersArray = [];
      
      if (result.success && result.printers) {
        printersArray = result.printers;
      } else if (result.printers && Array.isArray(result.printers)) {
        printersArray = result.printers;
      } else if (result.status === 'online' && result.printers) {
        printersArray = result.printers;

      
      // GARANTIR que são sempre strings, não objetos
      const printerNames = printersArray.map(printer => {
        if (typeof printer === 'string') {
          return printer;
        } else if (typeof printer === 'object' && printer.name) {
          return printer.name;
        } else {
          console.warn('🚨 Printer inválido:', printer)
          return String(printer)
        }
      })
      
      console.log(`✅ ${printerNames.length} impressoras encontradas:`, printerNames)
      setPrinters(printerNames)
      return printerNames;
    } catch (error) {
      console.error('💥 Erro ao obter impressoras:', error)
      return [];

  };

  // Verificar status de uma impressora específica (v2.0.1 usa /api/)
  const getPrinterStatus = async (printerName: string): Promise<DominioPrinter | null> => {
    try {
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/printer/status?name=${encodeURIComponent(printerName)}`)
      
      const result = await response.json()
      
      if (result.success) {
        return {
          name: result.printer,
          connected: result.status.connected,
          status: result.status.message
        };

      return null;
    } catch (error) {
      console.error('Erro ao verificar status da impressora:', error)
      return null;

  };

  // Função para gerar comandos ESC/POS formatados
  const generateESCPOSCommands = (content: string): string => {
    let commands = '';
    
    // Inicializar impressora
    commands += '\x1B\x40'; // ESC @ - Reset printer
    
    // Centralizar e imprimir cabeçalho
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x21\x30'; // ESC ! 48 - Double height and width
    commands += '=== DOMINIO PRINTER ===\n';
    commands += '\x1B\x21\x00'; // ESC ! 0 - Normal text
    commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    commands += '\n';
    
    // Adicionar conteúdo principal
    commands += content;
    
    // Adicionar rodapé
    commands += '\n';
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    commands += '\x1B\x61\x01'; // Center align
    commands += 'Teste realizado com sucesso!\n';
    commands += '\x1B\x61\x00'; // Left align
    
    // Cortar papel
    commands += '\n\n\n';
    commands += '\x1D\x56\x41\x10'; // GS V A 16 - Partial cut
    
    return commands;
  };

  // Teste de impressão (v2.0.1 - usando endpoint /print)
  const testPrint = async (printerName: string, text?: string): Promise<boolean> => {
    try {
      setIsPrinting(true)
      
      // Texto padrão se não fornecido
      const defaultText = `Impressora: ${printerName} catch (error) { console.error('Error:', error) }\nData/Hora: ${new Date().toLocaleString('pt-BR')}\nStatus: ✅ FUNCIONANDO!\n\nEste é um teste de impressão\ndo sistema Dominio Printer\npara verificar se a impressora\nestá respondendo corretamente.`;
      
      // Gerar comandos ESC/POS formatados
      const formattedText = generateESCPOSCommands(text || defaultText)
      
      // Estrutura correta para o endpoint /api/printer/test com rawMode v2.2.1
      const printData = {
        printerName: printerName,
        text: formattedText,
        rawMode: true  // v2.2.1 - Impressão sem alterações, controle total pelo app;
      };
      
      console.log('🧪 Enviando teste para:', baseUrl + '/test-print/caixa')
      console.log('📋 Dados do teste:', printData)
      
      const response = await fetch(`${baseUrl}/test-print/caixa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(printData)
      })
      
      console.log('📨 Response status:', response.status)
      const result = await response.json()
      console.log('📨 Response data:', result)
      
      if (result.success) {
        toast.success('Teste de impressão enviado!')
        return true;
      } else {
        toast.error(`Erro no teste: ${result.error || 'Falha na comunicação'}`)
        return false;

    } catch (error) {
      console.error('💥 Erro no teste:', error)
      toast.error('Erro ao conectar com Dominio Printer')
      return false;
    } finally {
      setIsPrinting(false)

  };

  // Impressão de texto simples
  const printText = async (printerName: string, text: string, options: PrintOptions = {}): Promise<boolean> => {
    try {
      setIsPrinting(true)
      
      // Estrutura conforme documentação: /api/printer/print
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/printer/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printerName: printerName, // Conforme documentação
          text,
          rawMode: true,  // v2.2.1 - Impressão sem alterações, controle total pelo app
          options: {
            align: options.align ?? true,
            cut: options.cut ?? true
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Impressão realizada com sucesso!')
        return true;
      } else {
        toast.error(`Erro na impressão: ${result.error}`)
        return false;

    } catch (error) {
      toast.error('Erro ao conectar com Dominio Printer')
      return false;
    } finally {
      setIsPrinting(false)

  };

  // Função para gerar ESC/POS de recibo
  const generateReceiptESCPOS = (receiptData: any): string => {
    let commands = '';
    
    // Reset e configuração inicial
    commands += '\x1B\x40'; // ESC @ - Reset
    
    // Cabeçalho da empresa
    commands += '\x1B\x61\x01'; // Center align
    commands += '\x1B\x21\x30'; // Double size
    commands += 'RESTAURANTE EXEMPLO\n';
    commands += '\x1B\x21\x00'; // Normal size
    commands += 'Rua das Flores, 123\n';
    commands += 'Tel: (11) 1234-5678\n';
    commands += '\x1B\x61\x00'; // Left align
    commands += '\n';
    
    // Separador
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    
    // Informações do pedido
    commands += `Mesa: ${receiptData.mesa || 'N/A'}\n`;
    commands += `Cliente: ${receiptData.cliente || 'Cliente'}\n`;
    commands += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
    commands += '\n';
    
    // Separador
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    commands += 'ITENS:\n';
    commands += '-'.repeat(paperWidth) + '\n'; // Usar largura configurada
    
    // Lista de itens
    let total = 0;
    if (receiptData.itens && receiptData.itens.length > 0) {
      receiptData.itens.forEach((item: any) => {
        const subtotal = item.quantidade * item.preco;
        total += subtotal;
        
        commands += `${item.quantidade}x ${item.nome}\n`;
        if (item.observacoes) {
          commands += `  Obs: ${item.observacoes}\n`;
        }
        
        // Preço alinhado à direita usando largura configurada
        const precoStr = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        const spaces = paperWidth - precoStr.length;
        commands += ' '.repeat(Math.max(0, spaces)) + precoStr + '\n';
        commands += '\n';
      })

    
    // Total
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    commands += '\x1B\x21\x10'; // Double width
    const totalStr = `TOTAL: R$ ${total.toFixed(2).replace('.', ',')}`;
    const totalSpaces = paperWidth - totalStr.length;
    commands += ' '.repeat(Math.max(0, totalSpaces)) + totalStr + '\n';
    commands += '\x1B\x21\x00'; // Normal text
    
    // Rodapé
    commands += '\n';
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    commands += '\x1B\x61\x01'; // Center
    commands += 'Obrigado pela preferência!\n';
    commands += '\x1B\x61\x00'; // Left align
    
    // Corte
    commands += '\n\n\n';
    commands += '\x1D\x56\x41\x10'; // Partial cut
    
    return commands;
  };

  // Impressão de recibo (v2.0.1 usa endpoint /test)
  const printReceipt = async (printerName: string, receipt: Receipt): Promise<boolean> => {
    try {
      setIsPrinting(true)
      
      // Gerar recibo formatado com ESC/POS
      const formattedReceipt = generateReceiptESCPOS(receipt)
      
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/printer/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printerName: printerName,
          text: formattedReceipt,
          rawMode: true  // v2.2.1 - Impressão sem alterações
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Cupom impresso com sucesso!')
        return true;
      } else {
        toast.error(`Erro na impressão do cupom: ${result.error}`)
        return false;

    } catch (error) {
      toast.error('Erro ao conectar com Dominio Printer')
      return false;
    } finally {
      setIsPrinting(false)

  };

  // Função para gerar comanda da cozinha formatada com ESC/POS
  const generateKitchenOrderESCPOS = (order: KitchenOrder): string => {
    let commands = '';
    
    // Inicializar impressora
    commands += '\x1B\x40'; // ESC @ - Reset printer
    
    // Cabeçalho centralizado
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x21\x30'; // ESC ! 48 - Double height and width
    commands += '=== COZINHA ===\n';
    commands += '\x1B\x21\x00'; // ESC ! 0 - Normal text
    commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    commands += '\n';
    
    // Informações do pedido
    commands += `PEDIDO: ${order.orderNumber}\n`;
    commands += `MESA: ${order.table}\n`;
    if (order.customer) {
      commands += `CLIENTE: ${order.customer}\n`;

    commands += `HORÁRIO: ${new Date().toLocaleTimeString('pt-BR')}\n`;
    commands += '\n';
    
    // Linha separadora
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    commands += 'ITENS PARA PREPARO:\n';
    commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
    
    // Itens do pedido
    order.items.forEach(item => {
      commands += '\x1B\x21\x08'; // ESC ! 8 - Emphasized
      commands += `${item.quantity}x ${item.name}\n`;
      commands += '\x1B\x21\x00'; // ESC ! 0 - Normal text
      
      if (item.observations) {
        commands += `  OBS: ${item.observations}\n`;

      
      if (item.additions && item.additions.length > 0) {
        commands += `  ADICIONAIS: ${item.additions.join(', ')}\n`;

      
      commands += '\n';
    })
    
    // Observações gerais
    if (order.observations) {
      commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
      commands += 'OBSERVAÇÕES GERAIS:\n';
      commands += '='.repeat(paperWidth) + '\n'; // Usar largura configurada
      commands += order.observations + '\n\n';

    
    // Rodapé
    commands += '\x1B\x61\x01'; // Center align
    commands += '--- FIM DO PEDIDO ---\n';
    commands += '\x1B\x61\x00'; // Left align
    
    // Cortar papel
    commands += '\n\n\n';
    commands += '\x1D\x56\x41\x10'; // GS V A 16 - Partial cut
    
    return commands;
  };

  // Impressão para cozinha
  const printKitchenOrder = async (printerName: string, order: KitchenOrder): Promise<boolean> => {
    try {
      setIsPrinting(true)
      
      // Gerar comanda formatada com ESC/POS
      const formattedOrder = generateKitchenOrderESCPOS(order)
      
      // Estrutura conforme documentação: /api/printer/kitchen
      const response = await fetch(`${baseUrl} catch (error) { console.error('Error:', error) }/printer/kitchen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printerName: printerName,
          text: formattedOrder,
          rawMode: true  // v2.2.1 - Impressão sem alterações
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Comanda enviada para cozinha!')
        return true;
      } else {
        toast.error(`Erro na impressão da comanda: ${result.error}`)
        return false;

    } catch (error) {
      toast.error('Erro ao conectar com Dominio Printer')
      return false;
    } finally {
      setIsPrinting(false)

  };

  return {
    isConnected,
    isPrinting,
    printers,
    paperWidth,
    checkStatus,
    getPrinters,
    getPrinterStatus,
    testPrint,
    printText,
    printReceipt,
    printKitchenOrder,
    updatePaperWidth
  };
};
