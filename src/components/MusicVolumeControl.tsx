import { Volume2, VolumeX } from "lucide-react";

type Props = {
  volume: number;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  className?: string;
};

export function MusicVolumeControl({
  volume,
  onVolumeChange,
  onToggleMute,
  className = "",
}: Props) {
  const muted = volume <= 0.001;
  const safeVolume = Math.min(1, Math.max(0, volume));

  const emit = (raw: number) => {
    onVolumeChange(Math.min(1, Math.max(0, raw)));
  };

  return (
    <div
      className={`relative z-20 flex shrink-0 items-center gap-1 pointer-events-auto ${className}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onToggleMute}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
        title="Mute / unmute"
        aria-label="Mute or unmute"
      >
        {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
      </button>
      <div className="biosy-music-volume-wrap">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(safeVolume * 100)}
          onInput={(e) => emit(Number(e.currentTarget.value) / 100)}
          onChange={(e) => emit(Number(e.currentTarget.value) / 100)}
          className="biosy-music-volume-input"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(safeVolume * 100)}
        />
      </div>
    </div>
  );
}
