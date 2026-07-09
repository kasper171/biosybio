import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AtSign,
  Crown,
  Globe,
  KeyRound,
  Link2,
  Mail,
  Save,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  cleanUsername,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";
import type { Profile } from "@/lib/profile-storage";
import { setPublicTemplateEnabled } from "@/lib/profile-template";
import { canToggleByosyBranding } from "@/lib/byosy-branding";
import { useI18n } from "@/i18n/LocaleProvider";
import { DashboardAccountLayout, DashCard } from "./DashboardAccountLayout";
import { DashboardPrivacyToggle } from "./DashboardPrivacyToggle";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

export function ContaPrivacidadePanel({ profile, onProfileChange }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState(profile.username);
  const [showUsername, setShowUsername] = useState(profile.show_username !== false);
  const [showViews, setShowViews] = useState(profile.show_view_count !== false);
  const [showUid, setShowUid] = useState(profile.show_public_uid !== false);
  const [publicTemplate, setPublicTemplate] = useState(profile.public_template_enabled === true);
  const [hideBranding, setHideBranding] = useState(profile.hide_byosy_branding === true);
  const [togglingTemplate, setTogglingTemplate] = useState(false);
  const [togglingBranding, setTogglingBranding] = useState(false);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setNewEmail(data.user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    setUsername(profile.username);
    setShowUsername(profile.show_username !== false);
    setShowViews(profile.show_view_count !== false);
    setShowUid(profile.show_public_uid !== false);
    setPublicTemplate(profile.public_template_enabled === true);
    setHideBranding(profile.hide_byosy_branding === true);
  }, [profile]);

  const canToggleBranding = canToggleByosyBranding(profile);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const saveProfileSettings = async () => {
    const clean = cleanUsername(username);
    const lengthError = usernameLengthError(clean);
    if (lengthError) {
      toast.error(lengthError);
      return;
    }

    setSavingProfile(true);

    if (clean !== profile.username) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", profile.id)
        .maybeSingle();
      if (taken) {
        setSavingProfile(false);
        toast.error("This username is already taken");
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: clean,
        show_username: showUsername,
        show_view_count: showViews,
        show_public_uid: showUid,
      })
      .eq("id", profile.id);

    setSavingProfile(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const updated = {
      ...profile,
      username: clean,
      show_username: showUsername,
      show_view_count: showViews,
      show_public_uid: showUid,
    };
    onProfileChange(updated);
    setUsername(clean);
    toast.success(t("dashboard.toasts.settingsSaved"));
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      toast.error("Enter an email different from the current one");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your inbox to confirm the new email");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully!");
  };

  const handleBrandingToggle = async (show: boolean) => {
    if (!canToggleBranding) {
      toast.error(t("dashboard.privacidade.branding.premiumRequired"));
      return;
    }

    const nextHide = !show;
    setTogglingBranding(true);
    setHideBranding(nextHide);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ hide_byosy_branding: nextHide })
        .eq("id", profile.id);
      if (error) throw error;
      onProfileChange({ ...profile, hide_byosy_branding: nextHide });
      toast.success(t("dashboard.toasts.settingsSaved"));
    } catch (e) {
      setHideBranding(!nextHide);
      toast.error(e instanceof Error ? e.message : t("dashboard.privacidade.branding.saveFailed"));
    } finally {
      setTogglingBranding(false);
    }
  };

  const handlePublicTemplateToggle = async (enabled: boolean) => {
    setTogglingTemplate(true);
    setPublicTemplate(enabled);
    try {
      const updated = await setPublicTemplateEnabled(profile, enabled);
      onProfileChange(updated);
      toast.success(
        enabled
          ? "Public template enabled! Your style will be published and updated automatically."
          : "Public template disabled.",
      );
    } catch (e) {
      setPublicTemplate(!enabled);
      toast.error(e instanceof Error ? e.message : "Error updating public template");
    } finally {
      setTogglingTemplate(false);
    }
  };

  return (
    <DashboardAccountLayout profile={profile} activeSection="privacidade">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <Shield className="h-5 w-5 text-pink-400" />
            {t("dashboard.privacidade.title")}
          </h1>
          <p className="mt-1 text-sm text-white/45">{t("dashboard.privacidade.subtitle")}</p>
        </div>

        <DashCard title={t("dashboard.privacidade.username.title")}>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            {t("dashboard.privacidade.username.description")}
          </p>
          <label className="mb-1 block text-xs font-medium text-white/55">
            {t("dashboard.privacidade.username.profileLink")}
          </label>
          <div className="mb-3 flex items-center rounded-xl border border-white/[0.08] bg-black/30 px-3">
            <Link2 className="mr-2 h-4 w-4 shrink-0 text-white/35" />
            <span className="shrink-0 text-sm text-white/40">
              {origin ? `${origin.replace(/^https?:\/\//, "")}/` : "/"}
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(cleanUsername(e.target.value))}
              minLength={MIN_USERNAME_LENGTH}
              maxLength={MAX_USERNAME_LENGTH}
              className="w-full bg-transparent py-3 text-sm text-white outline-none"
              placeholder="yourusername"
            />
          </div>
          <Link
            to="/$username"
            params={{ username: username || profile.username }}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
          >
            <AtSign className="h-3.5 w-3.5" />
            {t("dashboard.privacidade.username.viewPage", {
              username: username || profile.username,
            })}
          </Link>
        </DashCard>

        <DashCard title={t("dashboard.privacidade.publicTemplate.title")}>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            {t("dashboard.privacidade.publicTemplate.description", {
              name: profile.display_name || profile.username,
            })}
          </p>
          <DashboardPrivacyToggle
            label={t("dashboard.privacidade.publicTemplate.toggle")}
            description={t("dashboard.privacidade.publicTemplate.toggleDesc")}
            checked={publicTemplate}
            onChange={(v) => {
              if (!togglingTemplate) void handlePublicTemplateToggle(v);
            }}
          />
          <Link
            to="/dashboard"
            search={{ section: "templates" }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
          >
            <Globe className="h-3.5 w-3.5" />
            {t("dashboard.privacidade.publicTemplate.galleryLink")}
          </Link>
        </DashCard>

        <DashCard title={t("dashboard.privacidade.branding.title")}>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            {t("dashboard.privacidade.branding.description")}
          </p>
          <DashboardPrivacyToggle
            label={t("dashboard.privacidade.branding.show")}
            description={
              canToggleBranding
                ? t("dashboard.privacidade.branding.showDesc")
                : t("dashboard.privacidade.branding.showDescLocked")
            }
            checked={!hideBranding}
            disabled={!canToggleBranding || togglingBranding}
            badge={
              !canToggleBranding ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                  <Crown className="h-3 w-3" aria-hidden />
                  {t("dashboard.common.premium")}
                </span>
              ) : undefined
            }
            onChange={(show) => {
              if (!togglingBranding) void handleBrandingToggle(show);
            }}
          />
          {!canToggleBranding && (
            <Link
              to="/planos"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
            >
              <Crown className="h-3.5 w-3.5" />
              {t("dashboard.privacidade.branding.upgradeLink")}
            </Link>
          )}
        </DashCard>

        <DashCard title={t("dashboard.privacidade.cardVisibility.title")}>
          <p className="mb-4 text-xs text-white/45">
            {t("dashboard.privacidade.cardVisibility.description")}
          </p>
          <div className="space-y-2">
            <DashboardPrivacyToggle
              label={t("dashboard.privacidade.cardVisibility.showUsername")}
              description={t("dashboard.privacidade.cardVisibility.showUsernameDesc")}
              checked={showUsername}
              onChange={setShowUsername}
            />
            <DashboardPrivacyToggle
              label={t("dashboard.privacidade.cardVisibility.showViews")}
              description={t("dashboard.privacidade.cardVisibility.showViewsDesc")}
              checked={showViews}
              onChange={setShowViews}
            />
            <DashboardPrivacyToggle
              label={t("dashboard.privacidade.cardVisibility.showUid")}
              description={
                profile.public_uid != null
                  ? t("dashboard.privacidade.cardVisibility.showUidDescWithId", {
                      uid: profile.public_uid.toLocaleString("en-US"),
                    })
                  : t("dashboard.privacidade.cardVisibility.showUidDesc")
              }
              checked={showUid}
              onChange={setShowUid}
            />
          </div>
          <button
            type="button"
            onClick={() => void saveProfileSettings()}
            disabled={savingProfile}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? t("dashboard.common.saving") : t("dashboard.privacidade.cardVisibility.saveChanges")}
          </button>
        </DashCard>

        <DashCard title={t("dashboard.privacidade.email.title")}>
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <Mail className="h-3.5 w-3.5" />
                {t("dashboard.privacidade.email.current")}
              </label>
              <input
                value={email}
                readOnly
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-white/50 outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                {t("dashboard.privacidade.email.new")}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="novo@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={savingEmail}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {savingEmail ? t("dashboard.common.saving") : t("dashboard.privacidade.email.changeEmail")}
            </button>
          </form>
        </DashCard>

        <DashCard title={t("dashboard.privacidade.password.title")}>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <KeyRound className="h-3.5 w-3.5" />
                {t("dashboard.privacidade.password.new")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder={t("dashboard.privacidade.password.minChars")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                {t("dashboard.privacidade.password.confirm")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder={t("dashboard.privacidade.password.repeat")}
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {savingPassword ? t("dashboard.common.saving") : t("dashboard.privacidade.password.changePassword")}
            </button>
          </form>
        </DashCard>
      </div>
    </DashboardAccountLayout>
  );
}
