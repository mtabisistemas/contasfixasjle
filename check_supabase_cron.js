const SUPABASE_URL = "https://vvbekmpzfznrfbhmxwah.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmVrbXB6ZnpucmZiaG14d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA0NTExMSwiZXhwIjoyMTAxNjIxMTExfQ.KUICQoXFJWOaqLqgV7kx6FesCT0OudpUmO-FB7Yrsbo";

async function listCronJobs() {
    // Verificar Supabase scheduled functions (pg_cron jobs)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cron_jobs?select=*`, {
        headers: {
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`
        }
    });
    console.log("Status cron_jobs:", res.status, res.statusText);
    if (res.ok) {
        const data = await res.json();
        console.log("Cron jobs:", JSON.stringify(data, null, 2));
    }
}

async function checkScheduledNotifications() {
    // Verificar tabela de notificações agendadas
    const tables = ['notificacoes', 'scheduled_notifications', 'telegram_schedules', 'contas_agendamentos'];
    for (const table of tables) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=5`, {
            headers: {
                "apikey": SERVICE_KEY,
                "Authorization": `Bearer ${SERVICE_KEY}`
            }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`Tabela '${table}' existe:`, data.length, "registros");
        } else {
            console.log(`Tabela '${table}': ${res.status} (não existe ou sem acesso)`);
        }
    }
}

listCronJobs();
checkScheduledNotifications();
