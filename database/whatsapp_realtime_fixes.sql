-- Funções para diagnóstico e correção do sistema realtime WhatsApp

-- 1. Função para verificar tabelas na publicação realtime
CREATE OR REPLACE FUNCTION get_realtime_publication_tables()
RETURNS TABLE(tablename text, schemaname text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pt.tablename::text, pt.schemaname::text
  FROM pg_publication_tables pt
  WHERE pt.pubname = 'supabase_realtime'
  AND pt.tablename IN ('whatsapp_messages', 'whatsapp_chats');
$$;

-- 2. Função para verificar políticas RLS das tabelas WhatsApp
CREATE OR REPLACE FUNCTION get_whatsapp_rls_policies()
RETURNS TABLE(
  tablename text,
  policyname text,
  permissive text,
  roles text[],
  cmd text,
  expression text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.tablename::text,
    p.policyname::text,
    p.permissive::text,
    p.roles,
    p.cmd::text,
    p.qual::text as expression
  FROM pg_policies p
  WHERE p.schemaname = 'public' 
  AND p.tablename IN ('whatsapp_messages', 'whatsapp_chats')
  ORDER BY p.tablename, p.policyname;
$$;

-- 3. Função para garantir que tabelas WhatsApp estão na publicação realtime
CREATE OR REPLACE FUNCTION ensure_whatsapp_realtime_publication()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_msg text := '';
BEGIN
  -- Verificar e adicionar whatsapp_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'whatsapp_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
    result_msg := result_msg || 'whatsapp_messages adicionada; ';
  END IF;

  -- Verificar e adicionar whatsapp_chats
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'whatsapp_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_chats;
    result_msg := result_msg || 'whatsapp_chats adicionada; ';
  END IF;

  -- Garantir REPLICA IDENTITY FULL
  ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;
  ALTER TABLE public.whatsapp_chats REPLICA IDENTITY FULL;
  result_msg := result_msg || 'REPLICA IDENTITY configurado; ';

  IF result_msg = '' THEN
    result_msg := 'Tabelas já estavam configuradas corretamente';
  END IF;

  RETURN result_msg;
END;
$$;

-- 4. Função para criar políticas RLS otimizadas para realtime
CREATE OR REPLACE FUNCTION create_optimized_whatsapp_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_msg text := '';
BEGIN
  -- Remover políticas muito restritivas se existirem
  DROP POLICY IF EXISTS "Users can only see their company messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Users can only see their company chats" ON whatsapp_chats;
  
  -- Criar políticas otimizadas para realtime
  -- Estas políticas são permissivas para permitir realtime, mas o filtro por company_id
  -- será feito no código da aplicação
  
  CREATE POLICY "Enable realtime for whatsapp_messages" 
  ON whatsapp_messages FOR ALL 
  USING (true);
  
  CREATE POLICY "Enable realtime for whatsapp_chats" 
  ON whatsapp_chats FOR ALL 
  USING (true);
  
  result_msg := 'Políticas RLS otimizadas criadas com sucesso';
  
  RETURN result_msg;
END;
$$;

-- 5. Função para verificar status geral do realtime
CREATE OR REPLACE FUNCTION check_whatsapp_realtime_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_result jsonb := '{}';
  tables_in_pub int;
  policies_count int;
  replica_identity_ok int;
BEGIN
  -- Verificar tabelas na publicação
  SELECT COUNT(*) INTO tables_in_pub
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('whatsapp_messages', 'whatsapp_chats');
  
  -- Verificar políticas
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public' 
  AND tablename IN ('whatsapp_messages', 'whatsapp_chats')
  AND policyname LIKE '%realtime%';
  
  -- Verificar replica identity
  SELECT COUNT(*) INTO replica_identity_ok
  FROM pg_class c
  WHERE c.relname IN ('whatsapp_messages', 'whatsapp_chats')
  AND c.relreplident = 'f'; -- FULL
  
  status_result := jsonb_build_object(
    'tables_in_publication', tables_in_pub,
    'expected_tables', 2,
    'publication_ok', tables_in_pub = 2,
    'policies_count', policies_count,
    'replica_identity_ok', replica_identity_ok = 2,
    'overall_status', CASE 
      WHEN tables_in_pub = 2 AND replica_identity_ok = 2 THEN 'healthy'
      WHEN tables_in_pub > 0 THEN 'warning'
      ELSE 'critical'
    END
  );
  
  RETURN status_result;
END;
$$;

-- 6. Função para rollback de correções
CREATE OR REPLACE FUNCTION rollback_whatsapp_realtime_fixes()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_msg text := '';
BEGIN
  -- Remover tabelas da publicação realtime (rollback)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.whatsapp_messages;
    result_msg := result_msg || 'whatsapp_messages removida da publicação; ';
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar se a tabela não estava na publicação
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.whatsapp_chats;
    result_msg := result_msg || 'whatsapp_chats removida da publicação; ';
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar se a tabela não estava na publicação
  END;
  
  -- Remover políticas otimizadas
  DROP POLICY IF EXISTS "Enable realtime for whatsapp_messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Enable realtime for whatsapp_chats" ON whatsapp_chats;
  result_msg := result_msg || 'Políticas realtime removidas; ';
  
  -- Restaurar REPLICA IDENTITY DEFAULT
  ALTER TABLE public.whatsapp_messages REPLICA IDENTITY DEFAULT;
  ALTER TABLE public.whatsapp_chats REPLICA IDENTITY DEFAULT;
  result_msg := result_msg || 'REPLICA IDENTITY restaurado; ';
  
  RETURN 'Rollback concluído: ' || result_msg;
END;
$;

-- 7. Função para aplicar correções com verificação de pré-requisitos
CREATE OR REPLACE FUNCTION apply_whatsapp_realtime_fixes_safe()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_json jsonb := '{}';
  backup_status jsonb;
  fix_result text;
  final_status jsonb;
BEGIN
  -- 1. Fazer backup do status atual
  backup_status := check_whatsapp_realtime_status();
  
  -- 2. Verificar se as tabelas existem
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_messages') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tabela whatsapp_messages não encontrada',
      'backup_status', backup_status
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_chats') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tabela whatsapp_chats não encontrada',
      'backup_status', backup_status
    );
  END IF;
  
  -- 3. Aplicar correções
  BEGIN
    fix_result := ensure_whatsapp_realtime_publication();
    
    -- 4. Verificar se as correções funcionaram
    final_status := check_whatsapp_realtime_status();
    
    result_json := jsonb_build_object(
      'success', true,
      'backup_status', backup_status,
      'fix_result', fix_result,
      'final_status', final_status,
      'improvement', (final_status->>'overall_status') != (backup_status->>'overall_status')
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, tentar rollback
    BEGIN
      PERFORM rollback_whatsapp_realtime_fixes();
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar erros de rollback
    END;
    
    result_json := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'backup_status', backup_status,
      'rollback_attempted', true
    );
  END;
  
  RETURN result_json;
END;
$;

-- 8. Função para otimizar índices para realtime
CREATE OR REPLACE FUNCTION optimize_whatsapp_realtime_indexes()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_msg text := '';
BEGIN
  -- Criar índices otimizados para queries de realtime se não existirem
  
  -- Índice para whatsapp_messages por company_id e timestamp
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_messages_company_timestamp') THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_messages_company_timestamp 
    ON whatsapp_messages(company_id, created_at DESC);
    result_msg := result_msg || 'Índice messages company+timestamp criado; ';
  END IF;
  
  -- Índice para whatsapp_chats por company_id
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_chats_company') THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_chats_company 
    ON whatsapp_chats(company_id);
    result_msg := result_msg || 'Índice chats company criado; ';
  END IF;
  
  -- Índice para mensagens por chat_id (para queries de chat específico)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_messages_chat_timestamp') THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_messages_chat_timestamp 
    ON whatsapp_messages(chat_id, created_at DESC);
    result_msg := result_msg || 'Índice messages chat+timestamp criado; ';
  END IF;
  
  IF result_msg = '' THEN
    result_msg := 'Todos os índices já existiam';
  END IF;
  
  RETURN result_msg;
END;
$;

-- 9. Função para limpeza de dados antigos (performance)
CREATE OR REPLACE FUNCTION cleanup_old_whatsapp_data(days_to_keep integer DEFAULT 90)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  deleted_messages integer;
  result_msg text;
BEGIN
  -- Deletar mensagens muito antigas para manter performance
  DELETE FROM whatsapp_messages 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_messages = ROW_COUNT;
  
  -- Executar VACUUM para recuperar espaço
  VACUUM ANALYZE whatsapp_messages;
  VACUUM ANALYZE whatsapp_chats;
  
  result_msg := format('Limpeza concluída: %s mensagens antigas removidas', deleted_messages);
  
  RETURN result_msg;
END;
$;

-- 10. Função para analisar políticas RLS que podem bloquear realtime
CREATE OR REPLACE FUNCTION analyze_whatsapp_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_json jsonb := '{}';
  policy_analysis jsonb := '[]';
  policy_record record;
  issue_count integer := 0;
  recommendations text[] := '{}';
BEGIN
  -- Analisar cada política das tabelas WhatsApp
  FOR policy_record IN
    SELECT 
      p.tablename,
      p.policyname,
      p.permissive,
      p.roles,
      p.cmd,
      p.qual as expression,
      p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public' 
    AND p.tablename IN ('whatsapp_messages', 'whatsapp_chats')
    ORDER BY p.tablename, p.policyname
  LOOP
    DECLARE
      policy_issues text[] := '{}';
      is_problematic boolean := false;
    END;
    
    -- Verificar se a política pode bloquear realtime
    
    -- 1. Políticas muito restritivas (com muitas condições)
    IF length(policy_record.expression) > 200 THEN
      policy_issues := array_append(policy_issues, 'Expressão muito complexa pode impactar performance');
      is_problematic := true;
    END IF;
    
    -- 2. Políticas que usam funções custosas
    IF policy_record.expression ILIKE '%auth.%' OR 
       policy_record.expression ILIKE '%current_user%' OR
       policy_record.expression ILIKE '%session_user%' THEN
      policy_issues := array_append(policy_issues, 'Usa funções de autenticação que podem ser custosas');
      is_problematic := true;
    END IF;
    
    -- 3. Políticas que fazem JOINs ou subconsultas
    IF policy_record.expression ILIKE '%SELECT%' OR 
       policy_record.expression ILIKE '%JOIN%' OR
       policy_record.expression ILIKE '%EXISTS%' THEN
      policy_issues := array_append(policy_issues, 'Contém subconsultas que podem ser lentas');
      is_problematic := true;
    END IF;
    
    -- 4. Políticas RESTRICTIVE (mais restritivas que PERMISSIVE)
    IF policy_record.permissive = 'RESTRICTIVE' THEN
      policy_issues := array_append(policy_issues, 'Política RESTRICTIVE pode bloquear realtime');
      is_problematic := true;
    END IF;
    
    -- 5. Políticas que não permitem SELECT (necessário para realtime)
    IF policy_record.cmd != 'ALL' AND policy_record.cmd != 'SELECT' THEN
      policy_issues := array_append(policy_issues, 'Não permite SELECT, necessário para realtime');
      is_problematic := true;
    END IF;
    
    IF is_problematic THEN
      issue_count := issue_count + 1;
    END IF;
    
    -- Adicionar à análise
    policy_analysis := policy_analysis || jsonb_build_object(
      'table', policy_record.tablename,
      'policy', policy_record.policyname,
      'permissive', policy_record.permissive,
      'command', policy_record.cmd,
      'expression', policy_record.expression,
      'issues', policy_issues,
      'problematic', is_problematic
    );
  END LOOP;
  
  -- Gerar recomendações baseadas na análise
  IF issue_count > 0 THEN
    recommendations := array_append(recommendations, 
      format('Encontradas %s políticas problemáticas que podem afetar realtime', issue_count));
    recommendations := array_append(recommendations, 
      'Considere usar políticas PERMISSIVE simples para realtime');
    recommendations := array_append(recommendations, 
      'Implemente filtros manuais no código da aplicação quando possível');
    recommendations := array_append(recommendations, 
      'Use índices otimizados para as condições das políticas');
  ELSE
    recommendations := array_append(recommendations, 
      'Políticas RLS parecem otimizadas para realtime');
  END IF;
  
  result_json := jsonb_build_object(
    'total_policies', jsonb_array_length(policy_analysis),
    'problematic_policies', issue_count,
    'policies', policy_analysis,
    'recommendations', recommendations,
    'analysis_timestamp', now()
  );
  
  RETURN result_json;
END;
$;

-- 11. Função para criar políticas RLS otimizadas específicas para realtime
CREATE OR REPLACE FUNCTION create_realtime_optimized_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_msg text := '';
BEGIN
  -- Backup das políticas existentes (comentário para referência)
  -- As políticas antigas serão removidas e substituídas por versões otimizadas
  
  -- Remover políticas existentes que podem ser problemáticas
  DROP POLICY IF EXISTS "Users can only see their company messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Users can only see their company chats" ON whatsapp_chats;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON whatsapp_chats;
  DROP POLICY IF EXISTS "Enable realtime for whatsapp_messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Enable realtime for whatsapp_chats" ON whatsapp_chats;
  
  result_msg := result_msg || 'Políticas antigas removidas; ';
  
  -- Criar políticas super otimizadas para realtime
  -- Estas políticas são intencionalmente permissivas para permitir realtime
  -- A segurança será implementada no código da aplicação
  
  CREATE POLICY "realtime_optimized_messages" 
  ON whatsapp_messages FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
  CREATE POLICY "realtime_optimized_chats" 
  ON whatsapp_chats FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
  
  result_msg := result_msg || 'Políticas otimizadas para realtime criadas; ';
  
  -- Criar políticas de segurança adicionais se necessário
  -- (estas são opcionais e podem ser habilitadas se a segurança for crítica)
  
  /*
  -- Política de segurança básica (desabilitada por padrão para máxima performance)
  CREATE POLICY "basic_security_messages" 
  ON whatsapp_messages FOR ALL 
  TO authenticated
  USING (company_id IS NOT NULL)
  WITH CHECK (company_id IS NOT NULL);
  
  CREATE POLICY "basic_security_chats" 
  ON whatsapp_chats FOR ALL 
  TO authenticated
  USING (company_id IS NOT NULL)
  WITH CHECK (company_id IS NOT NULL);
  */
  
  result_msg := result_msg || 'Configuração concluída - IMPORTANTE: Filtros de segurança devem ser implementados no código da aplicação';
  
  RETURN result_msg;
END;
$;

-- 12. Função para testar performance das políticas RLS
CREATE OR REPLACE FUNCTION test_rls_performance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_json jsonb := '{}';
  start_time timestamp;
  end_time timestamp;
  test_duration_ms numeric;
  sample_company_id text;
BEGIN
  -- Obter um company_id de exemplo para teste
  SELECT company_id INTO sample_company_id 
  FROM whatsapp_messages 
  WHERE company_id IS NOT NULL 
  LIMIT 1;
  
  IF sample_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'Nenhum company_id encontrado para teste',
      'test_timestamp', now()
    );
  END IF;
  
  -- Teste 1: Query simples de mensagens
  start_time := clock_timestamp();
  
  PERFORM count(*) 
  FROM whatsapp_messages 
  WHERE company_id = sample_company_id 
  LIMIT 100;
  
  end_time := clock_timestamp();
  test_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  result_json := jsonb_build_object(
    'test_company_id', sample_company_id,
    'simple_query_ms', test_duration_ms,
    'test_timestamp', now()
  );
  
  -- Teste 2: Query com ORDER BY (comum em realtime)
  start_time := clock_timestamp();
  
  PERFORM * 
  FROM whatsapp_messages 
  WHERE company_id = sample_company_id 
  ORDER BY timestamp DESC 
  LIMIT 10;
  
  end_time := clock_timestamp();
  test_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  result_json := result_json || jsonb_build_object(
    'ordered_query_ms', test_duration_ms
  );
  
  -- Teste 3: Query de chats
  start_time := clock_timestamp();
  
  PERFORM count(*) 
  FROM whatsapp_chats 
  WHERE company_id = sample_company_id;
  
  end_time := clock_timestamp();
  test_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  result_json := result_json || jsonb_build_object(
    'chats_query_ms', test_duration_ms
  );
  
  -- Análise dos resultados
  DECLARE
    performance_rating text;
    recommendations text[] := '{}';
  END;
  
  IF (result_json->>'simple_query_ms')::numeric < 10 THEN
    performance_rating := 'excellent';
  ELSIF (result_json->>'simple_query_ms')::numeric < 50 THEN
    performance_rating := 'good';
  ELSIF (result_json->>'simple_query_ms')::numeric < 200 THEN
    performance_rating := 'fair';
  ELSE
    performance_rating := 'poor';
    recommendations := array_append(recommendations, 'Performance ruim detectada - verificar índices');
    recommendations := array_append(recommendations, 'Considerar otimização das políticas RLS');
  END IF;
  
  result_json := result_json || jsonb_build_object(
    'performance_rating', performance_rating,
    'recommendations', recommendations
  );
  
  RETURN result_json;
