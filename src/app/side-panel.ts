// Left side panel: the Transcript / Speakers / QA tabs and their delegated events.

import { closestElement, els, eventElement } from "./dom.ts";
import type { Control } from "./dom.ts";
import { renderQaPanel } from "./panels/qa.ts";
import { addSpeakerToProject, renderSpeakersPanel, updateSpeakerFromControl } from "./panels/speakers.ts";
import { addCueToTranscript, deleteCueFromTranscript, renderTranscriptPanel, updateTranscriptCueFromControl } from "./panels/transcript.ts";
import { invalidate, invalidateAll } from "./render.ts";
import { state } from "./store.ts";
import type { SideTab } from "./store.ts";

const TABS: SideTab[] = ["transcript", "speakers", "qa"];

function tabOf(element: HTMLElement): SideTab {
  const tab = element.dataset.tab;
  return tab === "speakers" || tab === "qa" ? tab : "transcript";
}

export function setupTabs(): void {
  els.tabs.forEach((tab, index) => {
    tab.dataset.tab = TABS[index];
    tab.id = `${TABS[index]}Tab`;
    tab.setAttribute("aria-controls", "sidePanelContent");
    tab.addEventListener("click", () => {
      state.activeTab = tabOf(tab);
      renderSideContent();
      renderTabs();
    });
    tab.addEventListener("keydown", handleTabKeydown);
  });
  els.sideContent.id = "sidePanelContent";
  els.sideContent.setAttribute("role", "tabpanel");
}

export function setupSidePanelEvents(): void {
  els.sideContent.addEventListener("click", (event) => {
    if (closestElement(event, "[data-add-speaker]")) {
      addSpeakerToProject();
      invalidateAll();
      return;
    }

    const editSpeaker = closestElement(event, "[data-speaker-edit]");
    if (editSpeaker) {
      toggleSpeakerEditor(editSpeaker.dataset.speakerEdit || "");
      return;
    }

    if (closestElement(event, "[data-add-cue]")) {
      addCueToTranscript();
      invalidateAll();
      return;
    }

    if (closestElement(event, "[data-import-captions]")) {
      els.captionInput.click();
      return;
    }

    const deleteCue = closestElement(event, "[data-delete-cue]");
    if (deleteCue) {
      deleteCueFromTranscript(deleteCue.dataset.deleteCue || "");
      invalidateAll();
      return;
    }

    const cueSelect = closestElement(event, "[data-cue-select]");
    if (cueSelect) selectCue(cueSelect.dataset.cueSelect || "");
  });

  els.sideContent.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const insideControl = closestElement(event, "input, select, textarea, button");
    const speakerCard = closestElement(event, ".speaker-card-head[role='button']");
    if (speakerCard && !insideControl) {
      event.preventDefault();
      toggleSpeakerEditor(speakerCard.dataset.speakerEdit || "");
      return;
    }

    const cueSelect = closestElement(event, "[data-cue-select]");
    if (cueSelect && !insideControl) {
      event.preventDefault();
      selectCue(cueSelect.dataset.cueSelect || "");
    }
  });

  els.sideContent.addEventListener("input", (event) => {
    if (applySideControl(event)) invalidate("topbar", "inspector", "timeline", "playback");
  });

  els.sideContent.addEventListener("change", (event) => {
    if (applySideControl(event)) invalidateAll();
  });
}

// Applies a speaker or transcript form control; returns whether the event was one of them.
function applySideControl(event: Event): boolean {
  const control = eventElement(event) as Control | null;
  if (!control) return false;
  if (control.dataset.speakerControl) {
    updateSpeakerFromControl(control);
    return true;
  }
  if (control.dataset.transcriptControl) {
    updateTranscriptCueFromControl(control);
    return true;
  }
  return false;
}

function toggleSpeakerEditor(speakerId: string): void {
  state.selectedSpeakerId = state.selectedSpeakerId === speakerId ? "" : speakerId;
  renderSideContent();
}

function selectCue(cueId: string): void {
  state.selectedCueId = cueId;
  state.selectedWordId = "";
  invalidateAll();
}

export function renderTabs(): void {
  els.tabs.forEach((tab) => {
    const active = tab.dataset.tab === state.activeTab;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const activeTab = els.tabs.find((tab) => tab.dataset.tab === state.activeTab);
  els.sideContent.setAttribute("aria-labelledby", activeTab ? activeTab.id : "");
}

function handleTabKeydown(event: KeyboardEvent): void {
  const currentIndex = els.tabs.indexOf(event.currentTarget as HTMLElement);
  let nextIndex = currentIndex;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % els.tabs.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + els.tabs.length) % els.tabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = els.tabs.length - 1;
  else return;

  event.preventDefault();
  state.activeTab = tabOf(els.tabs[nextIndex]);
  renderSideContent();
  renderTabs();
  els.tabs[nextIndex].focus();
}

export function renderSideContent(): void {
  if (state.activeTab === "speakers") {
    renderSpeakersPanel();
  } else if (state.activeTab === "qa") {
    renderQaPanel();
  } else {
    renderTranscriptPanel();
  }
}
