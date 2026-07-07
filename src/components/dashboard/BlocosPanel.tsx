import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type { Profile } from "@/lib/profile-storage";
import {
  BLOCK_PLACEMENT_LABELS,
  BLOCK_SIZE_LABELS,
  BLOCK_TYPE_LABELS,
  createProfileBlock,
  deleteProfileBlock,
  detectBlockFromUrl,
  fetchLinkMetadata,
  getErrorMessage,
  normalizeSpotifyUrl,
  MAX_PROFILE_BLOCKS,
  reorderProfileBlocks,
  resolveBlockPayload,
  updateProfileBlock,
  DISCORD_BLOCK_SIZE,
  DISCORD_BLOCK_SHAPES,
  isDiscordBlock,
  normalizeDiscordBlockConfig,
  type ProfileBlock,
  type ProfileBlockPlacement,
  type ProfileBlockSize,
  type ProfileBlockType,
} from "@/lib/profile-blocks";
import { BLOCK_SHAPE_LABELS, type BlockShape } from "@/lib/block-frame";

const BLOCK_SIZES: ProfileBlockSize[] = ["sm", "md", "lg"];
const BLOCK_SHAPES: BlockShape[] = ["rectangle", "square", "round"];

function sizesForBlockType(blockType: ProfileBlockType): ProfileBlockSize[] {
  return isDiscordBlock(blockType) ? [DISCORD_BLOCK_SIZE] : BLOCK_SIZES;
}

function shapesForBlockType(blockType: ProfileBlockType): BlockShape[] {
  return isDiscordBlock(blockType) ? [...DISCORD_BLOCK_SHAPES] : BLOCK_SHAPES;
}

function withDiscordDefaults<T extends { block_type: ProfileBlockType; size: ProfileBlockSize; block_shape: BlockShape }>(
  draft: T,
): T {
  if (!isDiscordBlock(draft.block_type)) return draft;
  return {
    ...draft,
    size: DISCORD_BLOCK_SIZE,
    block_shape:
      draft.block_shape === "square" ? "square" : "rectangle",
  };
}

function defaultSizeForPlacement(placement: ProfileBlockPlacement): ProfileBlockSize {
  return placement === "inside" ? "sm" : "md";
}

type Props = {
  profile: Profile;
  blocks: ProfileBlock[];
  onBlocksChange: (blocks: ProfileBlock[]) => void;
};

const BLOCK_TYPES: ProfileBlockType[] = ["link", "button", "spotify", "youtube", "discord_invite"];

function emptyDraft(placement: ProfileBlockPlacement) {
  return {
    block_type: "link" as ProfileBlockType,
    placement,
    size: defaultSizeForPlacement(placement) as ProfileBlockSize,
    block_shape: "rectangle" as BlockShape,
    share_row: false,
    show_card: true,
    title: "",
    subtitle: "",
    url: "",
    image_url: "" as string,
  };
}

function BlockDisplayOptions({
  shareRow,
  showCard,
  onShareRowChange,
  onShowCardChange,
}: {
  shareRow: boolean;
  showCard: boolean;
  onShareRowChange: (v: boolean) => void;
  onShowCardChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
        <div>
          <p className="text-xs font-medium text-white">Share row</p>
          <p className="text-[10px] text-white/45">Aligns on the same row (max. 3 together)</p>
        </div>
        <input
          type="checkbox"
          checked={shareRow}
          onChange={(e) => onShareRowChange(e.target.checked)}
          className="h-4 w-4 accent-pink-hot"
        />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
        <div>
          <p className="text-xs font-medium text-white">Card</p>
          <p className="text-[10px] text-white/45">Off = embed/media only, no site frame</p>
        </div>
        <input
          type="checkbox"
          checked={showCard}
          onChange={(e) => onShowCardChange(e.target.checked)}
          className="h-4 w-4 accent-pink-hot"
        />
      </label>
    </div>
  );
}

