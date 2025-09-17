-- Testar manualmente a criação do usuário admin para Quadrata Pizzas
DO $$
DECLARE
  function_response record;
  company_data record;
BEGIN
  -- Buscar dados da empresa
  SELECT id, name, domain INTO company_data 
  FROM companies 
  WHERE name = 'Quadrata Pizzas';
  
  IF FOUND THEN
    BEGIN
      SELECT INTO function_response http_post(
          'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/create-company-admin',
          json_build_object(
              'company_id', company_data.id,
              'company_domain', company_data.domain,
              'company_name', company_data.name
          )::text,
          'application/json',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.lP4bx7GhWQaV6JXYq1U2r5g7xT9LGdYE8hXqQBLDJgM'
      );

      -- Log da resposta
      INSERT INTO public.import_logs (
          company_id,
          status,
          source_url,
          items_imported,
          error_message
      ) VALUES (
          company_data.id,
          'manual_admin_creation_test',
          'create-company-admin',
          1,
          'Teste manual - HTTP status: ' || function_response.status || ' - Resposta: ' || function_response.content
      );
      
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.import_logs (
          company_id,
          status,
          source_url,
          items_imported,
          error_message
      ) VALUES (
          company_data.id,
          'manual_admin_creation_error',
          'create-company-admin',
          0,
          'Erro no teste manual: ' || SQLERRM
      );
    END;
  END IF;
END;
$$;