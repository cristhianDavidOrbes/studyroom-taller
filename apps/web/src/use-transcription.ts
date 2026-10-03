import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError, errorText, json } from "./api";
import { AudioUploadQueue, captureMicrophone, type MicrophoneCapture } from "./transcription-audio";
import type { TranscriptionState } from "./types";
import { consentWasRevoked } from "./transcription-consent";

export function useTranscription(roomId: string | undefined, joined: boolean, userId?: string) {
  const [microphone, setMicrophone] = useState<MediaStreamTrack | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const alive = useRef(true), capture = useRef<MicrophoneCapture | null>(null);
  const queue = useRef<AudioUploadQueue | null>(null);
  const consentClock = useRef<{ serverMs: number; receivedAt: number } | null>(null);
  const enabledRef = useRef(false);
  const consentConfirmedAt = useRef<string | null>(null);
  const consentOperation = useRef(0);
  const automaticStart = useRef(false);
  const sequence = useRef(0);
  const currentRoom = useRef(roomId);
  currentRoom.current = roomId;
  const accumulated = useRef<{ roomId?: string; data?: TranscriptionState }>({});
  const { data, error: queryError, refetch } = useQuery({
    queryKey: ["transcription", roomId],
    queryFn: async () => {
      const previous = accumulated.current.roomId === roomId ? accumulated.current.data : undefined;
      const segments = new Map(previous?.segments.map((segment) => [segment.id, segment]));
      let cursor = previous?.segments.at(-1)?.id;
      let result!: TranscriptionState;
      for (let page = 0; page < 5; page++) {
        result = await api<TranscriptionState>(`/rooms/${roomId}/transcription?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
        if (previous?.sessionId && previous.sessionId !== result.sessionId) segments.clear();
        for (const segment of result.segments) segments.set(segment.id, segment);
        if (!result.nextCursor) break;
        cursor = result.nextCursor;
      }
      const merged = { ...result, segments: [...segments.values()] };
      accumulated.current = { roomId, data: merged };
      return merged;
    },
    enabled: joined && !!roomId,
    refetchInterval: 5000,
  });
  const stopCapture = useCallback(async () => {
    sequence.current++;
    const active = capture.current;
    capture.current = null;
    if (alive.current) setRecording(false);
    await active?.stop();
  }, []);
  const stopForClose = useCallback(async () => {
    enabledRef.current = false;
    if (alive.current) setEnabled(false);
    await stopCapture();
    // Closing does not wait on the model. The server accepts final chunks for 60s.
    void queue.current?.drain(55000);
  }, [stopCapture]);
  const revokeLocal = useCallback(() => {
    enabledRef.current = false;
    consentConfirmedAt.current = null;
    consentClock.current = null;
    const pendingUploads = queue.current;
    queue.current = null;
    pendingUploads?.abort();
    if (alive.current) {
      setEnabled(false); setError("Tu transcripción se desactivó en otra pestaña o la sesión ya no está disponible. La captura se detuvo.");
    }
    void stopCapture();
  }, [stopCapture]);
  useEffect(() => {
    if (enabledRef.current && consentWasRevoked(data?.participants.find((person) => person.userId === userId), consentConfirmedAt.current)) revokeLocal();
  }, [data?.participants, userId, revokeLocal]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      consentOperation.current++;
      enabledRef.current = false;
      void stopCapture().then(() => queue.current?.drain(55000));
    };
  }, [stopCapture]);
  useEffect(() => {
    consentOperation.current++;
    automaticStart.current = false;
    enabledRef.current = false; setEnabled(false); setError(""); setBusy(false);
    consentConfirmedAt.current = null;
    consentClock.current = null;
    const previous = queue.current;
    queue.current = null;
    void stopCapture().then(() => previous?.drain(55000));
  }, [roomId, stopCapture]);
  useEffect(() => {
    const stop = () => { void stopForClose(); };
    window.addEventListener("pagehide", stop);
    return () => window.removeEventListener("pagehide", stop);
  }, [stopForClose]);
  useEffect(() => {
    if (!enabled || !microphone || !data?.sessionId || !roomId) {
      void stopCapture();
      return;
    }
    let cancelled = false;
    const current = ++sequence.current;
    const uploads = queue.current || new AudioUploadQueue(async (chunk, signal) => {
      const form = new FormData();
      form.append("audio", chunk.audio, "voz.wav");
      form.append("clientId", chunk.clientId);
      form.append("sessionId", chunk.sessionId);
      form.append("startMs", String(chunk.startMs));
      form.append("endMs", String(chunk.endMs));
      try {
        await api(`/rooms/${roomId}/transcription/audio`, { method: "POST", body: form, signal });
      } catch (failure) {
        if (currentRoom.current === roomId && failure instanceof ApiError && [401, 403, 409].includes(failure.status)) revokeLocal();
        throw failure;
      }
      if (alive.current && currentRoom.current === roomId) void refetch();
    }, (message) => { if (alive.current && currentRoom.current === roomId) setError(message); }, (count) => { if (alive.current && currentRoom.current === roomId) setPending(count); }, (chunk, reason) => {
      void api(`/rooms/${roomId}/transcription/gaps`, json("POST", { clientId: chunk.clientId, sessionId: chunk.sessionId, startMs: chunk.startMs, endMs: chunk.endMs, reason })).catch(() => {});
    });
    queue.current = uploads;
    const sessionTime = () => Math.max(0, Math.round((consentClock.current ? consentClock.current.serverMs + performance.now() - consentClock.current.receivedAt : new Date(data.startedAt).getTime()) - new Date(data.startedAt).getTime()));
    const attemptStart = sessionTime();
    void captureMicrophone(microphone, data.sessionId, sessionTime, (chunk) => uploads.enqueue(chunk)).then(async (active) => {
      if (cancelled || current !== sequence.current || !enabledRef.current) { await active.stop(); return; }
      capture.current = active;
      setRecording(true);
    }).catch((failure) => {
      if (!cancelled && alive.current) {
        setError(`No se pudo comenzar la transcripción: ${errorText(failure)}`);
        void api(`/rooms/${roomId}/transcription/gaps`, json("POST", { clientId: crypto.randomUUID(), sessionId: data.sessionId, startMs: attemptStart, endMs: Math.max(attemptStart + 1, sessionTime()), reason: "capture_failed" })).catch(() => {});
      }
    });
    const ended = () => { void stopCapture(); };
    microphone.addEventListener("ended", ended, { once: true });
    return () => {
      cancelled = true;
      microphone.removeEventListener("ended", ended);
      void stopCapture();
    };
  }, [enabled, microphone, data?.sessionId, data?.startedAt, roomId, refetch, stopCapture, revokeLocal]);
  const toggle = useCallback(async () => {
    if (!roomId || busy) return false;
    const operation = ++consentOperation.current;
    const current = () => alive.current && currentRoom.current === roomId && consentOperation.current === operation;
    setBusy(true); setError("");
    setBusyLabel(enabledRef.current ? "Guardando última voz…" : "Activando tu transcripción…");
    try {
      if (enabledRef.current) {
        enabledRef.current = false; setEnabled(false);
        await stopCapture();
        if (!current()) return false;
        await queue.current?.drain(55000);
        if (!current()) return false;
        queue.current = null;
        await api(`/rooms/${roomId}/transcription/consent`, json("POST", { enabled: false }));
      } else {
        if (!window.AudioContext || !window.AudioWorkletNode)
          throw new Error("La transcripción necesita una versión reciente de Chrome, Edge o Firefox.");
        const confirmed = await api<{ updatedAt: string }>(`/rooms/${roomId}/transcription/consent`, json("POST", { enabled: true }));
        if (!current()) return false;
        consentConfirmedAt.current = confirmed.updatedAt;
        consentClock.current = { serverMs: Date.parse(confirmed.updatedAt), receivedAt: performance.now() };
        enabledRef.current = true; setEnabled(true);
      }
      if (!current()) return false;
      await refetch();
      return current() && enabledRef.current;
    } catch (failure) {
      if (current()) setError(errorText(failure));
      return false;
    } finally {
      if (current()) setBusy(false);
    }
  }, [roomId, busy, refetch, stopCapture]);
  const enable = useCallback(async () => enabledRef.current ? true : toggle(), [toggle]);
  useEffect(() => {
    if (!joined || !roomId || busy || automaticStart.current) return;
    automaticStart.current = true;
    void enable();
  }, [joined, roomId, busy, enable]);
  return { data, error: error || (queryError ? errorText(queryError) : ""), enabled, recording, busy, busyLabel, pending, toggle, enable, stopForClose, setMicrophone, refetch };
}
