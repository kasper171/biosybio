import { useState } from "react";
import { Globe, Lock, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Profile } from "@/lib/profile-storage";
import { saveTemplate } from "@/lib/profile-template";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  userId: string;
  onSaved?: () => void;
};

export function SaveTemplateDialog({ open, onOpenChange, profile, userId, onSaved }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (visibility: "public" | "private") => {
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      toast.error("Give the template a name");
      return;
    }
    setSaving(true);
    try {
      await saveTemplate({
        userId,
        profile,
        name: trimmed,
        description,
        visibility,
        isLive: false,
      });
      toast.success(
        visibility === "public" ? "Template published to the gallery!" : "Template saved as private",
      );
      setName("");
      setDescription("");
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error saving template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#121218] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4 text-pink-400" />
            Save template
          </DialogTitle>
          <DialogDescription className="text-white/45">
            Saves layout, colors, sizes, and effects. Avatar, images, and music are not included.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/55">Template name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Ex: Neon Dark"
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/55">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Describe the template style..."
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-pink-500/50"
            />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("private")}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            Save private
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("public")}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Globe className="h-4 w-4" />
            Save public
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
