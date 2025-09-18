// SUPABASE REMOVIDO
interface OpcaoAdicional {
  descricao: string;
  venda: number;
  ordem: number;
}

interface GrupoAdicional {
  grupo: string;
  obrigatorio: boolean;
  min_selection?: number;
  max_selection?: number;
  selection_type?: string;
  opcoes: OpcaoAdicional[];
}

interface ProdutoJson {
  produto: string;
  descritivo: string | null;
  setor: string;
  venda: string;
  opcoesObrigatorias?: GrupoAdicional[];
  opcoesOpcionais?: GrupoAdicional[];
}

interface CardapioJson {
  produtos: ProdutoJson[];
  totalProdutos: number;
  geradoEm: string;
}

export class CardapioJsonService {
  /**
   * Gera o JSON estruturado do cardápio para alimentar a IA
   */
  static async generateCardapioJson(companyId: string): Promise<CardapioJson | null> {
    try {
      console.log('📋 Gerando JSON estruturado do cardápio - Company:', companyId);

      // Buscar categorias ativas
      console.log('🔍 Buscando categorias...');
      const { data: categorias, error: categoriasError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'categorias')
        /* .select\( REMOVIDO */ ; //'id, name, description')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .order\( REMOVIDO */ ; //'order_position', { ascending: true });

      if (categoriasError) {
        console.error('❌ Erro ao buscar categorias:', categoriasError);
        return null;
      }

      console.log('✅ Categorias encontradas:', categorias?.length || 0);

      // Buscar produtos disponíveis
      console.log('🔍 Buscando produtos...');
      const { data: produtos, error: produtosError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'produtos')
        /* .select\( REMOVIDO */ ; //'id, name, description, price, promotional_price, is_promotional, categoria_id')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'is_available', true)
        /* .order\( REMOVIDO */ ; //'order_position', { ascending: true });

      if (produtosError) {
        console.error('❌ Erro ao buscar produtos:', produtosError);
        return null;
      }

      console.log('✅ Produtos encontrados:', produtos?.length || 0);

      // Buscar relações produto-categoria adicional
      console.log('🔍 Buscando categorias adicionais...');
      const { data: produtoCategorias, error: produtoCategoriasError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'produto_categorias_adicionais')
        /* .select\( REMOVIDO */ ; //`
          produto_id,
          categoria_adicional_id,
          is_required,
          min_selection,
          max_selection,
          categorias_adicionais!inner(
            id,
            name,
            description,
            selection_type,
            min_selection,
            max_selection,
            is_required,
            company_id
          )
        `)
        /* .eq\( REMOVIDO */ ; //'categorias_adicionais.company_id', companyId);

      if (produtoCategoriasError) {
        console.error('❌ Erro ao buscar categorias adicionais:', produtoCategoriasError);
        // Não retornar null aqui, apenas continuar sem categorias adicionais
      }

      console.log('✅ Categorias adicionais encontradas:', produtoCategorias?.length || 0);

      // Buscar adicionais ativos
      console.log('🔍 Buscando adicionais...');
      const { data: adicionais, error: adicionaisError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'adicionais')
        /* .select\( REMOVIDO */ ; //`
          id, 
          name, 
          description, 
          price, 
          categoria_adicional_id, 
          order_position,
          categorias_adicionais!inner(company_id)
        `)
        /* .eq\( REMOVIDO */ ; //'is_available', true)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .eq\( REMOVIDO */ ; //'categorias_adicionais.company_id', companyId)
        /* .order\( REMOVIDO */ ; //'order_position', { ascending: true });

      if (adicionaisError) {
        console.error('❌ Erro ao buscar adicionais:', adicionaisError);
        // Não retornar null aqui, apenas continuar sem adicionais
      }

      console.log('✅ Adicionais encontrados:', adicionais?.length || 0);

      // Processar produtos com suas categorias e adicionais
      console.log('🔧 Processando produtos...');
      const produtosJson: ProdutoJson[] = produtos?.map(produto => {
        // Encontrar categoria do produto
        const categoria = categorias?.find(c => c.id === produto.categoria_id);
        
        // Obter preço (promocional se disponível)
        const precoFinal = produto.is_promotional && produto.promotional_price 
          ? produto.promotional_price 
          : produto.price;

        const produtoJson: ProdutoJson = {
          produto: produto.name,
          descritivo: produto.description,
          setor: categoria?.name || 'Sem categoria',
          venda: precoFinal?.toString() || '0'
        };

        // Buscar categorias adicionais para este produto
        const categoriasAdicionaisDoProduto = produtoCategorias?.filter(
          pc => pc.produto_id === produto.id
        ) || [];

        if (categoriasAdicionaisDoProduto.length > 0) {
          const opcoesObrigatorias: GrupoAdicional[] = [];
          const opcoesOpcionais: GrupoAdicional[] = [];

          categoriasAdicionaisDoProduto.forEach(relacao => {
            const categoriaAdicional = relacao.categorias_adicionais;
            if (!categoriaAdicional) return;

            // Buscar adicionais desta categoria
            const adicionaisDaCategoria = adicionais?.filter(
              a => a.categoria_adicional_id === categoriaAdicional.id
            ) || [];

            if (adicionaisDaCategoria.length > 0) {
              const grupo: GrupoAdicional = {
                grupo: categoriaAdicional.name,
                obrigatorio: relacao.is_required || categoriaAdicional.is_required || false,
                min_selection: relacao.min_selection || categoriaAdicional.min_selection || 0,
                max_selection: relacao.max_selection || categoriaAdicional.max_selection || undefined,
                selection_type: categoriaAdicional.selection_type || 'single',
                opcoes: adicionaisDaCategoria.map(adicional => ({
                  descricao: adicional.name,
                  venda: Number(adicional.price) || 0,
                  ordem: adicional.order_position || 0
                })).sort((a, b) => a.ordem - b.ordem)
              };

              if (grupo.obrigatorio) {
                opcoesObrigatorias.push(grupo);
              } else {
                opcoesOpcionais.push(grupo);
              }
            }
          });

          if (opcoesObrigatorias.length > 0) {
            produtoJson.opcoesObrigatorias = opcoesObrigatorias;
          }

          if (opcoesOpcionais.length > 0) {
            produtoJson.opcoesOpcionais = opcoesOpcionais;
          }
        }

        return produtoJson;
      }) || [];

      const result: CardapioJson = {
        produtos: produtosJson,
        totalProdutos: produtosJson.length,
        geradoEm: new Date().toISOString()
      };

      console.log('✅ JSON estruturado gerado com sucesso:', {
        totalProdutos: result.totalProdutos,
        produtosComOpcionais: produtosJson.filter(p => p.opcoesOpcionais || p.opcoesObrigatorias).length
      });

      return result;

    } catch (error) {
      console.error('❌ ERRO GERAL no generateCardapioJson:', error);
      return null;
    }
  }

  /**
   * Formata o JSON do cardápio para texto legível para a IA
   */
  static formatJsonToText(cardapioJson: CardapioJson): string {
    if (!cardapioJson || cardapioJson.produtos.length === 0) {
      return 'Nenhum produto disponível no momento.';
    }

    let texto = `CARDÁPIO COMPLETO (${cardapioJson.totalProdutos} produtos):\n\n`;

    cardapioJson.produtos.forEach((produto, index) => {
      texto += `${index + 1}. Produto: ${produto.produto}`;
      
      if (produto.descritivo) {
        texto += `, Descritivo: ${produto.descritivo}`;
      }
      
      texto += `, Setor: ${produto.setor}, Venda: ${produto.venda}`;

      if (produto.opcoesObrigatorias && produto.opcoesObrigatorias.length > 0) {
        texto += `, Opções Obrigatórias: ${JSON.stringify(produto.opcoesObrigatorias)}`;
      }

      if (produto.opcoesOpcionais && produto.opcoesOpcionais.length > 0) {
        texto += `, Opções Opcionais: ${JSON.stringify(produto.opcoesOpcionais)}`;
      }

      texto += '\n\n';
    });

    return texto;
  }

  /**
   * Salva o JSON do cardápio em um arquivo para download
   */
  static async saveJsonToFile(companyId: string): Promise<string | null> {
    try {
      const cardapioJson = await this.generateCardapioJson(companyId);
      if (!cardapioJson) return null;

      const jsonString = JSON.stringify(cardapioJson, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      console.error('❌ Erro ao salvar JSON:', error);
      return null;
    }
  }
}