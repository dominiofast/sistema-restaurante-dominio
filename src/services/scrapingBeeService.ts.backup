// SUPABASE REMOVIDO
const SETTING_KEY = 'scrapingbee_api_key';

export const getScrapingBeeApiKey = async (): Promise<string | null> => {
  try {
    const { data, error } = /* await supabase REMOVIDO */ null
      /* .from REMOVIDO */ ; //'app_settings')
      /* .select\( REMOVIDO */ ; //'value')
      /* .eq\( REMOVIDO */ ; //'key', SETTING_KEY)
      /* .single\( REMOVIDO */ ; //);

    if (error) {
      // Se der erro 406 (Not Acceptable), significa que a segurança de RLS bloqueou.
      // Neste caso, vamos desabilitar a segurança para esta tabela específica.
      if (error.code === 'PGRST116') {
        console.warn('RLS está bloqueando o acesso a app_settings. Considere ajustar as políticas.');
      }
      throw error;
    }

    return data?.value || null;
  } catch (err) {
    console.error('Erro ao buscar a chave da API do ScrapingBee:', err);
    return null;
  }
}; 