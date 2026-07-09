import { Heart } from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import { shouldShowByosyBranding } from "@/lib/byosy-branding";
import { isCardGlassEnabled } from "@/lib/card-glass";
import { SITE_NAME } from "@/lib/site";

type Props = {
  profile: Pick<Profile, "hide_byosy_branding" | "is_premium" | "roles">;
};

/** Badge fixo no canto inferior esquerdo da página pública. */
export function ProfileByosyBranding({ profile }: Props) {
  if (!shouldShowByosyBranding(profile)) return null;
  const glassEnabled = isCardGlassEnabled(profile);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-[55] select-none"
      aria-hidden
    >
      <div
        className={`flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
          glassEnabled ? "card-glass" : "bg-black/55 backdrop-blur-md"
        }`}
      >
        <span className="text-xs font-medium tracking-wide text-white/75">
          by {SITE_NAME}
        </span>
        <Heart className="h-3.5 w-3.5 shrink-0 fill-pink-500 text-pink-500" aria-hidden />
      </div>
    </div>
  );
}
