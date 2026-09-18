import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  downloadUrl?: string;
};

const RATES = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayerBar({
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  onPlayPause,
  onSeek,
  onSkip,
  onVolumeChange,
  onToggleMute,
  onRateChange,
  downloadUrl,
}: Props) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause */}
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? "አቁም" : "አጫውት"}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "bg-gold-500 text-stone-950 transition-colors hover:bg-gold-400",
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        )}
      </button>

      {/* Skip ±15s */}
      <button
        type="button"
        onClick={() => onSkip(-15)}
        aria-label="15 ሰከንድ ወደ ኋላ"
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary sm:flex"
      >
        <SkipBack className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onSkip(15)}
        aria-label="15 ሰከንድ ወደ ፊት"
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary sm:flex"
      >
        <SkipForward className="h-3.5 w-3.5" />
      </button>

      {/* Current time */}
      <span className="hidden w-10 shrink-0 text-right text-[11px] tabular-nums text-text-muted sm:inline">
        {formatTime(currentTime)}
      </span>

      {/* Seek bar */}
      <div className="relative min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="የድምጽ አቀማመጥ"
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full",
            "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-125",
            "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:bg-gold-500",
          )}
          style={{
            background: `linear-gradient(to right, rgb(var(--color-accent)) 0%, rgb(var(--color-accent)) ${pct}%, rgb(var(--color-surface-raised)) ${pct}%, rgb(var(--color-surface-raised)) 100%)`,
          }}
        />
      </div>

      {/* Total time */}
      <span className="hidden w-10 shrink-0 text-[11px] tabular-nums text-text-muted sm:inline">
        {formatTime(duration)}
      </span>

      {/* Playback rate */}
      <select
        value={playbackRate}
        onChange={(e) => onRateChange(Number(e.target.value))}
        aria-label="የአጫዋች ፍጥነት"
        className={cn(
          "hidden h-8 shrink-0 cursor-pointer rounded-md border border-surface-border",
          "bg-surface-sunken/40 px-2 text-[12px] tabular-nums text-text-muted",
          "transition-colors hover:bg-surface-raised hover:text-text-primary",
          "focus:border-gold-500/40 focus:outline-none",
          "md:block",
        )}
      >
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>

      {/* Volume */}
      <div className="hidden items-center gap-2 lg:flex">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "ድምጽ ክፈት" : "ድምጽ ዝጋ"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="የድምጽ መጠን"
          className={cn(
            "h-1 w-20 cursor-pointer appearance-none rounded-full bg-surface-raised",
            "[&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-text-muted",
            "[&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:bg-text-muted",
          )}
        />
      </div>

      {/* Download */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label="አውርድ"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary sm:flex"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
