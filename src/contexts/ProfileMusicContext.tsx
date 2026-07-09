import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { extractTrackName, formatMusicTime } from "@/lib/profile-music";

/** Volume inicial da música no perfil (0–1). */
export const DEFAULT_MUSIC_VOLUME = 0.5;

export type ProfileMusicConfig = {
  musicUrl: string;
  title?: string | null;
  startSec?: number;
  endSec?: number | null;
  autoplay?: boolean;
  enabled?: boolean;
};

export type ProfileMusicState = {
  audioRef: RefObject<HTMLAudioElement | null>;
  trackTitle: string;
  loopStart: number;
  seekMin: number;
  seekMax: number;
  duration: number;
  current: number;
  isPlaying: boolean;
  volume: number;
  formatTime: typeof formatMusicTime;
  togglePlay: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
};

const ProfileMusicContext = createContext<ProfileMusicState | null>(null);

export function useProfileMusic(): ProfileMusicState {
  const ctx = useContext(ProfileMusicContext);
  if (!ctx) throw new Error("useProfileMusic must be used within ProfileMusicProvider");
  return ctx;
}

export function useProfileMusicOptional(): ProfileMusicState | null {
  return useContext(ProfileMusicContext);
}

function seekAudioTo(audio: HTMLAudioElement, timeSec: number): void {
  const safe = Math.max(0, timeSec);
  try {
    audio.currentTime = safe;
  } catch {
    // iOS pode rejeitar seek antes dos metadados — retentamos em loadedmetadata.
  }
}

export function ProfileMusicProvider({
  config,
  children,
}: {
  config: ProfileMusicConfig;
  children: ReactNode;
}) {
  const { musicUrl, title, startSec = 0, endSec = null, autoplay = false, enabled = true } = config;
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef(DEFAULT_MUSIC_VOLUME);
  const hasAutoPlayedRef = useRef(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(startSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(DEFAULT_MUSIC_VOLUME);
  const [mediaReady, setMediaReady] = useState(false);

  const assignAudioRef = (el: HTMLAudioElement | null) => {
    audioRef.current = el;
    if (el) el.volume = volume;
  };

  const trackTitle = useMemo(
    () => (title?.trim() ? title.trim() : extractTrackName(musicUrl)),
    [musicUrl, title],
  );
  const loopStart = Math.max(startSec, 0);
  const loopEnd = endSec == null ? duration : Math.max(endSec, loopStart + 0.1);
  const seekMin = loopStart;
  const seekMax = Math.max(loopEnd, loopStart + 0.1);

  useEffect(() => {
    hasAutoPlayedRef.current = false;
    setMediaReady(false);
    setDuration(0);
    setCurrent(loopStart);
    setIsPlaying(false);
  }, [musicUrl, loopStart, endSec]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const applyLoopStart = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d);
      seekAudioTo(audio, loopStart);
      setCurrent(loopStart);
      setMediaReady(true);
    };

    const onLoaded = () => {
      applyLoopStart();
    };
    const onTime = () => {
      const now = audio.currentTime;
      const hardEnd = endSec == null ? (audio.duration || duration) : endSec;
      if (hardEnd > loopStart && now >= hardEnd) {
        seekAudioTo(audio, loopStart);
        if (!audio.paused) void audio.play().catch(() => {});
      }
      setCurrent(audio.currentTime);
    };
    const onEnded = () => {
      seekAudioTo(audio, loopStart);
      void audio.play().catch(() => {});
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    if (audio.readyState >= 1) {
      applyLoopStart();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [duration, endSec, loopStart, musicUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !mediaReady) return;
    seekAudioTo(audio, loopStart);
    setCurrent(loopStart);
  }, [loopStart, mediaReady]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!enabled) {
      audio.pause();
      return;
    }

    if (!autoplay || hasAutoPlayedRef.current || !mediaReady) return;

    hasAutoPlayedRef.current = true;
    audio.volume = volume;
    seekAudioTo(audio, loopStart);
    setCurrent(loopStart);
    void audio.play().catch(() => {
      hasAutoPlayedRef.current = false;
    });
  }, [autoplay, enabled, loopStart, volume, mediaReady]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (audio.currentTime < loopStart || audio.currentTime > seekMax) {
        seekAudioTo(audio, loopStart);
        setCurrent(loopStart);
      }
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const seek = (t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seekAudioTo(audio, t);
    setCurrent(t);
  };

  const setVolume = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    const audio = audioRef.current;
    if (audio) audio.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0.001) lastVolumeRef.current = clamped;
  };

  const toggleMute = () => {
    setVolumeState((v) => (v <= 0.001 ? lastVolumeRef.current : 0));
  };

  const value: ProfileMusicState = {
    audioRef,
    trackTitle,
    loopStart,
    seekMin,
    seekMax,
    duration,
    current,
    isPlaying,
    volume,
    formatTime: formatMusicTime,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  };

  return (
    <ProfileMusicContext.Provider value={value}>
      <audio ref={assignAudioRef} src={musicUrl} preload="auto" playsInline />
      {children}
    </ProfileMusicContext.Provider>
  );
}
