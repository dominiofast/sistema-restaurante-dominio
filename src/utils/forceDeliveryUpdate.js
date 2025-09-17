// Função para forçar atualização das configurações de entrega
window.forceDeliveryUpdate = async (companyId) => {
  try {
    console.log(`🔄 Forçando atualização para company: ${companyId}`);
    
    const { deliveryOptionsService } = await import('../services/deliveryOptionsService');
    
    // Limpar cache
    deliveryOptionsService.invalidateCache(companyId);
    deliveryOptionsService.clearCache();
    
    console.log('✅ Cache limpo com sucesso');
    
    // Buscar novamente
    const newOptions = await deliveryOptionsService.getDeliveryOptions(companyId);
    console.log('✅ Novas opções carregadas:', newOptions);
    
    // Recarregar a página para aplicar as mudanças
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Erro ao forçar atualização:', error);
  }
};

// Função específica para limpar cache da Domínio Pizzas
window.clearDominioCache = async () => {
  try {
    console.log(`🗑️ Limpando cache específico da Domínio Pizzas`);
    
    const { deliveryOptionsService } = await import('../services/deliveryOptionsService');
    
    // Limpar cache específico
    deliveryOptionsService.clearDominioCache();
    deliveryOptionsService.invalidateCache('550e8400-e29b-41d4-a716-446655440001');
    
    console.log('✅ Cache da Domínio Pizzas limpo');
    
    // Buscar novamente
    const newOptions = await deliveryOptionsService.getDeliveryOptions('550e8400-e29b-41d4-a716-446655440001');
    console.log('✅ Novas opções Domínio Pizzas carregadas:', newOptions);
    
    // Recarregar a página
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache Domínio:', error);
  }
};

console.log('🔧 Funções de debug carregadas: forceDeliveryUpdate(companyId) e clearDominioCache()');