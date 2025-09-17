import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PedidoData {
  pedido_id: number
  numero_pedido: number
  company_id: string
  printer_name: string
  allow_reprint?: boolean
  origin?: 'manual' | 'auto'
  company_info: {
    nome_estabelecimento: string
    endereco: string
    contato: string
    cnpj_cpf: string
  }
  company_address: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  } | null
  pedido: {
    nome: string
    telefone: string
    endereco: string
    tipo: string
    pagamento: string
    total: number
    observacoes?: string
  }
}

interface PedidoItem {
  nome_produto: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  observacoes?: string
  pedido_item_adicionais?: Array<{
    nome_adicional: string
    categoria_nome: string
    quantidade: number
    valor_unitario: number
    valor_total: number
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const pedidoData: PedidoData = await req.json()
    
    console.log('🖨️ Auto Print - Processando pedido:', pedidoData.pedido_id)

    // Processar impressão em background para não bloquear o response
    const backgroundPrintTask = async () => {
      try {
        // Aguardar um pouco para garantir que os itens foram inseridos
        await new Promise(resolve => setTimeout(resolve, 3000))

        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Idempotência: evitar impressão duplicada (janela ~5min)
        let skipIdempotency = Boolean((pedidoData as any).allow_reprint);
        if (!skipIdempotency) {
          const { data: recentLogs } = await supabase
            .from('ai_conversation_logs')
            .select('id, message_type, message_content, created_at')
            .eq('company_id', pedidoData.company_id)
            .order('created_at', { ascending: false })
            .limit(50)

          const alreadyStarted = (recentLogs || []).some((l: any) =>
            (l.message_type === 'auto_print_started' || l.message_type === 'auto_print_success' || l.message_type === 'manual_print_started' || l.message_type === 'manual_print_success') &&
            typeof l.message_content === 'string' &&
            l.message_content.includes(`pedido_id=${pedidoData.pedido_id}`)
          )

          if (alreadyStarted) {
            console.warn('⚠️ Impressão já iniciada/realizada para este pedido; abortando duplicata.', pedidoData.pedido_id)
            return
          }
        } else {
          console.log('🔁 Reimpressão manual solicitada; ignorando verificação de duplicidade para pedido', pedidoData.pedido_id)
        }

        const startedType = (pedidoData as any).origin === 'manual' ? 'manual_print_started' : 'auto_print_started'
        await supabase.from('ai_conversation_logs').insert({
          company_id: pedidoData.company_id,
          message_type: startedType,
          message_content: `PRINT LOCK pedido_id=${pedidoData.pedido_id} origin=${(pedidoData as any).origin || 'auto'}`,
          created_at: new Date().toISOString(),
        })

        // Buscar cabeçalho do pedido (fallback quando payload é mínimo)
        const { data: pedidoHeader, error: pedidoHeaderError } = await supabase
          .from('pedidos')
          .select('id, numero_pedido, nome, telefone, endereco, tipo, pagamento, total, company_id')
          .eq('id', pedidoData.pedido_id)
          .maybeSingle()
        if (pedidoHeaderError) {
          console.warn('⚠️ Não foi possível carregar cabeçalho do pedido:', pedidoHeaderError)
        }

        const numeroPedidoFromDb = pedidoHeader?.numero_pedido ?? null
        const clienteNome = pedidoData.pedido?.nome ?? pedidoHeader?.nome ?? ''
        const clienteTelefone = pedidoData.pedido?.telefone ?? pedidoHeader?.telefone ?? ''
        const clienteEndereco = pedidoData.pedido?.endereco ?? pedidoHeader?.endereco ?? ''
        const tipoPedido = pedidoData.pedido?.tipo ?? pedidoHeader?.tipo ?? 'balcao'
        const formaPagamento = pedidoData.pedido?.pagamento ?? pedidoHeader?.pagamento ?? 'Não informado'
        const totalPedido = Number(pedidoData.pedido?.total ?? pedidoHeader?.total ?? 0)

        // Buscar itens do pedido com todos os dados necessários
        console.log('🔍 Buscando itens para pedido:', pedidoData.pedido_id)
        const { data: itensBrutos, error: itensError } = await supabase
          .from('pedido_itens')
          .select(`
            id,
            nome_produto, 
            quantidade, 
            valor_unitario, 
            valor_total,
            observacoes,
            pedido_id
          `)
          .eq('pedido_id', pedidoData.pedido_id)

        if (itensError) {
          console.error('❌ Erro ao buscar itens:', itensError)
          throw new Error(`Erro ao buscar itens: ${itensError.message}`)
        }

        console.log('📝 Itens encontrados:', itensBrutos?.length || 0)
        console.log('🔍 Dados dos itens:', itensBrutos)

        if (!itensBrutos || itensBrutos.length === 0) {
          console.warn('⚠️ Nenhum item encontrado para o pedido', pedidoData.pedido_id)
          
          // Tentar uma segunda consulta para debug
          console.log('🔍 Tentando consulta de debug...')
          const { data: debugItems, error: debugError } = await supabase
            .from('pedido_itens')
            .select('*')
            .limit(5)
            .order('created_at', { ascending: false })
          
          console.log('🔍 Últimos itens no banco:', debugItems)
          console.log('🔍 Erro de debug:', debugError)
          
          // Log da falha
          await supabase.from('ai_conversation_logs').insert({
            company_id: pedidoData.company_id,
            customer_phone: clienteTelefone,
            customer_name: clienteNome,
            message_content: `IMPRESSÃO AUTO: Nenhum item encontrado para pedido #${pedidoData.numero_pedido || numeroPedidoFromDb || pedidoData.pedido_id}`,
            message_type: 'auto_print_no_items',
            created_at: new Date().toISOString()
          })

          return
        }

        // Buscar adicionais para todos os itens em lote com tentativas (evita condição de corrida)
        const itens: any[] = []
        const itemIds = (itensBrutos || []).map((i: any) => i.id)

        console.log('🔍 IDs dos itens para buscar adicionais:', itemIds)

        const fetchAdicionaisBatch = async () => {
          if (itemIds.length === 0) {
            console.log('⚠️ Nenhum item encontrado para buscar adicionais')
            return [] as any[]
          }
          
          console.log('🔍 Buscando adicionais para itens:', itemIds)
          const { data: adicionaisAll, error: adicionaisErr } = await supabase
            .from('pedido_item_adicionais')
            .select('pedido_item_id, nome_adicional, categoria_nome, quantidade, valor_unitario, valor_total')
            .in('pedido_item_id', itemIds)
          
          if (adicionaisErr) {
            console.warn('⚠️ Erro ao buscar adicionais em lote:', adicionaisErr)
            return [] as any[]
          }
          
          console.log('📋 Adicionais encontrados:', adicionaisAll)
          return adicionaisAll || []
        }

        // Até 4 tentativas com backoff para aguardar inserção de adicionais pelo cardápio digital
        let adicionaisBatch: any[] = []
        for (let attempt = 1; attempt <= 4; attempt++) {
          adicionaisBatch = await fetchAdicionaisBatch()
          const foundCount = adicionaisBatch.length
          console.log(`🔄 Tentativa ${attempt}/4 - adicionais encontrados:`, foundCount)
          // Se já temos pelo menos 1 adicional ou se não há itens, podemos seguir
          if (foundCount > 0 || itemIds.length === 0) break
          // Pequeno backoff crescente
          await new Promise(r => setTimeout(r, attempt * 1000))
        }

        // Organizar adicionais por item_id
        const adicionaisByItem: Record<string, any[]> = {}
        for (const ad of adicionaisBatch) {
          const key = String(ad.pedido_item_id)
          if (!adicionaisByItem[key]) adicionaisByItem[key] = []
          adicionaisByItem[key].push({
            nome_adicional: ad.nome_adicional,
            categoria_nome: ad.categoria_nome,
            quantidade: ad.quantidade,
            valor_unitario: ad.valor_unitario,
            valor_total: (Number(ad.valor_unitario) || 0) * (Number(ad.quantidade) || 0)
          })
        }

        for (const item of itensBrutos) {
          const adicionais = adicionaisByItem[String(item.id)] || []
          itens.push({
            nome_produto: item.nome_produto,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            observacoes: item.observacoes,
            pedido_item_adicionais: adicionais
          })
        }

        // Validar dados essenciais antes de formatar
        const numeroValidado = pedidoData.numero_pedido || numeroPedidoFromDb || pedidoData.pedido_id
        const itensValidados = (itens as PedidoItem[]) || []
        
        if (!numeroValidado) {
          throw new Error('Número do pedido não encontrado')
        }
        
        if (!Array.isArray(itensValidados) || itensValidados.length === 0) {
          throw new Error('Itens do pedido não encontrados ou inválidos')
        }

        // Preparar impressão via PrintNode (ESC/POS)
        console.log('🖨️ Preparando conteúdo ESC/POS para PrintNode...')

        // Buscar configuração da empresa para PrintNode
        const { data: printerConfig, error: printerCfgError } = await supabase
          .from('company_settings')
          .select('printnode_default_printer_id, printnode_child_account_id, printnode_child_email')
          .eq('company_id', pedidoData.company_id)
          .maybeSingle()
        if (printerCfgError) {
          console.error('❌ Erro ao buscar company_settings:', printerCfgError)
        }
        const printerId = printerConfig?.printnode_default_printer_id
        if (!printerId) {
          console.warn('⚠️ Nenhuma impressora PrintNode padrão configurada. Pulando impressão automática.')
          await supabase.from('ai_conversation_logs').insert({
            company_id: pedidoData.company_id,
            customer_phone: clienteTelefone,
            customer_name: clienteNome,
            message_content: `AUTO-PRINT: Sem printnode_default_printer_id para company_id=${pedidoData.company_id}`,
            message_type: 'auto_print_skipped_no_printnode',
            created_at: new Date().toISOString()
          })
          return
        }

        // Largura do papel
        const { data: printerWidthRec } = await supabase
          .from('printer_configs')
          .select('largura_papel')
          .eq('company_id', pedidoData.company_id)
          .eq('is_active', true)
          .maybeSingle()
        const width = Number(printerWidthRec?.largura_papel) || 42

        // Dados da empresa
        const { data: companyInfo } = await supabase
          .from('company_info')
          .select('nome_estabelecimento, contato, cnpj_cpf, endereco, numero, complemento, bairro, cidade, estado, cep')
          .eq('company_id', pedidoData.company_id)
          .maybeSingle()

        const { data: companyAddr } = await supabase
          .from('company_addresses')
          .select('logradouro, numero, complemento, bairro, cidade, estado, cep, is_principal')
          .eq('company_id', pedidoData.company_id)
          .eq('is_principal', true)
          .maybeSingle()

        const formatAddress = (addr: any) => addr ? `${addr.logradouro || ''}, ${addr.numero || ''}${addr.complemento ? ', ' + addr.complemento : ''}\n${addr.bairro || ''} - ${addr.cidade || ''}/${addr.estado || ''}\nCEP: ${addr.cep || ''}` : ''

        // Utilitário local para remover acentos
        const stripAccents = (input: string) => input ? input.normalize('NFD').replace(/\p{Diacritic}+/gu, '') : ''

        // Helpers de formatação com largura exata e truncamento
        const sep = '='.repeat(width).slice(0, width) + '\n'
        const thin = '-'.repeat(width).slice(0, width) + '\n'
        const truncate = (text: string, maxLen: number) => {
          if (!text) return ''
          if (text.length <= maxLen) return text
          if (maxLen <= 3) return text.slice(0, maxLen)
          return text.slice(0, maxLen - 3) + '...'
        }
        const lineLeftRight = (left: string, right: string) => {
          const r = right || ''
          const maxLeft = Math.max(0, width - r.length)
          const l = truncate(left || '', maxLeft)
          const spaces = Math.max(0, width - (l.length + r.length))
          return l + ' '.repeat(spaces) + r
        }
        let commands = ''
        commands += '\x1B\x40' // Reset
        commands += '\x1B\x4D\x00' // Fonte A
        commands += '\x1B\x61\x01' // Center
        commands += '\x1B\x21\x30' // Double size
        commands += `${companyInfo?.nome_estabelecimento || 'ESTABELECIMENTO'}\n`
        commands += '\x1B\x21\x00'
        const addrStr = formatAddress(companyAddr) || formatAddress(companyInfo as any)
        if (addrStr) commands += addrStr + '\n'
        if (companyInfo?.contato) commands += `Tel: ${companyInfo.contato}\n`
        if (companyInfo?.cnpj_cpf) commands += `CNPJ: ${companyInfo.cnpj_cpf}\n`
        commands += '\x1B\x61\x00' // Left
        commands += '\n'
        commands += sep
        commands += '\x1B\x61\x01'
        commands += 'PEDIDO\n'
        commands += '\x1B\x21\x30'
        commands += `#${numeroValidado}\n`
        commands += '\x1B\x21\x00'
        commands += '\x1B\x61\x00'
        commands += sep
        const dataHora = new Date().toLocaleString('pt-BR')
        commands += `Data: ${dataHora}\n`
        if (clienteNome && clienteNome !== 'Consumidor Final') commands += `Cliente: ${clienteNome}\n`
        if (clienteTelefone) commands += `Tel: ${clienteTelefone}\n`
        if (clienteEndereco) commands += `End: ${clienteEndereco}\n`
        commands += '\n'
        commands += sep
        commands += 'ITENS:\n'
        commands += thin
        for (const item of itensValidados) {
          const nome = item.nome_produto || ''
          const qt = Number(item.quantidade) || 0
          const vu = Number(item.valor_unitario) || 0
          const valorBase = qt * vu
          const adicionais = item.pedido_item_adicionais || []
          const valorAdicionais = adicionais.reduce((acc: number, ad: any) => acc + Number(ad.valor_unitario || 0) * Number(ad.quantidade || 0), 0)
          const subtotal = Math.max(Number(item.valor_total || 0), valorBase + valorAdicionais)
          commands += lineLeftRight(`${qt}x ${nome}`, `R$ ${subtotal.toFixed(2).replace('.', ',')}`) + '\n'
          if (item.observacoes) {
            commands += '\x1B\x45\x01' // Bold on
            commands += `  >>> OBS: ${item.observacoes} <<<\n`
            commands += '\x1B\x45\x00' // Bold off
          }
          if (adicionais.length) {
            for (const ad of adicionais) {
              commands += `  + ${ad.quantidade}x ${ad.nome_adicional}\n`
            }
          }
          commands += '\n'
        }
        commands += sep
        const total = Number(totalPedido || 0)
        // Negrito simples no total
        commands += '\x1B\x45\x01'
        commands += lineLeftRight('TOTAL:', `R$ ${total.toFixed(2).replace('.', ',')}`) + '\n'
        commands += '\x1B\x45\x00'
        commands += `Pagamento: ${formaPagamento}\n`
        commands += `Tipo: ${tipoPedido}\n`
        if (pedidoData.pedido?.observacoes) {
          commands += '\x1B\x45\x01' // Bold on
          commands += `>>> OBS GERAL: ${pedidoData.pedido.observacoes} <<<\n`
          commands += '\x1B\x45\x00' // Bold off
        }
        commands += '\n'
        commands += sep
        commands += '\x1B\x61\x01'
        commands += 'Obrigado pela preferencia!\n'
        commands += '\x1B\x61\x00'
        commands += '\n\n\n'
        commands += '\x1D\x56\x41\x03'

        // Base64 (raw)
        const utf8 = new TextEncoder().encode(stripAccents(commands))
        let binary = ''
        utf8.forEach((b) => (binary += String.fromCharCode(b)))
        const contentBase64 = btoa(binary)

        console.log('🛰️ Enviando job para printnode-proxy...', { printerId })
        const { data: pnData, error: pnError } = await supabase.functions.invoke('printnode-proxy', {
          body: {
            action: 'print',
            printerId: Number(printerId),
            title: `Pedido #${numeroValidado}`,
            contentType: 'raw_base64',
            content: contentBase64,
            source: 'Dominio POS',
            childAccountId: printerConfig?.printnode_child_account_id || undefined,
            childAccountEmail: printerConfig?.printnode_child_email || undefined,
          },
        })

        if (pnError) {
          console.error('❌ Falha ao enviar para PrintNode:', pnError)
          await supabase.from('ai_conversation_logs').insert({
            company_id: pedidoData.company_id,
            customer_phone: clienteTelefone,
            customer_name: clienteNome,
            message_content: `IMPRESSÃO ${(pedidoData as any).origin === 'manual' ? 'MANUAL' : 'AUTO'}: Erro PrintNode para pedido #${pedidoData.numero_pedido || numeroValidado} - ${pnError.message}`,
            message_type: (pedidoData as any).origin === 'manual' ? 'manual_print_failed' : 'auto_print_all_failed',
            created_at: new Date().toISOString(),
          })
        } else {
          console.log('✅ Pedido impresso via PrintNode com sucesso!', pnData)
          await supabase.from('ai_conversation_logs').insert({
            company_id: pedidoData.company_id,
            customer_phone: clienteTelefone,
            customer_name: clienteNome,
            message_content: `IMPRESSÃO ${(pedidoData as any).origin === 'manual' ? 'MANUAL' : 'AUTO'}: Pedido #${pedidoData.numero_pedido || numeroValidado} impresso via PrintNode (printerId=${printerId})`,
            message_type: (pedidoData as any).origin === 'manual' ? 'manual_print_success' : 'auto_print_success',
            created_at: new Date().toISOString(),
          })
        }

      } catch (error) {
        console.error('💥 Erro no background task de impressão:', error)
        
        // Log de erro geral
        await supabase.from('ai_conversation_logs').insert({
          company_id: pedidoData.company_id,
          customer_phone: clienteTelefone,
          customer_name: clienteNome,
          message_content: `ERRO IMPRESSÃO ${(pedidoData as any).origin === 'manual' ? 'MANUAL' : 'AUTO'}: ${(error as any).message} - Pedido #${pedidoData.numero_pedido || numeroValidado}`,
          message_type: (pedidoData as any).origin === 'manual' ? 'manual_print_error' : 'auto_print_error',
          created_at: new Date().toISOString()
        })
      }
    }

    // Executar impressão em background
    EdgeRuntime.waitUntil(backgroundPrintTask())
    
    // Retornar resposta imediata
    return new Response(
      JSON.stringify({ success: true, message: 'Processamento de impressão iniciado em background' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Erro na edge function de impressão automática:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})