import { useEffect } from "react";
import { saveVideoProgress } from "@/lib/videoProgress";

export function useVideoProgressManager(
  userId: string,
  videoRefs: React.MutableRefObject<Record<string, HTMLVideoElement | null>>
) {
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      Object.entries(videoRefs.current).forEach(([id, video]) => {
        if (video && !video.paused) {
          saveVideoProgress(userId, id, video.currentTime);
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [userId, videoRefs]);
}
