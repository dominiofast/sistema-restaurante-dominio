import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Comandos ESC/POS
const ESC = '\x1B';
const GS = '\x1D';

interface PrintRequest {
  printerIp: string;
  printerPort?: number;
  companyId: string;
  type: 'cupom' | 'comanda' | 'relatorio';
  data: any;
}

serve(async (req) => {
  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    // Validar autorização
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    // Pegar dados da requisição
    const printRequest: PrintRequest = await req.json()
    const { printerIp, printerPort = 9100, companyId, type, data } = printRequest

    // Verificar se usuário tem acesso à empresa
    const { data: userCompany } = await supabaseClient
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single()

    if (!userCompany) throw new Error('Sem permissão para esta empresa')

    // Montar conteúdo para impressão
    let printContent = '';
    
    switch (type) {
      case 'cupom':
        printContent = formatarCupom(data);
        break;
      case 'comanda':
        printContent = formatarComanda(data);
        break;
      case 'relatorio':
        printContent = formatarRelatorio(data);
        break;
    }

    // Conectar e enviar para impressora
    console.log(`Conectando em ${printerIp}:${printerPort}...`)
    
    const conn = await Deno.connect({
      hostname: printerIp,
      port: printerPort,
      transport: 'tcp'
    });

    // Enviar comandos
    const encoder = new TextEncoder();
    await conn.write(encoder.encode(printContent));
    
    // Fechar conexão
    conn.close();

    // Registrar log
    await supabaseClient
      .from('print_logs')
      .insert({
        company_id: companyId,
        user_id: user.id,
        printer_ip: printerIp,
        type: type,
        status: 'success',
        content_preview: printContent.substring(0, 100)
      })

    return new Response(
      JSON.stringify({ success: true, message: 'Impressão enviada!' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})

// Funções de formatação
function formatarCupom(data: any): string {
  let content = '';
  
  // Reset e inicializar
  content += ESC + '@';
  
  // Cabeçalho centralizado
  content += ESC + 'a' + '\x01'; // Centralizar
  content += ESC + '!' + '\x30'; // Texto grande
  content += data.nomeEmpresa + '\n';
  content += ESC + '!' + '\x00'; // Texto normal
  content += data.enderecoEmpresa + '\n';
  content += data.telefoneEmpresa + '\n';
  content += '=====================================\n';
  
  // Informações do pedido
  content += ESC + 'a' + '\x00'; // Alinhar esquerda
  content += '\nPEDIDO #' + data.numeroPedido + '\n';
  content += 'Data: ' + new Date().toLocaleString('pt-BR') + '\n';
  
  if (data.cliente) {
    content += '\nCliente: ' + data.cliente.nome + '\n';
    content += 'Tel: ' + data.cliente.telefone + '\n';
    if (data.cliente.endereco) {
      content += 'End: ' + data.cliente.endereco + '\n';
    }
  }
  
  content += '\n-------------------------------------\n';
  content += 'ITENS:\n';
  
  // Itens do pedido
  let total = 0;
  data.itens.forEach((item: any) => {
    const subtotal = item.quantidade * item.preco;
    total += subtotal;
    
    content += `${item.quantidade}x ${item.nome.padEnd(25)} ${subtotal.toFixed(2)}\n`;
    
    if (item.observacoes) {
      content += `   Obs: ${item.observacoes}\n`;
    }
  });
  
  content += '-------------------------------------\n';
  
  // Total
  content += ESC + 'E' + '\x01'; // Negrito
  content += `TOTAL: R$ ${total.toFixed(2)}\n`;
  content += ESC + 'E' + '\x00'; // Normal
  
  // Forma de pagamento
  if (data.formaPagamento) {
    content += `Pagamento: ${data.formaPagamento}\n`;
  }
  
  // Rodapé
  content += ESC + 'a' + '\x01'; // Centralizar
  content += '\nObrigado pela preferência!\n';
  content += '\n\n\n';
  
  // Cortar papel (depois da mensagem)
  content += GS + 'V' + '\x41' + '\x00';
  
  return content;
}

function formatarComanda(data: any): string {
  let content = '';
  
  // Reset
  content += ESC + '@';
  
  // Cabeçalho
  content += ESC + '!' + '\x30'; // Texto grande
  content += ESC + 'a' + '\x01'; // Centralizar
  content += 'COMANDA ' + data.numeroComanda + '\n';
  content += ESC + '!' + '\x00'; // Normal
  content += '=====================================\n';
  
  // Mesa/Cliente
  content += ESC + 'a' + '\x00'; // Esquerda
  if (data.mesa) {
    content += 'MESA: ' + data.mesa + '\n';
  }
  content += 'Hora: ' + new Date().toLocaleTimeString('pt-BR') + '\n\n';
  
  // Itens
  data.itens.forEach((item: any) => {
    content += ESC + 'E' + '\x01'; // Negrito
    content += `${item.quantidade}x ${item.nome}\n`;
    content += ESC + 'E' + '\x00'; // Normal
    
    if (item.observacoes) {
      content += `   --> ${item.observacoes}\n`;
    }
    content += '\n';
  });
  
  // Cortar
  content += '\n\n\n';
  content += GS + 'V' + '\x41' + '\x00';
  
  return content;
}

function formatarRelatorio(data: any): string {
  // Implementar formatação de relatório
  return 'RELATÓRIO\n' + JSON.stringify(data, null, 2);
} 