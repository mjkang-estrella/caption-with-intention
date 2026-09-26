import { clamp } from "../core/util.ts";
import { CENTER_STAGE_MIN, INSPECTOR_COLUMN_DEFAULT, INSPECTOR_COLUMN_MIN, INSPECTOR_STACK_MIN } from "./constants.ts";
import { els, query } from "./dom.ts";
import { state } from "./store.ts";

export function setupInspectorResize(): void {
  if (!els.inspectorResize) return;

  applyInspectorSize(state.inspectorSize);

  let dragStartCoordinate = 0;
  let dragStartSize = state.inspectorSize;

  els.inspectorResize.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dragStartCoordinate = isStackedInspectorLayout() ? event.clientY : event.clientX;
    dragStartSize = state.inspectorSize;
    document.body.classList.add("is-resizing-inspector");
    els.inspectorResize.setPointerCapture(event.pointerId);
  });

  els.inspectorResize.addEventListener("pointermove", (event) => {
    if (!els.inspectorResize.hasPointerCapture(event.pointerId)) return;
    const currentCoordinate = isStackedInspectorLayout() ? event.clientY : event.clientX;
    const nextSize = dragStartSize + (dragStartCoordinate - currentCoordinate);
    applyInspectorSize(nextSize);
  });

  els.inspectorResize.addEventListener("pointerup", (event) => {
    document.body.classList.remove("is-resizing-inspector");
    if (els.inspectorResize.hasPointerCapture(event.pointerId)) {
      els.inspectorResize.releasePointerCapture(event.pointerId);
    }
  });

  els.inspectorResize.addEventListener("pointercancel", () => {
    document.body.classList.remove("is-resizing-inspector");
  });

  els.inspectorResize.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 40 : 16;
    let nextSize = state.inspectorSize;

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextSize += step;
    else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextSize -= step;
    else if (event.key === "PageUp") nextSize += 72;
    else if (event.key === "PageDown") nextSize -= 72;
    else if (event.key === "Home") nextSize = getInspectorSizeBounds().min;
    else if (event.key === "End") nextSize = getInspectorSizeBounds().max;
    else return;

    event.preventDefault();
    applyInspectorSize(nextSize);
  });

  window.addEventListener("resize", () => applyInspectorSize(state.inspectorSize));
}

function applyInspectorSize(size: number): void {
  const bounds = getInspectorSizeBounds();
  state.inspectorSize = Math.round(clamp(size, bounds.min, bounds.max));
  query(".workspace").style.setProperty("--inspector-size", `${state.inspectorSize}px`);
  els.inspectorResize.setAttribute("aria-orientation", isStackedInspectorLayout() ? "horizontal" : "vertical");
  els.inspectorResize.setAttribute("aria-valuemin", String(bounds.min));
  els.inspectorResize.setAttribute("aria-valuemax", String(bounds.max));
  els.inspectorResize.setAttribute("aria-valuenow", String(state.inspectorSize));
}

function getInspectorSizeBounds(): { min: number; max: number } {
  const workspace = document.querySelector(".workspace");
  if (isStackedInspectorLayout()) {
    return {
      min: INSPECTOR_STACK_MIN,
      max: Math.max(INSPECTOR_STACK_MIN, Math.min(520, Math.round(window.innerHeight * 0.56)))
    };
  }

  const workspaceWidth = workspace ? workspace.clientWidth : 0;
  const tabs = document.querySelector(".tabs");
  const leftPanelWidth = tabs ? tabs.getBoundingClientRect().width : 0;
  const resizeHandleWidth = 10;
  const maxFromWorkspace = workspaceWidth - leftPanelWidth - resizeHandleWidth - CENTER_STAGE_MIN;
  const max = Math.max(INSPECTOR_COLUMN_MIN, Math.min(560, maxFromWorkspace || INSPECTOR_COLUMN_DEFAULT));

  return { min: INSPECTOR_COLUMN_MIN, max };
}

function isStackedInspectorLayout(): boolean {
  return window.innerWidth <= 900;
}
