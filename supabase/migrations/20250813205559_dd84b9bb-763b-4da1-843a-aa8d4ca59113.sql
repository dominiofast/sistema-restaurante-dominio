-- Realizar sync do assistant via HTTP
SELECT
  public.http_post(
    'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/sync-assistant',
    '{"company_id": "11e10dba-8ed0-47fc-91f5-bc88f2aef4ca", "slug": "300graus"}',
    'application/json'
  );