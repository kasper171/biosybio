/** URL aponta para vídeo mp4/mov (wallpaper ou faixa). */
export function isVideoMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  return /\.(mp4|m4v|mov)$/.test(path);
}
