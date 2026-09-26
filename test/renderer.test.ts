import { test } from "node:test";
import assert from "node:assert/strict";
import * as spec from "../src/cwi-spec.ts";
import * as model from "../src/model.ts";
import * as renderer from "../src/renderer.ts";

const cwi = { ...spec, ...model, ...renderer };

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_PX = 27;
// Deterministic stand-in for DOM text measurement.
const measure = (text, fontPx) => (text === " " ? 0.25 : 0.5 * text.length) * fontPx;
const frameAt = (project, time, options = {}) =>
  cwi.cwiComputeFrame(project, time, VIEWPORT, (cue) => cwi.cwiLayoutCue(project, cue, VIEWPORT, measure), options);
const wordIn = (frame, id) => frame.lines.flatMap((line) => line.words).find((word) => word.id === id);
const sample = () => cwi.createSampleProject();

function dialogueCue(id, start, end, words, extra = {}) {
  return {
    id, type: "dialogue", speakerId: "speaker-marty", start, end, text: words.map((word) => word[0]).join(" "),
    lineBreakAfterWordIds: [], exception: { color: false, motion: false, intonation: false }, offCamera: false,
    words: words.map(([text, wordStart, wordEnd], index) => ({
      id: `${id}-w${index}`, text, start: wordStart, end: wordEnd, volumePercent: 50, pitchWeight: 400, pitchWidth: 100,
      motion: "pop", timing: "aligned"
    })),
    ...extra
  };
}

function projectWith(cues, aspectRatio = "16:9") {
  const project = sample();
  project.project.aspectRatio = aspectRatio;
  project.cues = cues;
  return project;
}

test("base type is the AE 27 px on a 1080 frame and the box matches the AE rig height", () => {
  const project = projectWith([dialogueCue("c", 0, 2, [["Hey,", 0.1, 0.5], ["McFly.", 0.5, 1]])]);
  const layout = cwi.cwiLayoutCue(project, project.cues[0], VIEWPORT, measure);
  assert.equal(layout.baseFontPx, BASE_PX);
  // AE: text bounds + 20 px top and bottom = 70.4 px at 27 px Roboto.
  assert.ok(Math.abs(layout.lines[0].height - 70.4) / 70.4 < 0.03, `box height ${layout.lines[0].height}`);
  // AE: 30 px padding per side.
  assert.equal(layout.lines[0].words[0].x, 30);
});

test("a word starts coloring at its onset and peaks lifted and fully colored at the next onset", () => {
  const project = sample();
  const cue = project.cues.find((item) => item.id === "cue-pepsi-pay");
  const [, , a, pepsi] = cue.words;

  const atOnset = frameAt(project, pepsi.start);
  assert.equal(wordIn(atOnset, pepsi.id).colorAmount, 0);
  assert.equal(wordIn(atOnset, pepsi.id).lift, 0);

  const previous = wordIn(atOnset, a.id);
  assert.equal(previous.colorAmount, 1);
  assert.equal(previous.lift, 1);
  assert.ok(Math.abs(previous.offsetY - -5) < 1e-9, `lift ${previous.offsetY}`);
  assert.equal(previous.color, "rgb(94, 130, 237)");
});

test("the upcoming word dips 2 px inside the anticipation window", () => {
  const project = sample();
  const cue = project.cues.find((item) => item.id === "cue-pepsi-pay");
  const pepsi = cue.words[3];
  const early = wordIn(frameAt(project, pepsi.start - 0.2), pepsi.id);
  assert.equal(early.offsetY, 0);

  // 2 px at the 27 px base; the dip scales with the word's own (volume) size.
  const justBefore = wordIn(frameAt(project, pepsi.start - 0.001), pepsi.id);
  const fullDip = justBefore.fontPx * 2 / BASE_PX;
  assert.ok(justBefore.offsetY > 0.95 * fullDip && justBefore.offsetY <= fullDip, `dip ${justBefore.offsetY}`);
  assert.equal(justBefore.colorAmount, 0);
});

