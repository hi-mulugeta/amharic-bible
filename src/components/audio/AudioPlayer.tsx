import { useEffect, useRef, useState } from "react";
import { Headphones } from "lucide-react";
import type { ChapterAudioOut } from "@/api/queries/audio";
import { AudioPlayerBar } from "./AudioPlayerBar";
import { cn } from "@/lib/utils";

const VOLUME_KEY = "catena.audio.volume";
const RATE_KEY = "catena.audio.rate";

type Props = {
  audio: ChapterAudioOut;
  /** Reset playback when this key changes (e.g., chapter route). */
  resetKey: string;
};

export function AudioPlayer({ audio, resetKey }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.duration_seconds ?? 0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(VOLUME_KEY);
    const v = saved ? Number(saved) : 1;
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
  });
  const [playbackRate, setPlaybackRate] = useState(() => {
    const saved = localStorage.getItem(RATE_KEY);
    const r = saved ? Number(saved) : 1;
    return Number.isFinite(r) && r > 0 ? r : 1;
  });

  // Reset when chapter changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(audio.duration_seconds ?? 0);
  }, [resetKey, audio.id, audio.duration_seconds]);

  // Apply persisted preferences
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    el.playbackRate = playbackRate;
  }, [volume, muted, playbackRate]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(RATE_KEY, String(playbackRate));
  }, [playbackRate]);

  // Keyboard shortcuts — only when focus is not inside an input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
          return;
      }

      // We use a modifier to avoid clashes with the reader's arrow-key nav.
      // Alt+Space to toggle, Alt+Left/Right to seek, Alt+Up/Down to volume.
      if (!e.altKey) return;

      const el = audioRef.current;
      if (!el) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-15);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(15);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {
        // Autoplay policy blocked — user needs to interact first
      });
    } else {
      el.pause();
    }
  };

  const seek = (time: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(
      0,
      Math.min(el.duration || 0, el.currentTime + delta),
    );
  };

  const toggleMute = () => setMuted((m) => !m);

  // Reciter label
  const reciter = audio.reciter_name_am || audio.reciter_name_en;
  const rangeLabel =
    audio.start_verse && audio.end_verse
      ? ` · ቁጥር ${audio.start_verse}–${audio.end_verse}`
      : "";

  return (
    <div
      className={cn(
        "border-b border-surface-border bg-surface-raised/30 backdrop-blur",
      )}
    >
      <audio
        ref={audioRef}
        src={audio.url}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (!el) return;
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
          }
        }}
        onError={() => setIsPlaying(false)}
      />

      <div className="mx-auto max-w-reading px-5 py-3 md:px-8">
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-text-faint">
          <Headphones className="h-3 w-3" />
          <span className="font-amharic">
            የድምጽ ንባብ
            {reciter ? ` · ${reciter}` : ""}
            {rangeLabel}
          </span>
        </div>

        <AudioPlayerBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onPlayPause={togglePlay}
          onSeek={seek}
          onSkip={skip}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
          onRateChange={setPlaybackRate}
          downloadUrl={audio.url}
        />
      </div>
    </div>
  );
}
