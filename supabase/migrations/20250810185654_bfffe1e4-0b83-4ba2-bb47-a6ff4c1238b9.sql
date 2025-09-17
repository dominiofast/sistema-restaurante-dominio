-- Create/refresh pg_cron schedule to invoke the processor every minute
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-whatsapp-campaigns-every-minute') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'process-whatsapp-campaigns-every-minute'));
  END IF;

  PERFORM cron.schedule(
    'process-whatsapp-campaigns-every-minute',
    '* * * * *',
    $cron$
    select net.http_post(
      url:='https://epqppxteicfuzdblbluq.supabase.co/functions/v1/process-whatsapp-campaigns',
      headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTYwNjAsImV4cCI6MjA2NTY3MjA2MH0.rzwsy0eSZgIZ1Ia3ZU-mapEhgCSuwFsaJNXL-XshfHg"}'::jsonb,
      body:='{"limit":100}'::jsonb
    );
    $cron$
  );
END
$do$;