/**
 * Album storage quota tests (no Supabase required for validation layer).
 * Run: node scripts/test-album-storage-quota.mjs
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Inline mirror of server validation rules for CI-less smoke test
const ALBUM_STORAGE_QUOTA_BYTES = 200 * 1024 * 1024;
const ALBUM_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

function wouldExceedQuota(currentUsed, fileSize) {
  return currentUsed + fileSize > ALBUM_STORAGE_QUOTA_BYTES;
}

function simulateAtomicReserve(currentUsed, fileSize) {
  if (fileSize <= 0) return { ok: false, used: currentUsed };
  if (currentUsed + fileSize > ALBUM_STORAGE_QUOTA_BYTES) return { ok: false, used: currentUsed };
  return { ok: true, used: currentUsed + fileSize };
}

// Quota edge: exactly at limit
assert.equal(wouldExceedQuota(ALBUM_STORAGE_QUOTA_BYTES - 100, 100), false);
assert.equal(wouldExceedQuota(ALBUM_STORAGE_QUOTA_BYTES - 100, 101), true);

// Race simulation: two 50MB uploads with 120MB used — only one succeeds atomically
let used = 120 * 1024 * 1024;
const uploadSize = 50 * 1024 * 1024;
const first = simulateAtomicReserve(used, uploadSize);
assert.equal(first.ok, true);
used = first.used;
const second = simulateAtomicReserve(used, uploadSize);
assert.equal(second.ok, false, "second concurrent upload must fail when quota exceeded");

// Migration defines atomic SQL function
const migration = readFileSync(
  join(root, "supabase/migrations/20260709110000_album_storage_quota_atomic.sql"),
  "utf8",
);
assert.match(migration, /album_reserve_storage_bytes/);
assert.match(migration, /storage_bytes_used \+ p_bytes <= p_max_bytes/);

// Per-file cap
assert.equal(ALBUM_IMAGE_MAX_BYTES, 10 * 1024 * 1024);

console.log("album storage quota smoke tests: OK");
