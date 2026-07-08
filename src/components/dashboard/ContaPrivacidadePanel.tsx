import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AtSign,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Mail,
  RotateCcw,
  Save,
  Shield,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  usernameLengthError,
} from "@/lib/username";
import type { Profile } from "@/lib/profile-storage";
import { uploadProfileAsset } from "@/lib/profile-storage";
import { setPublicTemplateEnabled } from "@/lib/profile-template";
import {
  DEFAULT_SHARE_EMBED_DESCRIPTION,
  DEFAULT_SHARE_EMBED_TITLE,
  SHARE_EMBED_DESCRIPTION_MAX,
  SHARE_EMBED_TITLE_MAX,
  resolveShareEmbedDescription,
  resolveShareEmbedImageUrl,
  resolveShareEmbedTitle,
} from "@/lib/share-embed";
import { profilePublicUrl, SITE_NAME } from "@/lib/site";
import { BiosyToggle } from "@/components/ui/BiosyToggle";
import { cn } from "@/lib/utils";
import { DashboardAccountLayout, DashCard } from "./DashboardAccountLayout";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-200",
        "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]",
        checked && "border-pink-500/25 bg-pink-500/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      )}
    >
      <span>
        <span className={cn("block text-sm font-medium transition-colors", checked ? "text-white" : "text-white/90")}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/40">{description}</span>
      </span>
      <BiosyToggle
        checked={checked}
        onChange={onChange}
        variant="switch"
        aria-label={label}
        className="mt-0.5"
      />
    </label>
  );
}

