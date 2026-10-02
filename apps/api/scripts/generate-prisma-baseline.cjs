// One-time recovery for the initial migration already executed by an admin.
// Prefer `prisma migrate resolve --applied` whenever a migrator connection exists.
const { readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { resolve } = require('node:path');
const name = '20261002050007_studyroom_initial';
const source = readFileSync(resolve(__dirname, '../prisma/migrations', name, 'migration.sql'));
const checksum = createHash('sha256').update(source).digest('hex');
if (checksum !== '216f3d6e06c4ff0fa1bc8732091645921b6fc3c689a1cd9847c502fe9ce08b25') {
  throw new Error('Initial migration differs from the reviewed baseline. Do not mark it applied.');
}
const sql = source.toString('utf8');
const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
const tables = [...sql.matchAll(/CREATE TABLE "([^"]+)" \(([\s\S]+?)\n\);/g)];
const columns = tables.flatMap(([, table, body]) => [...body.matchAll(/^\s+"([^"]+)" (TEXT\[\]|TEXT|TIMESTAMP\(3\)|INTEGER|BIGINT|BOOLEAN|JSONB)([^\n]*)/gm)].map(([, column, type, tail]) => {
  const canonical = type === 'TIMESTAMP(3)' ? 'timestamp(3) without time zone' : type.toLowerCase();
  return `(${quote(table)},${quote(column)},${quote(canonical)},${tail.includes('NOT NULL')})`;
}));
const constraints = [...sql.matchAll(/CONSTRAINT (?:"([^"]+)"|(\w+)) /g)].map((m) => m[1] || m[2]);
const indexes = [...sql.matchAll(/CREATE (?:UNIQUE )?INDEX "([^"]+)"/g)].map((m) => m[1]);
if (tables.length !== 13 || columns.length < 100) throw new Error('Unexpected migration structure');
const output = `-- Generated from the exact committed LF bytes by generate-prisma-baseline.cjs.
-- SHA256 ${checksum}
-- ADMIN ONLY. This does not execute the application migration or change its rows.
-- Run after confirming the initial migration was fully applied. No runtime credentials.
BEGIN;
SELECT pg_advisory_xact_lock(735862042);
DO $baseline$
DECLARE item record; actual_type text; actual_notnull boolean; item_name text;
BEGIN
  FOR item_name IN SELECT unnest(ARRAY[${tables.map((m) => quote(m[1])).join(',')}]) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=to_regclass(format('public.%I', item_name)) AND relrowsecurity) THEN
      RAISE EXCEPTION 'Baseline rejected: missing table or RLS: %', item_name;
    END IF;
  END LOOP;
  FOR item IN SELECT * FROM (VALUES
${columns.join(',\n')}
  ) AS expected(table_name,column_name,type_name,not_null) LOOP
    SELECT format_type(a.atttypid,a.atttypmod), a.attnotnull INTO actual_type,actual_notnull
      FROM pg_attribute a WHERE a.attrelid=to_regclass(format('public.%I',item.table_name)) AND a.attname=item.column_name AND NOT a.attisdropped;
    IF actual_type IS DISTINCT FROM item.type_name OR actual_notnull IS DISTINCT FROM item.not_null THEN
      RAISE EXCEPTION 'Baseline rejected: column mismatch %.%', item.table_name,item.column_name;
    END IF;
  END LOOP;
  FOR item_name IN SELECT unnest(ARRAY[${constraints.map(quote).join(',')}]) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND c.conname=item_name) THEN
      RAISE EXCEPTION 'Baseline rejected: missing constraint %', item_name;
    END IF;
  END LOOP;
  FOR item_name IN SELECT unnest(ARRAY[${indexes.map(quote).join(',')}]) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=to_regclass(format('public.%I', item_name)) AND relkind='i') THEN
      RAISE EXCEPTION 'Baseline rejected: missing index %', item_name;
    END IF;
  END LOOP;
END $baseline$;
CREATE TABLE IF NOT EXISTS public._prisma_migrations (
  id varchar(36) PRIMARY KEY NOT NULL,
  checksum varchar(64) NOT NULL,
  finished_at timestamptz,
  migration_name varchar(255) NOT NULL,
  logs text,
  rolled_back_at timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  applied_steps_count integer NOT NULL DEFAULT 0
);
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public._prisma_migrations FROM PUBLIC;
DO $baseline$
DECLARE role_name text;
BEGIN
  FOR role_name IN SELECT unnest(ARRAY['anon','authenticated','studyroom_api']) LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=role_name) THEN
      EXECUTE format('REVOKE ALL ON TABLE public._prisma_migrations FROM %I',role_name);
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM public._prisma_migrations WHERE migration_name=${quote(name)} AND (checksum<>${quote(checksum)} OR rolled_back_at IS NOT NULL OR finished_at IS NULL)) THEN
    RAISE EXCEPTION 'Existing migration history conflicts; inspect it before resolving';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public._prisma_migrations WHERE migration_name=${quote(name)}) THEN
    INSERT INTO public._prisma_migrations(id,checksum,finished_at,migration_name,logs,applied_steps_count)
      VALUES ('46c7ec1c-5715-4aa5-a791-37d4cdd9a253',${quote(checksum)},now(),${quote(name)},'Baseline: existing schema applied through authenticated Supabase management SQL and verified before registration.',0);
  END IF;
END $baseline$;
COMMIT;
`;
const destination = resolve(__dirname, '../prisma/baseline-existing.sql');
writeFileSync(destination, output);
console.log(JSON.stringify({ file: destination, checksum, tables: tables.length, columns: columns.length, constraints: constraints.length, indexes: indexes.length }));
