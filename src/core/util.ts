export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Reads a number from loosely typed input (imported JSON, form values); empty values fall back.
export function toNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function roundTime(value: number): number {
  return Math.round(Number(value) * 100) / 100;
}

export function formatTime(value: number): string {
  const seconds = Math.max(0, Number(value) || 0);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(2).padStart(5, "0")}`;
}

export function percentile(values: number[], ratio: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  const index = clamp((sorted.length - 1) * ratio, 0, sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function slugify(value: string): string {
  return String(value || "cwi-project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cwi-project";
}

export function fileNameStem(value: string): string {
  const name = String(value || "Local Media").split(/[\\/]/).pop() || "Local Media";
  return name.replace(/\.[^.]+$/, "") || name;
}

export function capitalize(value: string): string {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export function escapeHtml(value: unknown): string {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

// Case- and punctuation-insensitive form of transcript text, for comparing cue text with its words.
export function normalizeWordText(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
