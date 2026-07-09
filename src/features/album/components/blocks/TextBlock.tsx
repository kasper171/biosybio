import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { AlbumAnimatedText } from "@/features/album/components/effects/AlbumAnimatedText";
import { albumSanitizePlainText } from "@/features/album/lib/security/album-sanitize";
import {
  ALBUM_TEXT_ANIMATION_IDS,
  ALBUM_TEXT_ANIMATION_LABELS,
} from "@/features/album/lib/effects/album-text-animations";
import type { AlbumTheme } from "@/features/album/types/album.types";

type Props = AlbumBlockEditorProps<"text"> & { theme?: AlbumTheme };

export function TextBlockEditor({ block, onChange, theme }: Props) {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <textarea
        value={block.data.content}
        onChange={(e) => onChange({ ...block.data, content: albumSanitizePlainText(e.target.value) })}
        placeholder="Escreva sua bio ou texto..."
        className="min-h-0 flex-1 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[oklch(0.65_0.28_0)]"
        maxLength={8000}
      />
      <select
        value={block.data.textAnimation ?? "none"}
        onChange={(e) => onChange({ ...block.data, textAnimation: e.target.value })}
        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
      >
        {ALBUM_TEXT_ANIMATION_IDS.map((id) => (
          <option key={id} value={id}>
            {ALBUM_TEXT_ANIMATION_LABELS[id]}
          </option>
        ))}
      </select>
      {block.data.content ? (
        <div className="pointer-events-none rounded-lg border border-dashed border-white/10 p-2 text-xs text-white/70">
          <AlbumAnimatedText
            text={block.data.content}
            animationId={block.data.textAnimation}
            theme={theme ?? {}}
          />
        </div>
      ) : null}
    </div>
  );
}

export function TextBlockPublic({
  block,
  theme,
}: AlbumBlockPublicProps<"text"> & { theme: AlbumTheme }) {
  if (!block.data.content) {
    return <div className="flex h-full items-center justify-center text-xs text-white/30">Texto</div>;
  }
  return (
    <div
      className="flex h-full items-center p-4 text-sm leading-relaxed"
      style={{
        color: block.data.color ?? theme.bodyTextColor ?? "rgba(255,255,255,0.85)",
        textAlign: block.data.align ?? "left",
      }}
    >
      <AlbumAnimatedText
        text={block.data.content}
        animationId={block.data.textAnimation}
        theme={theme}
      />
    </div>
  );
}
