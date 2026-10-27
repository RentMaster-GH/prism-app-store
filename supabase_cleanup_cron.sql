-- Run after deploying function
SELECT cron.schedule('cleanup-deleted-apps','0 3 * * *', \$\$ SELECT net.http_post(url:='https://YOUR_PROJECT.supabase.co/functions/v1/cleanup',headers:='{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb); \$\$);
