import type { Profile } from "@/lib/profile-storage";
import { ContaPrivacidadePanel } from "@/components/dashboard/ContaPrivacidadePanel";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

export function DashboardPrivacidadePage({ profile, onProfileChange }: Props) {
  return <ContaPrivacidadePanel profile={profile} onProfileChange={onProfileChange} />;
}
