import type { Profile } from "@/lib/profile-storage";

export type ProfileCompletionTask = {
  id: string;
  label: string;
  done: boolean;
};

export function getProfileCompletionTasks(profile: Profile): ProfileCompletionTask[] {
  const hasSocial = Object.values(profile.socials ?? {}).some((v) => Boolean(v?.trim()));
  return [
    { id: "avatar", label: "Profile photo", done: Boolean(profile.avatar_url) },
    { id: "bio", label: "Short bio", done: Boolean(profile.bio?.trim()) },
    { id: "discord", label: "Discord status", done: Boolean(profile.discord_user_id) },
    { id: "social", label: "At least one link", done: hasSocial },
  ];
}

export function getProfileCompletionPercent(profile: Profile): number {
  const tasks = getProfileCompletionTasks(profile);
  if (tasks.length === 0) return 100;
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}
