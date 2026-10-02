import { useRef, useEffect } from "react";
import type {
  Participant,
  TrackPublication,
  RemoteTrack,
  LocalTrack,
} from "livekit-client";
export interface TrackView {
  participant: Participant;
  publication: TrackPublication;
  track: RemoteTrack | LocalTrack;
}
export function TrackElement({
  track,
  muted = false,
  screen = false,
  onVideo,
}: {
  track: RemoteTrack | LocalTrack;
  muted?: boolean;
  screen?: boolean;
  onVideo?: (video: HTMLVideoElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null),
    onVideoRef = useRef(onVideo);
  onVideoRef.current = onVideo;
  useEffect(() => {
    const element = ref.current;
    if (element) {
      track.attach(element);
      onVideoRef.current?.(element);
    }
    return () => {
      if (element) track.detach(element);
      onVideoRef.current?.(null);
    };
  }, [track]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={screen ? "screen-video" : "camera-video"}
    />
  );
}
export function AudioElement({ track }: { track: RemoteTrack | LocalTrack }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) track.attach(el);
    return () => {
      if (el) track.detach(el);
    };
  }, [track]);
  return <audio ref={ref} autoPlay />;
}
