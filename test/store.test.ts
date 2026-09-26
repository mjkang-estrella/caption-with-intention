import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { commit, historyState, loadProject, projectRevision, redo, state, subscribe, touchProject, undo } from "../src/app/store.ts";
import { createSampleProject } from "../src/core/sample.ts";

const firstWord = () => state.cwi.cues[0].words[0];

beforeEach(() => loadProject(createSampleProject()));

test("an edit can be undone and redone", () => {
  const original = firstWord().volumePercent;
  assert.equal(commit("Volume size", () => { firstWord().volumePercent = 90; }), true);
  assert.deepEqual(historyState(), { undoLabel: "Volume size", redoLabel: null });

  assert.equal(undo(), "Volume size");
  assert.equal(firstWord().volumePercent, original);
  assert.deepEqual(historyState(), { undoLabel: null, redoLabel: "Volume size" });

  assert.equal(redo(), "Volume size");
  assert.equal(firstWord().volumePercent, 90);
  assert.equal(redo(), null);
});

test("edits that change nothing are not recorded", () => {
  const revision = projectRevision();
  assert.equal(commit("Volume size", () => { firstWord().volumePercent = firstWord().volumePercent; }), false);
  assert.equal(historyState().undoLabel, null);
  assert.equal(projectRevision(), revision);
});

test("rapid edits with the same key undo as one step", () => {
  const original = firstWord().volumePercent;
  [60, 70, 80].forEach((volume, index) => {
    commit("Volume size", () => { firstWord().volumePercent = volume; }, { coalesceKey: "volume:w1", now: 1000 + index * 200 });
  });
  assert.equal(undo(), "Volume size");
  assert.equal(firstWord().volumePercent, original);
  assert.equal(undo(), null);
});

test("a pause or a different control starts a new undo step", () => {
  commit("Volume size", () => { firstWord().volumePercent = 60; }, { coalesceKey: "volume:w1", now: 1000 });
  commit("Volume size", () => { firstWord().volumePercent = 70; }, { coalesceKey: "volume:w1", now: 1600 });
  commit("Tone", () => { firstWord().pitchWeight = 700; }, { coalesceKey: "tone:w1", now: 1700 });

  assert.equal(undo(), "Tone");
  assert.equal(undo(), "Volume size");
  assert.equal(firstWord().volumePercent, 60);
});

test("a new edit clears the redo stack", () => {
  commit("Volume size", () => { firstWord().volumePercent = 60; });
  undo();
  commit("Tone", () => { firstWord().pitchWeight = 700; });
  assert.equal(historyState().redoLabel, null);
});

test("history keeps the last 100 edits", () => {
  for (let index = 0; index < 105; index += 1) {
    commit(`Edit ${index}`, () => { firstWord().volumePercent = index % 2 ? 60 : 40; });
  }
  let steps = 0;
  while (undo()) steps += 1;
  assert.equal(steps, 100);
});

test("loading a project resets history; bookkeeping changes bypass it", () => {
  commit("Volume size", () => { firstWord().volumePercent = 60; });
  touchProject((project) => { project.project.duration = 99; });
  assert.equal(historyState().undoLabel, "Volume size");

  loadProject(createSampleProject());
  assert.deepEqual(historyState(), { undoLabel: null, redoLabel: null });
});

test("every project change bumps the revision and notifies subscribers", () => {
  let notified = 0;
  const unsubscribe = subscribe(() => { notified += 1; });
  const revision = projectRevision();
  commit("Volume size", () => { firstWord().volumePercent = 60; });
  touchProject(() => undefined);
  undo();
  unsubscribe();
  commit("Tone", () => { firstWord().pitchWeight = 700; });
  assert.equal(notified, 3);
  assert.equal(projectRevision(), revision + 4);
});
