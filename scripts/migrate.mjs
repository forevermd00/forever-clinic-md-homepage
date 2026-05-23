// Run: node scripts/migrate.mjs
import postgres from 'postgres';

// !! → %21%21 URL 인코딩
const sql = postgres('postgresql://postgres.nkvlfhlzprtpbckawcdk:forevermd0523__@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  prepare: false,
  ssl: 'require',
});

try {
  await sql`
    CREATE TABLE IF NOT EXISTS phone_verification_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log('✓ phone_verification_codes');

  await sql`
    CREATE TABLE IF NOT EXISTS sms_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      phone TEXT NOT NULL,
      status TEXT NOT NULL,
      nhn_result_code TEXT,
      nhn_result_message TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log('✓ sms_logs');

  await sql`
    CREATE TABLE IF NOT EXISTS keepalive_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL DEFAULT 'cron',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log('✓ keepalive_logs');

  await sql.end();
  console.log('Done.');
} catch (err) {
  console.error('Migration failed:', err.message);
  await sql.end().catch(() => {});
  process.exit(1);
}
