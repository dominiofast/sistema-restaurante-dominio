import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface PrinterConfig {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
}

export const useWebSerialPrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);

  // Comandos ESC/POS
  const ESC = '\x1B';
  const GS = '\x1D';
  
  // Verificar suporte
  const checkSupport = useCallback(() => {
    if (!('serial' in navigator)) {
      toast.error('Navegador não suporta Web Serial API. Use Chrome ou Edge.');
      return false;
    }
    return true;
  }, []);

  // Conectar impressora
  const connect = useCallback(async (config: PrinterConfig = {}) => {
    if (!checkSupport()) return false;
    
    try {
      setIsConnecting(true);
      
      // Solicitar porta
      const port = await navigator.serial.requestPort();
      portRef.current = port;
      
      // Abrir porta
      await port.open({
        baudRate: config.baudRate || 9600,
        dataBits: config.dataBits || 8,
        stopBits: config.stopBits || 1,
        parity: config.parity || 'none'
      });
      
      // Configurar writer
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      writerRef.current = textEncoder.writable.getWriter();
      
      setIsConnected(true);
      toast.success('Impressora conectada!');
      
      // Inicializar
      await sendCommand(ESC + '@');
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao conectar impressora');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [checkSupport]);

  // Desconectar
  const disconnect = useCallback(async () => {
    try {
      if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setIsConnected(false);
      toast.info('Impressora desconectada');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, []);

  // Enviar comando
  const sendCommand = useCallback(async (command: string) => {
    if (!writerRef.current) {
      throw new Error('Impressora não conectada');
    }
    await writerRef.current.write(command);
  }, []);

  // Imprimir texto
  const printText = useCallback(async (text: string) => {
    try {
      await sendCommand(text);
    } catch (error) {
      toast.error('Erro ao imprimir');
      throw error;
    }
  }, [sendCommand]);

  // Imprimir cupom
  const printReceipt = useCallback(async (data: {
    header?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    footer?: string;
  }) => {
    try {
      // Cabeçalho centralizado
      await sendCommand(ESC + 'a' + '\x01'); // Centralizar
      await sendCommand(ESC + '!' + '\x30'); // Texto grande
      await printText(data.header || 'CUPOM FISCAL\n');
      await sendCommand(ESC + '!' + '\x00'); // Texto normal
      await printText(new Date().toLocaleString('pt-BR') + '\n');
      await printText('=====================================\n');
      
      // Itens alinhados à esquerda
      await sendCommand(ESC + 'a' + '\x00');
      
      for (const item of data.items) {
        const linha = `${item.quantity}x ${item.name.padEnd(25)} ${item.price.toFixed(2)}`;
        await printText(linha + '\n');
      }
      
      await printText('-------------------------------------\n');
      
      // Total em negrito
      await sendCommand(ESC + 'E' + '\x01');
      await printText(`TOTAL: R$ ${data.total.toFixed(2)}\n`);
      await sendCommand(ESC + 'E' + '\x00');
      
      // Rodapé
      if (data.footer) {
        await sendCommand(ESC + 'a' + '\x01');
        await printText('\n' + data.footer + '\n');
      }
      
      // Cortar papel
      await printText('\n\n\n\n');
      await sendCommand(GS + 'V' + '\x41' + '\x00');
      
      toast.success('Cupom impresso!');
    } catch (error) {
      toast.error('Erro ao imprimir cupom');
      throw error;
    }
  }, [sendCommand, printText]);

  // Cortar papel
  const cutPaper = useCallback(async () => {
    try {
      await sendCommand(GS + 'V' + '\x41' + '\x00');
    } catch (error) {
      toast.error('Erro ao cortar papel');
    }
  }, [sendCommand]);

  // Abrir gaveta
  const openDrawer = useCallback(async () => {
    try {
      await sendCommand(ESC + 'p' + '\x00' + '\x0A' + '\x00');
      toast.success('Gaveta aberta');
    } catch (error) {
      toast.error('Erro ao abrir gaveta');
    }
  }, [sendCommand]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    printText,
    printReceipt,
    cutPaper,
    openDrawer,
    checkSupport
  };
}; 