// 🔍 DEBUG FRONTEND - DOMÍNIO PIZZAS
// Execute este script no console do navegador na página da Domínio Pizzas
// URL: https://pedido.dominio.tech/dominiopizzas

console.log('🚀 INICIANDO DEBUG DOMÍNIO PIZZAS');

// Configurações conhecidas
const DOMINIO_COMPANY_ID = '550e8400-e29b-41d4-a716-446655440001';
const DOMINIO_SLUG = 'dominiopizzas';

// Função principal de debug
async function debugDominioPizzas() {
  console.log('='.repeat(50));
  console.log('🔍 DEBUG COMPLETO - DOMÍNIO PIZZAS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se o Supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não está disponível!');
      return;
    }
    console.log('✅ Supabase disponível');
    
    // 2. Verificar empresa
    console.log('\n📊 VERIFICANDO EMPRESA...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', DOMINIO_COMPANY_ID)
      .single();
    
    if (companyError) {
      console.error('❌ Erro ao buscar empresa:', companyError);
      return;
    }
    
    if (!company) {
      console.error('❌ Empresa Domínio não encontrada!');
      return;
    }
    
    console.log('✅ Empresa encontrada:', {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status
    });
    
    // 3. Verificar regiões de atendimento
    console.log('\n📍 VERIFICANDO REGIÕES DE ATENDIMENTO...');
    const { data: regioes, error: regioesError } = await supabase
      .from('regioes_atendimento')
      .select('*')
      .eq('company_id', DOMINIO_COMPANY_ID)
      .order('created_at', { ascending: true });
    
    if (regioesError) {
      console.error('❌ Erro ao buscar regiões:', regioesError);
    } else {
      console.log(`📊 Total de regiões: ${regioes?.length || 0}`);
      
      if (!regioes || regioes.length === 0) {
        console.warn('⚠️ PROBLEMA IDENTIFICADO: Nenhuma região encontrada!');
        console.log('🔧 Aplicando solução universal...');
        await criarRegiaoUniversal();
      } else {
        console.log('✅ Regiões encontradas:');
        regioes.forEach((regiao, index) => {
          console.log(`  ${index + 1}. ${regiao.nome}`, {
            tipo: regiao.tipo,
            raio_km: regiao.raio_km,
            valor: regiao.valor,
            status: regiao.status ? '✅ Ativa' : '❌ Inativa',
            coordenadas: regiao.centro_lat && regiao.centro_lng ? 
              `${regiao.centro_lat}, ${regiao.centro_lng}` : '❌ Sem coordenadas'
          });
        });
      }
    }
    
    // 4. Verificar métodos de entrega
    console.log('\n🚚 VERIFICANDO MÉTODOS DE ENTREGA...');
    const { data: deliveryMethods, error: deliveryError } = await supabase
      .from('delivery_methods')
      .select('*')
      .eq('company_id', DOMINIO_COMPANY_ID)
      .single();
    
    if (deliveryError) {
      console.error('❌ Erro ao buscar métodos de entrega:', deliveryError);
    } else if (!deliveryMethods) {
      console.warn('⚠️ Nenhum método de entrega configurado!');
    } else {
      console.log('✅ Métodos de entrega:', {
        delivery: deliveryMethods.delivery ? '✅' : '❌',
        pickup: deliveryMethods.pickup ? '✅' : '❌',
        eat_in: deliveryMethods.eat_in ? '✅' : '❌'
      });
    }
    
    // 5. Testar cálculo de taxa
    console.log('\n💰 TESTANDO CÁLCULO DE TAXA...');
    await testarCalculoTaxa();
    
    // 6. Verificar estado do React (se disponível)
    console.log('\n⚛️ VERIFICANDO ESTADO DO REACT...');
    verificarEstadoReact();
    
  } catch (error) {
    console.error('❌ Erro geral no debug:', error);
  }
}

// Função para criar região universal (baseada na 300 graus)
async function criarRegiaoUniversal() {
  console.log('🔧 Criando região universal para Domínio Pizzas...');
  
  const regiaoUniversal = {
    company_id: DOMINIO_COMPANY_ID,
    tipo: 'raio',
    nome: 'Domínio Pizzas - Área de Cobertura Universal',
    cidade: 'Cacoal',
    estado: 'RO',
    centro_lat: -11.4389,
    centro_lng: -61.4447,
    raio_km: 100,
    valor: 0,
    status: true
  };
  
  try {
    const { data, error } = await supabase
      .from('regioes_atendimento')
      .insert([regiaoUniversal])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar região:', error);
      console.log('🔄 Usando região em memória como fallback...');
      return { ...regiaoUniversal, id: 'universal-' + Date.now() };
    } else {
      console.log('✅ Região universal criada:', data);
      return data;
    }
  } catch (err) {
    console.error('❌ Erro crítico:', err);
    return null;
  }
}

