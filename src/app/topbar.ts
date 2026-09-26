import { ASPECT_RATIOS, isOneOf } from "../core/schema.ts";
import { els, query } from "./dom.ts";
import { exportProjectJson, handleCaptionInput, handleJsonInput, handleMediaInput } from "./media.ts";
import { renderAll } from "./render.ts";
import { mediaExtensionLabel, state } from "./store.ts";

export function setupTopActions(): void {
  els.topActions.innerHTML = [
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

  els.aspectSelect.addEventListener("change", () => {
    const value = els.aspectSelect.value;
    state.cwi.project.aspectRatio = isOneOf(ASPECT_RATIOS, value) ? value : "16:9";
    state.autoAspect = false;
    renderAll();
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

export function renderTopbar(): void {
  els.projectName.textContent = state.mediaObjectUrl
    ? state.cwi.project.mediaName || "Browser media"
    : `${state.cwi.project.title || "Untitled CWI"}${mediaExtensionLabel()}`;
  els.mediaBoundary.textContent = state.mediaObjectUrl ? "Browser-only Media" : "Local Sample";
  if (els.statusRegion) els.statusRegion.textContent = state.statusMessage || "";
}
