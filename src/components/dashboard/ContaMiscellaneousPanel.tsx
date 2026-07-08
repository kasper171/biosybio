import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Globe,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Sparkles,
  Type,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile-storage";
import { uploadProfileAsset } from "@/lib/profile-storage";
import {
  DEFAULT_SHARE_EMBED_DESCRIPTION,
  DEFAULT_SHARE_EMBED_TITLE,
  SHARE_EMBED_DESCRIPTION_MAX,
  SHARE_EMBED_TITLE_MAX,
  resolveShareEmbedDescription,
  resolveShareEmbedImageUrl,
  resolveShareEmbedTitle,
} from "@/lib/share-embed";
import {
  PAGE_TITLE_MAX,
  resolvePageFaviconUrl,
  resolvePageTitle,
} from "@/lib/page-meta";
import { profilePublicUrl, SITE_NAME, SITE_TITLE } from "@/lib/site";
import { DashboardAccountLayout, DashCard } from "./DashboardAccountLayout";
import { DashboardPrivacyToggle } from "./DashboardPrivacyToggle";
import { useI18n } from "@/i18n/LocaleProvider";

type Props = {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
};

export function ContaMiscellaneousPanel({ profile, onProfileChange }: Props) {
  const { t } = useI18n();
  const [pageTitle, setPageTitle] = useState(profile.page_title ?? "");
  const [pageFaviconUrl, setPageFaviconUrl] = useState(profile.page_favicon_url ?? "");
  const [pageTitleTyping, setPageTitleTyping] = useState(profile.page_title_typing_effect === true);
  const [embedTitle, setEmbedTitle] = useState(profile.share_embed_title ?? "");
  const [embedDescription, setEmbedDescription] = useState(profile.share_embed_description ?? "");
  const [embedImageUrl, setEmbedImageUrl] = useState(profile.share_embed_image_url ?? "");
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingEmbedImage, setUploadingEmbedImage] = useState(false);
  const [savingPageTab, setSavingPageTab] = useState(false);
  const [savingEmbed, setSavingEmbed] = useState(false);

  useEffect(() => {
    setPageTitle(profile.page_title ?? "");
    setPageFaviconUrl(profile.page_favicon_url ?? "");
    setPageTitleTyping(profile.page_title_typing_effect === true);
    setEmbedTitle(profile.share_embed_title ?? "");
    setEmbedDescription(profile.share_embed_description ?? "");
    setEmbedImageUrl(profile.share_embed_image_url ?? "");
  }, [profile]);

  const previewUrl = profilePublicUrl(profile.username);

  const savePageTabSettings = async () => {
    setSavingPageTab(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        page_title: pageTitle.trim() || null,
        page_favicon_url: pageFaviconUrl.trim() || null,
        page_title_typing_effect: pageTitleTyping,
      })
      .eq("id", profile.id);
    setSavingPageTab(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    onProfileChange({
      ...profile,
      page_title: pageTitle.trim() || null,
      page_favicon_url: pageFaviconUrl.trim() || null,
      page_title_typing_effect: pageTitleTyping,
    });
    toast.success(t("dashboard.miscellaneous.pageTab.saved"));
  };

  const saveEmbedSettings = async () => {
    setSavingEmbed(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        share_embed_title: embedTitle.trim() || null,
        share_embed_description: embedDescription.trim() || null,
        share_embed_image_url: embedImageUrl.trim() || null,
      })
      .eq("id", profile.id);
    setSavingEmbed(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    onProfileChange({
      ...profile,
      share_embed_title: embedTitle.trim() || null,
      share_embed_description: embedDescription.trim() || null,
      share_embed_image_url: embedImageUrl.trim() || null,
    });
    toast.success(t("dashboard.miscellaneous.embed.saved"));
  };

  const handleFaviconPick = async (file: File | undefined) => {
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadProfileAsset(profile.id, "page_favicon", file);
      setPageFaviconUrl(url);
      toast.success(t("dashboard.miscellaneous.pageTab.faviconUploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.toasts.upload.failed"));
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleEmbedImagePick = async (file: File | undefined) => {
    if (!file) return;
    setUploadingEmbedImage(true);
    try {
      const url = await uploadProfileAsset(profile.id, "share_embed", file);
      setEmbedImageUrl(url);
      toast.success(t("dashboard.toasts.upload.imageUploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("dashboard.toasts.upload.failed"));
    } finally {
      setUploadingEmbedImage(false);
    }
  };

  const resetPageTab = () => {
    setPageTitle("");
    setPageFaviconUrl("");
    setPageTitleTyping(false);
    toast.message(t("dashboard.miscellaneous.pageTab.resetHint"));
  };

  const resetShareEmbed = () => {
    setEmbedTitle("");
    setEmbedDescription("");
    setEmbedImageUrl("");
    toast.message(t("dashboard.miscellaneous.embed.resetHint"));
  };

  const pageTabPreview = {
    page_title: pageTitle.trim() || null,
    page_favicon_url: pageFaviconUrl.trim() || null,
    share_embed_title: profile.share_embed_title,
  };
  const previewTabTitle = resolvePageTitle(pageTabPreview);
  const previewFavicon = resolvePageFaviconUrl(pageFaviconUrl.trim() || null);

  const previewSource = {
    share_embed_title: embedTitle.trim() || null,
    share_embed_description: embedDescription.trim() || null,
    share_embed_image_url: embedImageUrl.trim() || null,
  };
  const previewEmbedTitle = resolveShareEmbedTitle(previewSource);
  const previewDescription = resolveShareEmbedDescription(previewSource);
  const previewImage = resolveShareEmbedImageUrl(previewSource);

  return (
    <DashboardAccountLayout profile={profile} activeSection="miscellaneous">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-pink-400" />
            {t("dashboard.miscellaneous.title")}
          </h1>
          <p className="mt-1 text-sm text-white/45">{t("dashboard.miscellaneous.subtitle")}</p>
        </div>

        <DashCard title={t("dashboard.miscellaneous.pageTab.title")}>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            {t("dashboard.miscellaneous.pageTab.description", {
              url: previewUrl,
              siteName: SITE_NAME,
            })}
          </p>

          <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3">
            <img
              src={previewFavicon}
              alt=""
              className="h-8 w-8 rounded-md border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                {t("dashboard.miscellaneous.pageTab.previewLabel")}
              </p>
              <p className="truncate text-sm font-medium text-white">{previewTabTitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <Type className="h-3.5 w-3.5" />
                {t("dashboard.miscellaneous.pageTab.pageTitle")}
              </label>
              <input
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value.slice(0, PAGE_TITLE_MAX))}
                maxLength={PAGE_TITLE_MAX}
                placeholder={SITE_TITLE}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
              <p className="mt-1 text-[10px] text-white/35">
                {t("dashboard.miscellaneous.pageTab.pageTitleHint", {
                  count: pageTitle.length,
                  max: PAGE_TITLE_MAX,
                  defaultTitle: SITE_TITLE,
                })}
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-white/55">
                <ImageIcon className="h-3.5 w-3.5" />
                {t("dashboard.miscellaneous.pageTab.favicon")}
              </label>
              {pageFaviconUrl ? (
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={pageFaviconUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-white/[0.08] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPageFaviconUrl("")}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:bg-white/[0.06]"
                  >
                    {t("dashboard.common.remove")}
                  </button>
                </div>
              ) : (
                <p className="mb-3 text-xs text-white/40">
                  {t("dashboard.miscellaneous.pageTab.faviconDefault")}
                </p>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                <ImageIcon className="h-4 w-4" />
                {uploadingFavicon
                  ? t("dashboard.common.saving")
                  : t("dashboard.miscellaneous.pageTab.uploadFavicon")}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadingFavicon}
                  onChange={(e) => void handleFaviconPick(e.target.files?.[0])}
                />
              </label>
              <p className="mt-2 text-[10px] text-white/35">
                {t("dashboard.miscellaneous.pageTab.faviconHint")}
              </p>
            </div>

            <DashboardPrivacyToggle
              label={t("dashboard.miscellaneous.pageTab.typingEffect")}
              description={t("dashboard.miscellaneous.pageTab.typingEffectDesc")}
              checked={pageTitleTyping}
              onChange={setPageTitleTyping}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void savePageTabSettings()}
              disabled={savingPageTab}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingPageTab ? t("dashboard.common.saving") : t("dashboard.miscellaneous.pageTab.save")}
            </button>
            <button
              type="button"
              onClick={resetPageTab}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.06]"
            >
              <RotateCcw className="h-4 w-4" />
              {t("dashboard.miscellaneous.pageTab.reset")}
            </button>
          </div>
        </DashCard>

        <DashCard title={t("dashboard.miscellaneous.embed.title")}>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            {t("dashboard.miscellaneous.embed.description", { siteName: SITE_NAME, url: previewUrl })}
          </p>

          <div className="mb-5 overflow-hidden rounded-xl border border-[#1e1f22] bg-[#2b2d31]">
            <div className="border-b border-[#1e1f22] px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-[#949ba4]">
              {t("dashboard.miscellaneous.embed.previewLabel")}
            </div>
            <div className="space-y-2 p-3">
              <p className="text-xs text-[#00a8fc]">{previewUrl}</p>
              <div className="overflow-hidden rounded-lg border-l-4 border-[#5865f2] bg-[#1e1f22]">
                {previewImage ? (
                  <img src={previewImage} alt="" className="max-h-36 w-full object-cover" />
                ) : null}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#f2f3f5]">{previewEmbedTitle}</p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#b5bac1]">
                    {previewDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                {t("dashboard.miscellaneous.embed.embedTitle")}
              </label>
              <input
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value.slice(0, SHARE_EMBED_TITLE_MAX))}
                maxLength={SHARE_EMBED_TITLE_MAX}
                placeholder={DEFAULT_SHARE_EMBED_TITLE}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
              />
              <p className="mt-1 text-[10px] text-white/35">
                {embedTitle.length}/{SHARE_EMBED_TITLE_MAX} · {DEFAULT_SHARE_EMBED_TITLE}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/55">
                {t("dashboard.miscellaneous.embed.embedDescription")}
              </label>
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
                {t("dashboard.miscellaneous.embed.bannerImage")}
              </label>
              {embedImageUrl ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-white/[0.08]">
                  <img src={embedImageUrl} alt="" className="max-h-40 w-full object-cover" />
                </div>
              ) : (
                <p className="mb-3 text-xs text-white/40">
                  {t("dashboard.miscellaneous.embed.defaultBanner", { siteName: SITE_NAME })}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
                  <ImageIcon className="h-4 w-4" />
                  {uploadingEmbedImage ? t("dashboard.common.saving") : t("dashboard.common.uploadImage")}
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
                    {t("dashboard.common.remove")}
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-[10px] text-white/35">
                {t("dashboard.miscellaneous.embed.bannerHint")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveEmbedSettings()}
              disabled={savingEmbed}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingEmbed ? t("dashboard.common.saving") : t("dashboard.miscellaneous.embed.save")}
            </button>
            <button
              type="button"
              onClick={resetShareEmbed}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/[0.06]"
            >
              <RotateCcw className="h-4 w-4" />
              {t("dashboard.miscellaneous.embed.reset")}
            </button>
          </div>

          <Link
            to="/$username"
            params={{ username: profile.username }}
            target="_blank"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-pink-400 transition hover:text-pink-300"
          >
            <Globe className="h-3.5 w-3.5" />
            {t("dashboard.miscellaneous.embed.viewPublicPage")}
          </Link>
        </DashCard>
      </div>
    </DashboardAccountLayout>
  );
}
