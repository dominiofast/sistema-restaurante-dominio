import { createClient } from 'npm:@supabase/supabase-js@2.49.8'

console.log("🚀 [criar-pedido-pdv] carregando função...")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PedidoPDVData {
  nome: string
  telefone: string
  endereco?: string
  tipo: 'delivery' | 'retirada' | 'balcao'
  pagamento?: string
  observacoes?: string
  taxaEntrega?: number
  company_id?: string // Para super admins especificarem a empresa
  itens: Array<{
    produto_id: string
    nome_produto: string
    quantidade: number
    preco_unitario: number
    adicionais?: Array<{
      nome: string
      preco: number
      quantidade: number
    }>
  }>
}

Deno.serve(async (req: Request) => {
  console.log("⭐ [criar-pedido-pdv] invocada com método", req.method)
  console.log("🚀 EDGE FUNCTION EXECUTANDO - TESTE DE LOGS")
  
  if (req.method === 'OPTIONS') {
    console.log("🔄 CORS preflight")
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log("❌ Method not allowed:", req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    )
  }

  try {
    console.log("📦 Parsing request body...")
    const pedidoData: PedidoPDVData = await req.json()
    console.log("📋 Dados recebidos:", {
      nome: pedidoData.nome,
      telefone: pedidoData.telefone,
      tipo: pedidoData.tipo,
      itens_count: pedidoData.itens?.length || 0,
      company_id_enviado: pedidoData.company_id,
      taxaEntrega: pedidoData.taxaEntrega
    })

    // Validação
    if (!pedidoData.nome || !pedidoData.telefone || !pedidoData.itens?.length) {
      console.log("❌ Campos obrigatórios ausentes")
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: nome, telefone, itens' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Environment vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log("🔧 Environment check:", {
      url: !!supabaseUrl,
      key: !!supabaseServiceKey
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing environment variables")
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log("🔌 Creating Supabase client...")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obter company_id do usuário logado
    const authHeader = req.headers.get('Authorization')
    let companyId: string

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      try {
        console.log("🔍 Decodificando JWT...")
        // Decodificar JWT manualmente para obter email e role
        const tokenParts = token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        const userEmail = payload.email
        console.log("👤 Email do usuário:", userEmail)
        
        // Usar função RLS segura para obter role - fallback para user_metadata
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role')
        const userRole = roleData || payload.user_metadata?.role || payload.raw_user_meta_data?.role || 'user'
        console.log("👑 Role do usuário (via RLS):", userRole)
        console.log("🔄 Fallback role data:", { roleData, roleError, userRole })
        
        // STRICT VALIDATION FOR SUPER ADMIN
        if (userRole === 'super_admin') {
          console.log("🔑 Super admin detectado...")
          
          // Validate company_id explicitly
          if (!pedidoData.company_id) {
            console.error("❌ COMPANY_SELECTION_REQUIRED - company_id não enviado do frontend")
            return new Response(
              JSON.stringify({ 
                error: 'COMPANY_SELECTION_REQUIRED',
                message: 'Super admin deve selecionar uma empresa antes de criar pedidos',
                details: 'company_id não foi enviado do frontend'
              }),
              { status: 400, headers: corsHeaders }
            )
          }
          
          // Verificar se a empresa especificada existe e está ativa
          const { data: specificCompany, error: specError } = await supabase
            .from('companies')
            .select('id, name')
            .eq('id', pedidoData.company_id)
            .eq('status', 'active')
            .single()
          
          if (specError || !specificCompany) {
            console.error("❌ UNAUTHORIZED_COMPANY - empresa especificada não encontrada ou inativa:", pedidoData.company_id, specError)
            return new Response(
              JSON.stringify({ 
                error: 'UNAUTHORIZED_COMPANY',
                message: 'Empresa especificada não encontrada ou inativa',
                company_id: pedidoData.company_id
              }),
              { status: 403, headers: corsHeaders }
            )
          }
          
          companyId = specificCompany.id
          console.log("🏢 Super admin usando empresa especificada:", specificCompany.name, "- ID:", companyId)
        } else {
          // Usuários normais - usar company_id enviado ou primeira empresa ativa
          if (pedidoData.company_id) {
            // Verificar se a empresa especificada existe e está ativa
            const { data: specificCompany, error: specError } = await supabase
              .from('companies')
              .select('id, name')
              .eq('id', pedidoData.company_id)
              .eq('status', 'active')
              .single()
            
            if (specError || !specificCompany) {
              console.error("❌ Empresa especificada não encontrada:", pedidoData.company_id, specError)
              return new Response(
                JSON.stringify({ error: 'Empresa especificada não encontrada ou inativa' }),
                { status: 400, headers: corsHeaders }
              )
            }
            
            companyId = specificCompany.id
            console.log("🏢 Usando empresa especificada:", specificCompany.name, "- ID:", companyId)
          } else {
            // Fallback para primeira empresa ativa encontrada
            console.log("🔍 Buscando empresa ativa para email:", userEmail)
            const { data: credential, error: credError } = await supabase
              .from('companies')
              .select('id, name')
              .eq('status', 'active')
              .limit(1)
              .single()
            
            console.log("📊 Resultado da busca:", { credential, credError })
            
            if (credError || !credential?.id) {
              console.error("❌ Nenhuma empresa ativa encontrada:", userEmail, credError)
              return new Response(
                JSON.stringify({ error: 'Nenhuma empresa ativa encontrada' }),
                { status: 400, headers: corsHeaders }
              )
            }
            
            companyId = credential.id
            console.log("🏢 Empresa fallback encontrada:", credential.name, "- ID:", companyId)
          }
        }
        
      } catch (error) {
        console.error("❌ Erro ao processar JWT:", error)
        return new Response(
          JSON.stringify({ error: 'Token inválido', details: String(error) }),
          { status: 401, headers: corsHeaders }
        )
      }
    } else {
      console.error("❌ Authorization header ausente")
      return new Response(
        JSON.stringify({ error: 'Authorization header necessário' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Calcular total
    console.log("💰 Calculando total...")
    const subtotal = pedidoData.itens.reduce((acc, item) => {
      const itemTotal = item.preco_unitario * item.quantidade
      const adicionaisTotal = item.adicionais?.reduce((accAd, ad) => 
        accAd + (ad.preco * ad.quantidade), 0) || 0
      return acc + itemTotal + adicionaisTotal
    }, 0)

    const total = subtotal + (pedidoData.taxaEntrega || 0)
    console.log("💰 Total calculado:", total)

    // Adicionar taxa de entrega como item se existir (igual ao cardápio digital)
    let itensCompletos = [...pedidoData.itens]
    if (pedidoData.taxaEntrega && pedidoData.taxaEntrega > 0) {
      console.log("💰 Adicionando taxa de entrega como item:", pedidoData.taxaEntrega)
      const taxaItem = {
        produto_id: 'taxa-entrega',
        nome_produto: 'Taxa de Entrega',
        quantidade: 1,
        preco_unitario: pedidoData.taxaEntrega,
        adicionais: []
      }
      itensCompletos.push(taxaItem)
      console.log("📎 Item taxa de entrega criado:", JSON.stringify(taxaItem, null, 2))
    }

    // Criar pedido via RPC
    console.log("🔄 Chamando RPC criar_pedido_pdv_completo...")
    console.log("📋 Itens completos sendo enviados:", JSON.stringify(itensCompletos, null, 2))
    const rpcParams = {
      p_company_id: companyId,
      p_nome: pedidoData.nome,
      p_telefone: pedidoData.telefone,
      p_itens: JSON.stringify(itensCompletos),
      p_endereco: pedidoData.endereco || null,
      p_tipo: pedidoData.tipo || 'balcao',
      p_pagamento: pedidoData.pagamento || null,
      p_total: total,
      p_observacoes: pedidoData.observacoes || null
    }
    
    console.log("📋 Parâmetros RPC:", JSON.stringify(rpcParams, null, 2))
    
    const { data: resultado, error: rpcError } = await supabase.rpc('criar_pedido_pdv_completo', rpcParams)

    console.log("📊 Resultado RPC:", resultado)
    console.log("🚨 Erro RPC:", rpcError)

    if (rpcError) {
      console.error("❌ Erro RPC:", rpcError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pedido', details: rpcError.message }),
        { status: 500, headers: corsHeaders }
      )
    }

    if (!resultado) {
      console.error("❌ RPC retornou null")
      return new Response(
        JSON.stringify({ error: 'Erro interno ao criar pedido' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log("✅ Pedido criado com sucesso:", resultado)

    return new Response(
      JSON.stringify({
        success: true,
        pedido_id: resultado.pedido_id,
        numero_pedido: resultado.numero_pedido,
        total: resultado.total,
        message: 'Pedido criado com sucesso'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error("❌ Erro geral na função:", error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: String(error),
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})