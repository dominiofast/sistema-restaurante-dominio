import { supabase } from '@/integrations/supabase/client';

// Dados padrão de mercadorias/ingredientes
const MERCADORIAS_PADRAO = [
  // === MASSAS E FARINHAS ===
  { nome: 'Farinha de Trigo Tipo 1', descricao: 'Farinha de trigo especial para pizza', unidade_medida: 'kg', categoria: 'Farinhas e Massas', preco_unitario: 3.50, estoque_atual: 50.0, estoque_minimo: 10.0, observacoes: 'Ideal para massa de pizza' },
  { nome: 'Farinha Semolina', descricao: 'Farinha de semolina para massa especial', unidade_medida: 'kg', categoria: 'Farinhas e Massas', preco_unitario: 8.90, estoque_atual: 20.0, estoque_minimo: 5.0, observacoes: 'Para massas premium' },
  { nome: 'Fermento Biológico Seco', descricao: 'Fermento para crescimento da massa', unidade_medida: 'g', categoria: 'Farinhas e Massas', preco_unitario: 0.15, estoque_atual: 500.0, estoque_minimo: 100.0, observacoes: 'Conservar em local seco' },
  
  // === MOLHOS E BASES ===
  { nome: 'Molho de Tomate Pelado', descricao: 'Tomate pelado italiano para molho', unidade_medida: 'kg', categoria: 'Molhos e Bases', preco_unitario: 8.00, estoque_atual: 30.0, estoque_minimo: 8.0, observacoes: 'Base para molho de pizza' },
  { nome: 'Azeite Extra Virgem', descricao: 'Azeite de oliva extra virgem', unidade_medida: 'L', categoria: 'Óleos e Gorduras', preco_unitario: 25.00, estoque_atual: 10.0, estoque_minimo: 3.0, observacoes: 'Para finalizar pizzas' },
  { nome: 'Orégano Seco', descricao: 'Orégano desidratado', unidade_medida: 'g', categoria: 'Temperos e Condimentos', preco_unitario: 0.08, estoque_atual: 200.0, estoque_minimo: 50.0, observacoes: 'Tempero clássico' },
  { nome: 'Manjericão Fresco', descricao: 'Folhas frescas de manjericão', unidade_medida: 'maço', categoria: 'Temperos e Condimentos', preco_unitario: 3.50, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Usar rapidamente' },
  { nome: 'Alho', descricao: 'Alho fresco para temperar', unidade_medida: 'kg', categoria: 'Temperos e Condimentos', preco_unitario: 12.00, estoque_atual: 5.0, estoque_minimo: 1.0, observacoes: 'Indispensável na cozinha' },
  
  // === QUEIJOS E LATICÍNIOS ===
  { nome: 'Mussarela Fatiada', descricao: 'Queijo mussarela fatiado', unidade_medida: 'kg', categoria: 'Laticínios', preco_unitario: 25.00, estoque_atual: 40.0, estoque_minimo: 10.0, observacoes: 'Principal queijo das pizzas' },
  { nome: 'Parmesão Ralado', descricao: 'Queijo parmesão ralado fino', unidade_medida: 'kg', categoria: 'Laticínios', preco_unitario: 45.00, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Para finalizar' },
  { nome: 'Gorgonzola', descricao: 'Queijo gorgonzola cremoso', unidade_medida: 'kg', categoria: 'Laticínios', preco_unitario: 38.00, estoque_atual: 8.0, estoque_minimo: 2.0, observacoes: 'Queijo especial' },
  { nome: 'Catupiry', descricao: 'Requeijão cremoso Catupiry', unidade_medida: 'kg', categoria: 'Laticínios', preco_unitario: 28.00, estoque_atual: 12.0, estoque_minimo: 3.0, observacoes: 'Marca registrada' },
  { nome: 'Ricota', descricao: 'Queijo ricota fresco', unidade_medida: 'kg', categoria: 'Laticínios', preco_unitario: 18.00, estoque_atual: 10.0, estoque_minimo: 2.0, observacoes: 'Para pizzas brancas' },
  
  // === CARNES E PROTEÍNAS ===
  { nome: 'Calabresa Defumada', descricao: 'Linguiça calabresa fatiada', unidade_medida: 'kg', categoria: 'Carnes', preco_unitario: 22.00, estoque_atual: 20.0, estoque_minimo: 5.0, observacoes: 'Clássico das pizzas' },
  { nome: 'Presunto Parma', descricao: 'Presunto parma importado', unidade_medida: 'kg', categoria: 'Carnes', preco_unitario: 85.00, estoque_atual: 5.0, estoque_minimo: 1.0, observacoes: 'Produto premium' },
  { nome: 'Bacon em Cubos', descricao: 'Bacon cortado em cubos', unidade_medida: 'kg', categoria: 'Carnes', preco_unitario: 32.00, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Defumado especial' },
  { nome: 'Peito de Peru Defumado', descricao: 'Peito de peru fatiado', unidade_medida: 'kg', categoria: 'Carnes', preco_unitario: 28.00, estoque_atual: 8.0, estoque_minimo: 2.0, observacoes: 'Opção mais saudável' },
  { nome: 'Frango Desfiado', descricao: 'Peito de frango cozido e desfiado', unidade_medida: 'kg', categoria: 'Aves', preco_unitario: 18.00, estoque_atual: 12.0, estoque_minimo: 3.0, observacoes: 'Temperar antes de usar' },
  
  // === FRUTOS DO MAR ===
  { nome: 'Camarão Descascado', descricao: 'Camarão médio limpo', unidade_medida: 'kg', categoria: 'Frutos do Mar', preco_unitario: 65.00, estoque_atual: 8.0, estoque_minimo: 2.0, observacoes: 'Manter congelado' },
  { nome: 'Atum em Latas', descricao: 'Atum sólido em água', unidade_medida: 'unidade', categoria: 'Frutos do Mar', preco_unitario: 8.50, estoque_atual: 25.0, estoque_minimo: 5.0, observacoes: 'Escorrer antes de usar' },
  
  // === VEGETAIS E VERDURAS ===
  { nome: 'Tomate Italiano', descricao: 'Tomate alongado para pizza', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 8.00, estoque_atual: 20.0, estoque_minimo: 5.0, observacoes: 'Cortar em rodelas' },
  { nome: 'Cebola Roxa', descricao: 'Cebola roxa fatiada', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 4.50, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Sabor mais suave' },
  { nome: 'Pimentão Verde', descricao: 'Pimentão verde em tiras', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 6.00, estoque_atual: 10.0, estoque_minimo: 2.0, observacoes: 'Cortar em tiras' },
  { nome: 'Champignon Fatiado', descricao: 'Cogumelos champignon em conserva', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 12.00, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Escorrer bem' },
  { nome: 'Azeitona Preta', descricao: 'Azeitona preta sem caroço', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 18.00, estoque_atual: 12.0, estoque_minimo: 2.0, observacoes: 'Enxaguar antes de usar' },
  { nome: 'Rúcula Fresca', descricao: 'Folhas de rúcula selecionada', unidade_medida: 'maço', categoria: 'Legumes e Verduras', preco_unitario: 4.50, estoque_atual: 20.0, estoque_minimo: 5.0, observacoes: 'Lavar bem antes de usar' },
  { nome: 'Milho em Conserva', descricao: 'Grãos de milho doce', unidade_medida: 'kg', categoria: 'Legumes e Verduras', preco_unitario: 7.50, estoque_atual: 18.0, estoque_minimo: 4.0, observacoes: 'Escorrer o líquido' },
  
  // === FRUTAS ===
  { nome: 'Abacaxi em Fatias', descricao: 'Abacaxi descascado em fatias', unidade_medida: 'kg', categoria: 'Frutas', preco_unitario: 12.00, estoque_atual: 8.0, estoque_minimo: 2.0, observacoes: 'Para pizzas doces' },
  { nome: 'Banana Nanica', descricao: 'Banana madura para doces', unidade_medida: 'kg', categoria: 'Frutas', preco_unitario: 6.00, estoque_atual: 10.0, estoque_minimo: 2.0, observacoes: 'Para pizzas de sobremesa' },
  
  // === DOCES E SOBREMESAS ===
  { nome: 'Chocolate ao Leite', descricao: 'Chocolate ao leite em barra', unidade_medida: 'kg', categoria: 'Doces e Sobremesas', preco_unitario: 28.00, estoque_atual: 5.0, estoque_minimo: 1.0, observacoes: 'Derreter em banho-maria' },
  { nome: 'Leite Condensado', descricao: 'Leite condensado tradicional', unidade_medida: 'kg', categoria: 'Doces e Sobremesas', preco_unitario: 8.50, estoque_atual: 12.0, estoque_minimo: 3.0, observacoes: 'Para pizzas doces' },
  { nome: 'Açúcar Cristal', descricao: 'Açúcar cristal refinado', unidade_medida: 'kg', categoria: 'Doces e Sobremesas', preco_unitario: 4.50, estoque_atual: 25.0, estoque_minimo: 5.0, observacoes: 'Uso geral' },
  
  // === ÓLEOS E GORDURAS ===
  { nome: 'Óleo de Soja', descricao: 'Óleo de soja refinado', unidade_medida: 'L', categoria: 'Óleos e Gorduras', preco_unitario: 8.50, estoque_atual: 20.0, estoque_minimo: 5.0, observacoes: 'Para refogar' },
  { nome: 'Azeite Composto', descricao: 'Azeite misto para uso geral', unidade_medida: 'L', categoria: 'Óleos e Gorduras', preco_unitario: 12.00, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Sabor suave' },
  
  // === CONSERVAS ===
  { nome: 'Palmito em Conserva', descricao: 'Palmito inteiro em conserva', unidade_medida: 'kg', categoria: 'Conservas', preco_unitario: 15.00, estoque_atual: 10.0, estoque_minimo: 2.0, observacoes: 'Cortar em rodelas' },
  { nome: 'Ervilha em Conserva', descricao: 'Ervilha verde em conserva', unidade_medida: 'kg', categoria: 'Conservas', preco_unitario: 6.50, estoque_atual: 15.0, estoque_minimo: 3.0, observacoes: 'Escorrer bem' },
  
  // === OUTROS ===
  { nome: 'Água Mineral', descricao: 'Água mineral natural', unidade_medida: 'L', categoria: 'Bebidas', preco_unitario: 2.50, estoque_atual: 100.0, estoque_minimo: 20.0, observacoes: 'Para preparo de massas' },
  { nome: 'Sal Refinado', descricao: 'Sal refinado especial', unidade_medida: 'kg', categoria: 'Temperos e Condimentos', preco_unitario: 3.00, estoque_atual: 10.0, estoque_minimo: 2.0, observacoes: 'Uso geral na cozinha' },
  
  // === EMBALAGENS ===
  { nome: 'Caixa Pizza 35cm', descricao: 'Caixa de papelão para pizza grande', unidade_medida: 'unidade', categoria: 'Embalagens', preco_unitario: 2.80, estoque_atual: 200.0, estoque_minimo: 50.0, observacoes: 'Padrão pizzaria' },
  { nome: 'Caixa Pizza 30cm', descricao: 'Caixa de papelão para pizza média', unidade_medida: 'unidade', categoria: 'Embalagens', preco_unitario: 2.20, estoque_atual: 300.0, estoque_minimo: 75.0, observacoes: 'Tamanho médio' },
  { nome: 'Guardanapo Personalizado', descricao: 'Guardanapo com logo da empresa', unidade_medida: 'unidade', categoria: 'Embalagens', preco_unitario: 0.05, estoque_atual: 5000.0, estoque_minimo: 1000.0, observacoes: 'Identidade visual' }
];

// Dados padrão de receitas
const RECEITAS_PADRAO = [
  {
    nome: 'Massa de Pizza Tradicional',
    descricao: 'Massa clássica italiana para pizza',
    categoria: 'Massas',
    tempo_preparo: 120,
    rendimento: 8,
    unidade_rendimento: 'unidades',
    modo_preparo: `1. Dissolva o fermento em água morna (35°C)
2. Em uma tigela, misture a farinha com o sal
3. Faça um buraco no centro e adicione a água com fermento
4. Adicione o azeite e misture bem
5. Sove a massa por 10 minutos até ficar lisa
6. Deixe descansar por 1 hora em local morno
7. Divida em 8 porções de 150g cada
8. Modele as bolinhas e deixe descansar mais 30 min
9. Abra com as mãos ou rolo, sempre do centro para fora`,
    observacoes: 'Massa deve ficar elástica e macia. Não adicionar muita farinha ao abrir.',
    custo_total: 12.50,
    preco_venda_sugerido: 25.00,
    margem_lucro: 100.00
  },
  {
    nome: 'Molho Base Para Pizza',
    descricao: 'Molho de tomate temperado para base das pizzas',
    categoria: 'Molhos e Bases',
    tempo_preparo: 45,
    rendimento: 2,
    unidade_rendimento: 'kg',
    modo_preparo: `1. Escorra bem os tomates pelados e amasse com as mãos
2. Aqueça o azeite em uma panela
3. Refogue o alho picado até dourar
4. Adicione os tomates amassados
5. Tempere com sal, orégano e manjericão
6. Cozinhe em fogo baixo por 30 minutos mexendo ocasionalmente
7. Ajuste o tempero a gosto
8. Deixe esfriar antes de usar
9. Conserve na geladeira por até 5 dias`,
    observacoes: 'Molho não deve ficar muito líquido. Se necessário, cozinhe mais para reduzir.',
    custo_total: 8.20,
    preco_venda_sugerido: 18.00,
    margem_lucro: 119.51
  },
  {
    nome: 'Pizza Margherita',
    descricao: 'Clássica pizza italiana com molho, mussarela e manjericão',
    categoria: 'Pizzas Tradicionais',
    tempo_preparo: 15,
    rendimento: 1,
    unidade_rendimento: 'unidades',
    modo_preparo: `1. Pré-aqueça o forno à temperatura máxima (250°C)
2. Abra a massa em formato circular
3. Coloque sobre a forma ou pedra refratária
4. Espalhe 80g do molho base uniformemente
5. Distribua a mussarela fatiada por toda pizza
6. Leve ao forno por 8-12 minutos
7. Retire quando as bordas estiverem douradas
8. Adicione folhas frescas de manjericão
9. Regue com fio de azeite extra virgem
10. Sirva imediatamente`,
    observacoes: 'Pizza deve ter bordas crocantes e centro macio. Manjericão sempre fresco no final.',
    custo_total: 8.75,
    preco_venda_sugerido: 24.90,
    margem_lucro: 184.57
  },
  {
    nome: 'Pizza Calabresa',
    descricao: 'Pizza tradicional com calabresa, cebola e azeitona',
    categoria: 'Pizzas Tradicionais',
    tempo_preparo: 18,
    rendimento: 1,
    unidade_rendimento: 'unidades',
    modo_preparo: `1. Pré-aqueça o forno à temperatura máxima (250°C)
2. Abra a massa em formato circular
3. Espalhe 80g do molho base
4. Distribua a mussarela fatiada
5. Adicione as fatias de calabresa
6. Espalhe a cebola roxa em fatias finas
7. Decore com azeitonas pretas
8. Leve ao forno por 10-14 minutos
9. Retire quando dourada
10. Polvilhe orégano seco
11. Sirva quente`,
    observacoes: 'Calabresa deve ser de boa qualidade. Cebola roxa dá sabor mais suave.',
    custo_total: 11.20,
    preco_venda_sugerido: 28.90,
    margem_lucro: 158.04
  },
  {
    nome: 'Molho Branco Para Pizza',
    descricao: 'Molho cremoso à base de ricota e catupiry',
    categoria: 'Molhos e Bases',
    tempo_preparo: 20,
    rendimento: 1.5,
    unidade_rendimento: 'kg',
    modo_preparo: `1. Amasse bem a ricota até ficar cremosa
2. Misture com o catupiry em temperatura ambiente
3. Adicione uma pitada de sal e pimenta branca
4. Acrescente alho bem picadinho (opcional)
5. Misture até obter consistência homogênea
6. Prove e ajuste temperos
7. Use imediatamente ou conserve por até 3 dias
8. Aplicar camada fina sobre a massa`,
    observacoes: 'Não levar ao fogo. Molho deve ser usado frio sobre a massa.',
    custo_total: 22.50,
    preco_venda_sugerido: 45.00,
    margem_lucro: 100.00
  },
  {
    nome: 'Pizza 4 Queijos',
    descricao: 'Pizza especial com mussarela, gorgonzola, parmesão e catupiry',
    categoria: 'Pizzas Especiais',
    tempo_preparo: 16,
    rendimento: 1,
    unidade_rendimento: 'unidades',
    modo_preparo: `1. Pré-aqueça o forno à temperatura máxima
2. Abra a massa deixando bordas mais grossas
3. Espalhe uma camada fina de molho branco
4. Distribua a mussarela cobrindo toda base
5. Adicione pedaços pequenos de gorgonzola
6. Espalhe colheradas de catupiry
7. Finalize polvilhando parmesão ralado
8. Leve ao forno por 12-15 minutos
9. Retire quando queijos estiverem derretidos
10. Deixe descansar 2 minutos antes de cortar`,
    observacoes: 'Queijos devem estar em temperatura ambiente. Não exagerar no gorgonzola.',
    custo_total: 18.50,
    preco_venda_sugerido: 42.90,
    margem_lucro: 131.89
  },
  {
    nome: 'Borda Recheada Tradicional',
    descricao: 'Técnica para fazer borda recheada com catupiry',
    categoria: 'Técnicas Especiais',
    tempo_preparo: 10,
    rendimento: 1,
    unidade_rendimento: 'unidades',
    modo_preparo: `1. Abra a massa deixando 3cm de borda extra
2. Faça pequenas bolinhas de catupiry (10g cada)
3. Coloque as bolinhas na borda da massa
4. Dobre a borda sobre o recheio
5. Aperte bem as emendas para selar
6. Pincele a borda com azeite
7. Polvilhe orégano sobre a borda
8. Adicione os ingredientes no centro
9. Asse normalmente
10. A borda fica dourada e cremosa por dentro`,
    observacoes: 'Selar bem a borda para não vazar. Catupiry deve estar firme.',
    custo_total: 3.50,
    preco_venda_sugerido: 8.00,
    margem_lucro: 128.57
  }
];

export class FichasTecnicasDefaultService {
  
  // Verificar se já existem mercadorias para a empresa
  static async verificarMercadoriasExistentes(companyId: string): Promise<number> {
    try {
      const { data, error } = await (supabase as any)
        .from('mercadorias_ingredientes')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao verificar mercadorias existentes:', error);
      return 0;
    }
  }

  // Verificar se já existem receitas para a empresa
  static async verificarReceitasExistentes(companyId: string): Promise<number> {
    try {
      const { data, error } = await (supabase as any)
        .from('receitas_fichas_tecnicas')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Erro ao verificar receitas existentes:', error);
      return 0;
    }
  }

  // Carregar mercadorias padrão
  static async carregarMercadoriasPadrao(companyId: string, userId: string): Promise<{ sucesso: boolean; mensagem: string; quantidade?: number }> {
    try {
      // Verificar se já existem mercadorias
      const existentes = await this.verificarMercadoriasExistentes(companyId);
      
      if (existentes > 0) {
        return {
          sucesso: false,
          mensagem: `Já existem ${existentes} mercadorias cadastradas. Para evitar duplicação, limpe os dados antes de carregar os padrões.`
        };
      }

      // Preparar dados para inserção
      const mercadorias = MERCADORIAS_PADRAO.map(mercadoria => ({
        ...mercadoria,
        company_id: companyId,
        created_by: userId,
        updated_by: userId
      }));

      // Inserir em lotes de 10 para evitar problemas de performance
      const batchSize = 10;
      let totalInseridas = 0;

      for (let i = 0; i < mercadorias.length; i += batchSize) {
        const lote = mercadorias.slice(i, i + batchSize);
        
        const { error } = await (supabase as any)
          .from('mercadorias_ingredientes')
          .insert(lote);

        if (error) {
          console.error(`Erro no lote ${i / batchSize + 1}:`, error);
          throw error;
        }
        
        totalInseridas += lote.length;
      }

      return {
        sucesso: true,
        mensagem: `${totalInseridas} mercadorias padrão carregadas com sucesso!`,
        quantidade: totalInseridas
      };

    } catch (error: any) {
      console.error('Erro ao carregar mercadorias padrão:', error);
      return {
        sucesso: false,
        mensagem: `Erro ao carregar mercadorias: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  // Carregar receitas padrão
  static async carregarReceitasPadrao(companyId: string, userId: string): Promise<{ sucesso: boolean; mensagem: string; quantidade?: number }> {
    try {
      // Verificar se já existem receitas
      const existentes = await this.verificarReceitasExistentes(companyId);
      
      if (existentes > 0) {
        return {
          sucesso: false,
          mensagem: `Já existem ${existentes} receitas cadastradas. Para evitar duplicação, limpe os dados antes de carregar os padrões.`
        };
      }

      // Preparar dados para inserção
      const receitas = RECEITAS_PADRAO.map(receita => ({
        ...receita,
        company_id: companyId,
        created_by: userId,
        updated_by: userId
      }));

      // Inserir todas as receitas
      const { error } = await (supabase as any)
        .from('receitas_fichas_tecnicas')
        .insert(receitas);

      if (error) {
        console.error('Erro ao inserir receitas:', error);
        throw error;
      }

      return {
        sucesso: true,
        mensagem: `${receitas.length} receitas padrão carregadas com sucesso!`,
        quantidade: receitas.length
      };

    } catch (error: any) {
      console.error('Erro ao carregar receitas padrão:', error);
      return {
        sucesso: false,
        mensagem: `Erro ao carregar receitas: ${error.message || 'Erro desconhecido'}`
      };
    }
  }

  // Obter estatísticas dos dados padrão
  static getDadosEstatisticas() {
    return {
      mercadorias: {
        total: MERCADORIAS_PADRAO.length,
        categorias: [...new Set(MERCADORIAS_PADRAO.map(m => m.categoria))].length,
        categoriasNomes: [...new Set(MERCADORIAS_PADRAO.map(m => m.categoria))].sort()
      },
      receitas: {
        total: RECEITAS_PADRAO.length,
        categorias: [...new Set(RECEITAS_PADRAO.map(r => r.categoria))].length,
        categoriasNomes: [...new Set(RECEITAS_PADRAO.map(r => r.categoria))].sort()
      }
    };
  }
} 