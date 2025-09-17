import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool });

// Query functions for orders
export async function createPedido(pedidoData) {
  const { company_id, numero_pedido, nome, telefone, endereco, status, total, pagamento, tipo, observacoes } = pedidoData;
  
  const query = `
    INSERT INTO pedidos (company_id, numero_pedido, nome, telefone, endereco, status, total, pagamento, tipo, observacoes, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING id, numero_pedido, status, total, created_at
  `;
  
  const result = await pool.query(query, [
    company_id, numero_pedido, nome, telefone, endereco, 
    status, total, pagamento, tipo, observacoes
  ]);
  
  return result.rows[0];
}

export async function createPedidoItem(itemData) {
  const { pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes } = itemData;
  
  const query = `
    INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING id, nome_produto, quantidade, valor_unitario, valor_total
  `;
  
  const result = await pool.query(query, [
    pedido_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total, observacoes
  ]);
  
  return result.rows[0];
}

export async function createPedidoItemAdicional(adicionalData) {
  const { pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total } = adicionalData;
  
  const query = `
    INSERT INTO pedido_item_adicionais (pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id, nome_adicional, quantidade, valor_unitario, valor_total
  `;
  
  const result = await pool.query(query, [
    pedido_item_id, categoria_nome, nome_adicional, quantidade, valor_unitario, valor_total
  ]);
  
  return result.rows[0];
}