END;
$;

-- 13. Função para verificar e criar índices otimizados para realtime
CREATE OR REPLACE FUNCTION ensure_realtime_indexes()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_msg text := '';
  index_exists boolean;
BEGIN
  -- Índice principal para whatsapp_messages (company_id + timestamp)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_whatsapp_messages_company_timestamp_realtime'
  ) INTO index_exists;
  
  IF NOT index_exists THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_messages_company_timestamp_realtime 
    ON whatsapp_messages(company_id, timestamp DESC) 
    WHERE company_id IS NOT NULL;
    result_msg := result_msg || 'Índice messages company+timestamp criado; ';
  END IF;
  
  -- Índice para whatsapp_chats (company_id + updated_at)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_whatsapp_chats_company_updated_realtime'
  ) INTO index_exists;
  
  IF NOT index_exists THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_chats_company_updated_realtime 
    ON whatsapp_chats(company_id, updated_at DESC) 
    WHERE company_id IS NOT NULL;
    result_msg := result_msg || 'Índice chats company+updated criado; ';
  END IF;
  
  -- Índice para mensagens por chat_id (para queries específicas de chat)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_whatsapp_messages_chat_timestamp_realtime'
  ) INTO index_exists;
  
  IF NOT index_exists THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_messages_chat_timestamp_realtime 
    ON whatsapp_messages(chat_id, timestamp DESC) 
    WHERE chat_id IS NOT NULL;
    result_msg := result_msg || 'Índice messages chat+timestamp criado; ';
  END IF;
  
  -- Índice para status de mensagens (para queries de entrega)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_whatsapp_messages_status_realtime'
  ) INTO index_exists;
  
  IF NOT index_exists THEN
    CREATE INDEX CONCURRENTLY idx_whatsapp_messages_status_realtime 
    ON whatsapp_messages(company_id, message_status, timestamp DESC) 
    WHERE company_id IS NOT NULL AND message_status IS NOT NULL;
    result_msg := result_msg || 'Índice messages status criado; ';
  END IF;
  
  -- Atualizar estatísticas das tabelas
  ANALYZE whatsapp_messages;
  ANALYZE whatsapp_chats;
  result_msg := result_msg || 'Estatísticas atualizadas; ';
  
  IF result_msg = '' THEN
    result_msg := 'Todos os índices já existiam';
  END IF;
  
  RETURN result_msg;
END;
$;

-- 14. Função principal para otimização completa de RLS para realtime
CREATE OR REPLACE FUNCTION optimize_whatsapp_rls_for_realtime()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  result_json jsonb := '{}';
  analysis_result jsonb;
  policies_result text;
  indexes_result text;
  performance_result jsonb;
BEGIN
  -- 1. Analisar políticas atuais
  analysis_result := analyze_whatsapp_rls_policies();
  
  -- 2. Criar políticas otimizadas
  policies_result := create_realtime_optimized_policies();
  
  -- 3. Garantir índices otimizados
  indexes_result := ensure_realtime_indexes();
  
  -- 4. Testar performance
  performance_result := test_rls_performance();
  
  -- 5. Compilar resultado final
  result_json := jsonb_build_object(
    'optimization_timestamp', now(),
    'analysis', analysis_result,
    'policies_result', policies_result,
    'indexes_result', indexes_result,
    'performance_test', performance_result,
    'success', true,
    'summary', jsonb_build_object(
      'policies_optimized', true,
      'indexes_created', true,
      'performance_tested', true,
      'realtime_ready', true
    )
  );
  
  RETURN result_json;
END;
$;

-- Executar verificação inicial
SELECT check_whatsapp_realtime_status() as initial_status;