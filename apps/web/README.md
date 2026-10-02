# StudyRoom web

React 18, TypeScript, Vite, TanStack Query, Firebase Authentication, Socket.IO and LiveKit client. Every screen uses the real NestJS API contract; there is no fake production sign-in, seeded browser data or paid AI fallback.

## Run

Copy `.env.example` to `.env.local`, set Firebase web configuration and API URL, then run `npm run dev -w @studyroom/web` from the repository root. A local Firebase emulator requires both a development build and `VITE_USE_FIREBASE_EMULATOR=true`. Production builds ignore that switch. Browser session persistence is limited to the current browser session. Server credentials never belong in `VITE_` variables.

## Implemented surfaces and traceability

| Source | User stories |
| --- | --- |
| `src/auth.tsx`, `firebase.ts`, `api.ts` | SUT-2–8: registration, session, onboarding, profile/preferences, Firebase reset link and accessible forms |
| `src/explore.tsx` | SUT-10–16,19–22,24: search, filters, recommendations, empty/error states, room details, create/edit/privacy/scheduling |
| `src/room.tsx` | SUT-18,23,25,35–37,42–44,53: joining, roles, membership, chat, reactions, files, private notes, timer, closing |
| `src/media.tsx`, `shared-screen.tsx`, `annotation-toolbar.tsx`, `annotation-graphic.tsx`, `annotations.ts` | SUT-38–41: separate LiveKit media connection, camera/microphone/devices, adaptive video, screen sharing, compact camera menu, normalized shared pointer/pen/line/arrow/rectangle/ellipse/text, sizes/colors, per-mark eraser and clearing |
| `src/ai.tsx`, `usage.tsx` | SUT-46–51: server AI jobs, selected authorized context, streaming updates, cancellation, offline states, usage, feedback |
| `src/history.tsx` | SUT-53–57: authorized session history, artifacts, quiz attempts, date filters and export |
| `src/use-transcription.ts`, `transcription-audio.ts`, `transcription-panel.tsx`, `session-report.tsx` | Explicit personal voice consent, continuous existing-microphone capture, literal recognized transcript, authorized session resources and report questions |

Corresponding frontend activities are implemented with shared loading, success/error, empty-state, keyboard and responsive primitives. The repository-wide Jira matrix retains every one of the 657 issues. The table above is code mapping; it does **not** assert every acceptance test has passed.

## Verification

- `npm run build -w @studyroom/web` includes strict TypeScript validation and production bundling. LiveKit is downloaded only when the room route is opened.
- `npm run test -w @studyroom/web`: normalized coordinates/letterboxing, proportionate shape/text rendering and safe text, eraser hit testing, screen-scoped/idempotent events, desktop lifecycle timeouts/cleanup/recovery and Firefox's unknown capture-surface guidance.
- `npm run test:e2e`: local PostgreSQL + API + Firebase Auth emulator + Vite must already be running. The Chromium script creates a temporary account and tests invalid credentials, registration/onboarding, room creation, real API chat, saved notes after reload, timer, Socket.IO members, room closing, history, mobile layout and keyboard navigation. It closes its own room and deletes its own Firebase account in cleanup, recording success or failure separately.
- Set `WEB_BASE_URL` to test an explicitly authorized deployed environment, and `TEST_OUTPUT_DIR` to keep its evidence separate. `CHECK_CHUNK_RECOVERY=true` blocks only the room module once, checks the accessible recovery screen, then permits the request and verifies an explicit reload. `AXE_SCRIPT_PATH` can point to an installed `axe-core/axe.min.js`; the smoke audits seven views/states, including empty search results, against WCAG A/AA rules without injecting this test library into production. The recorded audit used axe-core 4.13.0.
- `npm run test:media`: additionally requires a working LiveKit SFU. Two isolated browser contexts send **synthetic** camera/microphone and a synthetic canvas screen. It checks track reception, annotation authorization, normalized points at different screen sizes, keyboard signaling, clearing and screen stopping. This never captures the user's physical camera, microphone or desktop.
- Latest scratch evidence: `apps/web/test-results/`. Selected durable local evidence: `docs/verification/web/`; published Render/Firebase evidence: `docs/verification/web-production/`.

