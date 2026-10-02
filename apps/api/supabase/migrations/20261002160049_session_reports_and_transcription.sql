BEGIN;
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "extractionError" TEXT,
ADD COLUMN     "extractionStatus" TEXT NOT NULL DEFAULT 'text';

-- CreateTable
CREATE TABLE "TranscriptionConsent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledSince" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptionConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptionBatch" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "audioHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranscriptionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startMs" INTEGER NOT NULL,
    "endMs" INTEGER NOT NULL,
    "words" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionDocument" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL DEFAULT '',
    "extractionStatus" TEXT NOT NULL DEFAULT 'text',
    "extractionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptionConsent_sessionId_userId_key" ON "TranscriptionConsent"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "TranscriptionBatch_sessionId_startMs_idx" ON "TranscriptionBatch"("sessionId", "startMs");

-- CreateIndex
CREATE INDEX "TranscriptionBatch_status_createdAt_idx" ON "TranscriptionBatch"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptionBatch_sessionId_userId_clientId_key" ON "TranscriptionBatch"("sessionId", "userId", "clientId");

-- CreateIndex
CREATE INDEX "TranscriptSegment_sessionId_startMs_idx" ON "TranscriptSegment"("sessionId", "startMs");

-- CreateIndex
CREATE INDEX "SessionDocument_sessionId_createdAt_idx" ON "SessionDocument"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionDocument_sessionId_documentId_key" ON "SessionDocument"("sessionId", "documentId");

-- AddForeignKey
ALTER TABLE "TranscriptionConsent" ADD CONSTRAINT "TranscriptionConsent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptionBatch" ADD CONSTRAINT "TranscriptionBatch_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "TranscriptionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDocument" ADD CONSTRAINT "SessionDocument_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing sessions keep their files; no audio is backfilled or manufactured.
UPDATE "Document" SET "extractionStatus"='unavailable', "extractionError"='Esta imagen se guardó antes de habilitar la extracción local de texto.' WHERE "mimeType" LIKE 'image/%' AND "extractedText"='';
INSERT INTO "SessionDocument" ("id","sessionId","documentId","name","mimeType","size","uploadedBy","extractedText","extractionStatus","extractionError","createdAt")
SELECT gen_random_uuid()::text,s.id,d.id,d.name,d."mimeType",d.size,d."uploadedBy",d."extractedText",d."extractionStatus",d."extractionError",d."createdAt"
FROM "Session" s JOIN "Document" d ON d."roomId"=s."roomId" AND d."createdAt">=s."startedAt" AND (s."endedAt" IS NULL OR d."createdAt"<=s."endedAt")
ON CONFLICT ("sessionId","documentId") DO NOTHING;

ALTER TABLE "TranscriptionBatch" ADD CONSTRAINT transcription_batch_status CHECK (status IN ('pending','succeeded','silent','failed'));
ALTER TABLE "TranscriptionBatch" ADD CONSTRAINT transcription_batch_time CHECK ("startMs">=0 AND "endMs">"startMs" AND "endMs"-"startMs"<=30000);
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT transcript_segment_time CHECK ("startMs">=0 AND "endMs">"startMs");
ALTER TABLE "SessionDocument" ADD CONSTRAINT session_document_size CHECK (size BETWEEN 1 AND 10000000);
ALTER TABLE "Document" ADD CONSTRAINT document_extraction_status CHECK ("extractionStatus" IN ('text','ocr','partial','no_text','unavailable','unknown'));
ALTER TABLE "SessionDocument" ADD CONSTRAINT session_document_extraction_status CHECK ("extractionStatus" IN ('text','ocr','partial','no_text','unavailable','unknown'));

-- Firebase identities and session participant authorization are checked by the API.
-- The Data API/public client roles have no access to these private transcripts.
DO $$
DECLARE tab TEXT;
BEGIN
 FOR tab IN SELECT unnest(ARRAY['TranscriptionConsent','TranscriptionBatch','TranscriptSegment','SessionDocument']) LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',tab);
  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC',tab);
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon',tab); END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated',tab); END IF;
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='studyroom_api') THEN
   EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.%I TO studyroom_api',tab);
   EXECUTE format('CREATE POLICY backend_only ON public.%I TO studyroom_api USING (true) WITH CHECK (true)',tab);
  END IF;
 END LOOP;
END $$;

COMMIT;
