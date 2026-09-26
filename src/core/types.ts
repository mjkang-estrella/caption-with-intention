// Caption with Intention project schema (cwi.json, schema v2) and the renderer's data shapes.

export type AspectRatio = "16:9" | "9:16" | "1:1";
export type CueType = "dialogue" | "sound" | "music";
export type SpeakerRole = "main" | "supporting" | "minor";
export type WordMotion = "pop" | "none" | "syllable";
export type WordTiming = "aligned" | "estimated" | "manual";

export interface WordUnit {
  text: string;
  start: number;
}

export interface Word {
  id: string;
  text: string;
  start: number;
  end: number;
  // 0-100; 50 is normal speech, 0 a whisper (3% of screen height), 100 a shout (12%).
  volumePercent: number;
  pitchWeight: number;
  pitchWidth: number;
  motion: WordMotion;
  timing: WordTiming;
  burst?: boolean;
  units?: WordUnit[];
}

// Parts of the system switched off for one cue (doc 8, scene exceptions).
export interface CueException {
  color: boolean;
  motion: boolean;
  intonation: boolean;
}

export interface Cue {
  id: string;
  type: CueType;
  speakerId: string;
  start: number;
  end: number;
  text: string;
  lineBreakAfterWordIds: string[];
  exception: CueException;
  offCamera: boolean;
  words: Word[];
}

export interface Speaker {
  id: string;
  name: string;
  role: SpeakerRole;
  color: string;
  defaultOffCamera: boolean;
}

export interface ProjectMeta {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  mediaName: string;
  duration: number;
  frameRate: number;
}

export interface Review {
  notes: string[];
  validationStatus: string;
}

export interface Project {
  schemaVersion: number;
  project: ProjectMeta;
  speakers: Speaker[];
  cues: Cue[];
  review: Review;
}

export interface Viewport {
  width: number;
  height: number;
}

// Returns the advance width of `text` set in Roboto Flex at the given size and axes.
export type MeasureFn = (text: string, fontPx: number, weight: number, width: number, slant: number) => number;

export interface TypeStyle {
  fontPx: number;
  weight: number;
  width: number;
  slant: number;
}

export interface DisplayWord {
  word: Word;
  text: string;
}

export interface LayoutWord extends DisplayWord {
  index: number;
  rest: TypeStyle;
  peak: TypeStyle;
  restWidth: number;
  peakWidth: number;
  spaceWidth: number;
  units: { text: string }[] | null;
  x: number;
}

export interface LayoutLine {
  words: LayoutWord[];
  width: number;
  peakWidth: number;
  height: number;
  baseline: number;
}

export interface CueLayout {
  cueId: string;
  signature: string;
  baseFontPx: number;
  padX: number;
  padY: number;
  maxBoxWidth: number;
  lines: LayoutLine[];
  manualBreakCount: number;
  overflow: boolean;
}

export interface CueTiming {
  estimated: boolean;
  phrase?: boolean;
  cursor: number;
  onsets: number[];
}

export interface FrameUnit {
  text: string;
  lift: number;
  offsetY: number;
}

export interface FrameWord extends TypeStyle {
  id: string;
  text: string;
  x: number;
  baseline: number;
  advance: number;
  emphasis: number;
  color: string;
  colorAmount: number;
  lift: number;
  dip: number;
  offsetY: number;
  scale: number;
  units: FrameUnit[] | null;
}

export interface FrameLine {
  key: string;
  cueId: string;
  cueType: CueType;
  lineIndex: number;
  signature: string;
  box: { x: number; y: number; width: number; height: number };
  words: FrameWord[];
}

export interface FrameState {
  time: number;
  width: number;
  height: number;
  boxFill: string;
  lines: FrameLine[];
  droppedLines: number;
  guide: { left: number; width: number; top: number; bottom: number };
}

// The subset of Web Audio's AudioBuffer that analysis needs, so tests can pass plain objects.
export interface AudioSamples {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  getChannelData(channel: number): Float32Array;
}

export interface QaCheck {
  status: "pass" | "fail";
  title: string;
  body: string;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
  voice?: string;
}
