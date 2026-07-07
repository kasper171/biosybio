import { useState } from "react";
import { Music2, Pause, Play, X } from "lucide-react";
import { useProfileMusic } from "@/contexts/ProfileMusicContext";
import { MusicVolumeControl } from "@/components/MusicVolumeControl";

export function ProfileMusicPlayerFloating() {
  const {
    trackTitle,
    seekMin,
    seekMax,
    current,
    isPlaying,
    volume,
    formatTime,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = useProfileMusic();

  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div className="flex flex-col items-end gap-2">
        {open && (
          <div className="w-[min(320px,calc(100vw-1rem))] rounded-lg border border-white/20 bg-black/55 px-2 py-1.5 text-white backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-sm text-white/90 transition hover:bg-white/10"
                title={isPlaying ? "Pausar" : "Tocar"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>

              <span className="shrink-0 text-xs text-white/85">
                {formatTime(current)} / {formatTime(seekMax)}
              </span>

              <p className="min-w-0 flex-1 truncate text-sm text-white/90">{trackTitle}</p>

              <MusicVolumeControl
                volume={volume}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
              />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-sm text-white/80 transition hover:bg-white/10"
                title="Fechar player"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-1.5">
              <div className="biosy-range-wrap py-0">
                <input
                  type="range"
                  min={seekMin}
                  max={seekMax}
                  step={0.01}
                  value={Math.min(Math.max(current, seekMin), seekMax)}
                  onInput={(e) => seek(Number(e.currentTarget.value))}
                  onChange={(e) => seek(Number(e.currentTarget.value))}
                  className="biosy-range-input w-full"
                  aria-label="Progresso da faixa"
                />
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/55 ${
            isPlaying ? "animate-[biosy-music-pulse_1s_ease-in-out_infinite]" : ""
          }`}
          title="Abrir player de música"
        >
          <Music2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
