import type { Profile } from "@/lib/profile-storage";
import { ContaMiscellaneousPanel } from "@/components/dashboard/ContaMiscellaneousPanel";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

export function DashboardMiscellaneousPage({ profile, onProfileChange }: Props) {
  return <ContaMiscellaneousPanel profile={profile} onProfileChange={onProfileChange} />;
}
