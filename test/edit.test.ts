import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addSpeaker, buildWordsForCueText, colorFitsRole, insertCue, nextSpeakerColor, normalizeCueTiming, removeCue,
  reseedEstimatedWords, setWordSyllables, uniqueId, updateCueTextAndWords
} from "../src/core/edit.ts";
import { createSampleProject } from "../src/core/sample.ts";

const firstDialogue = (project = createSampleProject()) => {
  const cue = project.cues.find((item) => item.type === "dialogue");
  assert.ok(cue);
  return { project, cue };
};

test("editing text with the same word count keeps timing and ids", () => {
  const { project, cue } = firstDialogue();
  const before = cue.words.map((word) => [word.id, word.start, word.end]);
  const words = buildWordsForCueText(project, cue, "You KNOW where 1640 Riverside Drive is?");
  assert.deepEqual(words.map((word) => [word.id, word.start, word.end]), before);
  assert.equal(words[1].text, "KNOW");
});

test("adding or removing words re-seeds estimated timing with fresh ids", () => {
  const { project, cue } = firstDialogue();
  const oldIds = new Set(cue.words.map((word) => word.id));
  const words = buildWordsForCueText(project, cue, "You know where it is?");
  assert.equal(words.length, 5);
  assert.ok(words.every((word) => word.timing === "estimated" && !oldIds.has(word.id)));
  assert.equal(words[0].start, cue.start);
  assert.equal(new Set(words.map((word) => word.id)).size, 5);
});

test("updating text drops line breaks that pointed at removed words", () => {
  const { project, cue } = firstDialogue();
  cue.lineBreakAfterWordIds = [cue.words[2].id];
  updateCueTextAndWords(project, cue, "Where is it?");
  assert.deepEqual(cue.lineBreakAfterWordIds, []);
  assert.equal(cue.text, "Where is it?");
});

test("estimated words follow cue timing edits; aligned words do not", () => {
  const { project, cue } = firstDialogue();
  const aligned = cue.words.map((word) => word.start);
  cue.start += 1;
  reseedEstimatedWords(cue);
  assert.deepEqual(cue.words.map((word) => word.start), aligned);

  cue.words = buildWordsForCueText(project, cue, "Only three words");
  cue.start = 10;
  cue.end = 12;
  reseedEstimatedWords(cue);
  assert.equal(cue.words[0].start, 10);
});

test("syllables must spell the word and get even onsets", () => {
  const { cue } = firstDialogue();
  const word = cue.words.find((item) => item.text === "Riverside");
  assert.ok(word);
  setWordSyllables(word, "Ri-ver-side");
  assert.deepEqual(word.units?.map((unit) => unit.text), ["Ri", "ver", "side"]);
  assert.equal(word.units?.[0].start, word.start);
  setWordSyllables(word, "Ri-ver");
  assert.equal(word.units, undefined);
});

test("word timing edits widen the cue to cover its words", () => {
  const { cue } = firstDialogue();
  cue.words[0].start = 0.5;
  normalizeCueTiming(cue);
  assert.equal(cue.start, cue.words[0].start);
});

test("new speakers get the free color farthest from the colors in use", () => {
  const project = createSampleProject();
  project.speakers = [{ ...project.speakers[0], color: "#E5E517" }];
  assert.equal(nextSpeakerColor(project, "main"), "#17E5E5");
  const speaker = addSpeaker(project);
  assert.equal(speaker.role, "supporting");
  assert.ok(colorFitsRole(speaker.color, "supporting"));
  assert.equal(project.speakers.length, 2);
});

test("cues insert after the anchor and removal selects a neighbor", () => {
  const project = createSampleProject();
  const [first, second] = project.cues;
  const cue = insertCue(project, first.id);
  assert.equal(project.cues[1], cue);
  assert.equal(cue.start, Math.round((first.end + 0.2) * 100) / 100);
  assert.equal(removeCue(project, cue.id), second.id);
  assert.equal(removeCue(project, "missing"), "");
});

test("uniqueId skips ids already used by speakers, cues, words, or reserved", () => {
  const project = createSampleProject();
  const reserved = new Set<string>();
  const first = uniqueId(project, "speaker-marty", reserved);
  reserved.add(first);
  const second = uniqueId(project, "speaker-marty", reserved);
  assert.notEqual(first, second);
  assert.ok(!project.speakers.some((speaker) => speaker.id === first));
});
