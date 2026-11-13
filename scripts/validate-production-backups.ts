import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\backups\\production_gpqbppjqqndzuvksrtjb';
const schemaPath = path.join(dir, 'production_schema_2026-11-13T06-57-10-680Z.sql');
const dataPath = path.join(dir, 'production_data_2026-11-13T06-57-10-680Z.sql');
const rolesPath = path.join(dir, 'production_roles_2026-11-13T06-57-10-680Z.sql');

console.log('=== VALIDATING PRODUCTION BACKUP ARTIFACTS ===\n');

// 1. Schema Analysis
const schema = fs.readFileSync(schemaPath, 'utf8');
const schemaLines = schema.split('\n');
console.log('1. SCHEMA DUMP AUDIT:');
console.log(`   File size: ${fs.statSync(schemaPath).size} bytes (${schemaLines.length} lines)`);
const tableMatches = [...schema.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?"?public"?\.?"?([a-zA-Z0-9_]+)"?/g)].map((m) => m[1]);
const uniqueTables = [...new Set(tableMatches)];
console.log('   Tables in public schema:', uniqueTables);

const funcMatches = [...schema.matchAll(/CREATE (?:OR REPLACE )?FUNCTION "?public"?\.?"?([a-zA-Z0-9_]+)"?/g)].map((m) => m[1]);
console.log('   Functions in public schema:', [...new Set(funcMatches)]);

const policyMatches = [...schema.matchAll(/CREATE POLICY "([^"]+)" ON "?public"?\.?"?([a-zA-Z0-9_]+)"?/g)].map((m) => `${m[2]}: "${m[1]}"`);
console.log(`   RLS Policies count: ${policyMatches.length}`);

// 2. Data Analysis
const data = fs.readFileSync(dataPath, 'utf8');
const dataLines = data.split('\n');
console.log('\n2. DATA DUMP AUDIT:');
console.log(`   File size: ${fs.statSync(dataPath).size} bytes (${dataLines.length} lines)`);
const copyMatches = [...data.matchAll(/COPY "?public"?\.?"?([a-zA-Z0-9_]+)"?[^;]*FROM stdin;/g)].map((m) => m[1]);
console.log('   Tables with COPY data streams:', copyMatches);

// 4. Data Verification Detail
console.log('\n4. DETAIL DATA RECORD CHECKS:');
const citiesPart = data.split('COPY "public"."cities"')[1]?.split('\\.')[0];
console.log('   Cities registered:', citiesPart?.trim().split('\n').map((l) => l.split('\t')[0]));

const rolesPart = data.split('COPY "public"."user_roles"')[1]?.split('\\.')[0];
const rolesLines = rolesPart?.trim().split('\n') || [];
console.log(`   User roles records count: ${rolesLines.length}`);

const busPart = data.split('COPY "public"."businesses"')[1]?.split('\\.')[0];
const busLines = busPart?.trim().split('\n') || [];
console.log(`   Businesses records count: ${busLines.length}`);

const enqPart = data.split('COPY "public"."customer_enquiries"')[1]?.split('\\.')[0];
const enqLines = enqPart?.trim().split('\n') || [];
console.log(`   Customer enquiries records count: ${enqLines.length}`);

