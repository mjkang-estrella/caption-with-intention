import { validateProject } from "../../core/qa.ts";
import type { QaContext } from "../../core/qa.ts";
import { escapeHtml } from "../../core/util.ts";
import { captionLayoutFor, captionViewport } from "../caption-view.ts";
import { els } from "../dom.ts";
import { state } from "../store.ts";

export function renderQaPanel(): void {
  const checks = validateProject(state.cwi, qaContext());
  const failedCount = checks.filter((check) => check.status === "fail").length;
  els.sideContent.innerHTML = `
    <div class="panel-list" aria-live="polite" aria-label="QA results">
      <div class="visually-hidden">${failedCount ? `${failedCount} QA checks need review.` : "All QA checks passed."}</div>
      ${checks.map((check) => `
        <div class="qa-card ${check.status}">
          <div class="qa-kicker">${check.status === "pass" ? "Pass" : "Needs review"}</div>
          <div class="qa-title">${escapeHtml(check.title)}</div>
          <div class="qa-body">${escapeHtml(check.body)}</div>
        </div>
      `).join("")}
      ${renderReviewNotes()}
    </div>
  `;
}

function renderReviewNotes(): string {
  const notes = state.cwi.review && Array.isArray(state.cwi.review.notes) ? state.cwi.review.notes : [];
  if (!notes.length) return "";
  return notes.map((note) => `
    <div class="qa-card">
      <div class="qa-kicker">Review note</div>
      <div class="qa-body">${escapeHtml(note)}</div>
    </div>
  `).join("");
}

// QA inputs that come from the page rather than the project.
export function qaContext(): QaContext {
  const viewport = captionViewport();
  return {
    layoutFor: (cue) => captionLayoutFor(cue, viewport),
    mediaSource: String(els.video.currentSrc || els.video.src || ""),
    pageOrigin: window.location.origin,
    importError: state.importError,
    importWarnings: state.importWarnings
  };
}