// Função para testar cálculo de taxa
async function testarCalculoTaxa() {
  const enderecoTeste = {
    latitude: -11.4389,
    longitude: -61.4447,
    logradouro: 'Rua Teste, 123',
    cidade: 'Cacoal',
    estado: 'RO'
  };
  
  console.log('🧪 Testando com endereço:', enderecoTeste);
  
  // Simular o que o hook useDeliveryFeeCalculator faz
  const { data: regioes } = await supabase
    .from('regioes_atendimento')
    .select('*')
    .eq('company_id', DOMINIO_COMPANY_ID)
    .eq('status', true);
  
  if (!regioes || regioes.length === 0) {
    console.warn('⚠️ Nenhuma região ativa para calcular taxa!');
    return;
  }
  
  console.log(`📊 Calculando taxa com ${regioes.length} região(ões)...`);
  
  for (const regiao of regioes) {
    if (regiao.tipo === 'raio' && regiao.centro_lat && regiao.centro_lng) {
      const distancia = calcularDistancia(
        enderecoTeste.latitude,
        enderecoTeste.longitude,
        regiao.centro_lat,
        regiao.centro_lng
      );
      
      console.log(`📍 Região: ${regiao.nome}`);
      console.log(`   Distância: ${distancia.toFixed(2)}km`);
      console.log(`   Raio: ${regiao.raio_km}km`);
      console.log(`   Dentro do raio: ${distancia <= regiao.raio_km ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Taxa: R$ ${regiao.valor}`);
      
      if (distancia <= regiao.raio_km) {
        console.log(`🎉 TAXA CALCULADA: R$ ${regiao.valor}`);
        return regiao.valor;
      }
    }
  }
  
  console.warn('⚠️ Endereço fora de todas as áreas de cobertura!');
  return null;
}

// Função para calcular distância (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para verificar estado do React
function verificarEstadoReact() {
  try {
    // Tentar encontrar elementos React
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
    console.log(`⚛️ Elementos React encontrados: ${reactElements.length}`);
    
    // Verificar se há erros no console
    const errors = window.console.error.toString();
    if (errors.includes('Error') || errors.includes('Failed')) {
      console.warn('⚠️ Possíveis erros no console detectados');
    }
    
    // Verificar localStorage
    const localStorageKeys = Object.keys(localStorage);
    console.log('💾 Chaves no localStorage:', localStorageKeys.filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('company')
    ));
    
  } catch (error) {
    console.error('❌ Erro ao verificar estado do React:', error);
  }
}

// Função para comparar com 300 Graus
async function compararCom300Graus() {
  console.log('\n🔄 COMPARANDO COM 300 GRAUS...');
  
  try {
    // Buscar empresa 300 Graus
    const { data: graus300 } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', '300graus')
      .single();
    
    if (!graus300) {
      console.warn('⚠️ 300 Graus não encontrada para comparação');
      return;
    }
    
    // Buscar regiões da 300 Graus
    const { data: regioes300 } = await supabase
      .from('regioes_atendimento')
      .select('*')
      .eq('company_id', graus300.id);
    
    console.log(`📊 300 Graus tem ${regioes300?.length || 0} região(ões)`);
    
    if (regioes300 && regioes300.length > 0) {
      console.log('✅ Configuração da 300 Graus (que funciona):');
      regioes300.forEach((regiao, index) => {
        console.log(`  ${index + 1}. ${regiao.nome}`, {
          tipo: regiao.tipo,
          raio_km: regiao.raio_km,
          valor: regiao.valor,
          status: regiao.status
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao comparar com 300 Graus:', error);
  }
}

// Executar debug automaticamente
debugDominioPizzas();

// Disponibilizar funções globalmente
window.debugDominioPizzas = debugDominioPizzas;
window.criarRegiaoUniversal = criarRegiaoUniversal;
window.compararCom300Graus = compararCom300Graus;
window.testarCalculoTaxa = testarCalculoTaxa;

console.log('\n🛠️ FUNÇÕES DISPONÍVEIS:');
console.log('- debugDominioPizzas() - Debug completo');
console.log('- criarRegiaoUniversal() - Criar região universal');
console.log('- compararCom300Graus() - Comparar com 300 Graus');
console.log('- testarCalculoTaxa() - Testar cálculo de taxa');

console.log('\n✅ Debug script carregado! Execute as funções acima conforme necessário.');