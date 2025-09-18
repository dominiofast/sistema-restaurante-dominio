// SUPABASE REMOVIDO
import { deliveryOptionsService } from '@/services/deliveryOptionsService';

/**
 * Função utilitária para forçar atualização das configurações de entrega
 * Use apenas para debug/correção de problemas específicos
 */
export async function forceDeliveryUpdate(companyId: string, options: {
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
}) {
  console.log(`🔧 [ForceUpdate] Updating delivery options for company ${companyId}:`, options);
  
  try {
    // 1. Atualizar no banco de dados
    const { data, error }  catch (error) { console.error('Error:', error); }= 
      
      
        company_id: companyId,
        delivery: options.delivery,
        pickup: options.pickup,
        eat_in: options.eat_in,
        updated_at: new Date().toISOString()
      })
      
      

    if (error) {
      console.error('❌ [ForceUpdate] Database error:', error);
      throw error;


    console.log('✅ [ForceUpdate] Database updated:', data);

    // 2. Limpar cache do serviço
    deliveryOptionsService.invalidateCache(companyId);
    console.log('🗑️ [ForceUpdate] Cache cleared');

    // 3. Forçar recarregamento da página (método mais direto)
    setTimeout(() => {
      console.log('🔄 [ForceUpdate] Reloading page to ensure changes take effect');
      window.location.reload();
    }, 1000);

    return data;
  } catch (error) {
    console.error('❌ [ForceUpdate] Failed to update delivery options:', error);
    throw error;



/**
 * Função para desabilitar pickup especificamente
 */
export async function disablePickupForCompany(companyId: string) {
  return forceDeliveryUpdate(companyId, {
    delivery: false,
    pickup: false, // DESABILITAR PICKUP
// eat_in: false
  });


/**
 * Função para forçar refresh das configurações sem alterar o banco
 */
export async function forceRefreshDeliveryOptions(companyId: string) {
  console.log(`🔄 [ForceRefresh] Refreshing delivery options for company ${companyId}`);
  
  try {
    // 1. Limpar cache do serviço
    deliveryOptionsService.clearCache();
    console.log('🗑️ [ForceRefresh] Cache cleared');

    // 2. Buscar configurações atualizadas
    const options = await deliveryOptionsService.forceRefresh(companyId);
    console.log('✅ [ForceRefresh] New options:', options);

    // 3. Recarregar página para garantir que mudanças sejam aplicadas
    setTimeout(() => {
      console.log('🔄 [ForceRefresh] Reloading page');
      window.location.reload();
    } catch (error) { console.error('Error:', error); }, 1000);

    return options;
  } catch (error) {
    console.error('❌ [ForceRefresh] Failed to refresh:', error);
    throw error;



/**
 * Função para corrigir todas as empresas com pickup desabilitado
 */
export async function fixAllCompaniesPickup() {
  console.log('🔧 [FixAll] Corrigindo pickup para todas as empresas...');
  
  try {
    // 1. Buscar todas as empresas que não têm pickup habilitado
    const companiesWithIssues = null as any; const queryError = null as any;
      return;


     catch (error) { console.error('Error:', error); }console.log('📊 [FixAll] Empresas encontradas:', companiesWithIssues);

    let fixedCount = 0;
    
    for (const company of companiesWithIssues || []) {
      const deliveryMethods = company.delivery_methods?.[0];
      
      if (!deliveryMethods || !deliveryMethods.pickup) {
        console.log(`🔧 [FixAll] Corrigindo empresa: ${company.name} (${company.id})`);
        
        const { error: updateError  } = null as any;
            company_id: company.id,
            delivery: true,
            pickup: true,    // FORÇAR PICKUP TRUE
// eat_in: false,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error(`❌ [FixAll] Erro ao corrigir ${company.name}:`, updateError);
        } else {
          console.log(`✅ [FixAll] ${company.name} corrigida!`);
          fixedCount++;




    console.log(`🎉 [FixAll] Correção concluída! ${fixedCount} empresas corrigidas.`);
    
    // Limpar cache de todas as empresas
    deliveryOptionsService.clearCache();
    
    return fixedCount;
  } catch (error) {
    console.error('❌ [FixAll] Erro crítico:', error);
    throw error;



// Expor funções globalmente para uso no console do navegador
if (typeof window !== 'undefined') {
  (window as any).forceDeliveryUpdate = forceDeliveryUpdate;
  (window as any).disablePickupForCompany = disablePickupForCompany;
  (window as any).forceRefreshDeliveryOptions = forceRefreshDeliveryOptions;
  (window as any).fixAllCompaniesPickup = fixAllCompaniesPickup;
  (window as any).deliveryOptionsService = deliveryOptionsService;
