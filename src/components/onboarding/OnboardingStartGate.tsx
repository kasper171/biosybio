import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n/types";
import { useI18n } from "@/i18n/LocaleProvider";
import {
  isOnboardingComplete,
  isOnboardingPending,
  markOnboardingComplete,
} from "@/lib/onboarding-storage";
import { OnboardingStartModal } from "@/components/onboarding/OnboardingStartModal";

/**
 * Exibe o fluxo Start após criação de conta.
 * Somente client-side (localStorage/sessionStorage) — sem novas rotas ou APIs expostas.
 */
export function OnboardingStartGate() {
  const { setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!active || !uid) return;

      setUserId(uid);

      if (!isOnboardingPending()) return;
      if (isOnboardingComplete(uid)) {
        return;
      }

      setOpen(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleComplete = (locale: Locale) => {
    if (!userId) return;
    setLocale(locale);
    markOnboardingComplete(userId);
    setOpen(false);
  };

  return <OnboardingStartModal open={open} onComplete={handleComplete} />;
}
