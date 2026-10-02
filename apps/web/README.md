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
| `src/media.tsx`, `annotations.ts` | SUT-38–41: separate LiveKit media connection, camera/microphone/devices, adaptive video, screen sharing, compact camera menu, normalized shared annotations |
| `src/ai.tsx`, `usage.tsx` | SUT-46–51: server AI jobs, selected authorized context, streaming updates, cancellation, offline states, usage, feedback |
| `src/history.tsx` | SUT-53–57: authorized session history, artifacts, quiz attempts, date filters and export |

Corresponding frontend activities are implemented with shared loading, success/error, empty-state, keyboard and responsive primitives. The repository-wide Jira matrix retains every one of the 657 issues. The table above is code mapping; it does **not** assert every acceptance test has passed.

## Verification

- `npm run build -w @studyroom/web` includes strict TypeScript validation and production bundling. LiveKit is downloaded only when the room route is opened.
- `npm run test -w @studyroom/web`: normalized coordinate/letterboxing tests, two viewport dimensions and invalid geometry.
- `npm run test:e2e`: local PostgreSQL + API + Firebase Auth emulator + Vite must already be running. The Chromium script creates disposable emulator accounts and tests invalid credentials, registration/onboarding, room creation, real API chat, saved notes after reload, timer, Socket.IO members, room closing, history, mobile layout and keyboard navigation.
- `npm run test:media`: additionally requires a working LiveKit SFU. Two isolated browser contexts send **synthetic** camera/microphone and a synthetic canvas screen. It checks track reception, annotation authorization, normalized points at different screen sizes, keyboard signaling, clearing and screen stopping. This never captures the user's physical camera, microphone or desktop.
- Evidence JSON and screenshots: `apps/web/test-results/`.

## Remaining real-environment validation

The automated browser tests do not establish 60-minute stability with four physical devices and separate networks, TURN/TLS with UDP blocked, real microphone intelligibility, hardware selection, mobile screen-sharing support, physical PC sleep/recovery, Firebase email delivery/expired emails, free cloud deployment quotas, or real Supabase signed storage in production. Those acceptance gates require the configured services and manual evidence. Use the room's device menu to download sampled WebRTC stats; there is no claim that this exporter alone proves call quality.

Media uses LiveKit directly. Restarting the application API can interrupt chat/state while the independent media connection continues. Socket rejoin requests a room snapshot; refresh of a Firebase token does not unmount the media component. Messages retain their idempotency key across retries. Notes are private and saved explicitly, before in-app exit, and protected by an unsaved-change warning on browser unload.
