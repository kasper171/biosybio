const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/gi;
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SCRIPTISH_RE = /(javascript:|data:text\/html|on\w+\s*=)/gi;

export const ALBUM_TEXT_MAX_LENGTH = 8_000;
export const ALBUM_TITLE_MAX_LENGTH = 120;
export const ALBUM_ALT_MAX_LENGTH = 200;

/** Strip HTML/control chars and dangerous URI patterns from free text. */
export function albumSanitizePlainText(
  input: string,
  maxLength = ALBUM_TEXT_MAX_LENGTH,
): string {
  const stripped = input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "")
    .replace(SCRIPTISH_RE, "")
    .trim();
  return stripped.slice(0, maxLength);
}

/** Escape for safe attribute insertion (defense in depth; React text nodes already escape). */
export function albumEscapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function albumSanitizeHexColor(value: string): string | null {
  const m = value.trim().match(/^#([0-9a-fA-F]{6})$/);
  return m ? `#${m[1].toLowerCase()}` : null;
}