export function ContaPrivacidadePanel({ profile, onProfileChange }: Props) {
  const [username, setUsername] = useState(profile.username);
  const [showUsername, setShowUsername] = useState(profile.show_username !== false);
  const [showViews, setShowViews] = useState(profile.show_view_count !== false);
  const [showUid, setShowUid] = useState(profile.show_public_uid !== false);
  const [publicTemplate, setPublicTemplate] = useState(profile.public_template_enabled === true);
  const [embedTitle, setEmbedTitle] = useState(profile.share_embed_title ?? "");
  const [embedDescription, setEmbedDescription] = useState(profile.share_embed_description ?? "");
  const [embedImageUrl, setEmbedImageUrl] = useState(profile.share_embed_image_url ?? "");
  const [uploadingEmbedImage, setUploadingEmbedImage] = useState(false);
  const [togglingTemplate, setTogglingTemplate] = useState(false);
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
    setEmbedTitle(profile.share_embed_title ?? "");
    setEmbedDescription(profile.share_embed_description ?? "");
    setEmbedImageUrl(profile.share_embed_image_url ?? "");
  }, [profile]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const saveProfileSettings = async () => {
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
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
        share_embed_title: embedTitle.trim() || null,
        share_embed_description: embedDescription.trim() || null,
        share_embed_image_url: embedImageUrl.trim() || null,
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
      share_embed_title: embedTitle.trim() || null,
      share_embed_description: embedDescription.trim() || null,
      share_embed_image_url: embedImageUrl.trim() || null,
    };
    onProfileChange(updated);
    setUsername(clean);
    toast.success("Settings saved!");
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

  const handleEmbedImagePick = async (file: File | undefined) => {
    if (!file) return;
    setUploadingEmbedImage(true);
    try {
      const url = await uploadProfileAsset(profile.id, "share_embed", file);
      setEmbedImageUrl(url);
      toast.success("Embed banner uploaded!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload image");
    } finally {
      setUploadingEmbedImage(false);
    }
  };

  const resetShareEmbed = () => {
    setEmbedTitle("");
    setEmbedDescription("");
    setEmbedImageUrl("");
    toast.message("Fields reset to defaults. Save to apply.");
  };

  const previewSource = {
    share_embed_title: embedTitle.trim() || null,
    share_embed_description: embedDescription.trim() || null,
    share_embed_image_url: embedImageUrl.trim() || null,
  };
  const previewTitle = resolveShareEmbedTitle(previewSource);
  const previewDescription = resolveShareEmbedDescription(previewSource);
  const previewImage = resolveShareEmbedImageUrl(previewSource);
  const previewUrl = profilePublicUrl(username || profile.username);

  return (
    <DashboardAccountLayout profile={profile} activeSection="privacidade">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <Shield className="h-5 w-5 text-pink-400" />
            Account
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Profile link, share embed, privacy, and account details.
          </p>
        </div>

        <DashCard title="Username">
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Your public link is based on your username. When you change it, the old link stops
            working.
          </p>
          <label className="mb-1 block text-xs font-medium text-white/55">Profile link</label>
          <div className="mb-3 flex items-center rounded-xl border border-white/[0.08] bg-black/30 px-3">
            <Link2 className="mr-2 h-4 w-4 shrink-0 text-white/35" />
            <span className="shrink-0 text-sm text-white/40">{origin ? `${origin.replace(/^https?:\/\//, "")}/` : "/"}</span>
            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
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
            View page @{username || profile.username}
          </Link>
        </DashCard>

        <DashCard title="Public template">
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Publish your current style as a community template. Anyone can copy layout,
            colors, sizes, and effects — avatars, images, and music from users who apply it remain their own.
            The template appears as{" "}
            <span className="text-white/70">{profile.display_name || profile.username}&apos;s Template</span>{" "}
            and updates automatically when you save your profile.
          </p>
          <PrivacyToggle
            label="Public template"
            description="Syncs your live style to the public template gallery"
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
            View template gallery
          </Link>
        </DashCard>

        <DashCard title="Share embed">
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Customize how your link appears on Discord, WhatsApp, Twitter, and other apps.
            Changes apply only to{" "}
            <span className="text-white/70">{previewUrl}</span>. Empty fields use {SITE_NAME}
            defaults.
          </p>

          <div className="mb-5 overflow-hidden rounded-xl border border-[#1e1f22] bg-[#2b2d31]">
            <div className="border-b border-[#1e1f22] px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-[#949ba4]">
              Preview (Discord)
            </div>
            <div className="space-y-2 p-3">
              <p className="text-xs text-[#00a8fc]">{previewUrl}</p>
              <div className="overflow-hidden rounded-lg border-l-4 border-[#5865f2] bg-[#1e1f22]">
                {previewImage ? (
                  <img src={previewImage} alt="" className="max-h-36 w-full object-cover" />
                ) : null}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#f2f3f5]">{previewTitle}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#b5bac1]">
                    {previewDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">Title</label>
              <input
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value.slice(0, SHARE_EMBED_TITLE_MAX))}
                maxLength={SHARE_EMBED_TITLE_MAX}
                placeholder={DEFAULT_SHARE_EMBED_TITLE}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
              <p className="mt-1 text-[10px] text-white/35">
                {embedTitle.length}/{SHARE_EMBED_TITLE_MAX} · Default: {DEFAULT_SHARE_EMBED_TITLE}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">Description</label>
              <textarea
                value={embedDescription}
                onChange={(e) =>
                  setEmbedDescription(e.target.value.slice(0, SHARE_EMBED_DESCRIPTION_MAX))
                }
                maxLength={SHARE_EMBED_DESCRIPTION_MAX}
                rows={3}
                placeholder={DEFAULT_SHARE_EMBED_DESCRIPTION}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
              <p className="mt-1 text-[10px] text-white/35">
                {embedDescription.length}/{SHARE_EMBED_DESCRIPTION_MAX}
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <ImageIcon className="h-3.5 w-3.5" />
                Banner image
              </label>
              {embedImageUrl ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/[0.08]">
                  <img src={embedImageUrl} alt="" className="max-h-40 w-full object-cover" />
                </div>
              ) : (
                <p className="mb-3 text-xs text-white/40">Using default {SITE_NAME} banner.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  <Upload className="h-4 w-4" />
                  {uploadingEmbedImage ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingEmbedImage}
                    onChange={(e) => void handleEmbedImagePick(e.target.files?.[0])}
                  />
                </label>
                {embedImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setEmbedImageUrl("")}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.06]"
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-[10px] text-white/35">
                Recommended: 1200×630 px (wide ratio). Discord uses this image at the top of the
                embed.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveProfileSettings}
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save embed"}
            </button>
            <button
              type="button"
              onClick={resetShareEmbed}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.06]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to default
            </button>
          </div>
        </DashCard>

        <DashCard title="Card visibility">
          <p className="mb-4 text-xs text-white/45">
            Choose which information is visible in the corner of your public card.
          </p>
          <div className="space-y-2">
            <PrivacyToggle
              label="Show @ on card"
              description="Displays the username (@username) below the display name"
              checked={showUsername}
              onChange={setShowUsername}
            />
            <PrivacyToggle
              label="Show views"
              description="Displays the view counter in the top-right corner"
              checked={showViews}
              onChange={setShowViews}
            />
            <PrivacyToggle
              label="Show UID"
              description={
                profile.public_uid != null
                  ? `Displays #${profile.public_uid.toLocaleString("en-US")} in the top-left corner`
                  : "Displays your UID in the top-left corner of the card"
              }
              checked={showUid}
              onChange={setShowUid}
            />
          </div>
          <button
            type="button"
            onClick={saveProfileSettings}
            disabled={savingProfile}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </DashCard>

        <DashCard title="Account email">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <Mail className="h-3.5 w-3.5" />
                Current email
              </label>
              <input
                value={email}
                readOnly
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-white/50 outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">New email</label>
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
              {savingEmail ? "Sending..." : "Change email"}
            </button>
          </form>
        </DashCard>

        <DashCard title="Password">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <KeyRound className="h-3.5 w-3.5" />
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {savingPassword ? "Saving..." : "Change password"}
            </button>
          </form>
        </DashCard>
      </div>
    </DashboardAccountLayout>
  );
}
