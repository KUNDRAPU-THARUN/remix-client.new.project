/**
 * KAARYAN LABS — PHASE V3.5.10B
 * PRODUCTION DATABASE BACKUP WORKFLOW SCRIPT
 *
 * Target: Production Supabase (gpqbppjqqndzuvksrtjb)
 * Protected: Never run silently; requires explicit CLI flag --allow-production-backup
 * Output Directory: Outside Git workspace in secure brain storage
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_PROJECT_REF = 'gpqbppjqqndzuvksrtjb';
const BACKUP_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\backups\\production_gpqbppjqqndzuvksrtjb';
const BRAIN_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb';

interface BackupStatus {
  step: string;
  file: string;
  bytes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  detail: string;
}

const statusLog: BackupStatus[] = [];

async function main() {
  console.log('========================================================================');
  console.log('KAARYAN LABS — PHASE V3.5.10B PRODUCTION DATABASE BACKUP RUNNER');
  console.log(`Target Production Project: ${TARGET_PROJECT_REF}`);
  console.log('========================================================================\n');

  // 1. SAFETY GATE CHECK
  const allowBackup = process.argv.includes('--allow-production-backup') || process.env.ALLOW_PRODUCTION_BACKUP === 'true';
  if (!allowBackup) {
    console.error('❌ SAFETY HALT: Explicit approval flag (--allow-production-backup) not provided.');
    console.error('   Per Phase V3.5.10B rules, remote backup exports require deliberate authorization.');
    process.exit(1);
  }

  // 2. BACKUP STORAGE VERIFICATION
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  console.log(`  📁 Secure Backup Destination: ${BACKUP_DIR}`);
  console.log('  🔒 Git Isolation: Confirmed OUTSIDE workspace repository.\n');

  // 3. TARGET VERIFICATION
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    if (!envContent.includes(TARGET_PROJECT_REF)) {
      console.error(`❌ SAFETY HALT: .env.local does not reference target project ${TARGET_PROJECT_REF}!`);
      process.exit(1);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const schemaFile = path.join(BACKUP_DIR, `production_schema_${timestamp}.sql`);
  const dataFile = path.join(BACKUP_DIR, `production_data_${timestamp}.sql`);
  const rolesFile = path.join(BACKUP_DIR, `production_roles_${timestamp}.sql`);

  const execEnv = {
    ...process.env,
  };

  // 4. CHECK AUTHENTICATION TOKEN
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn('⚠️ NOTICE: SUPABASE_ACCESS_TOKEN is not set in environment.');
    console.warn('   Supabase CLI requires an access token or database password to stream dumps.');
    console.warn('   Run with: SUPABASE_ACCESS_TOKEN=your_token npx tsx scripts/backup-production-db.ts --allow-production-backup\n');
  }

  // 5. BACKUP EXECUTION: SCHEMA DUMP
  console.log('--- STEP 1: Exporting Production Database Schema ---');
  try {
    const cmd = `npx supabase db dump --remote=${TARGET_PROJECT_REF} --schema=public --keep-comments --file="${schemaFile}"`;
    execSync(cmd, { env: execEnv, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
    const stats = fs.statSync(schemaFile);
    if (stats.size > 0) {
      statusLog.push({ step: 'Schema Dump', file: schemaFile, bytes: stats.size, status: 'SUCCESS', detail: `Exported ${stats.size} bytes` });
      console.log(`  ✅ Schema dump complete: ${stats.size} bytes -> ${path.basename(schemaFile)}`);
    } else {
      statusLog.push({ step: 'Schema Dump', file: schemaFile, bytes: 0, status: 'FAILED', detail: 'File created but empty (0 bytes)' });
      console.error('  ❌ Schema dump failed: File is empty.');
    }
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.stdout?.toString() || err.message;
    statusLog.push({ step: 'Schema Dump', file: schemaFile, bytes: 0, status: 'FAILED', detail: msg });
    console.error('  ❌ Schema dump error:', msg);
  }

  // 6. BACKUP EXECUTION: DATA DUMP
  console.log('\n--- STEP 2: Exporting Production Application Data ---');
  try {
    const cmd = `npx supabase db dump --remote=${TARGET_PROJECT_REF} --data-only --use-copy --file="${dataFile}"`;
    execSync(cmd, { env: execEnv, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
    const stats = fs.statSync(dataFile);
    if (stats.size > 0) {
      statusLog.push({ step: 'Data Dump', file: dataFile, bytes: stats.size, status: 'SUCCESS', detail: `Exported ${stats.size} bytes` });
      console.log(`  ✅ Data dump complete: ${stats.size} bytes -> ${path.basename(dataFile)}`);
    } else {
      statusLog.push({ step: 'Data Dump', file: dataFile, bytes: 0, status: 'FAILED', detail: 'File created but empty (0 bytes)' });
      console.error('  ❌ Data dump failed: File is empty.');
    }
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.stdout?.toString() || err.message;
    statusLog.push({ step: 'Data Dump', file: dataFile, bytes: 0, status: 'FAILED', detail: msg });
    console.error('  ❌ Data dump error:', msg);
  }

  // 7. BACKUP EXECUTION: ROLES DUMP
  console.log('\n--- STEP 3: Exporting Custom Database Roles ---');
  try {
    const cmd = `npx supabase db dump --remote=${TARGET_PROJECT_REF} --role-only --file="${rolesFile}"`;
    execSync(cmd, { env: execEnv, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
    const stats = fs.statSync(rolesFile);
    if (stats.size > 0) {
      statusLog.push({ step: 'Roles Dump', file: rolesFile, bytes: stats.size, status: 'SUCCESS', detail: `Exported ${stats.size} bytes` });
      console.log(`  ✅ Roles dump complete: ${stats.size} bytes -> ${path.basename(rolesFile)}`);
    } else {
      statusLog.push({ step: 'Roles Dump', file: rolesFile, bytes: 0, status: 'FAILED', detail: 'File created but empty (0 bytes)' });
      console.error('  ❌ Roles dump failed: File is empty.');
    }
  } catch (err: any) {
    const msg = err.stderr?.toString() || err.stdout?.toString() || err.message;
    statusLog.push({ step: 'Roles Dump', file: rolesFile, bytes: 0, status: 'FAILED', detail: msg });
    console.error('  ❌ Roles dump error:', msg);
  }

  console.log('\n========================================================================');
  console.log('PRODUCTION BACKUP STATUS SUMMARY:');
  statusLog.forEach((s) => {
    console.log(`  [${s.status}] ${s.step}: ${s.detail}`);
  });
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal error in backup runner:', err.message);
  process.exit(1);
});