## Remaining real-environment validation

The automated browser tests do not establish 60-minute stability with four physical devices and separate networks, TURN/TLS with UDP blocked, real microphone intelligibility, hardware selection, mobile screen-sharing support, physical PC sleep/recovery, Firebase email delivery/expired emails, free cloud deployment quotas, or real Supabase signed storage in production. Those acceptance gates require the configured services and manual evidence. Use the room's device menu to download sampled WebRTC stats; there is no claim that this exporter alone proves call quality.

Media uses LiveKit directly. Restarting the application API can interrupt chat/state while the independent media connection continues. Socket rejoin requests a room snapshot; refresh of a Firebase token does not unmount the media component. Messages retain their idempotency key across retries. Notes are private, saved after a short typing pause or explicitly, saved before in-app exit/remote session closure, available in session history, and protected by an unsaved-change warning on browser unload.

An application error boundary handles failed deferred view downloads without leaving a blank page. Recovery reloads only after the user's explicit action; there is no automatic reload loop. Automated accessibility checks are limited to the inspected states and do not replace screen-reader and complete keyboard review.

## Voice and session reports

**Voz → Transcribir mi voz** is an explicit per-user opt-in. Connecting media or enabling a microphone alone never starts transcription. Capture taps the existing LiveKit microphone track through a static same-origin AudioWorklet, produces mono PCM16 WAV at 16 kHz in contiguous 15-second chunks, and has zero audio output. It never calls `getUserMedia`, stops/clones the shared microphone, records other participants' audio, or waits for STT before connecting the call. Each participant enables their own voice. Silences are skipped, fragments remain bounded to one upload and five queued items, and model/network failures persist visible coverage gaps. Microphone off, user opt-out, session close and page exit flush the partial chunk best effort; unresolved uploads expire. A reload or browser crash can lose voice that has not reached the server.

The session report separates recognized original words from AI synthesis and preserves authorized chat, images and documents. Search and speaker filtering operate on the original transcript, with bounded initial rendering and more-items controls. Resource links are fetched on demand through the authenticated session document endpoint; expiring private links are excluded from exports. Questions use the report's session context, existing durable AI jobs and private per-user answer history. Private notes remain separate from the shared report context. Recognition can contain mistakes; the UI never promises a complete/perfect transcript for users who did not opt in or for missing audio.

AI references are rendered as readable voice/person/time, message/person, filename or summary labels. Report links require both the job's authorized `result.sources` and a matching source in the current report. Clicking a reference reveals its original entry even when filters or pagination had hidden it. Accented/decomposed source prefixes and UUID references without brackets are normalized; unknown references and unfinished streamed references expose no source IDs or invented links. Ordinary bracketed notes remain literal text. The room assistant without a report map shows an authorized source category without fabricating navigation.

## Windows desktop menu

Every participant can open the installation guide from the room's **En el escritorio** panel, even before sharing. `/desktop/StudyRoom-Herramientas.zip` contains the companion built by `scripts/desktop/`; extract it and double-click `Instalar-Herramientas.cmd` once, or start it directly with `Iniciar-Herramientas.cmd`. The explicit `studyroom-tools://open` link opens the installed app. It carries no account, room, token or other user data.

While a local screen track is published, the web renews a short local lease through `http://127.0.0.1:8790/v1/sharing`. The native menu appears only during sharing, returns after accidental closure while that lease remains active, and hides when sharing stops. The browser sends only a random session UUID and active flag; camera/microphone activation never contacts the helper. Requests run independently from LiveKit, allow a first local-access permission prompt, then use short timeouts and a two-second heartbeat. Stop, track-ended and page-exit release the lease best-effort; the companion's eight-second expiry covers a crashed browser. A missing app shows setup instructions while media continues normally.

Choose **Pantalla completa** to transmit the desktop drawings while changing applications. Known tab/window capture shows that guidance; Firefox/Zen may omit `displaySurface`, so the web asks the user to check their choice without claiming the selection is wrong. The separate **Sobre esta vista** camera menu places normalized annotations only over StudyRoom's shared view, with server-validated presenter/moderator permissions. The web does not claim to float outside the browser by itself.
