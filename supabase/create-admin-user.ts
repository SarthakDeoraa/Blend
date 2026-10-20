/**
 * Creates the Blend Admin user in Supabase Authentication.
 * Run once: npx tsx supabase/create-admin-user.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Load .env.local ────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

const SUPABASE_URL = process.env['VITE_SUPABASE_URL'] || '';
const SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Use the service-role client — this bypasses RLS and can create users
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Admin credentials — change these before running ────────────────────────
const ADMIN_EMAIL = 'admin@blenddecor.com';
const ADMIN_PASSWORD = 'Blend@2026!';

async function main() {
  console.log('🔐  Creating Blend Admin user in Supabase Auth...\n');

  // Check if user already exists by listing users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('❌  Could not list users:', listErr.message);
    process.exit(1);
  }

  const existing = users.find((u) => u.email === ADMIN_EMAIL);
  if (existing) {
    console.log(`ℹ️   User already exists: ${ADMIN_EMAIL}`);
    console.log(`    ID: ${existing.id}`);

    // Update password in case it changed
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (updateErr) {
      console.error('❌  Failed to update password:', updateErr.message);
    } else {
      console.log('✅  Password updated successfully.\n');
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Skip email verification
      user_metadata: { role: 'admin', display_name: 'Blend Studio Admin' },
    });

    if (error) {
      console.error('❌  Failed to create user:', error.message);
      process.exit(1);
    }

    console.log('✅  Admin user created!\n');
    console.log(`    Email   : ${data.user?.email}`);
    console.log(`    ID      : ${data.user?.id}`);
  }

  console.log('\n────────────────────────────────────────────');
  console.log('  Login credentials for the Admin Portal:');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('  URL      : http://localhost:5173/admin/login');
  console.log('────────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