test("words without aligned timing follow the AE cursor N * ease(p) + p", () => {
  const cue = dialogueCue("est", 10, 14, [["one", 0, 0], ["two", 0, 0], ["three", 0, 0], ["four", 0, 0]]);
  cue.words.forEach((word) => { word.timing = "estimated"; });
  const project = projectWith([cue]);
  const window = cwi.cwiEstimatedWindow(cue);
  assert.equal(window.end, 14 - cwi.CWI_STYLE.motion.estimatedEndInsetSeconds);

  const time = window.start + (window.end - window.start) / 2;
  const ease = cwi.cwiCubicBezier(0.5, cwi.CWI_STYLE.motion.estimatedEase);
  assert.ok(Math.abs(ease - 0.5) < 0.01, `ease ${ease}`);
  const cursor = cwi.cwiEstimatedCursor(4, time, window);
  assert.ok(Math.abs(cursor - (4 * ease + 0.5)) < 1e-9, `cursor ${cursor}`);
  const second = wordIn(frameAt(project, time), "est-w1");
  assert.equal(second.colorAmount, 1);
  const lift = 1 - Math.abs(cursor - 2);
  assert.ok(Math.abs(second.lift - lift * lift * (3 - 2 * lift)) < 1e-9);

  const seeded = cwi.cwiEstimatedWordTimes(cue, 4);
  assert.equal(seeded[0].start, 10);
  assert.ok(seeded.every((word, index) => index === 0 || word.start >= seeded[index - 1].start));
});

test("overlapping cues stack with the earlier line on top and never exceed two lines", () => {
  const first = dialogueCue("first", 0, 5, [["first", 0.2, 0.6]]);
  const second = dialogueCue("second", 1, 5, [["second", 1.2, 1.6]]);
  const third = dialogueCue("third", 2, 5, [["third", 2.2, 2.6]]);

  const two = frameAt(projectWith([second, first]), 1.5);
  assert.deepEqual(two.lines.map((line) => line.cueId), ["first", "second"]);
  assert.ok(two.lines[0].box.y + two.lines[0].box.height < two.lines[1].box.y, "line boxes are separated");
  const gap = two.lines[1].box.y - (two.lines[0].box.y + two.lines[0].box.height);
  assert.ok(Math.abs(gap - 1080 * 0.025) < 1e-9);
  assert.ok(Math.abs(two.lines[1].box.y + two.lines[1].box.height - 1080 * (1 - 65 / 1080)) < 1e-9);

  const project = projectWith([first, second, third]);
  const three = frameAt(project, 2.5);
  assert.deepEqual(three.lines.map((line) => line.cueId), ["second", "third"]);
  assert.equal(three.droppedLines, 1);
  const worst = cwi.cwiMaxSimultaneousLines(project, (cue) => cwi.cwiLayoutCue(project, cue, VIEWPORT, measure));
  assert.equal(worst.count, 3);
});

test("motion none and reduced motion keep color sync but drop the lift", () => {
  const cue = dialogueCue("m", 0, 3, [["still", 0.2, 0.6], ["moving", 0.6, 1.2]]);
  cue.words[0].motion = "none";
  const project = projectWith([cue]);

  const still = wordIn(frameAt(project, 0.6), "m-w0");
  assert.equal(still.lift, 0);
  assert.equal(still.colorAmount, 1);

  const reduced = wordIn(frameAt(project, 1.2, { reducedMotion: true }), "m-w1");
  assert.equal(reduced.offsetY, 0);
  assert.equal(reduced.colorAmount, 1);
});

test("intonation is transient: plain type before and after, peak size and tone while spoken", () => {
  assert.equal(cwi.cwiVolumeScale(0), 0.6);
  assert.equal(cwi.cwiVolumeScale(50), 1);
  assert.equal(cwi.cwiVolumeScale(100), 2.4);

  const cue = dialogueCue("t", 0, 3, [["You're", 0.2, 0.4], ["gonna", 0.4, 0.6], ["pay", 0.6, 0.8], ["for", 0.8, 1.0], ["it.", 1.0, 1.2]]);
  Object.assign(cue.words[2], { volumePercent: 100, pitchWeight: 820, pitchWidth: 110 });
  const project = projectWith([cue]);

  const before = wordIn(frameAt(project, 0.3), "t-w2");
  assert.deepEqual([before.fontPx, before.weight, before.width], [BASE_PX, 400, 100]);

  const peakFrame = frameAt(project, 0.8);
  const peak = wordIn(peakFrame, "t-w2");
  assert.equal(peak.emphasis, 1);
  assert.deepEqual([peak.fontPx, peak.weight, peak.width], [BASE_PX * 2.4, 820, 110]);

  const after = wordIn(frameAt(project, 2), "t-w2");
  assert.deepEqual([after.fontPx, after.weight, after.width], [BASE_PX, 400, 100]);
  assert.equal(after.colorAmount, 1, "spoken words keep the speaker color");
});

