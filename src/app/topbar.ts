import { ASPECT_RATIOS, isOneOf } from "../core/schema.ts";
import { els, query } from "./dom.ts";
import { exportProjectJson, handleCaptionInput, handleJsonInput, handleMediaInput } from "./media.ts";
import { flush, invalidateAll } from "./render.ts";
import { announceStatus } from "./status.ts";
import { commit, historyState, mediaExtensionLabel, redo, state, undo } from "./store.ts";

export function setupTopActions(): void {
  els.topActions.innerHTML = [
    '<button type="button" class="text-button" id="undoButton">Undo</button>',
    '<button type="button" class="text-button" id="redoButton">Redo</button>',
    `<label class="aspect-select"><span class="visually-hidden">Frame aspect ratio</span><select class="control-select" id="aspectSelect" aria-label="Frame aspect ratio">${ASPECT_RATIOS.map((aspect) => `<option value="${aspect}">${aspect}</option>`).join("")}</select></label>`,
    '<button type="button" class="text-button" id="mediaButton">Media</button>',
    '<button type="button" class="text-button" id="captionButton">Import Captions</button>',
    '<button type="button" class="text-button" id="importJsonButton">Import CWI JSON</button>',
    '<button type="button" class="primary-button" id="exportJsonButton">Export JSON</button>',
    '<input class="visually-hidden" id="mediaInput" type="file" accept="video/*,audio/*">',
    '<input class="visually-hidden" id="captionInput" type="file" accept=".srt,.vtt,text/vtt,text/plain">',
    '<input class="visually-hidden" id="jsonInput" type="file" accept="application/json,.json">'
  ].join("");

  els.mediaInput = query<HTMLInputElement>("#mediaInput");
  els.captionInput = query<HTMLInputElement>("#captionInput");
  els.jsonInput = query<HTMLInputElement>("#jsonInput");
  els.mediaButton = query("#mediaButton");
  els.captionButton = query("#captionButton");
  els.importJsonButton = query("#importJsonButton");
  els.exportJsonButton = query("#exportJsonButton");
  els.aspectSelect = query<HTMLSelectElement>("#aspectSelect");
  els.undoButton = query<HTMLButtonElement>("#undoButton");
  els.redoButton = query<HTMLButtonElement>("#redoButton");

  els.undoButton.addEventListener("click", () => stepHistory("undo"));
  els.redoButton.addEventListener("click", () => stepHistory("redo"));
  // Text fields keep the browser's own undo; everywhere else the shortcuts undo project edits.
  document.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target && (target.isContentEditable || target.closest("input, textarea, select"))) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      stepHistory(event.shiftKey ? "redo" : "undo");
    } else if (key === "y" && event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      stepHistory("redo");
    }
  });

  els.aspectSelect.addEventListener("change", () => {
    const value = els.aspectSelect.value;
    commit("Aspect ratio", (project) => {
      project.project.aspectRatio = isOneOf(ASPECT_RATIOS, value) ? value : "16:9";
    });
    state.autoAspect = false;
    invalidateAll();
  });
  els.mediaButton.addEventListener("click", () => els.mediaInput.click());
  els.captionButton.addEventListener("click", () => els.captionInput.click());
  els.importJsonButton.addEventListener("click", () => els.jsonInput.click());
  els.mediaInput.addEventListener("change", handleMediaInput);
  els.captionInput.addEventListener("change", handleCaptionInput);
  els.jsonInput.addEventListener("change", handleJsonInput);
  els.exportJsonButton.addEventListener("click", exportProjectJson);
}

export function renderStageFrame(): void {
  const aspect = isOneOf(ASPECT_RATIOS, state.cwi.project.aspectRatio) ? state.cwi.project.aspectRatio : "16:9";
  const [width, height] = aspect.split(":").map(Number);
  els.phoneFrame.style.setProperty("--frame-aspect-w", String(width));
  els.phoneFrame.style.setProperty("--frame-aspect-h", String(height));
  els.phoneFrame.dataset.aspect = aspect;
  if (els.aspectSelect) els.aspectSelect.value = aspect;
}

function stepHistory(direction: "undo" | "redo"): void {
  const label = direction === "undo" ? undo() : redo();
  if (!label) return;
  announceStatus(`${direction === "undo" ? "Undid" : "Redid"} ${label}.`);
  invalidateAll();
  flush();
}

export function renderTopbar(): void {
  const { undoLabel, redoLabel } = historyState();
  els.undoButton.disabled = !undoLabel;
  els.undoButton.title = undoLabel ? `Undo ${undoLabel}` : "Nothing to undo";
  els.redoButton.disabled = !redoLabel;
  els.redoButton.title = redoLabel ? `Redo ${redoLabel}` : "Nothing to redo";
  els.projectName.textContent = state.mediaObjectUrl
    ? state.cwi.project.mediaName || "Browser media"
    : `${state.cwi.project.title || "Untitled CWI"}${mediaExtensionLabel()}`;
  els.mediaBoundary.textContent = state.mediaObjectUrl ? "Browser-only Media" : "Local Sample";
  if (els.statusRegion) els.statusRegion.textContent = state.statusMessage || "";
}
