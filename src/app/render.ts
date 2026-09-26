// Render registry. Each editor region registers how it redraws itself; other modules ask for a
// redraw by part name instead of importing each other, which keeps the module graph acyclic.
//
// invalidate() batches redraws into the next animation frame, so a burst of input events (typing,
// slider drags) renders once per frame. renderParts() redraws immediately, for the playback loop
// and anything that must read the DOM right after rendering.

import { ensureSelection } from "./store.ts";

export type RenderPart = "stage" | "topbar" | "tabs" | "side" | "inspector" | "timeline" | "playback";

const ORDER: RenderPart[] = ["stage", "topbar", "tabs", "side", "inspector", "timeline", "playback"];
const renderers = new Map<RenderPart, () => void>();
const pending = new Set<RenderPart>();
let scheduledFrame = 0;
let selectionCheckPending = false;

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

export function invalidate(...parts: RenderPart[]): void {
  parts.forEach((part) => pending.add(part));
  if (!scheduledFrame) scheduledFrame = requestAnimationFrame(flush);
}

// Redraw everything next frame, after making sure the selection still points at the project.
export function invalidateAll(): void {
  selectionCheckPending = true;
  invalidate(...ORDER);
}

// Runs pending redraws now; call before reading or focusing freshly rendered DOM.
export function flush(): void {
  if (scheduledFrame) cancelAnimationFrame(scheduledFrame);
  scheduledFrame = 0;
  if (selectionCheckPending) {
    selectionCheckPending = false;
    ensureSelection();
  }
  const parts = ORDER.filter((part) => pending.has(part));
  pending.clear();
  renderParts(...parts);
}
