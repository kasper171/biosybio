import type { AlbumBlock, AlbumBlockChrome, AlbumBlockType } from "@/features/album/types/album.types";
import { AlbumBlockPalette } from "@/features/album/components/editor/AlbumBlockPalette";
import { getAlbumBlockDef } from "@/features/album/registry/blockRegistry";
import { albumCreateBlockId } from "@/features/album/lib/album-grid-utils";
import { parseSpotifyEmbedMeta } from "@/features/album/lib/spotify/album-spotify-embed";
import { albumSpotifyBlockSize } from "@/features/album/lib/album-connection-block-sizes";
import { albumSanitizePlainText } from "@/features/album/lib/security/album-sanitize";
import { CARD_BORDER_STYLES } from "@/lib/card-border";
import { CARD_REVEAL_OPTIONS } from "@/lib/card-reveal";

type Props = {
  blocks: AlbumBlock[];
  onBlocksChange: (blocks: AlbumBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function updateBlock(blocks: AlbumBlock[], id: string, patch: Partial<AlbumBlock>): AlbumBlock[] {
  return blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
}

function updateChrome(
  blocks: AlbumBlock[],
  id: string,
  patch: Partial<AlbumBlockChrome>,
): AlbumBlock[] {
  return blocks.map((b) =>
    b.id === id ? { ...b, chrome: { ...(b.chrome ?? {}), ...patch } } : b,
  );
}

export function AlbumLayoutToolsPanel({ blocks, onBlocksChange, selectedId, onSelect }: Props) {
  const selected = selectedId ? blocks.find((b) => b.id === selectedId) : null;

  const addBlock = (type: AlbumBlockType) => {
    const def = getAlbumBlockDef(type);
    if (!def) return;
    const size = def.defaultSize;
    const maxY = blocks.reduce((acc, b) => Math.max(acc, b.y + b.h), 0);
    const block: AlbumBlock = {
      id: albumCreateBlockId(),
      type,
      x: 0,
      y: maxY,
      w: size.w,
      h: size.h,
      data: def.defaultData() as AlbumBlock["data"],
    };
    onBlocksChange([...blocks, block]);
    onSelect(block.id);
  };

  const setSpotifyUrl = (raw: string) => {
    if (!selected || selected.type !== "spotify") return;
    const meta = parseSpotifyEmbedMeta(raw);
    const size = meta ? albumSpotifyBlockSize(meta.compact) : null;
    onBlocksChange(
      updateBlock(blocks, selected.id, {
        data: {
          ...selected.data,
          embedUrl: meta?.embedUrl ?? raw,
          kind: meta?.kind,
        },
        ...(size ? { w: size.w, h: size.h } : {}),
      }),
    );
  };

  return (
    <div className="space-y-4">
      <AlbumBlockPalette onAdd={addBlock} />

      {selected?.type === "spotify" ? (
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-xs font-semibold text-white/70">Spotify</p>
          <input
            value={selected.data.embedUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="album-input text-xs"
          />
          <input
            value={selected.data.title ?? ""}
            onChange={(e) =>
              onBlocksChange(
                updateBlock(blocks, selected.id, {
                  data: {
                    ...selected.data,
                    title: albumSanitizePlainText(e.target.value, 120),
                  },
                }),
              )
            }
            placeholder="Título (opcional)"
            className="album-input text-xs"
          />
          {selected.data.kind ? (
            <p className="text-[0.65rem] text-white/40">
              Tipo: {selected.data.kind === "track" || selected.data.kind === "episode" ? "Música compacta" : "Playlist / álbum"}
            </p>
          ) : null}
        </div>
      ) : null}

      {selected ? (
        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-xs font-semibold text-white/70">Borda e efeitos do bloco</p>
          <label className="album-theme-field">
            <span>Espessura da borda</span>
            <input
              type="range"
              min={0}
              max={8}
              value={selected.chrome?.borderWidth ?? 0}
              onChange={(e) =>
                onBlocksChange(
                  updateChrome(blocks, selected.id, { borderWidth: Number(e.target.value) }),
                )
              }
            />
          </label>
          <label className="album-theme-field">
            <span>Arredondamento</span>
            <input
              type="range"
              min={0}
              max={32}
              value={selected.chrome?.borderRadius ?? 12}
              onChange={(e) =>
                onBlocksChange(
                  updateChrome(blocks, selected.id, { borderRadius: Number(e.target.value) }),
                )
              }
            />
          </label>
          <label className="album-theme-field">
            <span>Cor da borda</span>
            <input
              type="color"
              value={selected.chrome?.borderColor ?? "#ffffff"}
              onChange={(e) =>
                onBlocksChange(updateChrome(blocks, selected.id, { borderColor: e.target.value }))
              }
            />
          </label>
          <label className="album-theme-field">
            <span>Estilo da borda</span>
            <select
              value={selected.chrome?.borderStyle ?? "solid"}
              onChange={(e) =>
                onBlocksChange(
                  updateChrome(blocks, selected.id, {
                    borderStyle: e.target.value as AlbumBlockChrome["borderStyle"],
                  }),
                )
              }
              className="album-input text-xs"
            >
              <option value="none">Sem borda</option>
              {CARD_BORDER_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="album-theme-toggle">
            <input
              type="checkbox"
              checked={selected.chrome?.glowEnabled ?? false}
              onChange={(e) =>
                onBlocksChange(
                  updateChrome(blocks, selected.id, { glowEnabled: e.target.checked }),
                )
              }
            />
            <span>Glow no bloco</span>
          </label>
          <label className="album-theme-toggle">
            <input
              type="checkbox"
              checked={selected.chrome?.glassEnabled ?? false}
              onChange={(e) =>
                onBlocksChange(
                  updateChrome(blocks, selected.id, { glassEnabled: e.target.checked }),
                )
              }
            />
            <span>Efeito Glass no bloco</span>
          </label>
          <label className="album-theme-field">
            <span>Efeito de entrada</span>
            <select
              value={selected.chrome?.revealEffect ?? "inherit"}
              onChange={(e) => {
                const value = e.target.value;
                onBlocksChange(
                  blocks.map((b) => {
                    if (b.id !== selected.id) return b;
                    const nextChrome = { ...(b.chrome ?? {}) };
                    if (value === "inherit") delete nextChrome.revealEffect;
                    else nextChrome.revealEffect = value as AlbumBlockChrome["revealEffect"];
                    return { ...b, chrome: nextChrome };
                  }),
                );
              }}
              className="album-input text-xs"
            >
              <option value="inherit">Padrão do perfil</option>
              <option value="none">Sem animação</option>
              {CARD_REVEAL_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {selectedId ? (
        <p className="text-xs leading-relaxed text-white/40">
          Arraste para mover. Conexões e Spotify aparecem ao vivo no preview quando vinculados.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-white/40">
          Adicione um bloco ou clique em um existente para editar tamanho, borda e conteúdo.
        </p>
      )}
    </div>
  );
}
