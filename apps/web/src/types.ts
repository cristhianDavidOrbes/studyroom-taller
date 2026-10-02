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
  action: "point" | "stroke" | "clear";
  screenId: string;
  userId?: string;
  x?: number;
  y?: number;
  points?: { x: number; y: number }[];
  color?: string;
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
