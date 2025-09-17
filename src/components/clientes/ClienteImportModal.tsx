import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClienteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportStatus {
  total: number;
  processed: number;
  errors: string[];
  success: number;
}

export const ClienteImportModal: React.FC<ClienteImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { currentCompany } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');

  // Prevenir navegação durante importação
  useEffect(() => {
    if (importing || step === 'processing') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Há uma importação em andamento. Tem certeza que deseja sair? Você perderá o progresso.';
        return e.returnValue;
      };

      const handlePopState = () => {
        if (importing) {
          const confirmLeave = window.confirm('Há uma importação em andamento. Tem certeza que deseja sair? Você perderá o progresso.');
          if (!confirmLeave) {
            window.history.pushState(null, '', window.location.href);
          }
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);

      // Adicionar estado ao histórico para capturar navegação
      if (importing) {
        window.history.pushState(null, '', window.location.href);
      }

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [importing, step]);

  const downloadTemplate = () => {
    const csvContent = `Nome do Cliente,Número Telefone,Quantidade de Pedidos,Dias de Inatividade
João Silva,11999999999,5,10
Maria Santos,11888888888,12,3
Pedro Costa,11777777777,0,45`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_clientes.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      // Better CSV parsing to handle commas within quoted values
      const line = lines[i];
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      
      if (values.length >= headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        data.push(row);
      }
    }

    return data;
  };

  const validateClienteData = (cliente: any): string[] => {
    const errors: string[] = [];
    
    if (!cliente['Nome do Cliente'] || cliente['Nome do Cliente'].trim() === '') {
      errors.push('Nome do Cliente é obrigatório');
    }
    
    if (!cliente['Número Telefone'] || cliente['Número Telefone'].toString().replace(/\D/g, '').length < 10) {
      errors.push('Número Telefone deve ter pelo menos 10 dígitos');
    }
    
    const quantidadePedidos = parseInt(cliente['Quantidade de Pedidos']);
    if (isNaN(quantidadePedidos) || quantidadePedidos < 0) {
      errors.push('Quantidade de Pedidos deve ser um número válido');
    }
    
    const diasInatividade = parseInt(cliente['Dias de Inatividade']);
    if (isNaN(diasInatividade) || diasInatividade < 0) {
      errors.push('Dias de Inatividade deve ser um número válido');
    }

    return errors;
  };

  const processImport = async () => {
    if (!file || !currentCompany?.id) return;

    // Check file size (max 10MB for large imports)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo de 10MB permitido.');
      return;
    }

    setImporting(true);
    setStep('processing');

    try {
      const csvText = await file.text();
      console.log('Arquivo CSV lido, tamanho:', csvText.length);
      
      const clientesData = parseCSV(csvText);
      console.log('Dados parseados:', clientesData.length, 'registros');
      
      // Limit to 10k records
      if (clientesData.length > 10000) {
        toast.error('Máximo de 10.000 registros permitidos por importação.');
        setImporting(false);
        return;
      }
      
      if (clientesData.length === 0) {
        toast.error('Nenhum dado válido encontrado no arquivo CSV. Verifique o formato.');
        setImporting(false);
        return;
      }
      
      const status: ImportStatus = {
        total: clientesData.length,
        processed: 0,
        errors: [],
        success: 0
      };

      setImportStatus(status);

      // Process in larger batches for better performance (50 records per batch for reliability)
      const batchSize = 50;
      
      for (let i = 0; i < clientesData.length; i += batchSize) {
        const batch = clientesData.slice(i, i + batchSize);
        
        // Prepare batch for bulk insert
        const validBatch = [];
        
        for (let j = 0; j < batch.length; j++) {
          const clienteRaw = batch[j];
          const lineNumber = i + j + 2; // +2 because CSV starts at line 1 and we skip header
          
          console.log(`Processando linha ${lineNumber}:`, clienteRaw);
          
          const validationErrors = validateClienteData(clienteRaw);
          
          if (validationErrors.length > 0) {
            const errorMsg = `Linha ${lineNumber}: ${validationErrors.join(', ')}`;
            console.error('Erro de validação:', errorMsg);
            status.errors.push(errorMsg);
          } else {
            const clienteData = {
              company_id: currentCompany.id,
              nome: clienteRaw['Nome do Cliente']?.trim(),
              telefone: clienteRaw['Número Telefone']?.toString().replace(/\D/g, '') || null,
              total_pedidos: parseInt(clienteRaw['Quantidade de Pedidos']) || 0,
              dias_sem_comprar: parseInt(clienteRaw['Dias de Inatividade']) || 0,
              email: null,
              documento: null,
              endereco: null,
              cidade: null,
              estado: null,
              cep: null,
              status: 'ativo'
            };
            
            console.log('Cliente preparado para inserção:', clienteData);
            validBatch.push(clienteData);
          }
          
          status.processed++;
        }

        // Insert each record individually for better error tracking
        for (const cliente of validBatch) {
          try {
            console.log('Inserindo cliente:', cliente.nome);
            
            const { data, error } = await supabase
              .from('clientes')
              .insert(cliente)
              .select();

            if (error) {
              console.error('Erro detalhado do Supabase:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              });
              status.errors.push(`Erro ao inserir ${cliente.nome}: ${error.message}`);
            } else {
              console.log('Cliente inserido com sucesso:', data);
              status.success++;
            }
          } catch (err: any) {
            console.error('Erro inesperado completo:', {
              message: err.message,
              stack: err.stack,
              cliente: cliente
            });
            status.errors.push(`Erro inesperado ao inserir ${cliente.nome}: ${err.message}`);
          }
        }
        
        // Update progress
        setImportStatus({ ...status });
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStep('complete');
      toast.success(`Importação concluída! ${status.success} clientes importados com sucesso.`);
      
      if (status.errors.length > 0) {
        toast.warning(`${status.errors.length} registros com erro. Verifique os detalhes.`);
      }

    } catch (error: any) {
      toast.error('Erro ao processar arquivo: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (step === 'complete') {
      onImportComplete();
    }
    setFile(null);
    setImportStatus(null);
    setStep('upload');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Clientes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' && (
            <>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Faça upload de um arquivo CSV com os dados dos clientes. 
                  Suporta até 10.000 registros e arquivos de até 10MB.
                  Use o template abaixo como referência para o formato correto.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template CSV
                </Button>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {!file ? (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Clique para selecionar um arquivo CSV
                        <br />
                        <span className="text-xs text-gray-500">Máximo: 10.000 registros | 10MB</span>
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setFile(null)}
                        className="mt-2"
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={processImport}
                  disabled={!file || importing}
                >
                  Iniciar Importação
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && importStatus && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Processando importação...</h3>
                <div className="space-y-2">
                  <Progress 
                    value={(importStatus.processed / importStatus.total) * 100} 
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{importStatus.processed} de {importStatus.total} processados</span>
                    <span>{Math.round((importStatus.processed / importStatus.total) * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">{importStatus.success}</p>
                  <p className="text-xs text-green-600">Sucessos</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="font-medium text-red-700">{importStatus.errors.length}</p>
                  <p className="text-xs text-red-600">Erros</p>
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && importStatus && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Importação Concluída!</h3>
                <p className="text-gray-600">
                  {importStatus.success} de {importStatus.total} clientes importados com sucesso
                </p>
              </div>

              {importStatus.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Erros encontrados:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importStatus.errors.slice(0, 10).map((error, index) => (
                          <p key={index} className="text-xs">{error}</p>
                        ))}
                        {importStatus.errors.length > 10 && (
                          <p className="text-xs italic">
                            ... e mais {importStatus.errors.length - 10} erros
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};