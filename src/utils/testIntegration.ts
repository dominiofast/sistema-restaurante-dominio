import { supabase } from '@/integrations/supabase/client';

export const testWhatsAppIntegration = async () => {
  try {
    console.log('🧪 Iniciando teste completo da integração...');
    
    const { data, error } = await supabase.functions.invoke('test-whatsapp-status', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Erro na função de teste:', error);
      return { success: false, error: error.message };
    }
    
    console.log('📊 Resultado do teste:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro ao executar teste:', error);
    return { success: false, error: (error as Error).message };
  }
};