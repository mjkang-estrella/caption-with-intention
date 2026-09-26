// The caption overlay on the preview frame: layout caching, text measurement, and the persistent
// nodes that computeFrame's state is projected onto.

import type { Cue, CueLayout, FrameState, Viewport } from "../core/types.ts";
import { computeFrame, layoutCue } from "../core/renderer.ts";
import { CWI_STYLE } from "../core/style.ts";
import { els } from "./dom.ts";
import { renderParts } from "./render.ts";
import { projectRevision, state } from "./store.ts";

type StyleProperty = "left" | "top" | "width" | "height" | "color" | "transform" | "fontSize" | "fontWeight" | "fontVariationSettings";

interface LineView {
  box: HTMLElement;
  words: HTMLElement[];
}

// Cue layouts for the current project revision and frame size; any project change or resize
// starts a fresh cache.
const captionLayouts = new Map<string, CueLayout>();
let captionLayoutsKey = "";
const captionMeasureCache = new Map<string, number>();
const captionView: { key: string; lines: LineView[] } = { key: "", lines: [] };
const captionStyleCache = new WeakMap<HTMLElement, Partial<Record<StyleProperty, string>>>();

export function setupCaptionStage(): void {
  els.captionSafe.innerHTML = "";
  els.captionGuide = document.createElement("div");
  els.captionGuide.className = "caption-guide";
  els.captionGuide.setAttribute("aria-hidden", "true");
  els.captionGuide.hidden = !state.showGuides;
  els.captionSafe.appendChild(els.captionGuide);

  els.captionMeasure = document.createElement("span");
  els.captionMeasure.className = "caption-measure";
  els.captionMeasure.setAttribute("aria-hidden", "true");
  document.body.appendChild(els.captionMeasure);

  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if (motionQuery) {
    state.reducedMotion = motionQuery.matches;
    const onMotionChange = () => {
      state.reducedMotion = motionQuery.matches;
      renderParts("playback");
    };
    if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", onMotionChange);
  }

  // Caption geometry is measured against the rendered frame and the loaded Roboto Flex face.
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => renderParts("playback")).observe(els.phoneFrame);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.load('400 27px "Roboto Flex Local"').catch(() => undefined).then(() => document.fonts.ready).then(() => {
      invalidateCaptionLayouts();
      renderParts("playback");
    });
  }
}

// The caption overlay is a projection of computeFrame: nodes are rebuilt only when the set
// of lines or their layout changes. Each frame updates box geometry, word position and type
// (emphasized words grow and push their neighbors), color, and vertical offset.
export function renderCaptionOverlay(time: number): void {
  const viewport = captionViewport();
  const frame = computeFrame(state.cwi, time, viewport, (cue) => captionLayoutFor(cue, viewport), {
    reducedMotion: state.reducedMotion
  });
  const key = [viewport.width, viewport.height, ...frame.lines.map((line) => `${line.key}|${line.signature}`)].join("||");
  if (key !== captionView.key) buildCaptionNodes(frame, key);

  frame.lines.forEach((line, lineIndex) => {
    const view = captionView.lines[lineIndex];
    setStyle(view.box, "left", `${line.box.x.toFixed(2)}px`);
    setStyle(view.box, "top", `${line.box.y.toFixed(2)}px`);
    setStyle(view.box, "width", `${line.box.width.toFixed(2)}px`);
    setStyle(view.box, "height", `${line.box.height.toFixed(2)}px`);
    line.words.forEach((word, wordIndex) => {
      const node = view.words[wordIndex];
      setStyle(node, "left", `${word.x.toFixed(2)}px`);
      setStyle(node, "top", `${(word.baseline - word.fontPx * CWI_STYLE.type.ascentEm).toFixed(2)}px`);
      applyCaptionFont(node, word.fontPx, word.weight, word.width, word.slant);
      setStyle(node, "color", word.color);
      setStyle(node, "transform", captionTransform(word.offsetY, word.scale));
      if (word.units) {
        word.units.forEach((unit, unitIndex) => {
          setStyle(node.children[unitIndex] as HTMLElement, "transform", captionTransform(unit.offsetY, 1));
        });
      }
    });
  });
}