test("an emphasized word pushes its neighbors and the box follows the text", () => {
  const cue = dialogueCue("p", 0, 3, [["You're", 0.2, 0.4], ["gonna", 0.4, 0.6], ["pay", 0.6, 0.8], ["for", 0.8, 1.0], ["it.", 1.0, 1.2]]);
  cue.words[2].volumePercent = 100;
  const project = projectWith([cue]);
  const layout = cwi.cwiLayoutCue(project, cue, VIEWPORT, measure);
  const growth = measure("pay", BASE_PX * 2.4) - measure("pay", BASE_PX);

  const rest = frameAt(project, 0.3).lines[0];
  const peak = frameAt(project, 0.8).lines[0];
  const settled = frameAt(project, 2).lines[0];

  assert.equal(rest.box.width, layout.lines[0].width);
  assert.ok(Math.abs(peak.box.width - (layout.lines[0].width + growth)) < 1e-9);
  assert.ok(Math.abs(wordIn({ lines: [peak] }, "p-w3").x - (wordIn({ lines: [rest] }, "p-w3").x + growth)) < 1e-9, "the next word is pushed right");
  assert.equal(wordIn({ lines: [peak] }, "p-w0").x, wordIn({ lines: [rest] }, "p-w0").x, "earlier words keep their offset in the box");
  assert.ok(peak.box.x < rest.box.x, "the centered box widens to both sides");
  assert.ok(peak.box.height > rest.box.height, "the box grows to the loud word");
  assert.ok(Math.abs(peak.box.y + peak.box.height - (rest.box.y + rest.box.height)) < 1e-9, "the box bottom stays anchored");
  assert.equal(settled.box.width, rest.box.width);

  // Mid-handover the two neighbors share the emphasis, so the line never exceeds its peak width.
  const handover = frameAt(project, 0.9).lines[0];
  const pay = wordIn({ lines: [handover] }, "p-w2");
  const next = wordIn({ lines: [handover] }, "p-w3");
  assert.ok(Math.abs(pay.emphasis + next.emphasis - 1) < 1e-9);
  assert.ok(handover.box.width <= layout.lines[0].peakWidth + 1e-9);
});

test("reduced motion keeps words at rest instead of pushing", () => {
  const cue = dialogueCue("r", 0, 3, [["loud", 0.2, 0.6], ["word", 0.6, 1]]);
  cue.words[0].volumePercent = 100;
  const project = projectWith([cue]);
  const word = wordIn(frameAt(project, 0.6, { reducedMotion: true }), "r-w0");
  assert.equal(word.fontPx, BASE_PX);
  assert.equal(word.colorAmount, 1);
});

test("line breaks are chosen at the widest moment so lines never re-wrap mid-animation", () => {
  const words = "Look, just give me something without any sugar in it".split(" ").map((text, index) => [text, index * 0.2, index * 0.2 + 0.2]);
  const cue = dialogueCue("w", 0, 3, words);
  const project = projectWith([cue]);
  const restWidth = cwi.cwiLayoutCue(project, cue, VIEWPORT, measure).lines[0].width;
  const snug = { width: ((restWidth + 10) * 1920) / 1074, height: 1080 };
  assert.equal(cwi.cwiLayoutCue(project, cue, snug, measure).lines.length, 1);

  cue.words[4].volumePercent = 100;
  const loud = cwi.cwiLayoutCue(project, cue, snug, measure);
  assert.equal(loud.lines.length, 2);
  assert.ok(loud.lines.every((line) => line.peakWidth <= snug.width * 1074 / 1920));
});

test("tone axes stay on the valid diagonal and follow the pitch chart", () => {
  [-1, -0.5, 0, 0.5, 1].forEach((slider) => {
    const tone = cwi.cwiToneFromSlider(slider);
    assert.ok(cwi.cwiToneInBand(tone.weight, tone.width), `slider ${slider}`);
  });
  assert.deepEqual({ ...cwi.cwiToneForPitchHz(180) }, { weight: 400, width: 100 });
  assert.deepEqual({ ...cwi.cwiToneForPitchHz(80) }, { weight: 1000, width: 150 });
  assert.deepEqual({ ...cwi.cwiToneForPitchHz(250) }, { weight: 100, width: 25 });
  assert.equal(cwi.cwiToneInBand(1000, 25), false);
});

test("off-camera words use the Roboto Flex slant and exceptions drop speaker color", () => {
  const cue = dialogueCue("o", 0, 3, [["offscreen", 0.2, 0.6], ["voice", 0.6, 1]], { offCamera: true });
  cue.exception.color = true;
  const project = projectWith([cue]);
  const word = wordIn(frameAt(project, 1), "o-w0");
  assert.equal(word.slant, -10);
  assert.equal(word.color, "rgb(255, 255, 255)");
});

