import { test } from "node:test";
import assert from "node:assert/strict";
import type { Cue, Project } from "../src/core/types.ts";
import { validateProject, volumeBaselineIssues } from "../src/core/qa.ts";
import type { QaContext } from "../src/core/qa.ts";
import { layoutCue } from "../src/core/renderer.ts";
import { createSampleProject } from "../src/core/sample.ts";

const measure = (text: string, fontPx: number) => (text === " " ? 0.25 : 0.5 * text.length) * fontPx;

function context(project: Project, overrides: Partial<QaContext> = {}): QaContext {
  const viewport = { width: 1920, height: 1080 };
  return {
    layoutFor: (cue: Cue) => layoutCue(project, cue, viewport, measure),
    mediaSource: "http://localhost:8080/reference/sample.mp4",
    pageOrigin: "http://localhost:8080",
    ...overrides
  };
}

const failures = (project: Project, overrides: Partial<QaContext> = {}) =>
  validateProject(project, context(project, overrides)).filter((check) => check.status === "fail").map((check) => check.title);

const dialogue = (project: Project) => project.cues.filter((cue) => cue.type === "dialogue");

test("the bundled sample passes every check", () => {
  assert.deepEqual(failures(createSampleProject()), []);
});

test("import errors and missing fields are reported first", () => {
  const project = createSampleProject();
  assert.deepEqual(failures(project, { importError: "bad JSON", importWarnings: ["project.id is missing"] }), ["JSON import", "JSON required fields"]);
});

test("media from another origin breaks the local media boundary", () => {
  const project = createSampleProject();
  assert.deepEqual(failures(project, { mediaSource: "https://cdn.example.com/clip.mp4" }), ["Media boundary"]);
  assert.deepEqual(failures(project, { mediaSource: "blob:http://localhost:8080/abc" }), []);
});

test("main and supporting colors must stay 30 degrees apart; minor characters are exempt", () => {
  const project = createSampleProject();
  project.speakers[2].color = "#E8E82E";
  assert.deepEqual(failures(project), ["Speaker colors"]);
  project.speakers[2].role = "minor";
  assert.deepEqual(failures(project), []);
});

test("estimated timing, out-of-order onsets, and mismatched read-ahead text are flagged", () => {
  const estimated = createSampleProject();
  dialogue(estimated)[0].words.forEach((word) => { word.timing = "estimated"; });
  assert.deepEqual(failures(estimated), ["Word sync"]);

  const reordered = createSampleProject();
  const words = dialogue(reordered)[0].words;
  [words[0].start, words[0].end, words[1].start, words[1].end] = [words[1].start, words[1].end, words[0].start, words[0].end];
  assert.deepEqual(failures(reordered), ["Read-ahead and timing"]);

  const mismatched = createSampleProject();
  dialogue(mismatched)[0].text = "Something else entirely";
  assert.deepEqual(failures(mismatched), ["Read-ahead and timing"]);
});

test("sound and music cues keep decorators out of their text and have no speaker", () => {
  const project = createSampleProject();
  const sound = project.cues.find((cue) => cue.type === "sound");
  assert.ok(sound);
  sound.text = "[door crack]";
  sound.speakerId = "speaker-marty";
  const [check] = validateProject(project, context(project)).filter((item) => item.title === "Sound and music cues");
  assert.equal(check.status, "fail");
  assert.match(check.body, /stores brackets/);
  assert.match(check.body, /should not have a speaker color/);
});

test("most speech must stay at the normal size", () => {
  const project = createSampleProject();
  assert.deepEqual(volumeBaselineIssues(project.cues), []);
  dialogue(project).forEach((cue) => cue.words.forEach((word) => { word.volumePercent = 80; }));
  assert.deepEqual(failures(project), ["Volume sizing"]);
});

test("tone that contradicts the voice, or tone on too many words, is flagged", () => {
  const contradicting = createSampleProject();
  Object.assign(dialogue(contradicting)[0].words[0], { pitchWeight: 1000, pitchWidth: 25 });
  assert.deepEqual(failures(contradicting), ["Tone styling"]);

  const overused = createSampleProject();
  dialogue(overused).forEach((cue) => cue.words.forEach((word) => Object.assign(word, { pitchWeight: 700, pitchWidth: 125 })));
  assert.deepEqual(failures(overused), ["Tone styling"]);
});

test("the work area flags overflowing cues and more than two lines at once", () => {
  const project = createSampleProject();
  const [first] = dialogue(project);
  assert.deepEqual(failures(project, { layoutFor: (cue) => layoutCue(project, cue, { width: 200, height: 1080 }, measure) }), ["Caption work area"]);

  const overlapping = createSampleProject();
  const copies = [1, 2].map((offset) => ({ ...structuredClone(first), id: `copy-${offset}`, words: first.words.map((word) => ({ ...word, id: `${word.id}-${offset}` })) }));
  overlapping.cues.push(...copies);
  const [check] = validateProject(overlapping, context(overlapping)).filter((item) => item.title === "Caption work area");
  assert.equal(check.status, "fail");
  assert.match(check.body, /3 caption lines are on screen/);
});