function buildCaptionNodes(frame: FrameState, key: string): void {
  captionView.lines.forEach((view) => view.box.remove());
  captionView.lines = frame.lines.map((line) => {
    const box = document.createElement("div");
    box.className = `caption-line caption-${line.cueType}`;
    box.style.background = frame.boxFill;

    const words = line.words.map((word) => {
      const node = document.createElement("span");
      node.className = "caption-word";
      // A line height equal to the font's ascent + descent puts the baseline exactly `ascentEm` below the top.
      node.style.lineHeight = String(CWI_STYLE.type.ascentEm + CWI_STYLE.type.descentEm);
      if (word.units) {
        word.units.forEach((unit) => {
          const unitNode = document.createElement("span");
          unitNode.className = "caption-unit";
          unitNode.textContent = unit.text;
          node.appendChild(unitNode);
        });
      } else {
        node.textContent = word.text;
      }
      box.appendChild(node);
      return node;
    });

    els.captionSafe.appendChild(box);
    return { box, words };
  });

  const guide = frame.guide;
  els.captionGuide.style.left = `${guide.left}px`;
  els.captionGuide.style.width = `${guide.width}px`;
  els.captionGuide.style.top = `${guide.top}px`;
  els.captionGuide.style.height = `${guide.bottom - guide.top}px`;
  els.captionSafe.dataset.lines = String(frame.lines.length);
  captionView.key = key;
}

// Skip style writes that would not change anything; most words are idle on most frames. The
// browser normalizes values it reads back, so compare against what was last written instead.
function setStyle(node: HTMLElement, property: StyleProperty, value: string): void {
  let written = captionStyleCache.get(node);
  if (!written) {
    written = {};
    captionStyleCache.set(node, written);
  }
  if (written[property] === value) return;
  written[property] = value;
  node.style[property] = value;
}

function captionTransform(offsetY: number, scale: number): string {
  if (!offsetY && scale === 1) return "";
  return `translate3d(0, ${offsetY.toFixed(2)}px, 0)${scale !== 1 ? ` scale(${scale.toFixed(3)})` : ""}`;
}

export function captionViewport(): Viewport {
  const frame = els.phoneFrame;
  return {
    width: frame && frame.clientWidth ? frame.clientWidth : 960,
    height: frame && frame.clientHeight ? frame.clientHeight : 540
  };
}

// Called once the caption font has loaded: earlier measurements used a fallback face.
function invalidateCaptionLayouts(): void {
  captionLayouts.clear();
  captionMeasureCache.clear();
  captionView.key = "";
}

export function captionLayoutFor(cue: Cue, viewport: Viewport = captionViewport()): CueLayout {
  const key = `${projectRevision()}:${viewport.width}x${viewport.height}`;
  if (key !== captionLayoutsKey) {
    captionLayouts.clear();
    captionLayoutsKey = key;
  }
  let layout = captionLayouts.get(cue.id);
  if (!layout) {
    layout = layoutCue(state.cwi, cue, viewport, measureCaptionText);
    captionLayouts.set(cue.id, layout);
  }
  return layout;
}

// Canvas text metrics cannot express Roboto Flex width or slant, so measure with a hidden
// span that uses exactly the same font settings as the rendered words.
function measureCaptionText(text: string, fontPx: number, weight: number, width: number, slant: number): number {
  const key = `${text}|${fontPx.toFixed(3)}|${weight}|${width}|${slant}`;
  const cached = captionMeasureCache.get(key);
  if (cached !== undefined) return cached;
  const node = els.captionMeasure;
  applyCaptionFont(node, fontPx, weight, width, slant);
  node.textContent = text;
  const measured = node.getBoundingClientRect().width;
  captionMeasureCache.set(key, measured);
  return measured;
}

function applyCaptionFont(node: HTMLElement, fontPx: number, weight: number, width: number, slant: number): void {
  setStyle(node, "fontSize", `${Math.round(fontPx * 100) / 100}px`);
  setStyle(node, "fontWeight", String(Math.round(weight)));
  setStyle(node, "fontVariationSettings", `"wght" ${Math.round(weight)}, "wdth" ${Math.round(width * 10) / 10}, "slnt" ${slant}`);
}

export function setupGuideToggle(): void {
  els.guideButton.addEventListener("click", () => {
    state.showGuides = !state.showGuides;
    setGuideButton();
  });
  setGuideButton();
}

function setGuideButton(): void {
  els.guideButton.setAttribute("aria-pressed", String(state.showGuides));
  els.guideButton.setAttribute("aria-label", state.showGuides ? "Hide caption work area" : "Show caption work area");
  els.captionGuide.hidden = !state.showGuides;
}
