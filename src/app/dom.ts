// Element references shared across the editor modules, filled in once by main.ts, plus
// helpers that keep DOM event handling type-safe.

export interface Elements {
  video: HTMLVideoElement;
  phoneFrame: HTMLElement;
  captionSafe: HTMLElement;
  captionGuide: HTMLElement;
  captionMeasure: HTMLElement;
  playButton: HTMLElement;
  stepButtons: HTMLElement[];
  soundButton: HTMLElement;
  guideButton: HTMLElement;
  timeReadout: HTMLElement;
  timelineGrid: HTMLElement;
  sideContent: HTMLElement;
  inspector: HTMLElement;
  inspectorResize: HTMLElement;
  inspectorHead: HTMLElement;
  inspectorBody: HTMLElement;
  projectName: HTMLElement;
  mediaBoundary: HTMLElement;
  topActions: HTMLElement;
  tabs: HTMLElement[];
  statusRegion: HTMLElement;
  aspectSelect: HTMLSelectElement;
  mediaInput: HTMLInputElement;
  captionInput: HTMLInputElement;
  jsonInput: HTMLInputElement;
  mediaButton: HTMLElement;
  captionButton: HTMLElement;
  importJsonButton: HTMLElement;
  exportJsonButton: HTMLElement;
  undoButton: HTMLButtonElement;
  redoButton: HTMLButtonElement;
}

export const els = {} as Elements;

// Form controls the editor reads values from in delegated input/change handlers.
export type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function controlValue(control: Control): string | boolean {
  return control instanceof HTMLInputElement && control.type === "checkbox" ? control.checked : control.value;
}

export function query<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}

export function queryAll<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function eventElement(event: Event): HTMLElement | null {
  return event.target instanceof HTMLElement ? event.target : null;
}

export function closestElement(event: Event, selector: string): HTMLElement | null {
  const target = eventElement(event);
  return target ? target.closest<HTMLElement>(selector) : null;
}
