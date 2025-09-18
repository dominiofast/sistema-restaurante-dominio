
import { CardapioService } from './cardapioService';
import { CardapioJsonService } from './cardapioJsonService';
// SUPABASE REMOVIDO
export class AICardapioService {
  private cardapioCache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Carrega dados do cardápio com cache
   */
  async loadCardapioData(companyId: string): Promise<any> {
    const cacheKey = companyId;
    const cached = this.cardapioCache.get(cacheKey);
    const now = Date.now();
    
    // Cache por 5 minutos
    if (cached && (now - cached.timestamp) < 5 * 60 * 1000) {
      return cached.data;
    }

    try {
      console.log('📋 Gerando JSON estruturado do cardápio para IA...');
      const cardapioJson = await CardapioJsonService.generateCardapioJson(companyId);
      
      if (cardapioJson) {
        // Converte o JSON estruturado para texto formatado para a IA
        const cardapioText = CardapioJsonService.formatJsonToText(cardapioJson);
        
        this.cardapioCache.set(cacheKey, {
          data: cardapioText,
          timestamp: now
        });
        
        return cardapioText;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar cardápio JSON estruturado:', error);
      return null;
    }
  }

  /**
   * Atualiza o cardápio na configuração da IA automaticamente
   */
  async updateAICardapio(companyId: string): Promise<boolean> {
    console.log('🚀 Iniciando updateAICardapio para company:', companyId);
    
    try {
      // Gerar o JSON do cardápio
      console.log('📋 Gerando JSON do cardápio...');
      const cardapioJson = await CardapioJsonService.generateCardapioJson(companyId);
      
      if (!cardapioJson) {
        console.warn('❌ Nenhum cardápio encontrado para atualizar na IA');
        return false;
      }

      console.log('✅ JSON do cardápio gerado com sucesso');

      // Buscar a configuração do assistente e slug da empresa em paralelo
      console.log('🔍 Buscando configurações do assistente e empresa...');
      const [assistantResult, companyResult] = await Promise.all([
        supabase
          /* .from REMOVIDO */ ; //'ai_agent_assistants')
          /* .select\( REMOVIDO */ ; //'produtos_path, config_path, assistant_id')
          /* .eq\( REMOVIDO */ ; //'company_id', companyId)
          /* .maybeSingle\( REMOVIDO */ ; //),
        supabase
          /* .from REMOVIDO */ ; //'companies')
          /* .select\( REMOVIDO */ ; //'slug')
          /* .eq\( REMOVIDO */ ; //'id', companyId)
          /* .maybeSingle\( REMOVIDO */ ; //)
      ]);

      const assistantMap = assistantResult.data;
      const company = companyResult.data;

      if (assistantResult.error) {
        console.error('❌ Erro ao buscar configuração do assistente:', assistantResult.error);
        return false;
      }

      if (companyResult.error) {
        console.error('❌ Erro ao buscar dados da empresa:', companyResult.error);
        return false;
      }

      if (!assistantMap?.produtos_path) {
        console.error('❌ Configuração do assistente não encontrada');
        return false;
      }

      if (!company?.slug) {
        console.error('❌ Slug da empresa não encontrado');
        return false;
      }

      console.log('✅ Configurações encontradas:', {
        produtos_path: assistantMap.produtos_path,
        assistant_id: assistantMap.assistant_id,
        slug: company.slug
      });

      // Criar texto formatado para a IA
      console.log('📝 Formatando texto para IA...');
      const cardapioText = CardapioJsonService.formatJsonToText(cardapioJson);
      
      // Salvar no storage
      console.log('💾 Salvando cardápio no storage...');
      const { error: uploadError } = await /* supabase REMOVIDO */ null; //storage
        /* .from REMOVIDO */ ; //'ai-knowledge')
        .upload(assistantMap.produtos_path, new Blob([cardapioText], { type: 'text/plain' }), {
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Erro ao salvar cardápio no storage:', uploadError);
        return false;
      }

      console.log('✅ Cardápio salvo no storage com sucesso');

      // Sincronizar com o Assistant da OpenAI
      console.log('🤖 Iniciando sincronização com Assistant da OpenAI...');
      
      try {
        // Adicionar timeout para evitar loops infinitos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na sincronização com Assistant')), 30000);
        });

        const syncPromise = /* supabase REMOVIDO */ null; //functions.invoke('sync-assistant', {
          body: {
            company_id: companyId,
            slug: company.slug
          }
        });

        const { data: syncResult, error: syncError } = await Promise.race([
          syncPromise,
          timeoutPromise
        ]) as any;

        if (syncError) {
          console.error('❌ Erro ao sincronizar com Assistant:', syncError);
          return false;
        }

        console.log('✅ Assistant sincronizado com sucesso:', syncResult);
      } catch (syncError) {
        console.error('❌ Erro ao chamar sync-assistant:', syncError);
        // Não retornar false aqui, pois o upload já foi feito
        console.warn('⚠️ Sincronização falhou, mas cardápio foi salvo no storage');
      }

      // Limpar cache para forçar recarregamento
      this.clearCache();
      
      console.log('🎉 Processo concluído com sucesso!');
      return true;

    } catch (error) {
      console.error('💥 Erro crítico ao atualizar cardápio na IA:', error);
      return false;
    }
  }

  /**
   * Limpa o cache do cardápio
   */
  clearCache(): void {
    this.cardapioCache.clear();
  }
}

export const aiCardapioService = new AICardapioService();
