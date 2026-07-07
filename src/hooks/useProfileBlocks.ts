import { useCallback, useEffect, useState } from "react";
import {
  fetchProfileBlocks,
  type ProfileBlock,
} from "@/lib/profile-blocks";

export function useProfileBlocks(profileId: string | null | undefined) {
  const [blocks, setBlocks] = useState<ProfileBlock[]>([]);
  const [loading, setLoading] = useState(Boolean(profileId));

  const reload = useCallback(async () => {
    if (!profileId) {
      setBlocks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProfileBlocks(profileId);
      setBlocks(data);
    } catch (err) {
      console.error("[useProfileBlocks]", err);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { blocks, setBlocks, loading, reload };
}
