export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adicionais: {
        Row: {
          categoria_adicional_id: string
          codigo_integracao: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_active: boolean
          is_available: boolean | null
          name: string
          order_position: number | null
          price: number
          updated_at: string | null

        Insert: {
          categoria_adicional_id: string
          codigo_integracao?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_available?: boolean | null
          name: string
          order_position?: number | null
          price?: number
          updated_at?: string | null

        Update: {
          categoria_adicional_id?: string
          codigo_integracao?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          is_available?: boolean | null
          name?: string
          order_position?: number | null
          price?: number
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "adicionais_categoria_adicional_id_fkey"
            columns: ["categoria_adicional_id"]
            isOneToOne: false
            referencedRelation: "categorias_adicionais"
            referencedColumns: ["id"]
          },
        ]

      agente_ia_config: {
        Row: {
          agressividade_venda: number
          ativo: boolean
          auto_sugestoes: boolean
          coleta_dados: boolean
          company_id: string
          conhecimento_estoque: boolean
          conhecimento_produtos: boolean
          conhecimento_promocoes: boolean
          created_at: string
          frases_venda: string | null
          habilitar_lancamento_pedidos: boolean | null
          horario_funcionamento: string
          id: string
          idioma: string
          integracao_whatsapp: boolean
          lembranca_pedidos: boolean
          limite_mensagens: number
          mensagem_ausencia: string | null
          mensagem_boas_vindas: string | null
          mensagem_despedida: string | null
          nivel_detalhamento: number
          nome: string
          notificacao_gerente: boolean
          personalidade: string
          token_pedidos: string | null
          updated_at: string
          url_cardapio: string | null
          url_pedidos: string | null
          velocidade_resposta: number

        Insert: {
          agressividade_venda?: number
          ativo?: boolean
          auto_sugestoes?: boolean
          coleta_dados?: boolean
          company_id: string
          conhecimento_estoque?: boolean
          conhecimento_produtos?: boolean
          conhecimento_promocoes?: boolean
          created_at?: string
          frases_venda?: string | null
          habilitar_lancamento_pedidos?: boolean | null
          horario_funcionamento?: string
          id?: string
          idioma?: string
          integracao_whatsapp?: boolean
          lembranca_pedidos?: boolean
          limite_mensagens?: number
          mensagem_ausencia?: string | null
          mensagem_boas_vindas?: string | null
          mensagem_despedida?: string | null
          nivel_detalhamento?: number
          nome?: string
          notificacao_gerente?: boolean
          personalidade?: string
          token_pedidos?: string | null
          updated_at?: string
          url_cardapio?: string | null
          url_pedidos?: string | null
          velocidade_resposta?: number

        Update: {
          agressividade_venda?: number
          ativo?: boolean
          auto_sugestoes?: boolean
          coleta_dados?: boolean
          company_id?: string
          conhecimento_estoque?: boolean
          conhecimento_produtos?: boolean
          conhecimento_promocoes?: boolean
          created_at?: string
          frases_venda?: string | null
          habilitar_lancamento_pedidos?: boolean | null
          horario_funcionamento?: string
          id?: string
          idioma?: string
          integracao_whatsapp?: boolean
          lembranca_pedidos?: boolean
          limite_mensagens?: number
          mensagem_ausencia?: string | null
          mensagem_boas_vindas?: string | null
          mensagem_despedida?: string | null
          nivel_detalhamento?: number
          nome?: string
          notificacao_gerente?: boolean
          personalidade?: string
          token_pedidos?: string | null
          updated_at?: string
          url_cardapio?: string | null
          url_pedidos?: string | null
          velocidade_resposta?: number

        Relationships: [
          {
            foreignKeyName: "agente_ia_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agente_ia_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_agent_assistants: {
        Row: {
          assistant_id: string | null
          bot_name: string
          cardapio_url: string | null
          company_id: string
          config_path: string
          created_at: string
          id: string
          is_active: boolean
          produtos_path: string
          updated_at: string
          use_direct_mode: boolean | null

        Insert: {
          assistant_id?: string | null
          bot_name?: string
          cardapio_url?: string | null
          company_id: string
          config_path: string
          created_at?: string
          id?: string
          is_active?: boolean
          produtos_path: string
          updated_at?: string
          use_direct_mode?: boolean | null

        Update: {
          assistant_id?: string | null
          bot_name?: string
          cardapio_url?: string | null
          company_id?: string
          config_path?: string
          created_at?: string
          id?: string
          is_active?: boolean
          produtos_path?: string
          updated_at?: string
          use_direct_mode?: boolean | null

        Relationships: []

      ai_agent_config: {
        Row: {
          agent_name: string | null
          auto_suggestions: boolean | null
          away_message: string | null
          company_id: string
          created_at: string | null
          data_collection: boolean | null
          detail_level: number | null
          goodbye_message: string | null
          id: string
          is_active: boolean | null
          language: string | null
          manager_notifications: boolean | null
          message_limit: number | null
          order_reminders: boolean | null
          personality: string | null
          product_knowledge: boolean | null
          promotion_knowledge: boolean | null
          response_speed: number | null
          sales_aggressiveness: number | null
          sales_phrases: string | null
          stock_knowledge: boolean | null
          updated_at: string | null
          welcome_message: string | null
          whatsapp_integration: boolean | null
          working_hours: string | null

        Insert: {
          agent_name?: string | null
          auto_suggestions?: boolean | null
          away_message?: string | null
          company_id: string
          created_at?: string | null
          data_collection?: boolean | null
          detail_level?: number | null
          goodbye_message?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          manager_notifications?: boolean | null
          message_limit?: number | null
          order_reminders?: boolean | null
          personality?: string | null
          product_knowledge?: boolean | null
          promotion_knowledge?: boolean | null
          response_speed?: number | null
          sales_aggressiveness?: number | null
          sales_phrases?: string | null
          stock_knowledge?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp_integration?: boolean | null
          working_hours?: string | null

        Update: {
          agent_name?: string | null
          auto_suggestions?: boolean | null
          away_message?: string | null
          company_id?: string
          created_at?: string | null
          data_collection?: boolean | null
          detail_level?: number | null
          goodbye_message?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          manager_notifications?: boolean | null
          message_limit?: number | null
          order_reminders?: boolean | null
          personality?: string | null
          product_knowledge?: boolean | null
          promotion_knowledge?: boolean | null
          response_speed?: number | null
          sales_aggressiveness?: number | null
          sales_phrases?: string | null
          stock_knowledge?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp_integration?: boolean | null
          working_hours?: string | null

        Relationships: [
          {
            foreignKeyName: "ai_agent_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_agent_prompts: {
        Row: {
          agent_slug: string
          id: string
          owner_id: string | null
          template: string
          updated_at: string | null
          vars: Json | null
          version: number | null

        Insert: {
          agent_slug: string
          id?: string
          owner_id?: string | null
          template: string
          updated_at?: string | null
          vars?: Json | null
          version?: number | null

        Update: {
          agent_slug?: string
          id?: string
          owner_id?: string | null
          template?: string
          updated_at?: string | null
          vars?: Json | null
          version?: number | null

        Relationships: []

      ai_agents_config: {
        Row: {
          cardapio_url: string | null
          company_id: string
          company_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          knowledge_base: string | null
          updated_at: string

        Insert: {
          cardapio_url?: string | null
          company_id: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          updated_at?: string

        Update: {
          cardapio_url?: string | null
          company_id?: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_agents_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_assistant_mappings: {
        Row: {
          agent_slug: string
          assistant_id: string
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          updated_at: string

        Insert: {
          agent_slug: string
          assistant_id: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string

        Update: {
          agent_slug?: string
          assistant_id?: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string

        Relationships: []

      ai_backup_configs: {
        Row: {
          auto_backup_enabled: boolean | null
          company_id: string | null
          created_at: string
          frequency: string | null
          id: string
          last_backup_at: string | null
          retention_days: number | null
          updated_at: string

        Insert: {
          auto_backup_enabled?: boolean | null
          company_id?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          last_backup_at?: string | null
          retention_days?: number | null
          updated_at?: string

        Update: {
          auto_backup_enabled?: boolean | null
          company_id?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          last_backup_at?: string | null
          retention_days?: number | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_backup_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_backup_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_cache_configs: {
        Row: {
          cache_enabled: boolean | null
          cache_similar_prompts: boolean | null
          company_id: string | null
          created_at: string
          id: string
          max_size_mb: number | null
          ttl_minutes: number | null
          updated_at: string

        Insert: {
          cache_enabled?: boolean | null
          cache_similar_prompts?: boolean | null
          company_id?: string | null
          created_at?: string
          id?: string
          max_size_mb?: number | null
          ttl_minutes?: number | null
          updated_at?: string

        Update: {
          cache_enabled?: boolean | null
          cache_similar_prompts?: boolean | null
          company_id?: string | null
          created_at?: string
          id?: string
          max_size_mb?: number | null
          ttl_minutes?: number | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_cache_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cache_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_conversation_logs: {
        Row: {
          company_id: string
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          message_content: string
          message_type: string
          response_time_ms: number | null
          tokens_used: number | null

        Insert: {
          company_id: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          message_content: string
          message_type: string
          response_time_ms?: number | null
          tokens_used?: number | null

        Update: {
          company_id?: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          message_content?: string
          message_type?: string
          response_time_ms?: number | null
          tokens_used?: number | null

        Relationships: [
          {
            foreignKeyName: "ai_conversation_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversation_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_fallback_configs: {
        Row: {
          company_id: string | null
          created_at: string
          fallback_enabled: boolean | null
          id: string
          primary_model: string
          secondary_model: string | null
          tertiary_model: string | null
          updated_at: string

        Insert: {
          company_id?: string | null
          created_at?: string
          fallback_enabled?: boolean | null
          id?: string
          primary_model: string
          secondary_model?: string | null
          tertiary_model?: string | null
          updated_at?: string

        Update: {
          company_id?: string | null
          created_at?: string
          fallback_enabled?: boolean | null
          id?: string
          primary_model?: string
          secondary_model?: string | null
          tertiary_model?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_fallback_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_global_config: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          openai_api_key: string
          openai_model: string | null
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null

        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          openai_api_key: string
          openai_model?: string | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null

        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          openai_api_key?: string
          openai_model?: string | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null

        Relationships: []

      ai_global_prompt_template: {
        Row: {
          created_at: string | null
          default_vars: Json | null
          id: string
          is_active: boolean | null
          template: string
          updated_at: string | null

        Insert: {
          created_at?: string | null
          default_vars?: Json | null
          id?: string
          is_active?: boolean | null
          template: string
          updated_at?: string | null

        Update: {
          created_at?: string | null
          default_vars?: Json | null
          id?: string
          is_active?: boolean | null
          template?: string
          updated_at?: string | null

        Relationships: []

      ai_model_configs: {
        Row: {
          api_key: string | null
          company_id: string | null
          created_at: string
          frequency_penalty: number | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string
          presence_penalty: number | null
          provider: string
          retry_attempts: number | null
          streaming: boolean | null
          system_prompt: string | null
          temperature: number | null
          timeout_seconds: number | null
          top_p: number | null
          updated_at: string

        Insert: {
          api_key?: string | null
          company_id?: string | null
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model: string
          presence_penalty?: number | null
          provider: string
          retry_attempts?: number | null
          streaming?: boolean | null
          system_prompt?: string | null
          temperature?: number | null
          timeout_seconds?: number | null
          top_p?: number | null
          updated_at?: string

        Update: {
          api_key?: string | null
          company_id?: string | null
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string
          presence_penalty?: number | null
          provider?: string
          retry_attempts?: number | null
          streaming?: boolean | null
          system_prompt?: string | null
          temperature?: number | null
          timeout_seconds?: number | null
          top_p?: number | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_model_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_model_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_prompt_history: {
        Row: {
          agent_id: string | null
          id: number
          owner_id: string | null
          template: string | null
          updated_at: string | null
          vars: Json | null
          version: number | null

        Insert: {
          agent_id?: string | null
          id?: never
          owner_id?: string | null
          template?: string | null
          updated_at?: string | null
          vars?: Json | null
          version?: number | null

        Update: {
          agent_id?: string | null
          id?: never
          owner_id?: string | null
          template?: string | null
          updated_at?: string | null
          vars?: Json | null
          version?: number | null

        Relationships: [
          {
            foreignKeyName: "ai_prompt_history_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_prompts"
            referencedColumns: ["id"]
          },
        ]

      ai_rate_limits: {
        Row: {
          alerts_enabled: boolean | null
          company_id: string | null
          cost_threshold: number | null
          created_at: string
          id: string
          requests_per_minute: number | null
          tokens_per_month: number | null
          updated_at: string

        Insert: {
          alerts_enabled?: boolean | null
          company_id?: string | null
          cost_threshold?: number | null
          created_at?: string
          id?: string
          requests_per_minute?: number | null
          tokens_per_month?: number | null
          updated_at?: string

        Update: {
          alerts_enabled?: boolean | null
          company_id?: string | null
          cost_threshold?: number | null
          created_at?: string
          id?: string
          requests_per_minute?: number | null
          tokens_per_month?: number | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_rate_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_security_logs: {
        Row: {
          company_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          severity: string
          user_id: string | null

        Insert: {
          company_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          severity: string
          user_id?: string | null

        Update: {
          company_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
          user_id?: string | null

        Relationships: [
          {
            foreignKeyName: "ai_security_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_security_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_security_settings: {
        Row: {
          company_id: string | null
          content_moderation: boolean | null
          created_at: string
          data_retention_days: number | null
          id: string
          log_sensitive_conversations: boolean | null
          privacy_mode: boolean | null
          prohibited_words: string[] | null
          updated_at: string

        Insert: {
          company_id?: string | null
          content_moderation?: boolean | null
          created_at?: string
          data_retention_days?: number | null
          id?: string
          log_sensitive_conversations?: boolean | null
          privacy_mode?: boolean | null
          prohibited_words?: string[] | null
          updated_at?: string

        Update: {
          company_id?: string | null
          content_moderation?: boolean | null
          created_at?: string
          data_retention_days?: number | null
          id?: string
          log_sensitive_conversations?: boolean | null
          privacy_mode?: boolean | null
          prohibited_words?: string[] | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "ai_security_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_security_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_usage_analytics: {
        Row: {
          company_id: string | null
          cost: number | null
          created_at: string
          date: string
          id: string
          latency_ms: number | null
          model: string | null
          provider: string | null
          requests: number | null
          success_rate: number | null
          tokens: number | null

        Insert: {
          company_id?: string | null
          cost?: number | null
          created_at?: string
          date: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          provider?: string | null
          requests?: number | null
          success_rate?: number | null
          tokens?: number | null

        Update: {
          company_id?: string | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          provider?: string | null
          requests?: number | null
          success_rate?: number | null
          tokens?: number | null

        Relationships: [
          {
            foreignKeyName: "ai_usage_analytics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_analytics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ai_webhooks: {
        Row: {
          company_id: string | null
          created_at: string
          events: string[]
          id: string
          is_active: boolean | null
          name: string
          retry_attempts: number | null
          secret_key: string | null
          timeout_seconds: number | null
          updated_at: string
          url: string

        Insert: {
          company_id?: string | null
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean | null
          name: string
          retry_attempts?: number | null
          secret_key?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url: string

        Update: {
          company_id?: string | null
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean | null
          name?: string
          retry_attempts?: number | null
          secret_key?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url?: string

        Relationships: [
          {
            foreignKeyName: "ai_webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_webhooks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null

        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null

        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null

        Relationships: []

      asaas_config: {
        Row: {
          api_key: string | null
          card_enabled: boolean | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          pix_enabled: boolean | null
          sandbox_mode: boolean | null
          updated_at: string | null
          webhook_token: string | null

        Insert: {
          api_key?: string | null
          card_enabled?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_enabled?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
          webhook_token?: string | null

        Update: {
          api_key?: string | null
          card_enabled?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_enabled?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
          webhook_token?: string | null

        Relationships: [
          {
            foreignKeyName: "asaas_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asaas_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      asaas_payments: {
        Row: {
          amount: number
          asaas_response: Json | null
          company_id: string
          confirmed_at: string | null
          created_at: string | null
          customer_cpf: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          external_reference: string | null
          id: string
          metadata: Json | null
          payment_id: string
          payment_method: string
          pix_expires_at: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          status: string
          updated_at: string | null

        Insert: {
          amount: number
          asaas_response?: Json | null
          company_id: string
          confirmed_at?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          payment_id: string
          payment_method: string
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          status?: string
          updated_at?: string | null

        Update: {
          amount?: number
          asaas_response?: Json | null
          company_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          payment_method?: string
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          status?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "asaas_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asaas_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      autoatendimento_config: {
        Row: {
          allow_card_payment: boolean | null
          allow_cash_payment: boolean | null
          allow_pix_payment: boolean | null
          auto_print_orders: boolean | null
          company_id: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          kiosk_mode: boolean | null
          require_customer_data: boolean | null
          session_timeout_minutes: number | null
          show_preparation_time: boolean | null
          updated_at: string | null
          welcome_message: string | null

        Insert: {
          allow_card_payment?: boolean | null
          allow_cash_payment?: boolean | null
          allow_pix_payment?: boolean | null
          auto_print_orders?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          kiosk_mode?: boolean | null
          require_customer_data?: boolean | null
          session_timeout_minutes?: number | null
          show_preparation_time?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null

        Update: {
          allow_card_payment?: boolean | null
          allow_cash_payment?: boolean | null
          allow_pix_payment?: boolean | null
          auto_print_orders?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          kiosk_mode?: boolean | null
          require_customer_data?: boolean | null
          session_timeout_minutes?: number | null
          show_preparation_time?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null

        Relationships: []

      autoatendimento_sessions: {
        Row: {
          cart_data: Json | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          order_id: number | null
          session_token: string
          status: string | null
          timeout_at: string | null
          updated_at: string | null

        Insert: {
          cart_data?: Json | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_id?: number | null
          session_token: string
          status?: string | null
          timeout_at?: string | null
          updated_at?: string | null

        Update: {
          cart_data?: Json | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_id?: number | null
          session_token?: string
          status?: string | null
          timeout_at?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "autoatendimento_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]

      caixa_lancamentos: {
        Row: {
          caixa_id: string
          categoria: string
          company_id: string
          created_at: string
          data_lancamento: string
          descricao: string
          forma_pagamento: string
          hora_lancamento: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          usuario: string | null
          valor: number

        Insert: {
          caixa_id: string
          categoria: string
          company_id: string
          created_at?: string
          data_lancamento?: string
          descricao: string
          forma_pagamento: string
          hora_lancamento?: string
          id?: string
          observacoes?: string | null
          tipo: string
          updated_at?: string
          usuario?: string | null
          valor: number

        Update: {
          caixa_id?: string
          categoria?: string
          company_id?: string
          created_at?: string
          data_lancamento?: string
          descricao?: string
          forma_pagamento?: string
          hora_lancamento?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          usuario?: string | null
          valor?: number

        Relationships: [
          {
            foreignKeyName: "caixa_lancamentos_caixa_id_fkey"
            columns: ["caixa_id"]
            isOneToOne: false
            referencedRelation: "caixas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixa_lancamentos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      caixas: {
        Row: {
          company_id: string
          created_at: string
          data_abertura: string
          data_fechamento: string | null
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          usuario_abertura: string | null
          usuario_fechamento: string | null
          valor_abertura: number
          valor_fechamento: number | null

        Insert: {
          company_id: string
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          usuario_abertura?: string | null
          usuario_fechamento?: string | null
          valor_abertura?: number
          valor_fechamento?: number | null

        Update: {
          company_id?: string
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          usuario_abertura?: string | null
          usuario_fechamento?: string | null
          valor_abertura?: number
          valor_fechamento?: number | null

        Relationships: [
          {
            foreignKeyName: "caixas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caixas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      cardapio_branding: {
        Row: {
          accent_color: string | null
          additional_settings: Json | null
          background_color: string | null
          banner_file_id: string | null
          company_id: string
          created_at: string | null
          header_style: string | null
          id: string
          is_active: boolean | null
          logo_file_id: string | null
          primary_color: string | null
          secondary_color: string | null
          show_banner: boolean | null
          show_logo: boolean | null
          text_color: string | null
          updated_at: string | null

        Insert: {
          accent_color?: string | null
          additional_settings?: Json | null
          background_color?: string | null
          banner_file_id?: string | null
          company_id: string
          created_at?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean | null
          logo_file_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_banner?: boolean | null
          show_logo?: boolean | null
          text_color?: string | null
          updated_at?: string | null

        Update: {
          accent_color?: string | null
          additional_settings?: Json | null
          background_color?: string | null
          banner_file_id?: string | null
          company_id?: string
          created_at?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean | null
          logo_file_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_banner?: boolean | null
          show_logo?: boolean | null
          text_color?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "cardapio_branding_banner_file_id_fkey"
            columns: ["banner_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardapio_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardapio_branding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardapio_branding_logo_file_id_fkey"
            columns: ["logo_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]

      cashback_config: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          percentual_cashback: number
          updated_at: string
          valor_minimo_compra: number | null

        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          percentual_cashback?: number
          updated_at?: string
          valor_minimo_compra?: number | null

        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          percentual_cashback?: number
          updated_at?: string
          valor_minimo_compra?: number | null

        Relationships: [
          {
            foreignKeyName: "cashback_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      cashback_notifications: {
        Row: {
          cashback_value: number
          company_id: string
          created_at: string
          customer_name: string | null
          customer_phone: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string | null
          notification_type: string
          pedido_id: number | null
          sent_at: string | null
          status: string
          updated_at: string

        Insert: {
          cashback_value: number
          company_id: string
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_type?: string
          pedido_id?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string

        Update: {
          cashback_value?: number
          company_id?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          notification_type?: string
          pedido_id?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "cashback_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_notifications_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]

      cashback_transactions: {
        Row: {
          company_id: string
          created_at: string
          customer_name: string | null
          customer_phone: string
          descricao: string | null
          id: string
          pedido_id: number | null
          tipo: string
          valor: number

        Insert: {
          company_id: string
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          descricao?: string | null
          id?: string
          pedido_id?: number | null
          tipo: string
          valor: number

        Update: {
          company_id?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          descricao?: string | null
          id?: string
          pedido_id?: number | null
          tipo?: string
          valor?: number

        Relationships: [
          {
            foreignKeyName: "cashback_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]

      categorias: {
        Row: {
          categoria_original_id: string | null
          codigo_integracao: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_categoria_filial: boolean | null
          name: string
          order_position: number | null
          origem_filial_id: string | null
          tipo_fiscal_id: string | null
          updated_at: string | null

        Insert: {
          categoria_original_id?: string | null
          codigo_integracao?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_categoria_filial?: boolean | null
          name: string
          order_position?: number | null
          origem_filial_id?: string | null
          tipo_fiscal_id?: string | null
          updated_at?: string | null

        Update: {
          categoria_original_id?: string | null
          codigo_integracao?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_categoria_filial?: boolean | null
          name?: string
          order_position?: number | null
          origem_filial_id?: string | null
          tipo_fiscal_id?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "categorias_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_tipo_fiscal_id_fkey"
            columns: ["tipo_fiscal_id"]
            isOneToOne: false
            referencedRelation: "tipos_fiscais"
            referencedColumns: ["id"]
          },
        ]

      categorias_adicionais: {
        Row: {
          codigo_integracao: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          max_selection: number | null
          min_selection: number | null
          name: string
          order_position: number | null
          selection_type: string | null
          updated_at: string | null

        Insert: {
          codigo_integracao?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_selection?: number | null
          min_selection?: number | null
          name: string
          order_position?: number | null
          selection_type?: string | null
          updated_at?: string | null

        Update: {
          codigo_integracao?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_selection?: number | null
          min_selection?: number | null
          name?: string
          order_position?: number | null
          selection_type?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "categorias_adicionais_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_adicionais_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      chunked_files: {
        Row: {
          chunk_paths: string[]
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          original_name: string
          total_chunks: number
          total_size: number
          updated_at: string
          upload_id: string

        Insert: {
          chunk_paths: string[]
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          original_name: string
          total_chunks: number
          total_size: number
          updated_at?: string
          upload_id: string

        Update: {
          chunk_paths?: string[]
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          total_chunks?: number
          total_size?: number
          updated_at?: string
          upload_id?: string

        Relationships: []

      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          company_id: string
          data_cadastro: string | null
          dias_sem_comprar: number | null
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: number
          nome: string
          status: string | null
          telefone: string | null
          total_pedidos: number | null

        Insert: {
          cep?: string | null
          cidade?: string | null
          company_id: string
          data_cadastro?: string | null
          dias_sem_comprar?: number | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: number
          nome: string
          status?: string | null
          telefone?: string | null
          total_pedidos?: number | null

        Update: {
          cep?: string | null
          cidade?: string | null
          company_id?: string
          data_cadastro?: string | null
          dias_sem_comprar?: number | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: number
          nome?: string
          status?: string | null
          telefone?: string | null
          total_pedidos?: number | null

        Relationships: [
          {
            foreignKeyName: "clientes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      companies: {
        Row: {
          created_at: string
          domain: string
          id: string
          logo: string | null
          min_order_value: number | null
          name: string
          plan: string
          slug: string | null
          status: string
          store_code: number | null
          updated_at: string
          user_count: number
          user_id: string | null

        Insert: {
          created_at?: string
          domain: string
          id?: string
          logo?: string | null
          min_order_value?: number | null
          name: string
          plan?: string
          slug?: string | null
          status?: string
          store_code?: number | null
          updated_at?: string
          user_count?: number
          user_id?: string | null

        Update: {
          created_at?: string
          domain?: string
          id?: string
          logo?: string | null
          min_order_value?: number | null
          name?: string
          plan?: string
          slug?: string | null
          status?: string
          store_code?: number | null
          updated_at?: string
          user_count?: number
          user_id?: string | null

        Relationships: []

      company_addresses: {
        Row: {
          bairro: string
          cep: string | null
          cidade: string
          company_id: string
          complemento: string | null
          created_at: string
          estado: string
          hide_from_customers: boolean | null
          id: string
          is_principal: boolean | null
          latitude: number | null
          logradouro: string
          longitude: number | null
          manual_coordinates: boolean | null
          numero: string
          referencia: string | null
          updated_at: string

        Insert: {
          bairro: string
          cep?: string | null
          cidade: string
          company_id: string
          complemento?: string | null
          created_at?: string
          estado: string
          hide_from_customers?: boolean | null
          id?: string
          is_principal?: boolean | null
          latitude?: number | null
          logradouro: string
          longitude?: number | null
          manual_coordinates?: boolean | null
          numero: string
          referencia?: string | null
          updated_at?: string

        Update: {
          bairro?: string
          cep?: string | null
          cidade?: string
          company_id?: string
          complemento?: string | null
          created_at?: string
          estado?: string
          hide_from_customers?: boolean | null
          id?: string
          is_principal?: boolean | null
          latitude?: number | null
          logradouro?: string
          longitude?: number | null
          manual_coordinates?: boolean | null
          numero?: string
          referencia?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "company_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      company_credentials: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          is_hashed: boolean | null
          password_hash: string
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          is_hashed?: boolean | null
          password_hash: string
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          is_hashed?: boolean | null
          password_hash?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "company_credentials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_credentials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      company_fiscal_config: {
        Row: {
          bairro: string | null
          cep: string | null
          certificado_instalado_focus: boolean | null
          certificado_path: string | null
          certificado_senha: string | null
          certificado_status: string | null
          certificado_validade: string | null
          cidade: string | null
          cnae_principal: string | null
          cnpj: string
          codigo_regime_tributario: string | null
          company_id: string
          consumidor_final: boolean | null
          created_at: string
          email_xmls: string | null
          finalidade_emissao: string | null
          focus_nfe_ambiente: string | null
          focus_nfe_habilitado: boolean | null
          focus_nfe_token: string | null
          id: string
          ie_substituicao_tributaria: string | null
          indicador_ie_destinatario: string | null
          informacao_complementar_nfce: string | null
          inscricao_estadual: string | null
          logradouro: string | null
          natureza_operacao: string | null
          nfce_id_token: string | null
          nfce_proxima_numeracao: number | null
          nfce_serie: number | null
          nfce_token: string | null
          nfe_proxima_numeracao: number | null
          nfe_serie: number | null
          nome_fantasia: string | null
          numero: string | null
          observacoes_configuracao: string | null
          presenca_comprador: string | null
          razao_social: string | null
          regime_tributario: string | null
          status_ultimo_teste: string | null
          telefone: string | null
          uf: string | null
          ultimo_teste_nfce: string | null
          updated_at: string

        Insert: {
          bairro?: string | null
          cep?: string | null
          certificado_instalado_focus?: boolean | null
          certificado_path?: string | null
          certificado_senha?: string | null
          certificado_status?: string | null
          certificado_validade?: string | null
          cidade?: string | null
          cnae_principal?: string | null
          cnpj: string
          codigo_regime_tributario?: string | null
          company_id: string
          consumidor_final?: boolean | null
          created_at?: string
          email_xmls?: string | null
          finalidade_emissao?: string | null
          focus_nfe_ambiente?: string | null
          focus_nfe_habilitado?: boolean | null
          focus_nfe_token?: string | null
          id?: string
          ie_substituicao_tributaria?: string | null
          indicador_ie_destinatario?: string | null
          informacao_complementar_nfce?: string | null
          inscricao_estadual?: string | null
          logradouro?: string | null
          natureza_operacao?: string | null
          nfce_id_token?: string | null
          nfce_proxima_numeracao?: number | null
          nfce_serie?: number | null
          nfce_token?: string | null
          nfe_proxima_numeracao?: number | null
          nfe_serie?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes_configuracao?: string | null
          presenca_comprador?: string | null
          razao_social?: string | null
          regime_tributario?: string | null
          status_ultimo_teste?: string | null
          telefone?: string | null
          uf?: string | null
          ultimo_teste_nfce?: string | null
          updated_at?: string

        Update: {
          bairro?: string | null
          cep?: string | null
          certificado_instalado_focus?: boolean | null
          certificado_path?: string | null
          certificado_senha?: string | null
          certificado_status?: string | null
          certificado_validade?: string | null
          cidade?: string | null
          cnae_principal?: string | null
          cnpj?: string
          codigo_regime_tributario?: string | null
          company_id?: string
          consumidor_final?: boolean | null
          created_at?: string
          email_xmls?: string | null
          finalidade_emissao?: string | null
          focus_nfe_ambiente?: string | null
          focus_nfe_habilitado?: boolean | null
          focus_nfe_token?: string | null
          id?: string
          ie_substituicao_tributaria?: string | null
          indicador_ie_destinatario?: string | null
          informacao_complementar_nfce?: string | null
          inscricao_estadual?: string | null
          logradouro?: string | null
          natureza_operacao?: string | null
          nfce_id_token?: string | null
          nfce_proxima_numeracao?: number | null
          nfce_serie?: number | null
          nfce_token?: string | null
          nfe_proxima_numeracao?: number | null
          nfe_serie?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes_configuracao?: string | null
          presenca_comprador?: string | null
          razao_social?: string | null
          regime_tributario?: string | null
          status_ultimo_teste?: string | null
          telefone?: string | null
          uf?: string | null
          ultimo_teste_nfce?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "company_fiscal_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_fiscal_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      company_groups: {
        Row: {
          child_company_id: string
          created_at: string
          id: string
          is_active: boolean
          parent_company_id: string
          sync_kds: boolean
          sync_pedidos: boolean
          updated_at: string

        Insert: {
          child_company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_company_id: string
          sync_kds?: boolean
          sync_pedidos?: boolean
          updated_at?: string

        Update: {
          child_company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_company_id?: string
          sync_kds?: boolean
          sync_pedidos?: boolean
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "company_groups_child_company_id_fkey"
            columns: ["child_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_groups_child_company_id_fkey"
            columns: ["child_company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_groups_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_groups_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      company_info: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnae: string | null
          cnpj_cpf: string | null
          company_id: string
          complemento: string | null
          contato: string | null
          created_at: string
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          instagram: string | null
          nome_estabelecimento: string
          numero: string | null
          razao_social: string | null
          segmento: string | null
          telefone2: string | null
          updated_at: string

        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnpj_cpf?: string | null
          company_id: string
          complemento?: string | null
          contato?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          instagram?: string | null
          nome_estabelecimento: string
          numero?: string | null
          razao_social?: string | null
          segmento?: string | null
          telefone2?: string | null
          updated_at?: string

        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnpj_cpf?: string | null
          company_id?: string
          complemento?: string | null
          contato?: string | null
          created_at?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          instagram?: string | null
          nome_estabelecimento?: string
          numero?: string | null
          razao_social?: string | null
          segmento?: string | null
          telefone2?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "company_info_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_info_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      company_settings: {
        Row: {
          company_id: string
          created_at: string | null
          custom_fields: Json | null
          dominio_printer_name: string | null
          font_size: number | null
          id: string
          logo_url: string | null
          printer_ip: string | null
          printer_name: string | null
          printer_port: number | null
          printer_type: string | null
          printnode_child_account_id: number | null
          printnode_child_email: string | null
          printnode_default_printer_id: number | null
          printnode_default_printer_name: string | null
          printnode_enabled: boolean | null
          spacing_config: Json | null
          template_cabecalho: string | null
          template_rodape: string | null
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          custom_fields?: Json | null
          dominio_printer_name?: string | null
          font_size?: number | null
          id?: string
          logo_url?: string | null
          printer_ip?: string | null
          printer_name?: string | null
          printer_port?: number | null
          printer_type?: string | null
          printnode_child_account_id?: number | null
          printnode_child_email?: string | null
          printnode_default_printer_id?: number | null
          printnode_default_printer_name?: string | null
          printnode_enabled?: boolean | null
          spacing_config?: Json | null
          template_cabecalho?: string | null
          template_rodape?: string | null
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          custom_fields?: Json | null
          dominio_printer_name?: string | null
          font_size?: number | null
          id?: string
          logo_url?: string | null
          printer_ip?: string | null
          printer_name?: string | null
          printer_port?: number | null
          printer_type?: string | null
          printnode_child_account_id?: number | null
          printnode_child_email?: string | null
          printnode_default_printer_id?: number | null
          printnode_default_printer_name?: string | null
          printnode_enabled?: boolean | null
          spacing_config?: Json | null
          template_cabecalho?: string | null
          template_rodape?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      customer_addresses: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          company_id: string
          complemento: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          estado: string | null
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          numero: string | null

        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id: string
          complemento?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null

        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string
          complemento?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estado?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null

        Relationships: [
          {
            foreignKeyName: "customer_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      customer_addresses_backup: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          company_id: string | null
          complemento: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          estado: string | null
          id: string | null
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          numero: string | null

        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string | null
          complemento?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estado?: string | null
          id?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null

        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          company_id?: string | null
          complemento?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estado?: string | null
          id?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          numero?: string | null

        Relationships: []

      customer_cashback: {
        Row: {
          company_id: string
          created_at: string
          customer_name: string | null
          customer_phone: string
          id: string
          saldo_disponivel: number
          saldo_total_acumulado: number
          updated_at: string

        Insert: {
          company_id: string
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          id?: string
          saldo_disponivel?: number
          saldo_total_acumulado?: number
          updated_at?: string

        Update: {
          company_id?: string
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          id?: string
          saldo_disponivel?: number
          saldo_total_acumulado?: number
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "customer_cashback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_cashback_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      dados_fiscais: {
        Row: {
          aliquota_cofins: number | null
          aliquota_ipi: number | null
          aliquota_pis: number | null
          cest: string | null
          cfop: string | null
          codigo_beneficio_fiscal: string | null
          cofins_base_calculo: number | null
          cofins_situacao_tributaria: string | null
          company_id: string
          created_at: string
          descricao: string
          ean: string | null
          icms_aliquota: number | null
          icms_efetivo_aliquota: number | null
          icms_efetivo_percentual_base: number | null
          icms_modalidade_base: string | null
          icms_origem: string | null
          icms_percentual_base: number | null
          icms_percentual_fcp: number | null
          icms_reducao_base: number | null
          icms_situacao_tributaria: string | null
          icms_st_aliquota: number | null
          icms_st_modalidade_base: string | null
          icms_st_mva: number | null
          icms_st_percentual_base: number | null
          icms_st_percentual_fcp: number | null
          icms_st_reducao_base: number | null
          id: string
          ipi_codigo_enquadramento: string | null
          ipi_situacao_tributaria: string | null
          ncm: string
          observacoes: string | null
          origem_mercadoria: string
          pis_base_calculo: number | null
          pis_situacao_tributaria: string | null
          tipo_fiscal_id: string
          updated_at: string

        Insert: {
          aliquota_cofins?: number | null
          aliquota_ipi?: number | null
          aliquota_pis?: number | null
          cest?: string | null
          cfop?: string | null
          codigo_beneficio_fiscal?: string | null
          cofins_base_calculo?: number | null
          cofins_situacao_tributaria?: string | null
          company_id: string
          created_at?: string
          descricao: string
          ean?: string | null
          icms_aliquota?: number | null
          icms_efetivo_aliquota?: number | null
          icms_efetivo_percentual_base?: number | null
          icms_modalidade_base?: string | null
          icms_origem?: string | null
          icms_percentual_base?: number | null
          icms_percentual_fcp?: number | null
          icms_reducao_base?: number | null
          icms_situacao_tributaria?: string | null
          icms_st_aliquota?: number | null
          icms_st_modalidade_base?: string | null
          icms_st_mva?: number | null
          icms_st_percentual_base?: number | null
          icms_st_percentual_fcp?: number | null
          icms_st_reducao_base?: number | null
          id?: string
          ipi_codigo_enquadramento?: string | null
          ipi_situacao_tributaria?: string | null
          ncm: string
          observacoes?: string | null
          origem_mercadoria?: string
          pis_base_calculo?: number | null
          pis_situacao_tributaria?: string | null
          tipo_fiscal_id: string
          updated_at?: string

        Update: {
          aliquota_cofins?: number | null
          aliquota_ipi?: number | null
          aliquota_pis?: number | null
          cest?: string | null
          cfop?: string | null
          codigo_beneficio_fiscal?: string | null
          cofins_base_calculo?: number | null
          cofins_situacao_tributaria?: string | null
          company_id?: string
          created_at?: string
          descricao?: string
          ean?: string | null
          icms_aliquota?: number | null
          icms_efetivo_aliquota?: number | null
          icms_efetivo_percentual_base?: number | null
          icms_modalidade_base?: string | null
          icms_origem?: string | null
          icms_percentual_base?: number | null
          icms_percentual_fcp?: number | null
          icms_reducao_base?: number | null
          icms_situacao_tributaria?: string | null
          icms_st_aliquota?: number | null
          icms_st_modalidade_base?: string | null
          icms_st_mva?: number | null
          icms_st_percentual_base?: number | null
          icms_st_percentual_fcp?: number | null
          icms_st_reducao_base?: number | null
          id?: string
          ipi_codigo_enquadramento?: string | null
          ipi_situacao_tributaria?: string | null
          ncm?: string
          observacoes?: string | null
          origem_mercadoria?: string
          pis_base_calculo?: number | null
          pis_situacao_tributaria?: string | null
          tipo_fiscal_id?: string
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "dados_fiscais_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_fiscais_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_fiscais_tipo_fiscal_id_fkey"
            columns: ["tipo_fiscal_id"]
            isOneToOne: false
            referencedRelation: "tipos_fiscais"
            referencedColumns: ["id"]
          },
        ]

      delivery_methods: {
        Row: {
          company_id: string
          created_at: string | null
          delivery: boolean | null
          eat_in: boolean | null
          id: string
          pickup: boolean | null
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          delivery?: boolean | null
          eat_in?: boolean | null
          id?: string
          pickup?: boolean | null
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          delivery?: boolean | null
          eat_in?: boolean | null
          id?: string
          pickup?: boolean | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "delivery_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      delivery_region_areas: {
        Row: {
          area_data: Json
          area_type: string
          created_at: string | null
          id: string
          region_id: string

        Insert: {
          area_data: Json
          area_type: string
          created_at?: string | null
          id?: string
          region_id: string

        Update: {
          area_data?: Json
          area_type?: string
          created_at?: string | null
          id?: string
          region_id?: string

        Relationships: [
          {
            foreignKeyName: "delivery_region_areas_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "delivery_regions"
            referencedColumns: ["id"]
          },
        ]

      delivery_regions: {
        Row: {
          company_id: string
          created_at: string | null
          delivery_fee: number
          description: string | null
          id: string
          is_active: boolean | null
          max_delivery_time: number | null
          min_order_value: number | null
          name: string
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          delivery_fee?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_time?: number | null
          min_order_value?: number | null
          name: string
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          delivery_fee?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_delivery_time?: number | null
          min_order_value?: number | null
          name?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "delivery_regions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_regions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      email_audit_logs: {
        Row: {
          created_at: string | null
          email: string
          email_type: string
          error_details: Json | null
          id: string
          message_id: string | null
          metadata: Json | null
          provider: string | null
          status: string

        Insert: {
          created_at?: string | null
          email: string
          email_type: string
          error_details?: Json | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider?: string | null
          status: string

        Update: {
          created_at?: string | null
          email?: string
          email_type?: string
          error_details?: Json | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider?: string | null
          status?: string

        Relationships: []

      email_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          email: string
          first_request_at: string | null
          id: string
          last_request_at: string | null
          request_count: number | null
          request_type: string
          updated_at: string | null

        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          email: string
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          request_type: string
          updated_at?: string | null

        Update: {
          blocked_until?: string | null
          created_at?: string | null
          email?: string
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          request_count?: number | null
          request_type?: string
          updated_at?: string | null

        Relationships: []

      estabelecimento_enderecos: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          company_id: string
          complemento: string | null
          created_at: string | null
          estado: string
          id: string
          is_principal: boolean | null
          latitude: number | null
          logradouro: string
          longitude: number | null
          nome: string | null
          numero: string
          referencia: string | null
          updated_at: string | null

        Insert: {
          bairro: string
          cep: string
          cidade: string
          company_id: string
          complemento?: string | null
          created_at?: string | null
          estado: string
          id?: string
          is_principal?: boolean | null
          latitude?: number | null
          logradouro: string
          longitude?: number | null
          nome?: string | null
          numero: string
          referencia?: string | null
          updated_at?: string | null

        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          company_id?: string
          complemento?: string | null
          created_at?: string | null
          estado?: string
          id?: string
          is_principal?: boolean | null
          latitude?: number | null
          logradouro?: string
          longitude?: number | null
          nome?: string | null
          numero?: string
          referencia?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "estabelecimento_enderecos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estabelecimento_enderecos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      facebook_pixel_configs: {
        Row: {
          access_token: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          pixel_id: string
          test_event_code: string | null
          test_mode: boolean
          updated_at: string

        Insert: {
          access_token?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          pixel_id: string
          test_event_code?: string | null
          test_mode?: boolean
          updated_at?: string

        Update: {
          access_token?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          pixel_id?: string
          test_event_code?: string | null
          test_mode?: boolean
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "facebook_pixel_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_pixel_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      features: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null

        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null

        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null

        Relationships: []

      fornecedores: {
        Row: {
          cnpj_cpf: string | null
          company_id: string
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null

        Insert: {
          cnpj_cpf?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null

        Update: {
          cnpj_cpf?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "fornecedores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      free_delivery_config: {
        Row: {
          company_id: string
          created_at: string
          free_delivery_message: string | null
          id: string
          is_enabled: boolean
          minimum_order_value: number
          updated_at: string

        Insert: {
          company_id: string
          created_at?: string
          free_delivery_message?: string | null
          id?: string
          is_enabled?: boolean
          minimum_order_value?: number
          updated_at?: string

        Update: {
          company_id?: string
          created_at?: string
          free_delivery_message?: string | null
          id?: string
          is_enabled?: boolean
          minimum_order_value?: number
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "free_delivery_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "free_delivery_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      horario_funcionamento: {
        Row: {
          company_id: string
          created_at: string | null
          fuso_horario: string
          horarios_detalhados: string | null
          id: string
          tipo_disponibilidade: string
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          fuso_horario?: string
          horarios_detalhados?: string | null
          id?: string
          tipo_disponibilidade?: string
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          fuso_horario?: string
          horarios_detalhados?: string | null
          id?: string
          tipo_disponibilidade?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "horario_funcionamento_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horario_funcionamento_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      horarios_dias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dia_semana: number
          horario_fim: string
          horario_funcionamento_id: string
          horario_inicio: string
          id: string

        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana: number
          horario_fim: string
          horario_funcionamento_id: string
          horario_inicio: string
          id?: string

        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dia_semana?: number
          horario_fim?: string
          horario_funcionamento_id?: string
          horario_inicio?: string
          id?: string

        Relationships: [
          {
            foreignKeyName: "horarios_dias_horario_funcionamento_id_fkey"
            columns: ["horario_funcionamento_id"]
            isOneToOne: false
            referencedRelation: "horario_funcionamento"
            referencedColumns: ["id"]
          },
        ]

      human_support_requests: {
        Row: {
          ai_paused_until: string
          assigned_at: string | null
          assigned_to: string | null
          chat_id: string | null
          company_id: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string
          id: string
          keywords_detected: string[] | null
          request_message: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          updated_at: string | null

        Insert: {
          ai_paused_until: string
          assigned_at?: string | null
          assigned_to?: string | null
          chat_id?: string | null
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone: string
          id?: string
          keywords_detected?: string[] | null
          request_message: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null

        Update: {
          ai_paused_until?: string
          assigned_at?: string | null
          assigned_to?: string | null
          chat_id?: string | null
          company_id?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string
          id?: string
          keywords_detected?: string[] | null
          request_message?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "human_support_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_support_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      ifood_integrations: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          environment: string | null
          id: string
          is_active: boolean
          merchant_id: string | null
          notes: string | null
          store_name: string | null
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null

        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean
          merchant_id?: string | null
          notes?: string | null
          store_name?: string | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null

        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean
          merchant_id?: string | null
          notes?: string | null
          store_name?: string | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null

        Relationships: []

      import_logs: {
        Row: {
          company_id: string
          created_at: string
          error_message: string | null
          id: string
          items_imported: number | null
          source_url: string | null
          status: string | null

        Insert: {
          company_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          items_imported?: number | null
          source_url?: string | null
          status?: string | null

        Update: {
          company_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          items_imported?: number | null
          source_url?: string | null
          status?: string | null

        Relationships: [
          {
            foreignKeyName: "import_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      login_rate_limit: {
        Row: {
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          identifier_type: string
          last_attempt_at: string | null
          updated_at: string | null

        Insert: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          identifier_type: string
          last_attempt_at?: string | null
          updated_at?: string | null

        Update: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string
          last_attempt_at?: string | null
          updated_at?: string | null

        Relationships: []

      login_rate_limits: {
        Row: {
          attempts: number
          blocked_until: string | null
          created_at: string
          first_attempt_at: string
          id: string
          identifier: string
          identifier_type: string
          last_attempt_at: string
          updated_at: string

        Insert: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier: string
          identifier_type: string
          last_attempt_at?: string
          updated_at?: string

        Update: {
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          last_attempt_at?: string
          updated_at?: string

        Relationships: []

      media_files: {
        Row: {
          alt_text: string | null
          company_id: string
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          mime_type: string | null
          updated_at: string | null

        Insert: {
          alt_text?: string | null
          company_id: string
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string | null

        Update: {
          alt_text?: string | null
          company_id?: string
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "media_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_files_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      mercadorias_ingredientes: {
        Row: {
          categoria: string | null
          codigo_produto: string | null
          company_id: string
          created_at: string
          created_by: string | null
          descricao: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fornecedor: string | null
          id: string
          is_active: boolean | null
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          unidade_medida: string
          updated_at: string
          updated_by: string | null

        Insert: {
          categoria?: string | null
          codigo_produto?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          is_active?: boolean | null
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          unidade_medida: string
          updated_at?: string
          updated_by?: string | null

        Update: {
          categoria?: string | null
          codigo_produto?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          is_active?: boolean | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          unidade_medida?: string
          updated_at?: string
          updated_by?: string | null

        Relationships: [
          {
            foreignKeyName: "mercadorias_ingredientes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mercadorias_ingredientes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      nfce_logs: {
        Row: {
          chave_nfe: string | null
          company_id: string
          created_at: string
          data_autorizacao: string | null
          error_message: string | null
          id: string
          justificativa_cancelamento: string | null
          motivo_cancelamento: string | null
          numero_nfce: number | null
          pedido_id: number | null
          protocolo_autorizacao: string | null
          referencia: string | null
          response_data: Json | null
          serie: number | null
          status: string | null
          updated_at: string
          url_danfe: string | null
          xml_nfce: string | null

        Insert: {
          chave_nfe?: string | null
          company_id: string
          created_at?: string
          data_autorizacao?: string | null
          error_message?: string | null
          id?: string
          justificativa_cancelamento?: string | null
          motivo_cancelamento?: string | null
          numero_nfce?: number | null
          pedido_id?: number | null
          protocolo_autorizacao?: string | null
          referencia?: string | null
          response_data?: Json | null
          serie?: number | null
          status?: string | null
          updated_at?: string
          url_danfe?: string | null
          xml_nfce?: string | null

        Update: {
          chave_nfe?: string | null
          company_id?: string
          created_at?: string
          data_autorizacao?: string | null
          error_message?: string | null
          id?: string
          justificativa_cancelamento?: string | null
          motivo_cancelamento?: string | null
          numero_nfce?: number | null
          pedido_id?: number | null
          protocolo_autorizacao?: string | null
          referencia?: string | null
          response_data?: Json | null
          serie?: number | null
          status?: string | null
          updated_at?: string
          url_danfe?: string | null
          xml_nfce?: string | null

        Relationships: [
          {
            foreignKeyName: "nfce_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfce_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      notas_entrada: {
        Row: {
          company_id: string
          conciliacao_estoque: boolean | null
          conciliacao_financeira: boolean | null
          created_at: string | null
          data_emissao: string
          data_entrada: string
          fornecedor_id: string | null
          id: string
          numero: string
          observacoes: string | null
          updated_at: string | null
          valor_total: number

        Insert: {
          company_id: string
          conciliacao_estoque?: boolean | null
          conciliacao_financeira?: boolean | null
          created_at?: string | null
          data_emissao: string
          data_entrada: string
          fornecedor_id?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          updated_at?: string | null
          valor_total: number

        Update: {
          company_id?: string
          conciliacao_estoque?: boolean | null
          conciliacao_financeira?: boolean | null
          created_at?: string | null
          data_emissao?: string
          data_entrada?: string
          fornecedor_id?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          updated_at?: string | null
          valor_total?: number

        Relationships: [
          {
            foreignKeyName: "notas_entrada_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_entrada_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_entrada_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]

      notas_entrada_itens: {
        Row: {
          descricao_produto: string
          id: string
          nota_id: string
          quantidade: number
          unidade: string
          valor_total: number
          valor_unitario: number

        Insert: {
          descricao_produto: string
          id?: string
          nota_id: string
          quantidade: number
          unidade: string
          valor_total: number
          valor_unitario: number

        Update: {
          descricao_produto?: string
          id?: string
          nota_id?: string
          quantidade?: number
          unidade?: string
          valor_total?: number
          valor_unitario?: number

        Relationships: [
          {
            foreignKeyName: "notas_entrada_itens_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "notas_entrada"
            referencedColumns: ["id"]
          },
        ]

      notification_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          pedido_id: string | null
          status: string
          type: string

        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id?: string | null
          status: string
          type: string

        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          pedido_id?: string | null
          status?: string
          type?: string

        Relationships: []

      notification_queue: {
        Row: {
          created_at: string | null
          id: string
          max_retries: number
          next_retry_at: string | null
          payload: Json | null
          pedido_id: string
          retry_count: number
          status: string
          type: string
          updated_at: string | null

        Insert: {
          created_at?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json | null
          pedido_id: string
          retry_count?: number
          status?: string
          type?: string
          updated_at?: string | null

        Update: {
          created_at?: string | null
          id?: string
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json | null
          pedido_id?: string
          retry_count?: number
          status?: string
          type?: string
          updated_at?: string | null

        Relationships: []

      open_delivery_client_config: {
        Row: {
          base_url: string
          company_id: string
          created_at: string
          external_company_id: string | null
          id: string
          is_active: boolean
          secret: string
          store_code: string
          sync_catalog: boolean
          sync_store_data: boolean
          updated_at: string

        Insert: {
          base_url: string
          company_id: string
          created_at?: string
          external_company_id?: string | null
          id?: string
          is_active?: boolean
          secret: string
          store_code: string
          sync_catalog?: boolean
          sync_store_data?: boolean
          updated_at?: string

        Update: {
          base_url?: string
          company_id?: string
          created_at?: string
          external_company_id?: string | null
          id?: string
          is_active?: boolean
          secret?: string
          store_code?: string
          sync_catalog?: boolean
          sync_store_data?: boolean
          updated_at?: string

        Relationships: []

      payment_delivery_card_brands: {
        Row: {
          brand_name: string
          config_id: string
          id: string

        Insert: {
          brand_name: string
          config_id: string
          id?: string

        Update: {
          brand_name?: string
          config_id?: string
          id?: string

        Relationships: [
          {
            foreignKeyName: "payment_delivery_card_brands_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "payment_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      payment_delivery_config: {
        Row: {
          accept_card: boolean | null
          accept_cash: boolean | null
          accept_pix: boolean | null
          ask_card_brand: boolean | null
          company_id: string
          created_at: string | null
          id: string
          pix_key: string | null
          updated_at: string | null

        Insert: {
          accept_card?: boolean | null
          accept_cash?: boolean | null
          accept_pix?: boolean | null
          ask_card_brand?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          pix_key?: string | null
          updated_at?: string | null

        Update: {
          accept_card?: boolean | null
          accept_cash?: boolean | null
          accept_pix?: boolean | null
          ask_card_brand?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          pix_key?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "payment_delivery_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_delivery_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      pedido_item_adicionais: {
        Row: {
          adicional_id: string | null
          categoria_nome: string
          created_at: string
          id: string
          nome_adicional: string
          pedido_item_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number

        Insert: {
          adicional_id?: string | null
          categoria_nome: string
          created_at?: string
          id?: string
          nome_adicional: string
          pedido_item_id: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number

        Update: {
          adicional_id?: string | null
          categoria_nome?: string
          created_at?: string
          id?: string
          nome_adicional?: string
          pedido_item_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number

        Relationships: [
          {
            foreignKeyName: "pedido_item_adicionais_adicional_id_fkey"
            columns: ["adicional_id"]
            isOneToOne: false
            referencedRelation: "adicionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_item_adicionais_pedido_item_id_fkey"
            columns: ["pedido_item_id"]
            isOneToOne: false
            referencedRelation: "pedido_itens"
            referencedColumns: ["id"]
          },
        ]

      pedido_item_status: {
        Row: {
          created_at: string
          id: string
          pedido_item_id: string
          status: string
          updated_at: string
          updated_by: string | null

        Insert: {
          created_at?: string
          id?: string
          pedido_item_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null

        Update: {
          created_at?: string
          id?: string
          pedido_item_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null

        Relationships: [
          {
            foreignKeyName: "pedido_item_status_pedido_item_id_fkey"
            columns: ["pedido_item_id"]
            isOneToOne: false
            referencedRelation: "pedido_itens"
            referencedColumns: ["id"]
          },
        ]

      pedido_itens: {
        Row: {
          created_at: string
          id: string
          nome_produto: string
          observacoes: string | null
          pedido_id: number
          produto_id: string | null
          quantidade: number
          valor_total: number
          valor_unitario: number

        Insert: {
          created_at?: string
          id?: string
          nome_produto: string
          observacoes?: string | null
          pedido_id: number
          produto_id?: string | null
          quantidade?: number
          valor_total?: number
          valor_unitario?: number

        Update: {
          created_at?: string
          id?: string
          nome_produto?: string
          observacoes?: string | null
          pedido_id?: number
          produto_id?: string | null
          quantidade?: number
          valor_total?: number
          valor_unitario?: number

        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]

      pedidos: {
        Row: {
          cashback_usado: number | null
          company_id: string
          created_at: string | null
          endereco: string | null
          external_data: Json | null
          external_id: string | null
          external_platform: string | null
          external_status: string | null
          horario: string | null
          id: number
          is_pedido_filial: boolean
          nome: string | null
          numero_caixa: number | null
          numero_pedido: number | null
          observacoes: string | null
          origem: string | null
          origem_filial_id: string | null
          pagamento: string | null
          pedido_original_id: number | null
          status: string | null
          telefone: string | null
          tipo: string | null
          total: number | null
          total_sem_desconto: number | null
          updated_at: string | null

        Insert: {
          cashback_usado?: number | null
          company_id: string
          created_at?: string | null
          endereco?: string | null
          external_data?: Json | null
          external_id?: string | null
          external_platform?: string | null
          external_status?: string | null
          horario?: string | null
          id?: number
          is_pedido_filial?: boolean
          nome?: string | null
          numero_caixa?: number | null
          numero_pedido?: number | null
          observacoes?: string | null
          origem?: string | null
          origem_filial_id?: string | null
          pagamento?: string | null
          pedido_original_id?: number | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          total?: number | null
          total_sem_desconto?: number | null
          updated_at?: string | null

        Update: {
          cashback_usado?: number | null
          company_id?: string
          created_at?: string | null
          endereco?: string | null
          external_data?: Json | null
          external_id?: string | null
          external_platform?: string | null
          external_status?: string | null
          horario?: string | null
          id?: number
          is_pedido_filial?: boolean
          nome?: string | null
          numero_caixa?: number | null
          numero_pedido?: number | null
          observacoes?: string | null
          origem?: string | null
          origem_filial_id?: string | null
          pagamento?: string | null
          pedido_original_id?: number | null
          status?: string | null
          telefone?: string | null
          tipo?: string | null
          total?: number | null
          total_sem_desconto?: number | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "pedidos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_origem_filial_id_fkey"
            columns: ["origem_filial_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_origem_filial_id_fkey"
            columns: ["origem_filial_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      pending_user_creation: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          email: string
          error_message: string | null
          id: string
          password_hash: string
          processed_at: string | null
          role: string | null
          status: string | null
          user_id: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          email: string
          error_message?: string | null
          id?: string
          password_hash: string
          processed_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          error_message?: string | null
          id?: string
          password_hash?: string
          processed_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null

        Relationships: []

      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
          slug: string

        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
          slug: string

        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
          slug?: string

        Relationships: []

      pixel_event_logs: {
        Row: {
          config_id: string
          created_at: string
          error_message: string | null
          event_id: string | null
          event_name: string
          id: number
          payload: Json | null
          source: string | null
          status: string | null

        Insert: {
          config_id: string
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          event_name: string
          id?: number
          payload?: Json | null
          source?: string | null
          status?: string | null

        Update: {
          config_id?: string
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          event_name?: string
          id?: number
          payload?: Json | null
          source?: string | null
          status?: string | null

        Relationships: [
          {
            foreignKeyName: "pixel_event_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "facebook_pixel_configs"
            referencedColumns: ["id"]
          },
        ]

      plan_features: {
        Row: {
          feature_id: string
          included: boolean | null
          plan_id: string

        Insert: {
          feature_id: string
          included?: boolean | null
          plan_id: string

        Update: {
          feature_id?: string
          included?: boolean | null
          plan_id?: string

        Relationships: [
          {
            foreignKeyName: "plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]

      plans: {
        Row: {
          active: boolean | null
          auto_renew: boolean | null
          badge: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          id: string
          name: string
          price_monthly: number | null
          price_yearly: number | null
          type: string
          updated_at: string | null

        Insert: {
          active?: boolean | null
          auto_renew?: boolean | null
          badge?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id: string
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          type: string
          updated_at?: string | null

        Update: {
          active?: boolean | null
          auto_renew?: boolean | null
          badge?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          type?: string
          updated_at?: string | null

        Relationships: []

      print_queue: {
        Row: {
          company_id: string
          created_at: string | null
          data: Json
          error_message: string | null
          id: string
          printed_at: string | null
          status: string | null
          type: string

        Insert: {
          company_id: string
          created_at?: string | null
          data: Json
          error_message?: string | null
          id?: string
          printed_at?: string | null
          status?: string | null
          type: string

        Update: {
          company_id?: string
          created_at?: string | null
          data?: Json
          error_message?: string | null
          id?: string
          printed_at?: string | null
          status?: string | null
          type?: string

        Relationships: [
          {
            foreignKeyName: "print_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      print_templates: {
        Row: {
          company_id: string
          created_at: string | null
          esc_pos_commands: Json | null
          footer_config: Json | null
          formatting_config: Json | null
          header_config: Json | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          template_content: Json
          template_name: string
          template_type: string
          updated_at: string | null

        Insert: {
          company_id: string
          created_at?: string | null
          esc_pos_commands?: Json | null
          footer_config?: Json | null
          formatting_config?: Json | null
          header_config?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_content?: Json
          template_name: string
          template_type: string
          updated_at?: string | null

        Update: {
          company_id?: string
          created_at?: string | null
          esc_pos_commands?: Json | null
          footer_config?: Json | null
          formatting_config?: Json | null
          header_config?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_content?: Json
          template_name?: string
          template_type?: string
          updated_at?: string | null

        Relationships: []

      printer_configs: {
        Row: {
          company_id: string
          created_at: string
          id: string
          impressao_automatica: boolean
          is_active: boolean
          is_default: boolean
          largura_papel: number
          printer_name: string
          texto_footer: string | null
          texto_header: string | null
          updated_at: string

        Insert: {
          company_id: string
          created_at?: string
          id?: string
          impressao_automatica?: boolean
          is_active?: boolean
          is_default?: boolean
          largura_papel?: number
          printer_name: string
          texto_footer?: string | null
          texto_header?: string | null
          updated_at?: string

        Update: {
          company_id?: string
          created_at?: string
          id?: string
          impressao_automatica?: boolean
          is_active?: boolean
          is_default?: boolean
          largura_papel?: number
          printer_name?: string
          texto_footer?: string | null
          texto_header?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "printer_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_configs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      produto_categorias_adicionais: {
        Row: {
          categoria_adicional_id: string
          created_at: string | null
          id: string
          is_required: boolean | null
          max_selection: number | null
          min_selection: number | null
          order_position: number | null
          produto_id: string

        Insert: {
          categoria_adicional_id: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          max_selection?: number | null
          min_selection?: number | null
          order_position?: number | null
          produto_id: string

        Update: {
          categoria_adicional_id?: string
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          max_selection?: number | null
          min_selection?: number | null
          order_position?: number | null
          produto_id?: string

        Relationships: [
          {
            foreignKeyName: "produto_categorias_adicionais_categoria_adicional_id_fkey"
            columns: ["categoria_adicional_id"]
            isOneToOne: false
            referencedRelation: "categorias_adicionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_categorias_adicionais_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]

      produtos: {
        Row: {
          aliquota_icms: number | null
          categoria_id: string | null
          cfop: string | null
          codigo_integracao: string | null
          company_id: string
          created_at: string | null
          cst_csosn: string | null
          description: string | null
          destaque: boolean | null
          id: string
          image: string | null
          images: string[] | null
          ingredients: string | null
          is_available: boolean | null
          is_produto_filial: boolean | null
          is_promotional: boolean | null
          name: string
          order_position: number | null
          origem_filial_id: string | null
          origem_produto: string | null
          preparation_time: number | null
          price: number
          produto_original_id: string | null
          promotional_price: number | null
          situacao_tributaria: string | null
          tipo_fiscal_id: string | null
          updated_at: string | null
          visivel_cardapio_publico: boolean | null

        Insert: {
          aliquota_icms?: number | null
          categoria_id?: string | null
          cfop?: string | null
          codigo_integracao?: string | null
          company_id: string
          created_at?: string | null
          cst_csosn?: string | null
          description?: string | null
          destaque?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          ingredients?: string | null
          is_available?: boolean | null
          is_produto_filial?: boolean | null
          is_promotional?: boolean | null
          name: string
          order_position?: number | null
          origem_filial_id?: string | null
          origem_produto?: string | null
          preparation_time?: number | null
          price: number
          produto_original_id?: string | null
          promotional_price?: number | null
          situacao_tributaria?: string | null
          tipo_fiscal_id?: string | null
          updated_at?: string | null
          visivel_cardapio_publico?: boolean | null

        Update: {
          aliquota_icms?: number | null
          categoria_id?: string | null
          cfop?: string | null
          codigo_integracao?: string | null
          company_id?: string
          created_at?: string | null
          cst_csosn?: string | null
          description?: string | null
          destaque?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          ingredients?: string | null
          is_available?: boolean | null
          is_produto_filial?: boolean | null
          is_promotional?: boolean | null
          name?: string
          order_position?: number | null
          origem_filial_id?: string | null
          origem_produto?: string | null
          preparation_time?: number | null
          price?: number
          produto_original_id?: string | null
          promotional_price?: number | null
          situacao_tributaria?: string | null
          tipo_fiscal_id?: string | null
          updated_at?: string | null
          visivel_cardapio_publico?: boolean | null

        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_tipo_fiscal_id_fkey"
            columns: ["tipo_fiscal_id"]
            isOneToOne: false
            referencedRelation: "tipos_fiscais"
            referencedColumns: ["id"]
          },
        ]

      programas_saipos: {
        Row: {
          arquivo_path: string | null
          ativo: boolean
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          updated_at: string
          url_download: string | null
          versao: string | null

        Insert: {
          arquivo_path?: string | null
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          updated_at?: string
          url_download?: string | null
          versao?: string | null

        Update: {
          arquivo_path?: string | null
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          updated_at?: string
          url_download?: string | null
          versao?: string | null

        Relationships: []

      prompt_ab_tests: {
        Row: {
          company_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          prompt_a_id: string | null
          prompt_b_id: string | null
          start_date: string | null
          status: string | null
          traffic_split: number | null
          updated_at: string
          winner_prompt_id: string | null

        Insert: {
          company_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          prompt_a_id?: string | null
          prompt_b_id?: string | null
          start_date?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string
          winner_prompt_id?: string | null

        Update: {
          company_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          prompt_a_id?: string | null
          prompt_b_id?: string | null
          start_date?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string
          winner_prompt_id?: string | null

        Relationships: [
          {
            foreignKeyName: "prompt_ab_tests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_ab_tests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_ab_tests_prompt_a_id_fkey"
            columns: ["prompt_a_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_ab_tests_prompt_b_id_fkey"
            columns: ["prompt_b_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]

      prompt_templates: {
        Row: {
          category: string | null
          company_id: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          version: string | null

        Insert: {
          category?: string | null
          company_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          version?: string | null

        Update: {
          category?: string | null
          company_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          version?: string | null

        Relationships: [
          {
            foreignKeyName: "prompt_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      qz_tray_logs: {
        Row: {
          company_id: string
          created_at: string
          id: string
          message: string
          printer_name: string | null
          timestamp: string
          type: string

        Insert: {
          company_id: string
          created_at?: string
          id?: string
          message: string
          printer_name?: string | null
          timestamp?: string
          type: string

        Update: {
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          printer_name?: string | null
          timestamp?: string
          type?: string

        Relationships: [
          {
            foreignKeyName: "qz_tray_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qz_tray_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      receitas_fichas_tecnicas: {
        Row: {
          categoria: string | null
          company_id: string
          created_at: string
          created_by: string | null
          custo_total: number | null
          descricao: string | null
          id: string
          is_active: boolean | null
          margem_lucro: number | null
          modo_preparo: string | null
          nome: string
          observacoes: string | null
          preco_venda_sugerido: number | null
          rendimento: number | null
          tempo_preparo: number | null
          unidade_rendimento: string | null
          updated_at: string
          updated_by: string | null

        Insert: {
          categoria?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          custo_total?: number | null
          descricao?: string | null
          id?: string
          is_active?: boolean | null
          margem_lucro?: number | null
          modo_preparo?: string | null
          nome: string
          observacoes?: string | null
          preco_venda_sugerido?: number | null
          rendimento?: number | null
          tempo_preparo?: number | null
          unidade_rendimento?: string | null
          updated_at?: string
          updated_by?: string | null

        Update: {
          categoria?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          custo_total?: number | null
          descricao?: string | null
          id?: string
          is_active?: boolean | null
          margem_lucro?: number | null
          modo_preparo?: string | null
          nome?: string
          observacoes?: string | null
          preco_venda_sugerido?: number | null
          rendimento?: number | null
          tempo_preparo?: number | null
          unidade_rendimento?: string | null
          updated_at?: string
          updated_by?: string | null

        Relationships: [
          {
            foreignKeyName: "receitas_fichas_tecnicas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_fichas_tecnicas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      receitas_ingredientes: {
        Row: {
          created_at: string
          custo_unitario: number | null
          id: string
          mercadoria_id: string
          observacoes: string | null
          quantidade: number
          receita_id: string
          unidade_medida: string
          updated_at: string

        Insert: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          mercadoria_id: string
          observacoes?: string | null
          quantidade: number
          receita_id: string
          unidade_medida: string
          updated_at?: string

        Update: {
          created_at?: string
          custo_unitario?: number | null
          id?: string
          mercadoria_id?: string
          observacoes?: string | null
          quantidade?: number
          receita_id?: string
          unidade_medida?: string
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "receitas_ingredientes_mercadoria_id_fkey"
            columns: ["mercadoria_id"]
            isOneToOne: false
            referencedRelation: "mercadorias_ingredientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_ingredientes_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas_fichas_tecnicas"
            referencedColumns: ["id"]
          },
        ]

      regioes_atendimento: {
        Row: {
          bairro: string | null
          centro_lat: number | null
          centro_lng: number | null
          cep_final: string | null
          cep_inicial: string | null
          cidade: string | null
          company_id: string | null
          created_at: string | null
          estado: string | null
          id: string
          nome: string | null
          poligono: Json | null
          raio_km: number | null
          status: boolean | null
          tipo: string
          valor: number | null

        Insert: {
          bairro?: string | null
          centro_lat?: number | null
          centro_lng?: number | null
          cep_final?: string | null
          cep_inicial?: string | null
          cidade?: string | null
          company_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          poligono?: Json | null
          raio_km?: number | null
          status?: boolean | null
          tipo: string
          valor?: number | null

        Update: {
          bairro?: string | null
          centro_lat?: number | null
          centro_lng?: number | null
          cep_final?: string | null
          cep_inicial?: string | null
          cidade?: string | null
          company_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          poligono?: Json | null
          raio_km?: number | null
          status?: boolean | null
          tipo?: string
          valor?: number | null

        Relationships: [
          {
            foreignKeyName: "regioes_atendimento_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regioes_atendimento_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      rh_inscricoes: {
        Row: {
          arquivado: boolean | null
          carta_apresentacao: string | null
          company_id: string
          created_at: string | null
          curriculo_nome: string | null
          curriculo_url: string | null
          disponibilidade_inicio: string | null
          email: string
          experiencia_relevante: string | null
          id: string
          linkedin_url: string | null
          nome_completo: string
          pretensao_salarial: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
          vaga_id: string

        Insert: {
          arquivado?: boolean | null
          carta_apresentacao?: string | null
          company_id: string
          created_at?: string | null
          curriculo_nome?: string | null
          curriculo_url?: string | null
          disponibilidade_inicio?: string | null
          email: string
          experiencia_relevante?: string | null
          id?: string
          linkedin_url?: string | null
          nome_completo: string
          pretensao_salarial?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          vaga_id: string

        Update: {
          arquivado?: boolean | null
          carta_apresentacao?: string | null
          company_id?: string
          created_at?: string | null
          curriculo_nome?: string | null
          curriculo_url?: string | null
          disponibilidade_inicio?: string | null
          email?: string
          experiencia_relevante?: string | null
          id?: string
          linkedin_url?: string | null
          nome_completo?: string
          pretensao_salarial?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
          vaga_id?: string

        Relationships: [
          {
            foreignKeyName: "rh_inscricoes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_inscricoes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_inscricoes_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "rh_vagas"
            referencedColumns: ["id"]
          },
        ]

      rh_vagas: {
        Row: {
          apply_url: string | null
          benefits: string | null
          company_id: string
          config_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          requirements: string | null
          salary_range: string | null
          title: string
          type: string | null
          updated_at: string | null

        Insert: {
          apply_url?: string | null
          benefits?: string | null
          company_id: string
          config_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title: string
          type?: string | null
          updated_at?: string | null

        Update: {
          apply_url?: string | null
          benefits?: string | null
          company_id?: string
          config_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "rh_vagas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vagas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vagas_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "rh_vagas_config"
            referencedColumns: ["id"]
          },
        ]

      rh_vagas_config: {
        Row: {
          banner_url: string | null
          company_id: string
          created_at: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          page_title: string | null
          primary_color: string | null
          slug: string | null
          title_color: string | null
          updated_at: string | null
          welcome_message: string | null
          whatsapp_url: string | null

        Insert: {
          banner_url?: string | null
          company_id: string
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string | null
          slug?: string | null
          title_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp_url?: string | null

        Update: {
          banner_url?: string | null
          company_id?: string
          created_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          page_title?: string | null
          primary_color?: string | null
          slug?: string | null
          title_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
          whatsapp_url?: string | null

        Relationships: [
          {
            foreignKeyName: "rh_vagas_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_vagas_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      role_permissions: {
        Row: {
          granted_at: string | null
          id: string
          permission_id: string
          role_id: string

        Insert: {
          granted_at?: string | null
          id?: string
          permission_id: string
          role_id: string

        Update: {
          granted_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string

        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]

      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null

        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null

        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null

        Relationships: []

      short_links: {
        Row: {
          clicks_count: number | null
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          short_id: string
          target_slug: string
          updated_at: string | null

        Insert: {
          clicks_count?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          short_id: string
          target_slug: string
          updated_at?: string | null

        Update: {
          clicks_count?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          short_id?: string
          target_slug?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "short_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      stripe_config: {
        Row: {
          card_enabled: boolean | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          pix_enabled: boolean | null
          publishable_key: string | null
          secret_key: string | null
          test_mode: boolean | null
          updated_at: string | null
          webhook_endpoint_secret: string | null

        Insert: {
          card_enabled?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_enabled?: boolean | null
          publishable_key?: string | null
          secret_key?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          webhook_endpoint_secret?: string | null

        Update: {
          card_enabled?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pix_enabled?: boolean | null
          publishable_key?: string | null
          secret_key?: string | null
          test_mode?: boolean | null
          updated_at?: string | null
          webhook_endpoint_secret?: string | null

        Relationships: [
          {
            foreignKeyName: "stripe_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      tipos_fiscais: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string

        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string

        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string

        Relationships: []

      turnos: {
        Row: {
          caixa_id: string | null
          company_id: string
          created_at: string
          data_abertura: string
          data_fechamento: string | null
          id: string
          numero_turno: number
          observacoes: string | null
          status: string
          updated_at: string
          usuario_abertura: string | null
          usuario_fechamento: string | null

        Insert: {
          caixa_id?: string | null
          company_id: string
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          id?: string
          numero_turno: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          usuario_abertura?: string | null
          usuario_fechamento?: string | null

        Update: {
          caixa_id?: string | null
          company_id?: string
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          id?: string
          numero_turno?: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          usuario_abertura?: string | null
          usuario_fechamento?: string | null

        Relationships: []

      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          role: string
          updated_at: string
          user_id: string

        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string

        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string

        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      user_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          token: string
          updated_at: string | null

        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          token: string
          updated_at?: string | null

        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          token?: string
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      user_roles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string

        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string

        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string

        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      user_store_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          permission_id: string
          store_id: string | null
          user_id: string

        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          permission_id: string
          store_id?: string | null
          user_id: string

        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          permission_id?: string
          store_id?: string | null
          user_id?: string

        Relationships: [
          {
            foreignKeyName: "user_store_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_store_permissions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_store_permissions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      whatsapp_assistant_control: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_paused: boolean | null
          paused_at: string | null
          paused_by: string | null
          phone: string
          resumed_at: string | null
          updated_at: string | null

        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_by?: string | null
          phone: string
          resumed_at?: string | null
          updated_at?: string | null

        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_paused?: boolean | null
          paused_at?: string | null
          paused_by?: string | null
          phone?: string
          resumed_at?: string | null
          updated_at?: string | null

        Relationships: [
          {
            foreignKeyName: "whatsapp_assistant_control_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_assistant_control_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      whatsapp_campaigns: {
        Row: {
          audience: string
          company_id: string
          country: string
          created_at: string
          days_of_week: number[] | null
          id: string
          is_active: boolean
          last_run_at: string | null
          media_base64: string | null
          media_file_name: string | null
          media_mime_type: string | null
          media_type: string | null
          message: string
          name: string
          next_run_at: string | null
          recurrence_type: string
          scheduled_date: string | null
          status: string
          time_of_day: string | null
          timezone: string
          total_failed: number
          total_recipients: number
          total_sent: number
          updated_at: string

        Insert: {
          audience: string
          company_id: string
          country?: string
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          media_base64?: string | null
          media_file_name?: string | null
          media_mime_type?: string | null
          media_type?: string | null
          message: string
          name: string
          next_run_at?: string | null
          recurrence_type?: string
          scheduled_date?: string | null
          status?: string
          time_of_day?: string | null
          timezone?: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
          updated_at?: string

        Update: {
          audience?: string
          company_id?: string
          country?: string
          created_at?: string
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          media_base64?: string | null
          media_file_name?: string | null
          media_mime_type?: string | null
          media_type?: string | null
          message?: string
          name?: string
          next_run_at?: string | null
          recurrence_type?: string
          scheduled_date?: string | null
          status?: string
          time_of_day?: string | null
          timezone?: string
          total_failed?: number
          total_recipients?: number
          total_sent?: number
          updated_at?: string

        Relationships: []

      whatsapp_chats: {
        Row: {
          ai_paused: boolean
          chat_id: string
          company_id: string
          contact_avatar: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          last_message: string | null
          last_message_time: string | null
          unread_count: number | null
          updated_at: string

        Insert: {
          ai_paused?: boolean
          chat_id: string
          company_id: string
          contact_avatar?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string

        Update: {
          ai_paused?: boolean
          chat_id?: string
          company_id?: string
          contact_avatar?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string

        Relationships: []

      whatsapp_integrations: {
        Row: {
          company_id: string
          control_id: string
          created_at: string
          host: string
          ia_agent_preset: string | null
          ia_model: string | null
          ia_temperature: number | null
          id: string
          instance_key: string
          purpose: string
          token: string
          updated_at: string
          webhook: string | null

        Insert: {
          company_id: string
          control_id: string
          created_at?: string
          host: string
          ia_agent_preset?: string | null
          ia_model?: string | null
          ia_temperature?: number | null
          id?: string
          instance_key: string
          purpose?: string
          token: string
          updated_at?: string
          webhook?: string | null

        Update: {
          company_id?: string
          control_id?: string
          created_at?: string
          host?: string
          ia_agent_preset?: string | null
          ia_model?: string | null
          ia_temperature?: number | null
          id?: string
          instance_key?: string
          purpose?: string
          token?: string
          updated_at?: string
          webhook?: string | null

        Relationships: [
          {
            foreignKeyName: "whatsapp_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]

      whatsapp_messages: {
        Row: {
          chat_id: string
          company_id: string
          contact_avatar: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          id: string
          is_from_me: boolean | null
          media_url: string | null
          message_content: string | null
          message_id: string
          message_type: string | null
          status: string | null
          timestamp: string
          updated_at: string

        Insert: {
          chat_id: string
          company_id: string
          contact_avatar?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_content?: string | null
          message_id: string
          message_type?: string | null
          status?: string | null
          timestamp?: string
          updated_at?: string

        Update: {
          chat_id?: string
          company_id?: string
          contact_avatar?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_content?: string | null
          message_id?: string
          message_type?: string | null
          status?: string | null
          timestamp?: string
          updated_at?: string

        Relationships: []

      whatsapp_order_notifications: {
        Row: {
          company_id: string
          confirmation_template: string | null
          created_at: string
          delivery_template: string | null
          id: string
          is_active: boolean
          send_confirmation: boolean
          send_delivery_updates: boolean
          send_status_updates: boolean
          status_update_template: string | null
          updated_at: string

        Insert: {
          company_id: string
          confirmation_template?: string | null
          created_at?: string
          delivery_template?: string | null
          id?: string
          is_active?: boolean
          send_confirmation?: boolean
          send_delivery_updates?: boolean
          send_status_updates?: boolean
          status_update_template?: string | null
          updated_at?: string

        Update: {
          company_id?: string
          confirmation_template?: string | null
          created_at?: string
          delivery_template?: string | null
          id?: string
          is_active?: boolean
          send_confirmation?: boolean
          send_delivery_updates?: boolean
          send_status_updates?: boolean
          status_update_template?: string | null
          updated_at?: string

        Relationships: [
          {
            foreignKeyName: "whatsapp_order_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_order_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_delivery_config"
            referencedColumns: ["id"]
          },
        ]


    Views: {
      company_delivery_config: {
        Row: {
          configuracao: string | null
          delivery: boolean | null
          eat_in: boolean | null
          empresa: string | null
          id: string | null
          pickup: boolean | null
          slug: string | null
          ultima_atualizacao: string | null

        Relationships: []


    Functions: {
      accept_user_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json

      analyze_pix_key: {
        Args: { p_pix_key: string }
        Returns: Json

      bytea_to_text: {
        Args: { data: string }
        Returns: string

      calculate_delivery_fee: {
        Args: {
          p_cep: string
          p_company_id: string
          p_latitude?: number
          p_longitude?: number

        Returns: {
          delivery_fee: number
          max_delivery_time: number
          min_order_value: number
          region_id: string
          region_name: string
        }[]

      can_access_caixa: {
        Args: { target_company_id: string }
        Returns: boolean

      can_access_company: {
        Args: { target_company_id: string }
        Returns: boolean

      can_access_customer_addresses: {
        Args: { target_company_id: string }
        Returns: boolean

      check_asaas_payment_status: {
        Args: { p_payment_id: string }
        Returns: Json

      check_asaas_pix_keys: {
        Args: { p_company_id: string }
        Returns: Json

      check_email_rate_limit: {
        Args: {
          max_requests?: number
          req_type?: string
          time_window_minutes?: number
          user_email: string

        Returns: Json

      check_existing_order_before_create: {
        Args: {
          p_amount: number
          p_customer_phone: string
          p_payment_id: string

        Returns: boolean

      check_login_rate_limit: {
        Args: {
          p_block_minutes?: number
          p_email: string
          p_ip?: string
          p_max_attempts?: number
          p_window_minutes?: number

        Returns: Json

      check_login_rate_limit_enhanced: {
        Args: {
          p_block_minutes?: number
          p_identifier: string
          p_max_attempts?: number
          p_type?: string
          p_window_minutes?: number

        Returns: Json

      check_sufficient_cashback_balance: {
        Args: {
          p_company_id: string
          p_customer_phone: string
          p_required_amount: number

        Returns: boolean

      cleanup_canceled_orders: {
        Args: Record<PropertyKey, never>
        Returns: string

      cleanup_expired_autoatendimento_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      cleanup_old_pedido_sequences: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      cleanup_old_rate_limit_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      create_asaas_payment_oficial: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_cpf?: string
          p_customer_name: string
          p_customer_phone?: string
          p_description: string

        Returns: Json

      create_asaas_pix_key: {
        Args: { p_company_id: string }
        Returns: Json

      create_asaas_pix_payment: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_cpf?: string
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone?: string
          p_description: string
          p_external_reference?: string

        Returns: Json

      create_cashback_transaction: {
        Args: {
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_descricao: string
          p_pedido_id: number
          p_tipo: string
          p_valor: number

        Returns: string

      create_human_support_request: {
        Args: {
          p_chat_id: string
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_keywords_detected: string[]
          p_pause_hours?: number
          p_request_message: string

        Returns: string

      create_prompt_from_global_template: {
        Args: { company_name: string; company_slug: string }
        Returns: undefined

      create_user_directly: {
        Args: {
          p_company_id: string
          p_created_by?: string
          p_email: string
          p_password: string
          p_role?: string

        Returns: Json

      create_user_invitation: {
        Args: { p_company_id: string; p_email: string; p_role?: string }
        Returns: string

      criar_pedido_pdv_completo: {
        Args: {
          p_company_id: string
          p_endereco?: string
          p_itens: string
          p_nome: string
          p_observacoes?: string
          p_pagamento?: string
          p_telefone: string
          p_tipo?: string
          p_total?: number

        Returns: Json

      debug_asaas_customer: {
        Args: { p_company_id: string }
        Returns: Json

      debug_asaas_payment: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_cpf?: string
          p_customer_name: string
          p_customer_phone?: string
          p_description: string

        Returns: Json

      debug_asaas_qr_code: {
        Args: { p_company_id: string; p_payment_id: string }
        Returns: Json

      debug_pix_keys_detailed: {
        Args: { p_company_id: string }
        Returns: Json

      debug_whatsapp_adicionais: {
        Args: { test_pedido_id: number }
        Returns: string

      debug_whatsapp_adicionais_completo: {
        Args: { test_pedido_id: number }
        Returns: string

      delete_customer_address_public: {
        Args: {
          p_address_id: string
          p_company_id: string
          p_customer_phone: string

        Returns: boolean

      delete_programa_saipos: {
        Args: { programa_id: string }
        Returns: undefined

      despausar_todos_assistentes: {
        Args: Record<PropertyKey, never>
        Returns: Json

      detect_human_request_keywords: {
        Args: { message_text: string }
        Returns: string[]

      fix_assistant_templates: {
        Args: Record<PropertyKey, never>
        Returns: string

      fix_negative_cashback_balance: {
        Args: { p_company_id: string; p_customer_phone: string }
        Returns: Json

      fix_order_totals_after_promotional_fix: {
        Args: Record<PropertyKey, never>
        Returns: Json

      fix_produtos_order_position: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      fix_promotional_prices_in_orders: {
        Args: Record<PropertyKey, never>
        Returns: Json

      format_working_hours: {
        Args: { company_uuid: string }
        Returns: string

      generate_assistant_name: {
        Args: { company_name: string }
        Returns: string

      generate_company_slug: {
        Args: { company_name: string }
        Returns: string

      generate_integration_codes_for_company: {
        Args: { company_uuid: string }
        Returns: Json

      generate_integration_codes_for_parent: {
        Args: { parent_company_id: string }
        Returns: Json

      generate_short_id: {
        Args: Record<PropertyKey, never>
        Returns: string

      get_active_turno_for_company: {
        Args: { company_uuid: string }
        Returns: string

      get_assistant_status: {
        Args: { p_company_id: string; p_phone: string }
        Returns: Json

      get_cashback_values_by_order: {
        Args: { p_pedido_id: number }
        Returns: {
          cashback_gerado: number
          cashback_usado: number
        }[]

      get_company_children: {
        Args: { company_uuid: string }
        Returns: {
          child_id: string
          child_name: string
          is_active: boolean
          sync_kds: boolean
          sync_pedidos: boolean
        }[]

      get_customer_addresses_for_order: {
        Args: { p_company_id: string; p_phone: string }
        Returns: {
          bairro: string
          cep: string
          cidade: string
          complemento: string
          customer_name: string
          customer_phone: string
          estado: string
          id: string
          logradouro: string
          numero: string
        }[]

      get_customer_info: {
        Args: { p_company_id: string; p_phone: string }
        Returns: Json

      get_my_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string

      get_next_pedido_number_by_turno: {
        Args: { company_uuid: string }
        Returns: number

      get_next_pedido_number_for_company_today: {
        Args: { company_uuid: string }
        Returns: number

      get_next_pedido_number_for_company_today_public: {
        Args: { company_uuid: string }
        Returns: number

      get_next_turno_number_for_company: {
        Args: { company_uuid: string }
        Returns: number

      get_programas_saipos: {
        Args: Record<PropertyKey, never>
        Returns: {
          arquivo_path: string
          ativo: boolean
          created_at: string
          descricao: string
          icone: string
          id: string
          nome: string
          url_download: string
          versao: string
        }[]

      get_realtime_cashback_balance: {
        Args: { p_company_id: string; p_customer_phone: string }
        Returns: Json

      get_trigger_and_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          rls: boolean
          trigger: boolean
        }[]

      get_user_companies: {
        Args: Record<PropertyKey, never>
        Returns: string[]

      get_user_company_domain: {
        Args: Record<PropertyKey, never>
        Returns: string

      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string

      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string

      hash_password: {
        Args: { plain_password: string }
        Returns: string

      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]

      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]

      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]

      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean

      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean

      identify_orphan_payments: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          confirmed_at: string
          customer_phone: string
          days_since_payment: number
          has_matching_order: boolean
          payment_id: string
        }[]

      insert_programa_saipos: {
        Args: { programa_data: Json }
        Returns: string

      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean

      limpar_sincronizacao_filiais: {
        Args: { parent_company_id: string }
        Returns: Json

      notify_orphan_payments: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: Json
          total_amount: number
          total_orphans: number
        }[]

      pause_whatsapp_assistant: {
        Args: { p_company_id: string; p_paused_by: string; p_phone: string }
        Returns: Json

      process_cashback_cancellation: {
        Args: { pedido_id_param: number }
        Returns: Json

      process_cashback_cancellation_generated: {
        Args: {
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_pedido_id: number
          p_valor_cancelamento: number

        Returns: boolean

      process_cashback_refund: {
        Args: {
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_pedido_id: number
          p_valor_estorno: number

        Returns: boolean

      recalcular_custo_receita: {
        Args: { receita_uuid: string }
        Returns: number

      recalculate_cashback_balance: {
        Args: { p_company_id: string; p_customer_phone: string }
        Returns: Json

      reset_all_daily_pedido_sequences: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      reset_and_credit_cashback: {
        Args: {
          p_cashback_amount: number
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_pedido_id: number

        Returns: undefined

      reset_company_sequence_today: {
        Args: { company_uuid: string }
        Returns: undefined

      reset_daily_sequence_for_company: {
        Args: { company_uuid: string }
        Returns: undefined

      resume_whatsapp_assistant: {
        Args: { p_company_id: string; p_phone: string }
        Returns: Json

      rpc_check_existing_order: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_phone: string
          p_payment_id: string

        Returns: Json

      safe_credit_cashback: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_name: string
          p_customer_phone: string
          p_description: string
          p_idempotency_key?: string
          p_pedido_id?: number

        Returns: Json

      safe_debit_cashback: {
        Args:
          | {
              p_amount: number
              p_company_id: string
              p_customer_phone: string
              p_description: string
              p_pedido_id: number
            }
          | {
              p_amount: number
              p_company_id: string
              p_customer_phone: string
              p_description: string
              p_pedido_id?: number
            }
        Returns: Json

      safe_generate_cashback: {
        Args:
          | {
              p_amount: number
              p_company_id: string
              p_customer_name: string
              p_customer_phone: string
              p_description: string
              p_order_id: number
            }
          | {
              p_cashback_value: number
              p_company_id: string
              p_customer_name: string
              p_customer_phone: string
              p_pedido_id: number
            }
        Returns: Json

      search_customer_by_phone: {
        Args: { p_company_id: string; p_phone: string }
        Returns: {
          id: number
          nome: string
          telefone: string
        }[]

      send_cashback_notification: {
        Args: { p_company_id?: string; p_pedido_id: number }
        Returns: Json

      sync_all_filiais_to_parent: {
        Args: { parent_company_id: string }
        Returns: Json

      sync_existing_cardapio_to_parent: {
        Args: { filial_company_id: string }
        Returns: Json

      sync_filial_with_integration_codes: {
        Args: { filial_company_id: string; parent_company_id: string }
        Returns: Json

      test_cashback_notification: {
        Args: { p_pedido_id: number }
        Returns: Json

      test_trigger_manual: {
        Args: Record<PropertyKey, never>
        Returns: string

      test_whatsapp_manual: {
        Args: { p_pedido_id: number }
        Returns: string

      test_whatsapp_notification_debug: {
        Args: Record<PropertyKey, never>
        Returns: string

      text_to_bytea: {
        Args: { data: string }
        Returns: string

      update_all_assistant_prompts: {
        Args: Record<PropertyKey, never>
        Returns: string

      update_client_status_by_inactivity: {
        Args: Record<PropertyKey, never>
        Returns: undefined

      update_customer_cashback_balance: {
        Args: {
          p_amount: number
          p_company_id: string
          p_customer_phone: string

        Returns: undefined

      update_programa_saipos: {
        Args: { programa_data: Json; programa_id: string }
        Returns: undefined

      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string

      user_has_permission: {
        Args: { permission_slug: string; store_id?: string; user_id: string }
        Returns: boolean

      validate_fiscal_config: {
        Args: { p_company_id: string }
        Returns: Json


    Enums: {
      app_role: "super_admin" | "admin" | "store_admin" | "user"

    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null

      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null

      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null


  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals

  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R

    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R

      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals

  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I

    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I

      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals

  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U

    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U

      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals

  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals

  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "store_admin", "user"],
    },
  },
} as const
;
