# StudyRoom implementation contract

Monorepo npm workspaces: apps/web (React18/Vite/TypeScript), apps/api (NestJS/Prisma/PostgreSQL), apps/ai-gateway (Node TypeScript local authenticated Ollama gateway). Spanish UI. Base API /api. JSON errors {message,code?}; Firebase ID token Bearer; user id is Firebase uid. Browser never receives server secrets. ISO UTC dates; user timezone display. Local development uses real Firebase Auth emulator and PostgreSQL; no mock authentication in production.

All requirements are in jira-requirements.json (657), story-requirements.md (50), task-requirements.md (150), epic-requirements.md (7). Activities must also be read from JSON and traced honestly. Do not mark untested requirements verified.

## API contract (backend owns definitive OpenAPI and types; coordinate changes)
- GET /health public; GET/PATCH /me profile {id,email,displayName,bio,interests:string[],level,notifications:{inApp,email},onboarded}; POST /auth/logout (revoke session tokens)
- GET /rooms?q=&subject=&modality=&level=&sort=relevance|activity|scheduled&recommended=true returns Room[]; GET /rooms/:id Room; POST /rooms; PATCH /rooms/:id; POST /rooms/:id/join {code?,inviteToken?}; POST /rooms/:id/leave; POST /rooms/:id/close; POST /rooms/:id/cancel
- Room {id,title,description,subject,modality,level,privacy:public|private,capacity,scheduledAt?,status:scheduled|open|closed|cancelled,hostId,createdAt,participantCount,myRole?,sessionId?}; create/update accepts accessCode for private, durationMinutes.
- GET /rooms/:id/members -> [{userId,displayName,role:host|moderator|participant,handRaised,online}]; PATCH /rooms/:id/members/:userId {role}; DELETE /rooms/:id/members/:userId (kick); POST /rooms/:id/invites -> {url,token,expiresAt}
- GET /rooms/:id/messages -> Message[]; POST /rooms/:id/messages {text,clientId}; Message {id,userId,displayName,text,createdAt,clientId,kind:user|ai}; @IA invokes authorized AI job.
- GET/PUT /rooms/:id/notes -> {text}; private to caller
- GET /rooms/:id/documents; POST /rooms/:id/documents multipart field file; GET /rooms/:id/documents/:docId/url -> {url}; DELETE same; Document {id,name,mimeType,size,createdAt,uploadedBy}; signed private storage, bounded PDF/text/image; safe authorized text extraction for AI.
- GET /rooms/:id/timer; PUT /rooms/:id/timer {action:start|pause|reset,durationSeconds?,mode:focus|break}; {endsAt?,remainingSeconds,mode,running}
- POST /rooms/:id/media/token -> {token,url}; GET /rooms/:id/state -> {members,messages,timer,annotations}; POST /rooms/:id/annotations {action:point|stroke|clear,screenId,x?,y?,points?,color?}; GET /usage -> resource usage+limits+warnings
- GET /sessions -> histories; GET /sessions/:id -> history detail including artifacts/jobs; GET /sessions/:id/export?format=json|markdown
- POST /rooms/:id/ai {question,includeChat:boolean,documentIds:string[]} -> job; GET /ai/jobs/:id -> job; POST /ai/jobs/:id/cancel; POST /ai/answers/:id/feedback {rating:1|-1,reason?}; POST /sessions/:id/artifacts {kind:summary|keypoints|quiz} -> job; POST /sessions/:id/quiz/attempts {answers:number[]} -> {score,total,feedback}
- AI jobs {id,status:queued|running|completed|failed|cancelled,kind,result?,error?,createdAt}. Backend AI requests gateway POST /v1/generate Bearer secret body {prompt,system?,maxTokens?,stream:false}; response {text,model,usage?}. Gateway supports stream true NDJSON and abort. Backend all AI durable queue one consumer concurrency, authorized context only. Gateway GET /health public returns status only, GET /v1/health authenticated health with model readiness.

## Realtime
Socket.IO default namespace, auth {token}; client emit room:join {roomId} acknowledgement {ok,error?}; server validates actual membership, emits room:state snapshot. Events chat:message (Message), room:members (members), room:updated (Room), room:closed ({roomId}), timer:updated (timer), annotation:updated ({action,screenId,userId,x,y,points,color}), ai:updated (job), room:reaction ({userId,emoji}), room:hand ({userId,raised}). Client emits room:reaction {roomId,emoji}, room:hand {roomId,raised}. REST for persistent mutations; socket is notification/resync. No secret or private notes broadcast. Reauthorize every event. On reconnect rejoin+snapshot. Multiple tabs counted once. Media continues separately in LiveKit.

## Media and annotations
LiveKit client adaptiveStream+dynacast+simulcast; camera540p24fps, screen720p15fps. Top-right compact camera menu opens annotation tools. Normalized coordinates over displayed shared-screen content (contain/letterbox aware) sync all room participants. Permission for current screen owner or room host/moderator, validates active published screen; reconnect snapshot. No standalone whiteboard. Actual 60min four-device media QA remains a manual evidence gate.

## Operations
Render free static/web, Supabase Free Postgres+Storage, Firebase Spark, LiveKit Build Free. No paid fallback. All credentials .env ignored, .env.example safe. Free caps enforced configurable with conservative room max4. Local AI qwen3:4b-instruct (validated Spanish instruct variant), Ollama localhost11434, OLLAMA_NO_CLOUD=1, gateway localhost8787 exposed via ngrok HTTP free. Single inference, context4096, bounded output, localPC uptime failure states. Root owns README, CI, render.yaml, dependency installation, integration and end-to-end tests. Agents own their workspace package.json; root owns root package.json/lockfile. Communicate interface deviations immediately.
