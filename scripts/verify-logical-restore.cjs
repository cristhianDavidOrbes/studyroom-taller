// Read-only cloud snapshot; restore exclusively into a new local test database.
// The JSON snapshot is private data, not pg_dump and not a Storage object backup.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let Client;
try { ({ Client } = require('pg')); }
catch { ({ Client } = createRequire(process.env.STUDYROOM_PG_PACKAGE || path.resolve(root, '../work/pg-tools/package.json'))('pg')); }
const tables = ['User','Room','Membership','Message','Note','Document','Invite','Session','AiJob','Feedback','QuizAttempt','Usage','MediaGrant'];
const quote = value => '"' + value.replaceAll('"','""') + '"';
const digest = rows => crypto.createHash('sha256').update([...rows].sort().join('\n')).digest('hex');
const timestamp = new Date().toISOString();
const runId = timestamp.replaceAll(/[:.]/g,'-');
const dir = path.join(root,'.local/backups',runId);
const output = path.join(root,'docs/verification/logical-restore.json');
const report = { at:timestamp, status:'pending', format:'StudyRoom logical JSON snapshot plus versioned SQL migration; not pg_dump', source:{provider:'Supabase',schema:'public',transaction:'REPEATABLE READ READ ONLY',rlsPreserved:true}, destination:{host:'127.0.0.1',port:54322}, limitations:['Does not copy Supabase Storage object contents or Firebase accounts.','Does not replace a full database dump, provider-managed backup, PITR or production recovery exercise.'], tables:[] };
let source, admin, restored;
async function rows(client,table) { return (await client.query(`SELECT to_jsonb(t)::text AS row FROM public.${quote(table)} t`)).rows.map(item=>item.row); }
async function schema(client) { return (await client.query("SELECT table_name,column_name,ordinal_position,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1) ORDER BY table_name,ordinal_position",[tables])).rows; }
async function main() {
  const cloud = JSON.parse(fs.readFileSync(path.join(root,'.local/cloud-env.json'),'utf8'));
  const credentials = JSON.parse(fs.readFileSync(path.join(root,'.local/postgres.json'),'utf8'));
  const url = new URL(cloud.DATABASE_URL);
  for (const key of ['schema','connection_limit','sslmode','sslaccept','sslcert']) url.searchParams.delete(key);
  source = new Client({connectionString:url.toString(),ssl:{rejectUnauthorized:true,ca:fs.readFileSync(path.join(root,'apps/api/certs/supabase-ca.crt'),'utf8')},connectionTimeoutMillis:15000});
  await source.connect();
  await source.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  await source.query("SET LOCAL TIME ZONE 'UTC'");
  await source.query("SET LOCAL statement_timeout = '30s'");
  const role = (await source.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];
  assert.equal(role.rolsuper,false);assert.equal(role.rolbypassrls,false);
  const rls = (await source.query("SELECT relname,relrowsecurity FROM pg_class JOIN pg_namespace ON pg_namespace.oid=relnamespace WHERE nspname='public' AND relname=ANY($1)",[tables])).rows;
  assert.equal(rls.length,13);assert.ok(rls.every(item=>item.relrowsecurity));
  const snapshot = {at:timestamp,schema:await schema(source),tables:{}};
  for (const table of tables) snapshot.tables[table] = await rows(source,table);
  await source.query('COMMIT');await source.end();source=null;
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  if(process.platform==='win32') {
    const identity=execFileSync('whoami.exe',[],{encoding:'utf8',windowsHide:true}).trim();
    execFileSync('icacls.exe',[dir,'/inheritance:r','/grant:r',`${identity}:(OI)(CI)F`],{stdio:'ignore',windowsHide:true});
  }
  fs.writeFileSync(path.join(dir,'snapshot.json'),JSON.stringify(snapshot),{mode:0o600});
  const migrationPath=path.join(root,'apps/api/supabase/migrations/20261002050007_studyroom_initial.sql');
  const migration=fs.readFileSync(migrationPath,'utf8');
  fs.writeFileSync(path.join(dir,'schema.sql'),migration,{mode:0o600});
  report.backup={localPath:path.relative(root,dir).replaceAll('\\','/'),private:true,schemaSha256:crypto.createHash('sha256').update(migration).digest('hex')};
  admin=new Client({host:'127.0.0.1',port:54322,user:'postgres',password:credentials.password,database:'postgres',connectionTimeoutMillis:10000});await admin.connect();
  let database='studyroom_restore_test';
  if((await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[database])).rowCount) database+='_'+crypto.randomBytes(5).toString('hex');
  assert.match(database,/^studyroom_restore_test(?:_[a-f0-9]{10})?$/);
  await admin.query(`CREATE DATABASE ${quote(database)}`);
  report.destination.database=database;await admin.end();admin=null;
  restored=new Client({host:'127.0.0.1',port:54322,user:'postgres',password:credentials.password,database,connectionTimeoutMillis:10000});await restored.connect();
  await restored.query("SET TIME ZONE 'UTC'");
  await restored.query('BEGIN');
  assert.equal((await restored.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n,0);
  await restored.query(migration);
  assert.deepEqual(await schema(restored),snapshot.schema);
  // Parent tables precede foreign keys; constraints stay enabled for every insertion.
  for (const table of tables) {
    const data=snapshot.tables[table];
    if(data.length)await restored.query(`INSERT INTO public.${quote(table)} SELECT * FROM json_populate_recordset(NULL::public.${quote(table)},$1::json)`,['['+data.join(',')+']']);
    const actual=await rows(restored,table);
    assert.equal(actual.length,data.length,`${table}: row count`);
    assert.equal(digest(actual),digest(data),`${table}: content digest`);
    report.tables.push({name:table,sourceRows:data.length,restoredRows:actual.length,sha256:digest(actual),matched:true});
  }
  const constraints=await restored.query("SELECT count(*)::int AS n,bool_and(convalidated) AS validated FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace");
  assert.ok(constraints.rows[0].n>=8);assert.equal(constraints.rows[0].validated,true);
  const privacy=await restored.query("SELECT bool_and(relrowsecurity) AS rls FROM pg_class JOIN pg_namespace ON pg_namespace.oid=relnamespace WHERE nspname='public' AND relname=ANY($1)",[tables]);
  assert.equal(privacy.rows[0].rls,true);
  await restored.query('COMMIT');
  report.foreignKeys={count:constraints.rows[0].n,validated:true};
  report.restoredRlsEnabled=true;report.sourceRoleBypassesRls=false;
  report.status='passed';
}
main().catch(async error=>{
  report.status='failed';report.errorCode=String(error.code||'RESTORE_VALIDATION_FAILED');
  // Database messages can include row contents, URLs or identifiers: do not print them.
  console.error('No se completó la validación de respaldo/restauración. Código:',report.errorCode);
  process.exitCode=1;
}).finally(async()=>{
  await Promise.allSettled([source?.end(),admin?.end(),restored?.end()]);
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,tablesVerified:report.tables.length,rowsVerified:report.tables.reduce((sum,table)=>sum+table.restoredRows,0),evidence:'docs/verification/logical-restore.json'}));
});
