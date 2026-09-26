import { els } from "./dom.ts";
import { state } from "./store.ts";

// Screen-reader announcement for import, analysis, and seek results.
export function announceStatus(message: string): void {
  state.statusMessage = String(message || "");
  if (els.statusRegion) els.statusRegion.textContent = state.statusMessage;
}
