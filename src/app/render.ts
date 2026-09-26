// Render registry. Each editor region registers how it redraws itself; other modules ask for a
// redraw by part name instead of importing each other, which keeps the module graph acyclic.

import { ensureSelection } from "./store.ts";

export type RenderPart = "stage" | "topbar" | "tabs" | "side" | "inspector" | "timeline" | "playback";

const ORDER: RenderPart[] = ["stage", "topbar", "tabs", "side", "inspector", "timeline", "playback"];
const renderers = new Map<RenderPart, () => void>();

export function registerRenderer(part: RenderPart, render: () => void): void {
  renderers.set(part, render);
}

export function renderParts(...parts: RenderPart[]): void {
  ORDER.forEach((part) => {
    if (parts.includes(part)) renderers.get(part)?.();
  });
}

export function renderAll(): void {
  ensureSelection();
  renderParts(...ORDER);
}
