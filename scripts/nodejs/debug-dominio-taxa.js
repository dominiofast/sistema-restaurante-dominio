// 🔍 DIAGNÓSTICO ESPECÍFICO - PROBLEMA DE TAXA DOMÍNIO PIZZAS
// Execute este script no console do navegador na página da Domínio Pizzas

console.log('🔍 INICIANDO DIAGNÓSTICO ESPECÍFICO - DOMÍNIO PIZZAS');

const DOMINIO_COMPANY_ID = '550e8400-e29b-41d4-a716-446655440001';

// Função principal de diagnóstico
async function diagnosticarProblemaTaxa() {
  console.log('='.repeat(60));
  console.log('🔍 DIAGNÓSTICO ESPECÍFICO - PROBLEMA DE TAXA');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar se o Supabase está disponível
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase não disponível! Certifique-se de estar na página correta.');
      return false;
    }
    console.log('✅ Supabase disponível');
    
    // 2. Buscar todas as regiões da Domínio Pizzas
    console.log('\n📊 Buscando regiões da Domínio Pizzas...');
    const { data: regioes, error: regioesError } = await supabase
      .from('regioes_atendimento')
      .select('*')
      .eq('company_id', DOMINIO_COMPANY_ID);
    
    if (regioesError) {
      console.error('❌ Erro ao buscar regiões:', regioesError);
      return false;
    }
    
    console.log(`📊 Total de regiões encontradas: ${regioes?.length || 0}`);
    
    if (!regioes || regioes.length === 0) {
      console.error('❌ PROBLEMA IDENTIFICADO: Nenhuma região encontrada!');
      return false;
    }
    
    // 3. Analisar cada região em detalhes
    console.log('\n🔍 ANÁLISE DETALHADA DAS REGIÕES:');
    const regioesAtivas = [];
    const regioesInativas = [];
    const regioesSemCoordenadas = [];
    
    regioes.forEach((regiao, index) => {
      console.log(`\n📍 Região ${index + 1}:`);
      console.log(`   ID: ${regiao.id}`);
      console.log(`   Nome: ${regiao.nome || 'SEM NOME'}`);
      console.log(`   Tipo: ${regiao.tipo}`);
      console.log(`   Status: ${regiao.status ? '✅ ATIVA' : '❌ INATIVA'}`);
      console.log(`   Raio: ${regiao.raio_km}km`);
      console.log(`   Taxa: R$ ${regiao.valor}`);
      console.log(`   Centro: ${regiao.centro_lat}, ${regiao.centro_lng}`);
      console.log(`   Cidade: ${regiao.cidade || 'N/A'}`);
      console.log(`   Bairro: ${regiao.bairro || 'N/A'}`);
      
      // Classificar regiões
      if (!regiao.status) {
        regioesInativas.push(regiao);
      } else if (!regiao.centro_lat || !regiao.centro_lng) {
        regioesSemCoordenadas.push(regiao);
      } else {
        regioesAtivas.push(regiao);
      }
    });
    
    console.log(`\n📊 RESUMO DAS REGIÕES:`);
    console.log(`   ✅ Regiões ativas e válidas: ${regioesAtivas.length}`);
    console.log(`   ❌ Regiões inativas: ${regioesInativas.length}`);
    console.log(`   ⚠️ Regiões sem coordenadas: ${regioesSemCoordenadas.length}`);
    
    if (regioesAtivas.length === 0) {
      console.error('❌ PROBLEMA IDENTIFICADO: Nenhuma região ativa com coordenadas válidas!');
      
      if (regioesInativas.length > 0) {
        console.log('💡 SOLUÇÃO: Ativar as regiões inativas');
        console.log('Execute: ativarRegioes()');
      }
      
      if (regioesSemCoordenadas.length > 0) {
        console.log('💡 SOLUÇÃO: Adicionar coordenadas às regiões');
        console.log('Execute: adicionarCoordenadas()');
      }
      
      return false;
    }
    
    // 4. Testar cálculo com endereço real
    console.log('\n🧪 TESTANDO CÁLCULO COM ENDEREÇO REAL...');
    
    // Endereço de teste em Cacoal (centro da cidade)
    const enderecoTeste = {
      latitude: -11.4389,
      longitude: -61.4447,
      logradouro: 'Rua Teste, 123',
      bairro: 'Centro',
      cidade: 'Cacoal',
      estado: 'RO'
    };
    
    console.log('📍 Endereço de teste:', enderecoTeste);
    
    // Simular o cálculo exato do hook
    let taxaCalculada = null;
    let regiaoEncontrada = null;
    
    for (const regiao of regioesAtivas) {
      if (regiao.tipo === 'raio' && regiao.centro_lat && regiao.centro_lng && regiao.raio_km) {
        const distancia = calcularDistancia(
          enderecoTeste.latitude,
          enderecoTeste.longitude,
          regiao.centro_lat,
          regiao.centro_lng
        );
        
        console.log(`\n🔍 Testando região: ${regiao.nome}`);
        console.log(`   Centro da região: ${regiao.centro_lat}, ${regiao.centro_lng}`);
        console.log(`   Distância calculada: ${distancia.toFixed(2)}km`);
        console.log(`   Raio da região: ${regiao.raio_km}km`);
        console.log(`   Dentro do raio: ${distancia <= regiao.raio_km ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`   Taxa: R$ ${regiao.valor}`);
        
        if (distancia <= regiao.raio_km) {
          if (taxaCalculada === null || regiao.raio_km < regiaoEncontrada.raio_km) {
            taxaCalculada = regiao.valor;
            regiaoEncontrada = regiao;
            console.log(`   🎯 REGIÃO VÁLIDA! Taxa: R$ ${regiao.valor}`);
          }
        }
      }
    }
    
    if (taxaCalculada !== null) {
      console.log(`\n🎉 SUCESSO! Taxa calculada: R$ ${taxaCalculada}`);
      console.log(`📍 Região utilizada: ${regiaoEncontrada.nome}`);
      console.log(`✅ O cálculo está funcionando corretamente!`);
    } else {
      console.error('\n❌ PROBLEMA IDENTIFICADO: Endereço fora de todas as regiões!');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('   1. Coordenadas das regiões estão incorretas');
      console.log('   2. Raios das regiões são muito pequenos');
      console.log('   3. Centro das regiões está em local errado');
      
      // Sugerir correções
      console.log('\n🔧 SUGESTÕES DE CORREÇÃO:');
      regioesAtivas.forEach((regiao, index) => {
        const distancia = calcularDistancia(
          enderecoTeste.latitude,
          enderecoTeste.longitude,
          regiao.centro_lat,
          regiao.centro_lng
        );
        
        const raioNecessario = Math.ceil(distancia) + 1;
        console.log(`   ${index + 1}. Região "${regiao.nome}": aumentar raio de ${regiao.raio_km}km para ${raioNecessario}km`);
      });
    }
    
    // 5. Verificar se há problemas com o frontend
    console.log('\n🖥️ VERIFICANDO PROBLEMAS NO FRONTEND...');
    
    // Verificar se os hooks estão carregados
    if (typeof window.React !== 'undefined') {
      console.log('✅ React disponível');
    } else {
      console.warn('⚠️ React não detectado');
    }
    
    // Verificar se há erros no console
    const originalError = console.error;
    let errorsDetected = [];
    console.error = function(...args) {
      errorsDetected.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    setTimeout(() => {
      console.error = originalError;
      if (errorsDetected.length > 0) {
        console.warn('⚠️ Erros detectados no console:', errorsDetected);
      } else {
        console.log('✅ Nenhum erro detectado no console');
      }
    }, 1000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    return false;
  }
}

// Função para ativar todas as regiões
async function ativarRegioes() {
  console.log('🔧 Ativando todas as regiões da Domínio Pizzas...');
  
  try {
    const { data, error } = await supabase
      .from('regioes_atendimento')
      .update({ status: true })
      .eq('company_id', DOMINIO_COMPANY_ID)
      .eq('status', false);
    
    if (error) {
      console.error('❌ Erro ao ativar regiões:', error);
    } else {
      console.log('✅ Regiões ativadas com sucesso!');
      console.log('🔄 Recarregue a página para ver as mudanças');
    }
  } catch (error) {
    console.error('❌ Erro ao ativar regiões:', error);
  }
}

// Função para adicionar coordenadas padrão (Cacoal/RO)
async function adicionarCoordenadas() {
  console.log('🔧 Adicionando coordenadas padrão às regiões...');
  
  const coordenadasCacoal = {
    centro_lat: -11.4389,
    centro_lng: -61.4447,
    cidade: 'Cacoal',
    estado: 'RO'
  };
  
  try {
    const { data, error } = await supabase
      .from('regioes_atendimento')
      .update(coordenadasCacoal)
      .eq('company_id', DOMINIO_COMPANY_ID)
      .or('centro_lat.is.null,centro_lng.is.null');
    
    if (error) {
      console.error('❌ Erro ao adicionar coordenadas:', error);
    } else {
      console.log('✅ Coordenadas adicionadas com sucesso!');
      console.log('🔄 Recarregue a página para ver as mudanças');
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar coordenadas:', error);
  }
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

// Função para testar com endereço específico
async function testarComEndereco(latitude, longitude, descricao = 'Endereço personalizado') {
  console.log(`\n🧪 TESTANDO COM ${descricao.toUpperCase()}`);
  console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);
  
  const { data: regioes } = await supabase
    .from('regioes_atendimento')
    .select('*')
    .eq('company_id', DOMINIO_COMPANY_ID)
    .eq('status', true);
  
  if (!regioes || regioes.length === 0) {
    console.warn('⚠️ Nenhuma região ativa encontrada');
    return;
  }
  
  let melhorRegiao = null;
  let menorDistancia = Infinity;
  
  for (const regiao of regioes) {
    if (regiao.tipo === 'raio' && regiao.centro_lat && regiao.centro_lng) {
      const distancia = calcularDistancia(
        latitude,
        longitude,
        regiao.centro_lat,
        regiao.centro_lng
      );
      
      console.log(`📍 ${regiao.nome}: ${distancia.toFixed(2)}km (raio: ${regiao.raio_km}km) - ${distancia <= regiao.raio_km ? '✅ DENTRO' : '❌ FORA'} - R$ ${regiao.valor}`);
      
      if (distancia <= regiao.raio_km && distancia < menorDistancia) {
        melhorRegiao = regiao;
        menorDistancia = distancia;
      }
    }
  }
  
  if (melhorRegiao) {
    console.log(`🎉 TAXA CALCULADA: R$ ${melhorRegiao.valor} (região: ${melhorRegiao.nome})`);
    return melhorRegiao.valor;
  } else {
    console.warn('⚠️ Endereço fora de todas as áreas de cobertura');
    return 0;
  }
}

// Disponibilizar funções globalmente
window.diagnosticarProblemaTaxa = diagnosticarProblemaTaxa;
window.ativarRegioes = ativarRegioes;
window.adicionarCoordenadas = adicionarCoordenadas;
window.testarComEndereco = testarComEndereco;

// Executar diagnóstico automaticamente
diagnosticarProblemaTaxa();

console.log('\n🛠️ FUNÇÕES DISPONÍVEIS:');
console.log('- diagnosticarProblemaTaxa() - Diagnóstico completo');
console.log('- ativarRegioes() - Ativar todas as regiões');
console.log('- adicionarCoordenadas() - Adicionar coordenadas padrão');
console.log('- testarComEndereco(lat, lng, descricao) - Testar endereço específico');

console.log('\n🔍 Executando diagnóstico automático...');
console.log('✅ Script de diagnóstico carregado com sucesso!');