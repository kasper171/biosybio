import type { AlbumBlockEditorProps, AlbumBlockPublicProps } from "@/features/album/types/block-registry.types";
import { AlbumAnimatedText } from "@/features/album/components/effects/AlbumAnimatedText";
import type { AlbumTheme } from "@/features/album/types/album.types";

type Props = AlbumBlockPublicProps<"text"> & { theme: AlbumTheme };

export function TextBlockEditor({ block, theme }: AlbumBlockEditorProps<"text"> & { theme?: AlbumTheme }) {
  if (!block.data.content) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-white/35">
        Edite o texto no painel Layout
      </div>
    );
  }
  return <TextBlockPublic block={block} theme={theme ?? {}} userId="" />;
}

export function TextBlockPublic({ block, theme }: Props) {
  if (!block.data.content) {
    return <div className="flex h-full items-center justify-center text-xs text-white/30">Texto</div>;
  }
  return (
    <div
      className="album-block-text flex h-full w-full items-center overflow-visible p-3 text-sm leading-relaxed sm:p-4"
      style={{
        color: block.data.color ?? theme.bodyTextColor ?? "rgba(255,255,255,0.85)",
        textAlign: block.data.align ?? "left",
        justifyContent:
          block.data.align === "center" ? "center" : block.data.align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <AlbumAnimatedText
        key={`${block.id}-${block.data.textAnimation ?? "none"}`}
        text={block.data.content}
        animationId={block.data.textAnimation}
        theme={theme}
        className="max-w-full break-words"
      />
    </div>
  );
}
