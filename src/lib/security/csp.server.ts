import '@tanstack/react-start/server-only';

import { randomBytes } from "node:crypto";

export function createCspNonce(): string {
  return randomBytes(16).toString("base64");
}

/** CSP with per-request nonce — no script-src/style-src unsafe-inline. */
export function buildContentSecurityPolicy(nonce: string): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    `style-src-elem 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "style-src-attr 'unsafe-inline'",
    [
      "img-src 'self' data: blob:",
      "https://*.supabase.co",
      "https://cdn.discordapp.com",
      "https://media.discordapp.net",
      "https://dcdn.dstn.to",
      "https://i.scdn.co",
      "https://img.youtube.com",
      "https://www.habbo.com",
      "https://www.habbo.com.br",
      "https://imaging.habblet.city",
    ].join(" "),
    "font-src 'self' data: https://fonts.gstatic.com",
    [
      "connect-src 'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://api.lanyard.rest",
      "https://discord.com",
      "https://dcdn.dstn.to",
      "https://www.habbo.com",
      "https://www.habbo.com.br",
      "https://api.habblet.city",
    ].join(" "),
    "media-src 'self' blob: https://*.supabase.co",
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com",
  ];

  return directives.join("; ");
}

export function injectNonceIntoHtml(html: string, nonce: string): string {
  return html
    .replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`)
    .replace(/<style(?![^>]*\bnonce=)/gi, `<style nonce="${nonce}"`);
}
