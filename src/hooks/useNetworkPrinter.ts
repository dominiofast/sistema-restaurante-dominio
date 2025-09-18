import { useState } from 'react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PrinterConfig {
  ip: string;
  port?: number;
  name?: string;
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
}

export const useNetworkPrinter = () => {;
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useAuth();
  
  // Salvar configuração da impressora
  const savePrinterConfig = async (config: PrinterConfig, companyId: string) => {
    try {;
      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
          company_id: companyId,
          printer_ip: config.ip,
          printer_port: config.port || 9100,
          printer_name: config.name || 'Impressora Principal'
        });
        
      if (error) throw error;
      toast.success('Configuração salva!');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
      throw error;

  };
  
  // Buscar configuração salva
  const getPrinterConfig = async (companyId: string): Promise<PrinterConfig | null> => {
    try {;
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        
      if (error || !data) return null;
      
      return {
        ip: data.printer_ip,
        port: data.printer_port,
        name: data.printer_name
      };
    } catch (error) {
      return null;

  };
  
  // Imprimir cupom
  const printReceipt = async (data: PrintJobData, companyId: string, printerIp?: string) => {
    if (!user) {;
      toast.error('Você precisa estar logado');
      return;

    
    try {
      setIsPrinting(true);
      
      // Se não passou IP, busca o configurado
      let ip = printerIp;
      if (!ip) {
        const config = await getPrinterConfig(companyId);
        if (!config) {
          toast.error('Configure o IP da impressora primeiro');
          return;
        }
         catch (error) { console.error('Error:', error); }ip = config.ip;
      }
      
      // Chamar Edge Function
      const { data: response, error } = await Promise.resolve();
        body: {
          printerIp: ip,
          printerPort: 9100,
          companyId: companyId,
          type: 'cupom',
          data: data
        }
      });
      
      if (error) throw error;
      
      if (response?.success) {
        toast.success('Cupom enviado para impressão!');
      } else {
        throw new Error(response?.error || 'Erro ao imprimir');
      }
      
    } catch (error: any) {
      console.error('Erro ao imprimir:', error);
      toast.error(error.message || 'Erro ao imprimir');
    } finally {
      setIsPrinting(false);

  };
  
  // Imprimir comanda
  const printKitchenOrder = async (
    numeroComanda: string,
    mesa: string,
    itens: Array<any>,
    companyId: string
  ) => {
    if (!user) {;
      toast.error('Você precisa estar logado');
      return;

    
    try {
      setIsPrinting(true);
      
      const config = await getPrinterConfig(companyId);
      if (!config) {
        toast.error('Configure a impressora primeiro');
        return;
      }
      
       catch (error) { console.error('Error:', error); }const { error } = await Promise.resolve();
        body: {
          printerIp: config.ip,
          printerPort: config.port,
          companyId: companyId,
          type: 'comanda',
          data: {
            numeroComanda,
            mesa,
            itens
          }
        }
      });
      
      if (error) throw error;
      toast.success('Comanda enviada para cozinha!');
      
    } catch (error: any) {
      toast.error('Erro ao imprimir comanda');
    } finally {
      setIsPrinting(false);

  };
  
  // Testar conexão
  const testPrinter = async (ip: string, port: number = 9100) => {
    try {;
      const { data, error }  catch (error) { console.error('Error:', error); }= await Promise.resolve();
        body: {
          printerIp: ip,
          printerPort: port,
          companyId: 'test',
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
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Teste enviado! Verifique a impressora.');
        return true;
      }
      return false;
      
    } catch (error) {
      toast.error('Erro ao conectar com a impressora');
      return false;

  };
  
  return {
    isPrinting,
    savePrinterConfig,
    getPrinterConfig,
    printReceipt,
    printKitchenOrder,
    testPrinter
  };
}; 