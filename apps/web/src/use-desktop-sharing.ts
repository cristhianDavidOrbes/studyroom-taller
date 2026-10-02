import { useEffect, useState } from "react";
import {
  startDesktopSharing,
  type DesktopBridgeStatus,
} from "./desktop-bridge";

export function useDesktopSharing(screenId?: string, track?: MediaStreamTrack) {
  const [status, setStatus] = useState<DesktopBridgeStatus | "idle">("idle");
  useEffect(() => {
    if (!screenId || track?.readyState === "ended") {
      setStatus("idle");
      return;
    }
    const stop = startDesktopSharing(crypto.randomUUID(), setStatus);
    window.addEventListener("pagehide", stop);
    track?.addEventListener("ended", stop);
    return () => {
      window.removeEventListener("pagehide", stop);
      track?.removeEventListener("ended", stop);
      stop();
    };
  }, [screenId, track]);
  return status;
}
