const DEFAULT_MEDIA_SRC = "AE PROJECT/(Footage)/ASETS/Video/Cena_ref_CI_Template_v02a.mp4";
const CUE_TYPES = ["dialogue", "sound", "music"];
const MOTIONS = ["pop", "none", "syllable"];
const SPEAKER_ROLES = ["main", "supporting", "minor"];
const SPEAKER_PALETTE = [
  { role: "main", label: "CI Main Yellow", color: "#E5E517" },
  { role: "main", label: "CI Main Blue", color: "#17E5E5" },
  { role: "main", label: "CI Main Red", color: "#E51717" },
  { role: "main", label: "CI Main Orange", color: "#E58017" },
  { role: "main", label: "CI Main Green", color: "#17E517" },
  { role: "main", label: "CI Main Pink", color: "#E517E5" },
  { role: "supporting", label: "CI Support Orange", color: "#E85C2E" },
  { role: "supporting", label: "CI Support Yellow", color: "#EBC247" },
  { role: "supporting", label: "CI Support Green I", color: "#C2EB47" },
  { role: "supporting", label: "CI Support Green II", color: "#82ED5E" },
  { role: "supporting", label: "CI Support Green III", color: "#47EB70" },
  { role: "supporting", label: "CI Support Cyan", color: "#5EEDC9" },
  { role: "supporting", label: "CI Support Blue I", color: "#47C2EB" },
  { role: "supporting", label: "CI Support Blue II", color: "#5E82ED" },
  { role: "supporting", label: "CI Support Purple I", color: "#8C6BED" },
  { role: "supporting", label: "CI Support Purple II", color: "#CC6BED" },
  { role: "supporting", label: "CI Support Pink I", color: "#EB47C2" },
  { role: "supporting", label: "CI Support Pink II", color: "#ED5E82" },
  { role: "minor", label: "Minor Pastel Yellow", color: "#E6E68F" },
  { role: "minor", label: "Minor Pastel Green", color: "#A8E68F" },
  { role: "minor", label: "Minor Pastel Cyan", color: "#8FE6D4" },
  { role: "minor", label: "Minor Pastel Blue", color: "#8FA8E6" },
  { role: "minor", label: "Minor Pastel Pink", color: "#E68FC1" }
];
const LABEL_WIDTH = 90;
const PX_PER_SECOND = 110;
const INSPECTOR_COLUMN_MIN = 300;
const INSPECTOR_COLUMN_DEFAULT = 360;
const INSPECTOR_STACK_MIN = 220;
const CENTER_STAGE_MIN = 360;

 function createSampleProject() {
  return {
    project: {
      id: "cwi-demo-short-09",
      title: "Creator_Short_09",
      aspectRatio: "16:9",
      mediaName: "Cena_ref_CI_Template_v02a.mp4",
      duration: 9.8
    },
    speakers: [
      { id: "speaker-host", name: "Host", role: "main", color: "#E5E517", defaultOffCamera: false },
      { id: "speaker-guest", name: "Guest", role: "supporting", color: "#5E82ED", defaultOffCamera: false },
      { id: "speaker-narrator", name: "Narrator", role: "supporting", color: "#17E5E5", defaultOffCamera: true }
    ],
    cues: [
      {
        id: "cue-launch",
        type: "dialogue",
        speakerId: "speaker-host",
        start: 0,
        end: 3.72,
        text: "Google just launched a free tool",
        lineBreakAfterWordIds: ["word-launched"],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-google", text: "Google", start: 1.08, end: 1.48, volumePercent: 55, pitchWeight: 720, pitchWidth: 104, motion: "pop" },
          { id: "word-just", text: "just", start: 1.5, end: 1.78, volumePercent: 50, pitchWeight: 640, pitchWidth: 100, motion: "pop" },
          { id: "word-launched", text: "launched", start: 1.82, end: 2.38, volumePercent: 82, pitchWeight: 980, pitchWidth: 118, motion: "pop" },
          { id: "word-a", text: "a", start: 2.56, end: 2.72, volumePercent: 48, pitchWeight: 520, pitchWidth: 94, motion: "pop" },
          { id: "word-free", text: "free", start: 2.74, end: 3.08, volumePercent: 66, pitchWeight: 680, pitchWidth: 106, motion: "pop" },
          { id: "word-tool", text: "tool", start: 3.1, end: 3.48, volumePercent: 74, pitchWeight: 820, pitchWidth: 112, motion: "pop" }
        ]
      },
      {
        id: "cue-chime",
        type: "sound",
        speakerId: "",
        start: 3.9,
        end: 4.78,
        text: "notification chime",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-chime", text: "notification chime", start: 3.94, end: 4.45, volumePercent: 64, pitchWeight: 520, pitchWidth: 96, motion: "pop" }
        ]
      },
      {
        id: "cue-builds",
        type: "dialogue",
        speakerId: "speaker-guest",
        start: 4.72,
        end: 7.82,
        text: "that builds apps from simple prompts",
        lineBreakAfterWordIds: ["word-apps"],
        exception: false,
        offCamera: true,
        words: [
          { id: "word-that", text: "that", start: 4.96, end: 5.22, volumePercent: 44, pitchWeight: 460, pitchWidth: 88, motion: "pop" },
          { id: "word-builds", text: "builds", start: 5.24, end: 5.78, volumePercent: 58, pitchWeight: 590, pitchWidth: 96, motion: "pop" },
          { id: "word-apps", text: "apps", start: 5.82, end: 6.22, volumePercent: 78, pitchWeight: 900, pitchWidth: 116, motion: "pop" },
          { id: "word-from", text: "from", start: 6.34, end: 6.64, volumePercent: 52, pitchWeight: 540, pitchWidth: 96, motion: "pop" },
          { id: "word-simple", text: "simple", start: 6.7, end: 7.08, volumePercent: 48, pitchWeight: 500, pitchWidth: 92, motion: "pop" },
          { id: "word-prompts", text: "prompts", start: 7.1, end: 7.58, volumePercent: 62, pitchWeight: 680, pitchWidth: 104, motion: "pop" }
        ]
      },
      {
        id: "cue-music",
        type: "music",
        speakerId: "",
        start: 7.92,
        end: 9.48,
        text: "bright synth pulse",
        lineBreakAfterWordIds: [],
        exception: true,
        offCamera: false,
        words: [
          { id: "word-music", text: "bright synth pulse", start: 7.92, end: 9.48, volumePercent: 46, pitchWeight: 430, pitchWidth: 90, motion: "none" }
        ]
      }
    ],
    review: {
      notes: ["Internal creator QA is the first validation gate.", "Standard closed captions remain a required companion deliverable."],
      validationStatus: "unchecked"
    }
  };
}
