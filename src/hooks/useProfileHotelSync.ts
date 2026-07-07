import { useEffect, useRef } from "react";
import type { Profile } from "@/lib/profile-storage";
import { HOTEL_SYNC_INTERVAL_MS } from "@/lib/hotel/hotel-display";
import { isHotelConnected } from "@/lib/hotel/profile-hotel";
import { syncProfileHotelDataFn } from "@/lib/hotel/hotel-sync.functions";

type Options = {
  enabled?: boolean;
  onProfileChange?: (profile: Profile) => void;
};

/**
 * Sincroniza missão, level e achievements Habbo/Habblet a cada 30 minutos
 * enquanto o perfil está aberto (página pública ou editor).
 */
export function useProfileHotelSync(
  profile: Profile | null | undefined,
  { enabled = true, onProfileChange }: Options = {},
) {
  const syncingRef = useRef(false);
  const profileRef = useRef(profile);
  const onChangeRef = useRef(onProfileChange);
  profileRef.current = profile;
  onChangeRef.current = onProfileChange;

  useEffect(() => {
    if (!enabled || !profile || !isHotelConnected(profile)) return;

    const runSync = async (force: boolean) => {
      if (syncingRef.current || !profileRef.current) return;
      syncingRef.current = true;
      try {
        const result = await syncProfileHotelDataFn({
          data: { profileId: profileRef.current.id, force },
        });
        if (result.ok && !result.skipped && result.patch && profileRef.current) {
          const next = { ...profileRef.current, ...result.patch };
          profileRef.current = next;
          onChangeRef.current?.(next);
        }
      } catch {
        // Falha silenciosa — próxima tentativa no intervalo
      } finally {
        syncingRef.current = false;
      }
    };

    void runSync(false);

    const timer = window.setInterval(() => {
      void runSync(true);
    }, HOTEL_SYNC_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [enabled, profile?.id]);
}
