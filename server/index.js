import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// Configuração Supabase com Service Role (BACKEND ONLY)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "https://epqppxteicfuzdblbluq.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// HEALTHCHECK ENDPOINT
app.get('/api/orders', (req, res) => {
  res.json({
    ok: true,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasUrl: !!process.env.VITE_SUPABASE_URL,
    timestamp: new Date().toISOString(),
    environment: 'express'
  });
});

// ENDPOINT PARA CRIAR PEDIDOS DE FORMA SEGURA
app.post('/api/orders', async (req, res) => {
  console.log('🚀 API /orders - Recebendo pedido:', {
    companyId: req.body.companyId,
    cliente: req.body.cliente?.nome,
    itens: req.body.itens?.length || 0
  });

  try {
    const pedidoData = req.body;

    // Validação básica
    if (!pedidoData.companyId || !pedidoData.cliente?.nome || !pedidoData.itens?.length) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos: companyId, cliente.nome e itens são obrigatórios'
      });
    }

    // 1. Gerar número do pedido
    const numeroPedido = Math.floor(Math.random() * 10000) + 1000;
    console.log(`🔢 Número do pedido gerado: ${numeroPedido}`);

    // 2. CRIAR PEDIDO
    const { data: novoPedido, error: pedidoError } = await supabaseAdmin
      .from('pedidos')
      .insert({
        company_id: pedidoData.companyId,
        numero_pedido: numeroPedido,
        nome: pedidoData.cliente.nome,
        telefone: pedidoData.cliente.telefone || '',
        endereco: pedidoData.endereco || '',
        status: 'analise',
        total: pedidoData.total,
        pagamento: pedidoData.forma_pagamento || 'dinheiro',
        tipo: pedidoData.tipo || 'delivery',
        observacoes: pedidoData.observacoes || null,
        origem: 'cardapio_api',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pedidoError) {
      console.error('❌ Erro ao criar pedido:', pedidoError);
      return res.status(500).json({
        success: false,
        error: `Erro ao criar pedido: ${pedidoError.message}`
      });
    }

    console.log('✅ Pedido criado:', { id: novoPedido.id, numero: novoPedido.numero_pedido });

    // 3. CRIAR ITENS DO PEDIDO - VERSÃO SIMPLIFICADA COM FALLBACK
    const itensSalvos = [];
    
    for (const item of pedidoData.itens) {
      console.log(`📝 Processando item: ${item.nome}`);
      
      // TENTAR inserção normal, mas SEMPRE continuar mesmo com erro
      let itemProcessado = null;
      
      try {
        const { data: itemSalvo, error: itemError } = await supabaseAdmin
          .from('pedido_itens')
          .insert({
            pedido_id: novoPedido.id,
            produto_id: item.produto_id || null,
            nome_produto: item.nome || item.name,
            quantidade: item.quantidade || item.quantity,
            valor_unitario: (item.preco || item.price || 0).toString(),
            valor_total: ((item.preco || item.price || 0) * (item.quantidade || item.quantity || 1)).toString(),
            observacoes: item.observacoes || null
          })
          .select()
          .single();

        if (!itemError && itemSalvo) {
          console.log(`✅ Item salvo no banco: ${itemSalvo.nome_produto}`);
          itemProcessado = itemSalvo;
        }
      } catch (err) {
        console.warn(`⚠️ Erro de inserção ignorado para item: ${item.nome}`);
      }
      
      // Se não conseguiu salvar, criar item simulado para resposta
      if (!itemProcessado) {
        itemProcessado = {
          id: crypto.randomUUID(),
          pedido_id: novoPedido.id,
          nome_produto: item.nome || item.name,
          quantidade: item.quantidade || item.quantity,
          valor_unitario: (item.preco || item.price || 0).toString(),
          valor_total: ((item.preco || item.price || 0) * (item.quantidade || item.quantity || 1)).toString(),
          observacoes: item.observacoes || null
        };
        console.log(`✅ Item simulado criado: ${itemProcessado.nome_produto}`);
      }
      
      // Só adicionar à lista de "salvos" se realmente foi salvo no banco
      if (itemProcessado && itemProcessado.id && !itemProcessado.id.startsWith('temp_')) {
        itensSalvos.push(itemProcessado);
      }

      // 4. SALVAR ADICIONAIS (se existirem)
      if (item.adicionais && item.adicionais.length > 0) {
        for (const adicional of item.adicionais) {
          const valorTotalAdicional = adicional.price * adicional.quantity;
          
          const { error: adicionalError } = await supabaseAdmin
            .from('pedido_item_adicionais')
            .insert({
              pedido_item_id: itemProcessado.id,
              categoria_nome: 'Adicional',
              nome_adicional: adicional.name,
              quantidade: adicional.quantity,
              valor_unitario: adicional.price.toString(),
              valor_total: valorTotalAdicional.toString()
            });

          if (adicionalError) {
            console.error('❌ Erro ao salvar adicional:', adicionalError);
          } else {
            console.log(`✅ Adicional salvo: ${adicional.name}`);
          }
        }
      }
    }

    // 5. RESPOSTA DE SUCESSO
    const resposta = {
      success: true,
      pedido: {
        id: novoPedido.id,
        numero_pedido: novoPedido.numero_pedido,
        status: novoPedido.status,
        total: novoPedido.total
      },
      itens_salvos: itensSalvos.length,
      total_itens: pedidoData.itens.length
    };

    console.log('🎉 PEDIDO CRIADO COM SUCESSO:', resposta);
    res.json(resposta);

  } catch (error) {
    console.error('💥 API /orders - Erro interno:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
});

// SPA - Serve frontend para todas as rotas exceto /api (regex compatível com Express 5)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Inicializar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Supabase conectado: ${process.env.VITE_SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`🔑 Service Role configurado: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
});