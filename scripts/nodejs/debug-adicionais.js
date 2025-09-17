// Script de debug para verificar configuração dos adicionais
// Execute no console do navegador na página do cardápio público

console.log('🔍 INICIANDO DEBUG DOS ADICIONAIS');

// Função para verificar dados do banco
async function debugAdicionais() {
  try {
    // Importar supabase (assumindo que está disponível globalmente)
    const { createClient } = window.supabase || {};
    
    if (!createClient) {
      console.error('❌ Supabase não disponível');
      return;
    }

    const supabase = createClient(
      'https://your-project.supabase.co', // Substitua pela URL real
      'your-anon-key' // Substitua pela chave real
    );

    console.log('1️⃣ Verificando categorias de adicionais...');
    
    const { data: categorias, error: catError } = await supabase
      .from('categorias_adicionais')
      .select('*');
    
    if (catError) {
      console.error('❌ Erro ao buscar categorias:', catError);
      return;
    }
    
    console.log('📋 Categorias encontradas:', categorias);
    
    console.log('2️⃣ Verificando associações produto-categoria...');
    
    const { data: associacoes, error: assocError } = await supabase
      .from('produto_categorias_adicionais')
      .select('*');
    
    if (assocError) {
      console.error('❌ Erro ao buscar associações:', assocError);
      return;
    }
    
    console.log('🔗 Associações encontradas:', associacoes);
    
    // Verificar especificamente grupos com max_selection > 1
    const gruposQuantidade = associacoes.filter(a => a.max_selection > 1);
    console.log('📊 Grupos com quantidade (max_selection > 1):', gruposQuantidade);
    
    if (gruposQuantidade.length === 0) {
      console.warn('⚠️ PROBLEMA ENCONTRADO: Nenhum grupo configurado com max_selection > 1');
      console.log('💡 SOLUÇÃO: Configure pelo menos um grupo com max_selection = 20 no admin');
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

// Executar debug
debugAdicionais();

console.log('🔍 DEBUG CONCLUÍDO - Verifique os logs acima');