function BlockShapeSelect({
  value,
  onChange,
  shapes = BLOCK_SHAPES,
}: {
  value: BlockShape;
  onChange: (v: BlockShape) => void;
  shapes?: BlockShape[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">Shape</span>
      <div className={`grid gap-1.5 ${shapes.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {shapes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              value === s
                ? "border-pink-hot/50 bg-pink-hot/15 text-white"
                : "border-white/10 bg-black/20 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {BLOCK_SHAPE_LABELS[s]}
          </button>
        ))}
      </div>
    </label>
  );
}

function BlockSizeSelect({
  value,
  onChange,
  sizes = BLOCK_SIZES,
}: {
  value: ProfileBlockSize;
  onChange: (v: ProfileBlockSize) => void;
  sizes?: ProfileBlockSize[];
}) {
  if (sizes.length === 1) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
        <p className="text-xs text-white/50">Size</p>
        <p className="mt-0.5 text-sm font-medium text-white">{BLOCK_SIZE_LABELS[sizes[0]]}</p>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">Size</span>
      <div className="grid grid-cols-3 gap-1.5">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
              value === s
                ? "border-pink-hot/50 bg-pink-hot/15 text-white"
                : "border-white/10 bg-black/20 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {BLOCK_SIZE_LABELS[s]}
          </button>
        ))}
      </div>
    </label>
  );
}

export function BlocosPanel({ profile, blocks, onBlocksChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [draft, setDraft] = useState(emptyDraft("inside"));
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = (next: ProfileBlock[]) => {
    onBlocksChange(
      [...next].sort((a, b) =>
        a.placement === b.placement
          ? a.sort_order - b.sort_order
          : a.placement.localeCompare(b.placement),
      ),
    );
  };

  const handlePasteUrl = async (url: string) => {
    if (!url.trim()) return;
    const detected = detectBlockFromUrl(url);
    const canonical = normalizeSpotifyUrl(url);
    if (!detected && !canonical) return;

    const resolved = resolveBlockPayload(
      canonical ? "spotify" : (detected?.block_type ?? draft.block_type),
      url,
    );

    setDraft((d) =>
      withDiscordDefaults({
        ...d,
        url: resolved.url,
        block_type: resolved.block_type,
        title: detected?.title ?? d.title,
        subtitle: detected?.subtitle ?? d.subtitle,
        image_url: detected?.image_url ?? d.image_url,
      }),
    );
    setFetchingMeta(true);
    try {
      const meta = await fetchLinkMetadata(url);
      setDraft((d) =>
        withDiscordDefaults({
          ...d,
          block_type: meta.block_type,
          url: resolveBlockPayload(meta.block_type, url).url,
          title: meta.title || d.title,
          subtitle: meta.subtitle || d.subtitle,
          image_url: meta.image_url ?? d.image_url,
        }),
      );
    } catch {
      // metadata opcional
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleCreate = async () => {
    if (blocks.length >= MAX_PROFILE_BLOCKS) {
      toast.error(`Block limit of ${MAX_PROFILE_BLOCKS} reached`);
      return;
    }
    if (!draft.url.trim()) {
      toast.error("Enter a link");
      return;
    }
    setSaving(true);
    try {
      const resolved = resolveBlockPayload(draft.block_type, draft.url, {
        size: draft.size,
        block_shape: draft.block_shape,
        share_row: draft.share_row,
        show_card: draft.show_card,
      });
      let title = draft.title.trim();
      let subtitle = draft.subtitle.trim();
      let imageUrl = draft.image_url.trim() || null;
      let config: typeof resolved.config = {
        ...resolved.config,
        size: draft.size,
        block_shape: draft.block_shape,
        share_row: draft.share_row,
        show_card: draft.show_card,
      };

      if (resolved.block_type === "discord_invite") {
        config = normalizeDiscordBlockConfig(config);
      }

      if (resolved.block_type === "discord_invite" && draft.url.trim() && !title) {
        try {
          const meta = await fetchLinkMetadata(draft.url);
          title = meta.title || title;
          subtitle = meta.subtitle || subtitle;
          imageUrl = meta.image_url ?? imageUrl;
          config = normalizeDiscordBlockConfig({
            ...config,
            ...meta.config,
            size: draft.size,
            block_shape: draft.block_shape,
            share_row: draft.share_row,
            show_card: draft.show_card,
          });
        } catch {
          // mantém campos manuais
        }
      }

      const created = await createProfileBlock(profile.id, {
        block_type: resolved.block_type,
        placement: draft.placement,
        title,
        subtitle,
        url: resolved.url,
        image_url: imageUrl,
        config,
      });
      refresh([...blocks, created]);
      setDraft(emptyDraft(draft.placement));
      setAdding(false);
      toast.success("Block added");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Error creating block");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (block: ProfileBlock) => {
    setSaving(true);
    try {
      const resolved = resolveBlockPayload(block.block_type, block.url, block.config);
      const baseConfig = isDiscordBlock(block)
        ? normalizeDiscordBlockConfig({
            ...resolved.config,
            size: block.config.size ?? DISCORD_BLOCK_SIZE,
            block_shape: block.config.block_shape ?? "rectangle",
            share_row: block.config.share_row === true,
            show_card: block.config.show_card !== false,
          })
        : {
            ...resolved.config,
            size: block.config.size ?? defaultSizeForPlacement(block.placement),
            block_shape: block.config.block_shape ?? "rectangle",
            share_row: block.config.share_row === true,
            show_card: block.config.show_card !== false,
          };
      const updated = await updateProfileBlock(block.id, {
        block_type: resolved.block_type,
        placement: block.placement,
        title: block.title,
        subtitle: block.subtitle,
        url: resolved.url,
        image_url: block.image_url,
        config: baseConfig,
        enabled: block.enabled,
      });
      refresh(blocks.map((b) => (b.id === block.id ? updated : b)));
      setEditingId(null);
      toast.success("Block updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfileBlock(id);
      refresh(blocks.filter((b) => b.id !== id));
      toast.success("Block removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error removing");
    }
  };

  const moveBlock = async (block: ProfileBlock, dir: -1 | 1) => {
    const same = blocks
      .filter((b) => b.placement === block.placement)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = same.findIndex((b) => b.id === block.id);
    const target = idx + dir;
    if (target < 0 || target >= same.length) return;
    const reordered = [...same];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const ids = reordered.map((b) => b.id);
    try {
      await reorderProfileBlocks(profile.id, block.placement, ids);
      const others = blocks.filter((b) => b.placement !== block.placement);
      const next = reordered.map((b, i) => ({ ...b, sort_order: i }));
      refresh([...others, ...next]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error reordering");
    }
  };

  const toggleEnabled = async (block: ProfileBlock) => {
    try {
      const updated = await updateProfileBlock(block.id, { enabled: !block.enabled });
      refresh(blocks.map((b) => (b.id === block.id ? updated : b)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating");
    }
  };

  const sorted = [...blocks].sort((a, b) =>
    a.placement === b.placement
      ? a.sort_order - b.sort_order
      : a.placement.localeCompare(b.placement),
  );

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-white/50">
        Maximum of <strong className="text-white/70">{MAX_PROFILE_BLOCKS} blocks</strong>.
        Sizes are fixed (small, medium, large) for all types. Choose the shape: rectangle, square, or round.
        Use <strong className="text-white/70">Share row</strong> to align up to 3 on the same line.
        Turn off <strong className="text-white/70">Card</strong> to show only the embed (e.g. Spotify player).
      </p>
      <p className="text-[11px] text-white/35">{blocks.length}/{MAX_PROFILE_BLOCKS} blocks</p>

      {!adding ? (
        <button
          type="button"
          disabled={blocks.length >= MAX_PROFILE_BLOCKS}
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/70 transition hover:border-pink-hot/40 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          New block
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-white">New block</h3>

          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Position</span>
            <select
              value={draft.placement}
              onChange={(e) => {
                const placement = e.target.value as ProfileBlockPlacement;
                setDraft((d) => ({
                  ...d,
                  placement,
                  size: d.size ?? defaultSizeForPlacement(placement),
                }));
              }}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              {(Object.keys(BLOCK_PLACEMENT_LABELS) as ProfileBlockPlacement[]).map((k) => (
                <option key={k} value={k}>
                  {BLOCK_PLACEMENT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Type</span>
            <select
              value={draft.block_type}
              onChange={(e) => {
                const block_type = e.target.value as ProfileBlockType;
                setDraft((d) =>
                  withDiscordDefaults({ ...d, block_type }),
                );
              }}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BLOCK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

          {isDiscordBlock(draft.block_type) && (
            <p className="text-[10px] leading-relaxed text-white/40">
              Discord invite: large size only, square or rectangle shape.
            </p>
          )}

          <BlockSizeSelect
            value={draft.size}
            sizes={sizesForBlockType(draft.block_type)}
            onChange={(size) => setDraft((d) => ({ ...d, size }))}
          />

          <BlockShapeSelect
            value={draft.block_shape}
            shapes={shapesForBlockType(draft.block_type)}
            onChange={(block_shape) => setDraft((d) => ({ ...d, block_shape }))}
          />

          <BlockDisplayOptions
            shareRow={draft.share_row}
            showCard={draft.show_card}
            onShareRowChange={(share_row) => setDraft((d) => ({ ...d, share_row }))}
            onShowCardChange={(show_card) => setDraft((d) => ({ ...d, show_card }))}
          />

          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-xs text-white/50">
              Link
              {fetchingMeta && <Loader2 className="h-3 w-3 animate-spin" />}
            </span>
            <input
              type="url"
              value={draft.url}
              onChange={(e) => {
                const v = e.target.value;
                setDraft((d) => ({ ...d, url: v }));
                void handlePasteUrl(v);
              }}
              placeholder={
                draft.block_type === "discord_invite"
                  ? "https://discord.gg/your-invite"
                  : "https://open.spotify.com/track/..."
              }
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-white/50">
              {draft.block_type === "button" ? "Button text" : "Title"}
            </span>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-white/50">Subtitle / description</span>
            <textarea
              value={draft.subtitle}
              onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>

          {draft.block_type === "link" && (
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Image URL (optional)</span>
              <input
                type="url"
                value={draft.image_url}
                onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleCreate()}
              className="flex-1 rounded-lg bg-pink-hot px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft(emptyDraft("inside"));
              }}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <p className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-6 text-center text-xs text-white/40">
          No blocks yet. Add Spotify, YouTube, or custom links.
        </p>
      )}

      <div className="space-y-2">
        {sorted.map((block) => (
          <div
            key={block.id}
            className={`rounded-xl border p-3 transition ${
              block.enabled
                ? "border-white/10 bg-white/[0.03]"
                : "border-white/5 bg-white/[0.01] opacity-60"
            }`}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-white/20" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
                    {BLOCK_TYPE_LABELS[block.block_type]}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {BLOCK_PLACEMENT_LABELS[block.placement]}
                  </span>
                  <span className="text-[10px] text-white/35">
                    · {BLOCK_SIZE_LABELS[block.config.size ?? defaultSizeForPlacement(block.placement)]}
                    · {BLOCK_SHAPE_LABELS[block.config.block_shape ?? "rectangle"]}
                  </span>
                  {block.config.share_row && (
                    <span className="text-[10px] text-pink-hot/80">· shares row</span>
                  )}
                  {block.config.show_card === false && (
                    <span className="text-[10px] text-white/35">· no card</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-medium text-white">
                  {block.title || block.url || "Untitled"}
                </p>
                {block.subtitle && (
                  <p className="truncate text-xs text-white/45">{block.subtitle}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => void moveBlock(block, -1)}
                  className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                  title="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void moveBlock(block, 1)}
                  className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
                  title="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditingId(editingId === block.id ? null : block.id)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/5"
              >
                {editingId === block.id ? "Close" : "Edit"}
              </button>
              <button
                type="button"
                onClick={() => void toggleEnabled(block)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/5"
              >
                {block.enabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(block.id)}
                className="rounded-lg border border-red-500/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {editingId === block.id && (
              <BlockEditForm
                block={block}
                saving={saving}
                onSave={(next) => void handleUpdate(next)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockEditForm({
  block,
  saving,
  onSave,
  onCancel,
}: {
  block: ProfileBlock;
  saving: boolean;
  onSave: (block: ProfileBlock) => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState(block);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  const handleUrl = async (url: string) => {
    const detected = detectBlockFromUrl(url);
    const canonical = normalizeSpotifyUrl(url);
    const resolved = resolveBlockPayload(
      canonical ? "spotify" : (detected?.block_type ?? local.block_type),
      url,
    );
    setLocal((b) => ({
      ...b,
      url: resolved.url,
      block_type: resolved.block_type,
      config:
        resolved.block_type === "discord_invite"
          ? normalizeDiscordBlockConfig({ ...b.config, ...resolved.config })
          : { ...b.config, ...resolved.config },
    }));
    if (!detected && !canonical) return;
    setFetchingMeta(true);
    try {
      const meta = await fetchLinkMetadata(url);
      const metaResolved = resolveBlockPayload(meta.block_type, url, local.config);
      setLocal((b) => ({
        ...b,
        block_type: metaResolved.block_type,
        url: metaResolved.url,
        title: meta.title || b.title,
        subtitle: meta.subtitle || b.subtitle,
        image_url: meta.image_url ?? b.image_url,
        config:
          metaResolved.block_type === "discord_invite"
            ? normalizeDiscordBlockConfig({ ...b.config, ...metaResolved.config })
            : { ...b.config, ...metaResolved.config },
      }));
    } finally {
      setFetchingMeta(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <select
        value={local.placement}
        onChange={(e) =>
          setLocal((b) => ({ ...b, placement: e.target.value as ProfileBlockPlacement }))
        }
        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      >
        {(Object.keys(BLOCK_PLACEMENT_LABELS) as ProfileBlockPlacement[]).map((k) => (
          <option key={k} value={k}>
            {BLOCK_PLACEMENT_LABELS[k]}
          </option>
        ))}
      </select>
      <select
        value={local.block_type}
        onChange={(e) => {
          const block_type = e.target.value as ProfileBlockType;
          setLocal((b) => ({
            ...b,
            block_type,
            config: isDiscordBlock(block_type)
              ? normalizeDiscordBlockConfig({ ...b.config, size: DISCORD_BLOCK_SIZE })
              : b.config,
          }));
        }}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      >
        {BLOCK_TYPES.map((t) => (
          <option key={t} value={t}>
            {BLOCK_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <BlockSizeSelect
        value={local.config.size ?? defaultSizeForPlacement(local.placement)}
        sizes={sizesForBlockType(local.block_type)}
        onChange={(size) => setLocal((b) => ({ ...b, config: { ...b.config, size } }))}
      />
      <BlockShapeSelect
        value={local.config.block_shape ?? "rectangle"}
        shapes={shapesForBlockType(local.block_type)}
        onChange={(block_shape) =>
          setLocal((b) => ({ ...b, config: { ...b.config, block_shape } }))
        }
      />
      <BlockDisplayOptions
        shareRow={local.config.share_row === true}
        showCard={local.config.show_card !== false}
        onShareRowChange={(share_row) =>
          setLocal((b) => ({ ...b, config: { ...b.config, share_row } }))
        }
        onShowCardChange={(show_card) =>
          setLocal((b) => ({ ...b, config: { ...b.config, show_card } }))
        }
      />
      <input
        type="url"
        value={local.url}
        onChange={(e) => void handleUrl(e.target.value)}
        placeholder="Link"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      />
      {fetchingMeta && (
        <p className="flex items-center gap-1 text-[10px] text-white/40">
          <Loader2 className="h-3 w-3 animate-spin" /> Fetching details...
        </p>
      )}
      <input
        type="text"
        value={local.title}
        onChange={(e) => setLocal((b) => ({ ...b, title: e.target.value }))}
        placeholder="Title"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      />
      <textarea
        value={local.subtitle}
        onChange={(e) => setLocal((b) => ({ ...b, subtitle: e.target.value }))}
        placeholder="Subtitle / text"
        rows={2}
        className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(local)}
          className="rounded-lg bg-pink-hot px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
