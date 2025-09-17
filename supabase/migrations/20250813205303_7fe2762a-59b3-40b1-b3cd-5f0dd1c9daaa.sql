-- Chamar sync-assistant para a 300graus
SELECT pg_notify('sync-assistant', '{"company_id": "11e10dba-8ed0-47fc-91f5-bc88f2aef4ca", "slug": "300graus"}');