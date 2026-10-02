-- Generated from the exact committed LF bytes by generate-prisma-baseline.cjs.
-- SHA256 216f3d6e06c4ff0fa1bc8732091645921b6fc3c689a1cd9847c502fe9ce08b25
-- ADMIN ONLY. This does not execute the application migration or change its rows.
-- Run after confirming the initial migration was fully applied. No runtime credentials.
BEGIN;
SELECT pg_advisory_xact_lock(735862042);
DO $baseline$
DECLARE item record; actual_type text; actual_notnull boolean; item_name text;
BEGIN
  FOR item_name IN SELECT unnest(ARRAY['User','Room','Membership','Message','Note','Document','Invite','Session','AiJob','Feedback','QuizAttempt','Usage','MediaGrant']) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=to_regclass(format('public.%I', item_name)) AND relrowsecurity) THEN
      RAISE EXCEPTION 'Baseline rejected: missing table or RLS: %', item_name;
    END IF;
  END LOOP;
  FOR item IN SELECT * FROM (VALUES
('User','id','text',true),
('User','email','text',true),
('User','displayName','text',true),
('User','bio','text',true),
('User','interests','text[]',false),
('User','level','text',true),
('User','notifications','jsonb',true),
('User','onboarded','boolean',true),
('User','createdAt','timestamp(3) without time zone',true),
('User','updatedAt','timestamp(3) without time zone',true),
('Room','id','text',true),
('Room','title','text',true),
('Room','description','text',true),
('Room','subject','text',true),
('Room','modality','text',true),
('Room','level','text',true),
('Room','privacy','text',true),
('Room','accessHash','text',false),
('Room','capacity','integer',true),
('Room','scheduledAt','timestamp(3) without time zone',false),
('Room','durationMinutes','integer',true),
('Room','status','text',true),
('Room','hostId','text',true),
('Room','timer','jsonb',true),
('Room','annotations','jsonb',true),
('Room','createdAt','timestamp(3) without time zone',true),
('Room','updatedAt','timestamp(3) without time zone',true),
('Membership','id','text',true),
('Membership','roomId','text',true),
('Membership','userId','text',true),
('Membership','role','text',true),
('Membership','active','boolean',true),
('Membership','banned','boolean',true),
('Membership','handRaised','boolean',true),
('Membership','joinedAt','timestamp(3) without time zone',true),
('Membership','leftAt','timestamp(3) without time zone',false),
('Message','id','text',true),
('Message','roomId','text',true),
('Message','userId','text',true),
('Message','displayName','text',true),
('Message','text','text',true),
('Message','kind','text',true),
('Message','clientId','text',true),
('Message','createdAt','timestamp(3) without time zone',true),
('Note','id','text',true),
('Note','roomId','text',true),
('Note','userId','text',true),
('Note','text','text',true),
('Note','updatedAt','timestamp(3) without time zone',true),
('Document','id','text',true),
('Document','roomId','text',true),
('Document','name','text',true),
('Document','mimeType','text',true),
('Document','size','integer',true),
('Document','path','text',true),
('Document','uploadedBy','text',true),
('Document','extractedText','text',true),
('Document','createdAt','timestamp(3) without time zone',true),
('Invite','id','text',true),
('Invite','roomId','text',true),
('Invite','tokenHash','text',true),
('Invite','expiresAt','timestamp(3) without time zone',true),
('Invite','createdAt','timestamp(3) without time zone',true),
('Session','id','text',true),
('Session','roomId','text',true),
('Session','title','text',true),
('Session','startedAt','timestamp(3) without time zone',true),
('Session','endedAt','timestamp(3) without time zone',false),
('Session','participantIds','text[]',false),
('Session','context','jsonb',true),
('AiJob','id','text',true),
('AiJob','roomId','text',true),
('AiJob','sessionId','text',false),
('AiJob','userId','text',true),
('AiJob','kind','text',true),
('AiJob','status','text',true),
('AiJob','priority','integer',true),
('AiJob','payload','jsonb',true),
('AiJob','result','jsonb',false),
('AiJob','error','text',false),
('AiJob','attempts','integer',true),
('AiJob','availableAt','timestamp(3) without time zone',true),
('AiJob','leaseUntil','timestamp(3) without time zone',false),
('AiJob','leaseOwner','text',false),
('AiJob','idempotencyKey','text',true),
('AiJob','shared','boolean',true),
('AiJob','createdAt','timestamp(3) without time zone',true),
('AiJob','updatedAt','timestamp(3) without time zone',true),
('Feedback','id','text',true),
('Feedback','jobId','text',true),
('Feedback','userId','text',true),
('Feedback','rating','integer',true),
('Feedback','reason','text',false),
('Feedback','createdAt','timestamp(3) without time zone',true),
('QuizAttempt','id','text',true),
('QuizAttempt','sessionId','text',true),
('QuizAttempt','userId','text',true),
('QuizAttempt','answers','jsonb',true),
('QuizAttempt','score','integer',true),
('QuizAttempt','total','integer',true),
('QuizAttempt','createdAt','timestamp(3) without time zone',true),
('Usage','id','text',true),
('Usage','ngrokRequests','integer',true),
('Usage','ngrokBytes','bigint',true),
('Usage','participantMinutes','integer',true),
('Usage','mediaBytes','bigint',true),
('Usage','storageEgress','bigint',true),
('Usage','updatedAt','timestamp(3) without time zone',true),
('MediaGrant','id','text',true),
('MediaGrant','roomId','text',true),
('MediaGrant','userId','text',true),
('MediaGrant','reservedMinutes','integer',true),
('MediaGrant','reservedBytes','bigint',true),
('MediaGrant','startedAt','timestamp(3) without time zone',true),
('MediaGrant','expiresAt','timestamp(3) without time zone',true)
  ) AS expected(table_name,column_name,type_name,not_null) LOOP
    SELECT format_type(a.atttypid,a.atttypmod), a.attnotnull INTO actual_type,actual_notnull
      FROM pg_attribute a WHERE a.attrelid=to_regclass(format('public.%I',item.table_name)) AND a.attname=item.column_name AND NOT a.attisdropped;
    IF actual_type IS DISTINCT FROM item.type_name OR actual_notnull IS DISTINCT FROM item.not_null THEN
      RAISE EXCEPTION 'Baseline rejected: column mismatch %.%', item.table_name,item.column_name;
    END IF;
  END LOOP;
  FOR item_name IN SELECT unnest(ARRAY['User_pkey','Room_pkey','Membership_pkey','Message_pkey','Note_pkey','Document_pkey','Invite_pkey','Session_pkey','AiJob_pkey','Feedback_pkey','QuizAttempt_pkey','Usage_pkey','MediaGrant_pkey','Membership_roomId_fkey','Membership_userId_fkey','Message_roomId_fkey','Document_roomId_fkey','Session_roomId_fkey','AiJob_sessionId_fkey','Feedback_jobId_fkey','QuizAttempt_sessionId_fkey','room_capacity_bounds','room_privacy_values','room_status_values','membership_role_values','feedback_rating_values','document_size_bounds','job_status_values']) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND c.conname=item_name) THEN
      RAISE EXCEPTION 'Baseline rejected: missing constraint %', item_name;
    END IF;
  END LOOP;
  FOR item_name IN SELECT unnest(ARRAY['Room_status_scheduledAt_idx','Room_subject_level_modality_idx','Room_hostId_idx','Membership_userId_active_idx','Membership_roomId_active_idx','Membership_roomId_userId_key','Message_roomId_createdAt_idx','Message_roomId_userId_clientId_key','Note_roomId_userId_key','Document_path_key','Document_roomId_createdAt_idx','Invite_tokenHash_key','Invite_roomId_idx','Session_roomId_idx','AiJob_idempotencyKey_key','AiJob_status_availableAt_priority_idx','AiJob_userId_createdAt_idx','AiJob_roomId_idx','Feedback_jobId_userId_key','QuizAttempt_userId_sessionId_idx','MediaGrant_expiresAt_idx','MediaGrant_roomId_userId_key']) LOOP
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
  IF EXISTS (SELECT 1 FROM public._prisma_migrations WHERE migration_name='20261002050007_studyroom_initial' AND (checksum<>'216f3d6e06c4ff0fa1bc8732091645921b6fc3c689a1cd9847c502fe9ce08b25' OR rolled_back_at IS NOT NULL OR finished_at IS NULL)) THEN
    RAISE EXCEPTION 'Existing migration history conflicts; inspect it before resolving';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public._prisma_migrations WHERE migration_name='20261002050007_studyroom_initial') THEN
    INSERT INTO public._prisma_migrations(id,checksum,finished_at,migration_name,logs,applied_steps_count)
      VALUES ('46c7ec1c-5715-4aa5-a791-37d4cdd9a253','216f3d6e06c4ff0fa1bc8732091645921b6fc3c689a1cd9847c502fe9ce08b25',now(),'20261002050007_studyroom_initial','Baseline: existing schema applied through authenticated Supabase management SQL and verified before registration.',0);
  END IF;
END $baseline$;
COMMIT;
