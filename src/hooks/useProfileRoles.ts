import { useEffect, useState } from "react";
import type { Profile } from "@/lib/profile-storage";
import { attachProfileRoles, type ProfileRoleAssignment } from "@/lib/profile-roles";

export function useProfileRoles(profile: Profile | null | undefined) {
  const [roles, setRoles] = useState<ProfileRoleAssignment[]>(profile?.roles ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) {
      setRoles([]);
      return;
    }
    if (profile.roles && profile.roles.length > 0) {
      setRoles(profile.roles);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void attachProfileRoles(profile).then((withRoles) => {
      if (!cancelled) {
        setRoles(withRoles.roles ?? []);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [profile?.id, profile?.roles]);

  return { roles, loading };
}
