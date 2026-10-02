BEGIN;
CREATE INDEX "AiJob_sessionId_idx" ON "AiJob"("sessionId");
CREATE INDEX "QuizAttempt_sessionId_idx" ON "QuizAttempt"("sessionId");
CREATE INDEX "TranscriptSegment_batchId_idx" ON "TranscriptSegment"("batchId");
COMMIT;
