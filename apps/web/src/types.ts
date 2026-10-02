export interface Profile {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  interests: string[];
  level: string;
  notifications: { inApp: boolean; email: boolean };
  onboarded: boolean;
}
export interface StudyRoom {
  id: string;
  title: string;
  description: string;
  subject: string;
  modality: string;
  level: string;
  privacy: "public" | "private";
  capacity: number;
  durationMinutes?: number;
  scheduledAt?: string;
  status: "scheduled" | "open" | "closed" | "cancelled";
  hostId: string;
  createdAt: string;
  participantCount: number;
  myRole?: "host" | "moderator" | "participant";
  sessionId?: string;
}
export interface Member {
  userId: string;
  displayName: string;
  role: "host" | "moderator" | "participant";
  handRaised: boolean;
  online: boolean;
}
export interface Message {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: string;
  clientId?: string;
  kind: "user" | "ai";
}
export interface StudyDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: string;
}
export interface Timer {
  endsAt?: string;
  remainingSeconds: number;
  mode: "focus" | "break";
  running: boolean;
}
export interface Annotation {
  id?: string;
  action:
    | "point"
    | "stroke"
    | "line"
    | "arrow"
    | "rectangle"
    | "ellipse"
    | "text"
    | "erase"
    | "clear";
  screenId: string;
  userId?: string;
  x?: number;
  y?: number;
  points?: { x: number; y: number }[];
  color?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  targetIds?: string[];
}
export interface Job {
  id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  kind: string;
  result?: unknown;
  error?: string;
  createdAt: string;
  partialText?: string;
  question?: string;
}
export interface Session {
  id: string;
  roomId: string;
  title?: string;
  room?: StudyRoom;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  jobs?: Job[];
  artifacts?: {
    id: string;
    kind: string;
    content: unknown;
    createdAt: string;
  }[];
  quizAttempts?: {
    id: string;
    score: number;
    total: number;
    createdAt: string;
  }[];
}
export interface RoomState {
  members: Member[];
  messages: Message[];
  timer: Timer;
  annotations: Annotation[];
}
export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  startMs: number;
  endMs: number;
  words?: { word: string; startMs: number; endMs: number; probability?: number }[];
}
export interface TranscriptionState {
  sessionId: string;
  startedAt: string;
  serverTime?: string;
  nextCursor?: string | null;
  segments: TranscriptSegment[];
  batches: {
    id: string; clientId: string; speakerId: string;
    status: string; startMs: number; endMs: number; error?: string;
  }[];
  participants: { userId: string; displayName: string; enabled: boolean; updatedAt?: string }[];
  coverage: {
    status: "pending" | "partial" | "available" | "none";
    pendingBatches: number; failedBatches: number; completedBatches: number;
    consentingParticipants: number; totalParticipants: number;
  };
}
export interface SessionReport extends Session {
  attempts?: { score: number; total: number; createdAt: string }[];
  messages: Message[];
  documents: (StudyDocument & {
    available: boolean;
    extractedText?: string;
    extractionStatus?: string;
    extractionError?: string;
  })[];
  transcription: TranscriptionState;
}