test("sound effects appear plain, then grow and pop in sync with the sound as one unit", () => {
  const project = sample();
  const sound = project.cues.find((cue) => cue.id === "cue-cup-clatters");
  const [clatter] = sound.words;

  const appear = frameAt(project, sound.start);
  assert.equal(appear.lines[0].words[0].text, "[cup clatters]");
  assert.equal(appear.lines[0].words[0].fontPx, BASE_PX, "no size before the sound starts");

  const during = frameAt(project, (clatter.start + clatter.end) / 2).lines[0].words[0];
  assert.equal(during.fontPx, BASE_PX * cwi.cwiVolumeScale(clatter.volumePercent));
  assert.ok(during.offsetY < 0, "pops up while the sound lasts");
  assert.equal(during.color, "#DDDDDD", "sound effects stay white");

  const settled = frameAt(project, clatter.end + 0.21).lines[0].words[0];
  assert.equal(settled.fontPx, BASE_PX);

  // An imported sound split into several words still moves as one event.
  const split = { ...sound, id: "split", words: ["door", "crack"].map((text, index) => ({ ...clatter, id: `split-${index}`, text, timing: "estimated" })) };
  const words = frameAt(projectWith([split]), sound.start + 0.6).lines[0].words;
  assert.equal(words[0].emphasis, words[1].emphasis);
  assert.deepEqual(words.map((word) => word.text), ["[door", "crack]"]);

  assert.equal(cwi.cwiCueDisplayText({ type: "music", text: "jazz music playing" }), "\u266B [jazz music playing] \u266B");
});

test("manual line breaks win and long lines split at the AE max line width", () => {
  const words = "Look, just give me something without any sugar in it, okay? I said something without sugar.".split(" ").map((text, index) => [text, index * 0.2, index * 0.2 + 0.2]);
  const cue = dialogueCue("long", 0, 3, words);
  const project = projectWith([cue]);
  const auto = cwi.cwiLayoutCue(project, cue, VIEWPORT, measure);
  const single = cwi.cwiLayoutCue(project, cue, { width: 4000, height: 1080 }, measure);
  assert.equal(single.lines.length, 1);
  assert.ok(single.lines[0].width > 1074, "fixture is wider than the AE guide");
  assert.equal(auto.lines.length, 2);
  assert.ok(auto.lines.every((line) => line.width <= 1074));

  cue.lineBreakAfterWordIds = ["long-w1"];
  const manual = cwi.cwiLayoutCue(project, cue, VIEWPORT, measure);
  assert.deepEqual(manual.lines[0].words.map((word) => word.text), ["Look,", "just"]);
});

test("v1 projects migrate without losing zero values", () => {
  const raw = sample();
  delete raw.schemaVersion;
  raw.cues[0].exception = true;
  raw.cues[0].words[0].volumePercent = 0;
  delete raw.cues[0].words[1].motion;
  const project = cwi.cwiNormalizeProject(raw);
  assert.equal(project.schemaVersion, 2);
  assert.deepEqual({ ...project.cues[0].exception }, { color: true, motion: false, intonation: false });
  assert.equal(project.cues[0].words[0].volumePercent, 0);
  assert.equal(project.cues[0].words[1].motion, "pop");
  assert.equal(project.project.frameRate, 30);
});

test("minor palette uses 30% saturation and 90% brightness", () => {
  const minor = cwi.SPEAKER_PALETTE.filter((entry) => entry.role === "minor");
  assert.equal(minor.length, 24);
  assert.equal(cwi.cwiHsbToHex(0, 0.3, 0.9), "#E6A1A1");
  assert.equal(cwi.cwiNearestAspectRatio(1080, 1920), "9:16");
});

test("syllable motion lifts one syllable at a time while the word stays on the baseline", () => {
  const cue = dialogueCue("s", 0, 3, [["inexplicable", 0.5, 1.5]]);
  cue.words[0].motion = "syllable";
  cue.words[0].units = ["in", "ex", "pli", "ca", "ble"].map((text, index) => ({ text, start: 0.5 + index * 0.2 }));
  const project = projectWith([cue]);

  const word = wordIn(frameAt(project, 0.9), "s-w0");
  assert.equal(word.lift, 0);
  assert.deepEqual(word.units.map((unit) => unit.text), ["in", "ex", "pli", "ca", "ble"]);
  assert.equal(word.units[1].lift, 1);
  assert.ok(word.units.filter((unit) => unit.lift > 0).length === 1, "one syllable is raised at a unit onset");

  cue.words[0].units[1].text = "eks";
  const mismatched = wordIn(frameAt(project, 0.9), "s-w0");
  assert.equal(mismatched.units, null, "syllables that do not spell the word are ignored");
});
