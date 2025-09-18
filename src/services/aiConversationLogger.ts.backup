
// SUPABASE REMOVIDO
export class AIConversationLogger {
  /**
   * Salva log da conversa
   */
  static async saveConversationLog(
    companyId: string,
    customerPhone: string | undefined,
    customerName: string | undefined,
    userMessage: string,
    aiResponse: string,
    tokensUsed: number,
    responseTime: number
  ): Promise<void> {
    try {
      // Salva mensagem do usuário
      /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'ai_conversation_logs')
        /* .insert\( REMOVIDO */ ; //{
          company_id: companyId,
          customer_phone: customerPhone,
          customer_name: customerName,
          message_type: 'user',
          message_content: userMessage,
          tokens_used: 0,
          response_time_ms: 0
        });

      // Salva resposta da IA
      /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'ai_conversation_logs')
        /* .insert\( REMOVIDO */ ; //{
          company_id: companyId,
          customer_phone: customerPhone,
          customer_name: customerName,
          message_type: 'assistant',
          message_content: aiResponse,
          tokens_used: tokensUsed,
          response_time_ms: responseTime
        });
    } catch (error) {
      console.error('Erro ao salvar log da conversa:', error);
    }
  }
}
