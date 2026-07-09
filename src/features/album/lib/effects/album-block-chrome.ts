import type { CSSProperties } from "react";
import type { AlbumBlockChrome } from "@/features/album/types/album.types";
import { getRevealClass, normalizeCardRevealEffect } from "@/lib/card-reveal";

export function albumBlockChromeStyle(chrome?: AlbumBlockChrome): CSSProperties {
  if (!chrome) return {};
  const style: CSSProperties = {};
  if (chrome.borderRadius != null) style.borderRadius = `${chrome.borderRadius}px`;
  if (chrome.borderStyle && chrome.borderStyle !== "none") {
    style.borderStyle = chrome.borderStyle;
    style.borderWidth = `${chrome.borderWidth ?? 2}px`;
    style.borderColor = chrome.borderColor ?? "rgba(255,255,255,0.25)";
  }
  return style;
}

export function albumBlockRevealClass(chrome?: AlbumBlockChrome, animate = true): string {
  if (!animate || !chrome?.revealEffect || chrome.revealEffect === "none") return "";
  return getRevealClass(normalizeCardRevealEffect(chrome.revealEffect));
}
