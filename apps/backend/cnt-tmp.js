const { Client } = require('pg');
const cfg = {
  connectionString: 'postgresql://postgres.zoqqlmclbcclzmejcmiu:ykbWrbUzIQhfJxgJ@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=15',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
};
(async () => {
  for (let a = 1; a <= 5; a++) {
    const c = new Client(cfg);
    c.on('error', () => {});
    try {
      await c.connect();
      const r = await c.query('SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active) AS active FROM free_vpn_configs');
      console.log('TOTAL: ' + r.rows[0].total + ' ACTIVE: ' + r.rows[0].active);
      const s = await c.query('SELECT COUNT(*) AS c FROM sub_links');
      console.log('SUB_LINKS: ' + s.rows[0].c);
      await c.end().catch(() => {});
      return;
    } catch (e) {
      await c.end().catch(() => {});
      if (a === 5) { console.log('ERR', e.message); process.exit(1); }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
})();
