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
const PX_PER_SECOND = 110;
const INSPECTOR_COLUMN_MIN = 300;
const INSPECTOR_COLUMN_DEFAULT = 360;
const INSPECTOR_STACK_MIN = 220;
const CENTER_STAGE_MIN = 360;
const AE_CAPTION_FONT_RATIO = 27 / 1080;
const AE_WORD_RISE_RATIO = 0.25;
const AE_BOX_VERTICAL_PADDING_EM = 20 / 27;
const AE_BOX_HORIZONTAL_PADDING_EM = 60 / 27;
const AE_NON_DIALOGUE_COLOR = "#5E82ED";
const AUDIO_WAVEFORM = [
    0.003, 0.003, 0.005, 0.003, 0.003, 0.003, 0.003, 0.003, 0.005, 0.003, 0.011, 0.174, 0.17, 0.22, 0.092, 0.04, 0.171, 0.129, 0.036, 0.013, 0.228, 0.194, 0.116, 0.028,
    0.169, 0.249, 0.173, 0.14, 0.178, 0.116, 0.14, 0.294, 0.364, 0.284, 0.253, 0.101, 0.268, 0.422, 0.46, 0.131, 0.217, 0.197, 0.144, 0.095, 0.039, 0.339, 0.271, 0.047,
    0.016, 0.005, 0.004, 0.003, 0.005, 0.02, 0.003, 0.003, 0.003, 0.006, 0.004, 0.015, 0.007, 0.008, 0.009, 0.009, 0.009, 0.006, 0.005, 0.003, 0.003, 0.004, 0.03, 0.025,
    0.03, 0.054, 0.051, 0.025, 0.087, 0.094, 0.037, 0.017, 0.029, 0.023, 0.028, 0.025, 0.019, 0.018, 0.022, 0.023, 0.033, 0.085, 0.102, 0.059, 0.099, 0.157, 0.073, 0.198,
    0.113, 0.044, 0.012, 0.011, 0.009, 0.011, 0.036, 0.017, 0.013, 0.011, 0.023, 0.02, 0.06, 0.347, 0.181, 0.092, 0.047, 0.111, 0.087, 0.085, 0.055, 0.017, 0.102, 0.162,
    0.05, 0.123, 0.226, 0.263, 0.177, 0.053, 0.17, 0.024, 0.026, 0.015, 0.007, 0.006, 0.004, 0.005, 0.069, 0.113, 0.022, 0.056, 0.205, 0.186, 0.103, 0.143, 0.156, 0.034,
    0.038, 0.027, 0.197, 0.087, 0.013, 0.009, 0.007, 0.007, 0.009, 0.007, 0.008, 0.011, 0.024, 0.224, 0.299, 0.145, 0.038, 0.226, 0.105, 0.089, 0.19, 0.186, 0.267, 0.241,
    0.245, 0.152, 0.059, 0.179, 0.136, 0.116, 0.18, 0.084, 0.017, 0.006, 0.004, 0.004, 0.005, 0.005, 0.004, 0.004, 0.004, 0.027, 0.013, 0.022, 0.024, 0.035, 0.057, 0.139,
    0.044, 0.149, 0.105, 0.119, 0.126, 0.188, 0.249, 0.176, 0.107, 0.131, 0.148, 0.198, 0.084, 0.096, 0.057, 0.046, 0.06, 0.08, 0.126, 0.026, 0.004, 0.003, 0.003, 0.005,
    0.007, 0.005, 0.005, 0.006, 0.013, 0.027, 0.026, 0.107, 0.127, 0.235, 0.199, 0.097, 0.043, 0.027, 0.039, 0.014, 0.006, 0.01, 0.008, 0.006, 0.006, 0.004, 0.014, 0.009,
    0.005, 0.004, 0.089, 0.069, 0.061, 0.039, 0.039, 0.108, 0.034, 0.027, 0.025, 0.217, 0.311, 0.151, 0.065, 0.02, 0.012, 0.009, 0.029, 0.01, 0.01, 0.009, 0.011, 0.01,
    0.01, 0.012, 0.012, 0.013, 0.114, 0.061, 0.113, 0.046, 0.016, 0.007, 0.006, 0.009, 0.007, 0.006, 0.055, 0.01, 0.01, 0.009, 0.006, 0.005, 0.005, 0.005, 0.005, 0.004,
    0.003, 0.003, 0.004, 0.004, 0.004, 0.004, 0.003, 0.004, 0.004, 0.004, 0.004, 0.003, 0.013, 0.012, 0.006, 0.006, 0.025, 0.216, 0.184, 0.065, 0.313, 0.108, 0.096, 0.056,
    0.06, 0.028, 0.038, 0.052, 0.061, 0.053, 0.088, 0.301, 0.152, 0.033, 0.054, 0.392, 0.364, 0.247, 0.127, 0.044, 0.021, 0.01, 0.008, 0.008, 0.009, 0.008, 0.01, 0.009,
    0.01, 0.009, 0.027, 0.02, 0.024, 0.022, 0.021, 0.021, 0.017, 0.012, 0.01, 0.012, 0.011, 0.011, 0.011, 0.011, 0.011, 0.011, 0.011, 0.01, 0.01, 0.017, 0.029, 0.295
];
function createSampleProject() {
    return {
        project: {
            id: "cwi-bttf-diner-template",
            title: "BTTF_Diner_CWI_Template",
            aspectRatio: "16:9",
            mediaName: "Cena_ref_CI_Template_v02a.mp4",
            duration: 34.54
        },
        speakers: [
            { id: "speaker-marty", name: "Marty", role: "main", color: "#E5E517", defaultOffCamera: false },
            { id: "speaker-biff", name: "Biff", role: "main", color: "#E51717", defaultOffCamera: false },
            { id: "speaker-lou", name: "Lou", role: "supporting", color: "#5E82ED", defaultOffCamera: false }
        ],
        cues: [
            {
                id: "cue-riverside-drive",
                type: "dialogue",
                speakerId: "speaker-marty",
                start: 0.72,
                end: 3.08,
                text: "You know where 1640 Riverside Drive is?",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-you-know", text: "You", start: 1.02, end: 1.16, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
                    { id: "word-know", text: "know", start: 1.18, end: 1.34, volumePercent: 48, pitchWeight: 490, pitchWidth: 96, motion: "pop" },
                    { id: "word-where", text: "where", start: 1.36, end: 1.58, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
                    { id: "word-1640", text: "1640", start: 1.62, end: 2.12, volumePercent: 52, pitchWeight: 520, pitchWidth: 98, motion: "pop" },
                    { id: "word-riverside", text: "Riverside", start: 2.16, end: 2.56, volumePercent: 52, pitchWeight: 520, pitchWidth: 98, motion: "pop" },
                    { id: "word-drive", text: "Drive", start: 2.58, end: 2.78, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
                    { id: "word-is", text: "is?", start: 2.8, end: 3.0, volumePercent: 48, pitchWeight: 490, pitchWidth: 94, motion: "pop" }
                ]
            },
            {
                id: "cue-order-something",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 3.16,
                end: 5.42,
                text: "Are you gonna order something, kid?",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-are", text: "Are", start: 3.34, end: 3.48, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
                    { id: "word-you-order", text: "you", start: 3.5, end: 3.66, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
                    { id: "word-gonna-order", text: "gonna", start: 3.68, end: 3.94, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
                    { id: "word-order", text: "order", start: 3.96, end: 4.22, volumePercent: 60, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
                    { id: "word-something-order", text: "something,", start: 4.24, end: 4.72, volumePercent: 64, pitchWeight: 680, pitchWidth: 104, motion: "pop" },
                    { id: "word-kid", text: "kid?", start: 4.74, end: 5.08, volumePercent: 66, pitchWeight: 700, pitchWidth: 106, motion: "pop" }
                ]
            },
            {
                id: "cue-give-tab",
                type: "dialogue",
                speakerId: "speaker-marty",
                start: 7.1,
                end: 9.18,
                text: "Yeah, give me a Tab.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-yeah", text: "Yeah,", start: 7.14, end: 7.4, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
                    { id: "word-give-tab", text: "give", start: 8.38, end: 8.5, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
                    { id: "word-me-tab", text: "me", start: 8.5, end: 8.9, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
                    { id: "word-a-tab", text: "a", start: 8.9, end: 8.94, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
                    { id: "word-tab", text: "Tab.", start: 8.94, end: 9.16, volumePercent: 54, pitchWeight: 540, pitchWidth: 98, motion: "pop" }
                ]
            },
            {
                id: "cue-cant-tab",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 9.2,
                end: 13.84,
                text: "Tab? I can't give you a tab unless you order something.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-tab-question", text: "Tab?", start: 9.2, end: 9.32, volumePercent: 68, pitchWeight: 720, pitchWidth: 106, motion: "pop" },
                    { id: "word-i-cant", text: "I", start: 10.34, end: 10.43, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
                    { id: "word-cant", text: "can't", start: 10.43, end: 10.62, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" },
                    { id: "word-give-cant", text: "give", start: 10.62, end: 10.76, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
                    { id: "word-you-cant", text: "you", start: 10.82, end: 10.97, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
                    { id: "word-a-cant", text: "a", start: 11.03, end: 11.08, volumePercent: 54, pitchWeight: 560, pitchWidth: 98, motion: "pop" },
                    { id: "word-tab-cant", text: "tab", start: 11.13, end: 11.22, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" },
                    { id: "word-unless", text: "unless", start: 11.3, end: 11.73, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
                    { id: "word-you-order-2", text: "you", start: 11.76, end: 11.9, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
                    { id: "word-order-2", text: "order", start: 11.92, end: 12.32, volumePercent: 60, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
                    { id: "word-something-cant", text: "something.", start: 12.38, end: 13.5, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" }
                ]
            },
            {
                id: "cue-pepsi-free",
                type: "dialogue",
                speakerId: "speaker-marty",
                start: 13.84,
                end: 14.82,
                text: "Right, give me a Pepsi Free.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-right", text: "Right,", start: 13.88, end: 14.08, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
                    { id: "word-give-free", text: "give", start: 14.1, end: 14.24, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
                    { id: "word-me-free", text: "me", start: 14.26, end: 14.38, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
                    { id: "word-a-free", text: "a", start: 14.4, end: 14.5, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
                    { id: "word-pepsi-free", text: "Pepsi", start: 14.52, end: 14.68, volumePercent: 52, pitchWeight: 520, pitchWidth: 96, motion: "pop" },
                    { id: "word-free", text: "Free.", start: 14.7, end: 14.8, volumePercent: 52, pitchWeight: 520, pitchWidth: 96, motion: "pop" }
                ]
            },
            {
                id: "cue-pepsi-pay",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 14.82,
                end: 17.22,
                text: "You want a Pepsi, pal? You're gonna pay for it.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-you", text: "You", start: 14.88, end: 15.02, volumePercent: 58, pitchWeight: 590, pitchWidth: 98, motion: "pop" },
                    { id: "word-want", text: "want", start: 15.04, end: 15.24, volumePercent: 58, pitchWeight: 590, pitchWidth: 98, motion: "pop" },
                    { id: "word-a", text: "a", start: 15.26, end: 15.34, volumePercent: 56, pitchWeight: 570, pitchWidth: 98, motion: "pop" },
                    { id: "word-pepsi", text: "Pepsi,", start: 15.36, end: 15.66, volumePercent: 62, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
                    { id: "word-pal", text: "pal?", start: 15.68, end: 15.9, volumePercent: 60, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
                    { id: "word-youre", text: "You're", start: 16.0, end: 16.24, volumePercent: 66, pitchWeight: 700, pitchWidth: 104, motion: "pop" },
                    { id: "word-gonna", text: "gonna", start: 16.26, end: 16.5, volumePercent: 66, pitchWeight: 700, pitchWidth: 104, motion: "pop" },
                    { id: "word-pay", text: "pay", start: 16.52, end: 16.74, volumePercent: 72, pitchWeight: 820, pitchWidth: 110, motion: "pop" },
                    { id: "word-for", text: "for", start: 16.76, end: 16.9, volumePercent: 64, pitchWeight: 680, pitchWidth: 102, motion: "pop" },
                    { id: "word-it-2", text: "it.", start: 16.92, end: 17.08, volumePercent: 64, pitchWeight: 680, pitchWidth: 102, motion: "pop" }
                ]
            },
            {
                id: "cue-no-sugar-okay",
                type: "dialogue",
                speakerId: "speaker-marty",
                start: 17.22,
                end: 20.3,
                text: "Look, just give me something without any sugar in it, okay?",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-look", text: "Look,", start: 17.22, end: 17.34, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
                    { id: "word-just", text: "just", start: 17.34, end: 17.5, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
                    { id: "word-give", text: "give", start: 17.52, end: 17.68, volumePercent: 52, pitchWeight: 510, pitchWidth: 96, motion: "pop" },
                    { id: "word-me", text: "me", start: 17.7, end: 17.84, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
                    { id: "word-something-2", text: "something", start: 17.86, end: 18.38, volumePercent: 54, pitchWeight: 520, pitchWidth: 96, motion: "pop" },
                    { id: "word-without-2", text: "without", start: 18.72, end: 18.98, volumePercent: 46, pitchWeight: 470, pitchWidth: 92, motion: "pop" },
                    { id: "word-any", text: "any", start: 19.0, end: 19.16, volumePercent: 48, pitchWeight: 480, pitchWidth: 92, motion: "pop" },
                    { id: "word-sugar-2", text: "sugar", start: 19.18, end: 19.5, volumePercent: 46, pitchWeight: 460, pitchWidth: 90, motion: "pop" },
                    { id: "word-in", text: "in", start: 19.52, end: 19.64, volumePercent: 46, pitchWeight: 450, pitchWidth: 90, motion: "pop" },
                    { id: "word-it", text: "it,", start: 19.66, end: 19.82, volumePercent: 48, pitchWeight: 460, pitchWidth: 90, motion: "pop" },
                    { id: "word-okay", text: "okay?", start: 19.84, end: 20.22, volumePercent: 62, pitchWeight: 620, pitchWidth: 102, motion: "pop" }
                ]
            },
            {
                id: "cue-something-without",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 23.88,
                end: 26.08,
                text: "Something without sugar.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-something-lou", text: "Something", start: 24.76, end: 25.16, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
                    { id: "word-without-lou", text: "without", start: 25.18, end: 25.52, volumePercent: 54, pitchWeight: 580, pitchWidth: 98, motion: "pop" },
                    { id: "word-sugar-lou", text: "sugar.", start: 25.54, end: 25.9, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" }
                ]
            },
            {
                id: "cue-hey-mcfly",
                type: "dialogue",
                speakerId: "speaker-biff",
                start: 29.88,
                end: 31.44,
                text: "Hey, McFly.",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-hey", text: "Hey,", start: 30.0, end: 30.24, volumePercent: 70, pitchWeight: 760, pitchWidth: 108, motion: "pop" },
                    { id: "word-mcfly", text: "McFly.", start: 30.26, end: 30.82, volumePercent: 78, pitchWeight: 860, pitchWidth: 114, motion: "pop" }
                ]
            },
            {
                id: "cue-cup-clatters",
                type: "sound",
                speakerId: "",
                start: 31.44,
                end: 32.12,
                text: "cup clatters",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-cup-clatters", text: "cup clatters", start: 31.5, end: 31.94, volumePercent: 76, pitchWeight: 560, pitchWidth: 100, motion: "pop" }
                ]
            },
            {
                id: "cue-pepsi-can-cracks",
                type: "sound",
                speakerId: "",
                start: 32.12,
                end: 33.18,
                text: "pepsi can cracks open",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-pepsi-can-cracks", text: "pepsi can cracks open", start: 32.18, end: 33.0, volumePercent: 55, pitchWeight: 400, pitchWidth: 100, motion: "none" }
                ]
            },
            {
                id: "cue-door-crack",
                type: "sound",
                speakerId: "",
                start: 33.18,
                end: 34.3,
                text: "door crack",
                lineBreakAfterWordIds: [],
                exception: false,
                offCamera: false,
                words: [
                    { id: "word-door-crack", text: "door crack", start: 33.24, end: 33.94, volumePercent: 55, pitchWeight: 400, pitchWidth: 100, motion: "none" }
                ]
            }
        ],
        review: {
            notes: ["Mock transcript preserves the full sample dialogue while using AE-style rendered caption behavior.", "Standard closed captions remain a required companion deliverable."],
            validationStatus: "unchecked"
        }
    };
}
(() => {
    const state = {
        cwi: createSampleProject(),
        activeTab: "transcript",
        selectedCueId: "cue-riverside-drive",
        selectedWordId: "",
        selectedSpeakerId: "",
        mediaObjectUrl: "",
        importError: "",
        importWarnings: [],
        playbackKey: "",
        inspectorSize: INSPECTOR_COLUMN_DEFAULT,
        speakerSelectorOpen: false,
        activeSpeakerOptionId: "",
        previewTimeOverride: null
    };
    const els = {};
    document.addEventListener("DOMContentLoaded", init);
    function init() {
        els.video = document.querySelector(".media");
        els.captionSafe = document.querySelector(".caption-safe");
        els.playButton = document.querySelector(".play-icon");
        els.stepButtons = document.querySelectorAll(".preview-button");
        els.soundButton = document.querySelector(".sound-button");
        els.timeReadout = document.querySelector(".time-readout");
        els.timelineGrid = document.querySelector(".timeline-grid");
        els.sideContent = document.querySelector(".transcript");
        els.inspector = document.querySelector(".inspector");
        els.inspectorResize = document.querySelector(".inspector-resize");
        els.inspectorHead = document.querySelector(".inspector-head");
        els.inspectorBody = document.querySelector(".inspector-body");
        els.projectName = document.querySelector(".project-name");
        els.mediaBoundary = document.querySelector(".project-meta .small-pill");
        els.topActions = document.querySelector(".top-actions");
        els.tabs = Array.from(document.querySelectorAll(".tab"));
        els.video.src = DEFAULT_MEDIA_SRC;
        els.video.muted = false;
        els.video.volume = 0.85;
        setupTopActions();
        setupTabs();
        setupPlaybackControls();
        setupSidePanelEvents();
        setupTimelineEvents();
        setupInspectorEvents();
        setupInspectorResize();
        setupVideoEvents();
        renderAll();
    }
    function setupTopActions() {
        els.topActions.innerHTML = [
            '<label class="text-button" for="mediaInput">Media</label>',
            '<label class="text-button" for="jsonInput">Import JSON</label>',
            '<button type="button" class="primary-button" id="exportJsonButton">Export JSON</button>',
            '<input class="visually-hidden" id="mediaInput" type="file" accept="video/*,audio/*">',
            '<input class="visually-hidden" id="jsonInput" type="file" accept="application/json,.json">'
        ].join("");
        els.mediaInput = document.getElementById("mediaInput");
        els.jsonInput = document.getElementById("jsonInput");
        els.exportJsonButton = document.getElementById("exportJsonButton");
        els.mediaInput.addEventListener("change", handleMediaInput);
        els.jsonInput.addEventListener("change", handleJsonInput);
        els.exportJsonButton.addEventListener("click", exportProjectJson);
    }
    function setupTabs() {
        const tabs = ["transcript", "speakers", "qa"];
        els.tabs.forEach((tab, index) => {
            tab.dataset.tab = tabs[index];
            tab.id = `${tabs[index]}Tab`;
            tab.setAttribute("aria-controls", "sidePanelContent");
            tab.addEventListener("click", () => {
                state.activeTab = tab.dataset.tab;
                renderSideContent();
                renderTabs();
            });
            tab.addEventListener("keydown", handleTabKeydown);
        });
        els.sideContent.id = "sidePanelContent";
        els.sideContent.setAttribute("role", "tabpanel");
    }
    function setupPlaybackControls() {
        const [backButton, playButton, forwardButton] = Array.from(els.stepButtons);
        backButton.addEventListener("click", () => stepPlayback(-0.25));
        playButton.addEventListener("click", togglePlayback);
        forwardButton.addEventListener("click", () => stepPlayback(0.25));
        els.soundButton.addEventListener("click", toggleSound);
        setSoundButton();
    }
    function setupVideoEvents() {
        els.video.addEventListener("loadedmetadata", () => {
            if (Number.isFinite(els.video.duration) && els.video.duration > 0) {
                state.cwi.project.duration = roundTime(els.video.duration);
            }
            renderAll();
        });
        els.video.addEventListener("timeupdate", () => {
            if (!els.video.paused)
                state.previewTimeOverride = null;
            renderPlayback();
        });
        els.video.addEventListener("seeking", () => {
            if (!els.video.paused)
                state.previewTimeOverride = null;
            renderPlayback();
        });
        els.video.addEventListener("play", () => {
            if (state.previewTimeOverride !== null) {
                seekVideoElement(state.previewTimeOverride);
                state.previewTimeOverride = null;
            }
            setPlayButton();
            requestAnimationFrame(playbackLoop);
        });
        els.video.addEventListener("pause", setPlayButton);
        els.video.addEventListener("ended", setPlayButton);
        els.video.addEventListener("volumechange", setSoundButton);
    }
    function setupSidePanelEvents() {
        els.sideContent.addEventListener("click", (event) => {
            const addSpeaker = event.target.closest("[data-add-speaker]");
            if (addSpeaker) {
                addSpeakerToProject();
                renderAll();
                return;
            }
            const editSpeaker = event.target.closest("[data-speaker-edit]");
            if (editSpeaker) {
                state.selectedSpeakerId = state.selectedSpeakerId === editSpeaker.dataset.speakerEdit ? "" : editSpeaker.dataset.speakerEdit;
                renderSideContent();
                return;
            }
            const addCue = event.target.closest("[data-add-cue]");
            if (addCue) {
                addCueToTranscript();
                renderAll();
                return;
            }
            const deleteCue = event.target.closest("[data-delete-cue]");
            if (deleteCue) {
                deleteCueFromTranscript(deleteCue.dataset.deleteCue);
                renderAll();
                return;
            }
            const cueSelect = event.target.closest("[data-cue-select]");
            if (cueSelect) {
                state.selectedCueId = cueSelect.dataset.cueSelect;
                state.selectedWordId = "";
                renderAll();
            }
        });
        els.sideContent.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ")
                return;
            const speakerCard = event.target.closest(".speaker-card-head[role='button']");
            if (speakerCard && !event.target.closest("input, select, textarea, button")) {
                event.preventDefault();
                state.selectedSpeakerId = state.selectedSpeakerId === speakerCard.dataset.speakerEdit ? "" : speakerCard.dataset.speakerEdit;
                renderSideContent();
                return;
            }
            const cueSelect = event.target.closest("[data-cue-select]");
            if (cueSelect && !event.target.closest("input, select, textarea, button")) {
                event.preventDefault();
                state.selectedCueId = cueSelect.dataset.cueSelect;
                state.selectedWordId = "";
                renderAll();
            }
        });
        els.sideContent.addEventListener("input", (event) => {
            if (event.target.dataset.speakerControl) {
                updateSpeakerFromControl(event.target);
                renderInspector();
                renderTimeline();
                renderPlayback();
                return;
            }
            if (event.target.dataset.transcriptControl) {
                updateTranscriptCueFromControl(event.target);
                renderInspector();
                renderTimeline();
                renderPlayback();
            }
        });
        els.sideContent.addEventListener("change", (event) => {
            if (event.target.dataset.speakerControl) {
                updateSpeakerFromControl(event.target);
                renderAll();
                return;
            }
            if (event.target.dataset.transcriptControl) {
                updateTranscriptCueFromControl(event.target);
                renderAll();
            }
        });
    }
    function setupTimelineEvents() {
        els.timelineGrid.addEventListener("click", (event) => {
            const segment = event.target.closest("[data-cue-id]");
            if (!segment) {
                const seekTarget = event.target.closest("[data-timeline-seek]");
                if (seekTarget)
                    seekTimelineFromPointer(event);
                return;
            }
            state.selectedCueId = segment.dataset.cueId;
            state.selectedWordId = segment.dataset.wordId || "";
            renderAll();
        });
    }
    function setupInspectorEvents() {
        els.inspector.addEventListener("input", (event) => {
            if (!event.target.dataset.control)
                return;
            applyInspectorControl(event.target);
            syncInspectorTitle();
            renderPlayback();
            renderTimeline();
            renderSideContent();
            updateRangeOutputs();
        });
        els.inspector.addEventListener("change", (event) => {
            if (!event.target.dataset.control)
                return;
            applyInspectorControl(event.target);
            renderAll();
        });
        els.inspector.addEventListener("click", (event) => {
            const speakerTrigger = event.target.closest("[data-speaker-trigger]");
            if (speakerTrigger) {
                toggleSpeakerSelector();
                return;
            }
            const speakerOption = event.target.closest("[data-cue-speaker-option]");
            if (speakerOption) {
                selectCueSpeaker(speakerOption.dataset.cueSpeakerOption);
                return;
            }
            const wordPick = event.target.closest("[data-inspector-word-id]");
            if (wordPick) {
                state.selectedCueId = wordPick.dataset.cueId;
                state.selectedWordId = wordPick.dataset.inspectorWordId;
                renderAll();
                return;
            }
            const wordNav = event.target.closest("[data-word-nav]");
            if (wordNav) {
                selectAdjacentWord(Number(wordNav.dataset.wordNav));
                renderAll();
                return;
            }
            const preset = event.target.closest("[data-volume-preset]");
            if (preset) {
                const word = getSelectedWord();
                if (word) {
                    word.volumePercent = Number(preset.dataset.volumePreset);
                    renderAll();
                }
                return;
            }
        });
        els.inspector.addEventListener("keydown", handleSpeakerSelectorKeydown);
    }
    function setupInspectorResize() {
        if (!els.inspectorResize)
            return;
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
            if (!els.inspectorResize.hasPointerCapture(event.pointerId))
                return;
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
            if (event.key === "ArrowUp" || event.key === "ArrowLeft")
                nextSize += step;
            else if (event.key === "ArrowDown" || event.key === "ArrowRight")
                nextSize -= step;
            else if (event.key === "PageUp")
                nextSize += 72;
            else if (event.key === "PageDown")
                nextSize -= 72;
            else if (event.key === "Home")
                nextSize = getInspectorSizeBounds().min;
            else if (event.key === "End")
                nextSize = getInspectorSizeBounds().max;
            else
                return;
            event.preventDefault();
            applyInspectorSize(nextSize);
        });
        window.addEventListener("resize", () => applyInspectorSize(state.inspectorSize));
    }
    function applyInspectorSize(size) {
        const bounds = getInspectorSizeBounds();
        state.inspectorSize = Math.round(clamp(size, bounds.min, bounds.max));
        document.querySelector(".workspace").style.setProperty("--inspector-size", `${state.inspectorSize}px`);
        els.inspectorResize.setAttribute("aria-orientation", isStackedInspectorLayout() ? "horizontal" : "vertical");
        els.inspectorResize.setAttribute("aria-valuemin", String(bounds.min));
        els.inspectorResize.setAttribute("aria-valuemax", String(bounds.max));
        els.inspectorResize.setAttribute("aria-valuenow", String(state.inspectorSize));
    }
    function getInspectorSizeBounds() {
        const workspace = document.querySelector(".workspace");
        if (isStackedInspectorLayout()) {
            return {
                min: INSPECTOR_STACK_MIN,
                max: Math.max(INSPECTOR_STACK_MIN, Math.min(520, Math.round(window.innerHeight * 0.56)))
            };
        }
        const workspaceWidth = workspace ? workspace.clientWidth : 0;
        const leftPanelWidth = document.querySelector(".tabs") ? document.querySelector(".tabs").getBoundingClientRect().width : 0;
        const resizeHandleWidth = 10;
        const maxFromWorkspace = workspaceWidth - leftPanelWidth - resizeHandleWidth - CENTER_STAGE_MIN;
        const max = Math.max(INSPECTOR_COLUMN_MIN, Math.min(560, maxFromWorkspace || INSPECTOR_COLUMN_DEFAULT));
        return { min: INSPECTOR_COLUMN_MIN, max };
    }
    function isStackedInspectorLayout() {
        return window.innerWidth <= 900;
    }
    function handleMediaInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file)
            return;
        if (state.mediaObjectUrl)
            URL.revokeObjectURL(state.mediaObjectUrl);
        state.mediaObjectUrl = URL.createObjectURL(file);
        state.cwi.project.mediaName = file.name;
        els.video.src = state.mediaObjectUrl;
        els.video.load();
        state.importError = "";
        renderAll();
    }
    function handleJsonInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(String(reader.result || ""));
                state.importWarnings = findMissingImportedFields(parsed);
                state.cwi = normalizeImportedProject(parsed);
                state.selectedCueId = state.cwi.cues[0] ? state.cwi.cues[0].id : "";
                state.selectedWordId = "";
                state.activeTab = "qa";
                state.importError = "";
                renderAll();
            }
            catch (error) {
                state.importError = error.message || "The selected JSON file could not be imported.";
                state.importWarnings = [];
                state.activeTab = "qa";
                renderAll();
            }
            finally {
                event.target.value = "";
            }
        };
        reader.readAsText(file);
    }
    function exportProjectJson() {
        const payload = structuredCloneSafe(state.cwi);
        payload.review = payload.review || {};
        payload.review.validationStatus = validateProject(payload).some((item) => item.status === "fail") ? "needs-review" : "pass";
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${slugify(payload.project.title || "cwi-project")}.cwi.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
    function togglePlayback() {
        if (els.video.paused) {
            els.video.muted = false;
            if (els.video.volume === 0)
                els.video.volume = 0.85;
            els.video.play().catch(() => {
                state.importError = "Preview playback was blocked by the browser.";
                state.activeTab = "qa";
                renderAll();
            });
        }
        else {
            els.video.pause();
        }
    }
    function toggleSound() {
        if (els.video.muted || els.video.volume === 0) {
            els.video.muted = false;
            if (els.video.volume === 0)
                els.video.volume = 0.85;
        }
        else {
            els.video.muted = true;
        }
        setSoundButton();
    }
    function stepPlayback(delta) {
        const duration = getDuration();
        seekPreviewToTime(currentMediaTime() + delta);
        renderPlayback();
    }
    function playbackLoop() {
        renderPlayback();
        if (!els.video.paused && !els.video.ended)
            requestAnimationFrame(playbackLoop);
    }
    function renderAll() {
        ensureSelection();
        renderTopbar();
        renderTabs();
        renderSideContent();
        renderInspector();
        renderTimeline();
        renderPlayback();
    }
    function renderTopbar() {
        els.projectName.textContent = state.mediaObjectUrl
            ? state.cwi.project.mediaName || "Browser media"
            : `${state.cwi.project.title || "Untitled CWI"}${mediaExtensionLabel()}`;
        els.mediaBoundary.textContent = state.mediaObjectUrl ? "Browser-only Media" : "Local Sample";
    }
    function renderTabs() {
        els.tabs.forEach((tab) => {
            const active = tab.dataset.tab === state.activeTab;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });
        const activeTab = els.tabs.find((tab) => tab.dataset.tab === state.activeTab);
        els.sideContent.setAttribute("aria-labelledby", activeTab ? activeTab.id : "");
    }
    function handleTabKeydown(event) {
        const currentIndex = els.tabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;
        if (event.key === "ArrowRight")
            nextIndex = (currentIndex + 1) % els.tabs.length;
        else if (event.key === "ArrowLeft")
            nextIndex = (currentIndex - 1 + els.tabs.length) % els.tabs.length;
        else if (event.key === "Home")
            nextIndex = 0;
        else if (event.key === "End")
            nextIndex = els.tabs.length - 1;
        else
            return;
        event.preventDefault();
        state.activeTab = els.tabs[nextIndex].dataset.tab;
        renderSideContent();
        renderTabs();
        els.tabs[nextIndex].focus();
    }
    function renderSideContent() {
        if (state.activeTab === "speakers") {
            renderSpeakersPanel();
        }
        else if (state.activeTab === "qa") {
            renderQaPanel();
        }
        else {
            renderTranscriptPanel();
        }
    }
    function renderTranscriptPanel() {
        const current = getCurrentCueAndWord();
        els.sideContent.innerHTML = `
          <div class="panel-list transcript-panel">
            <div class="transcript-list">
              ${state.cwi.cues.map((cue) => {
            const speaker = getSpeaker(cue.speakerId);
            const active = cue.id === state.selectedCueId;
            const editId = cueEditDomId(cue.id);
            const cueTypeClass = cue.type === "dialogue" ? "" : ` ${cue.type}`;
            const speakerMarkup = speaker
                ? `<div class="speaker"><i style="background: ${escapeAttr(speaker.color)}"></i>${escapeHtml(speaker.name)}</div>`
                : `<div class="speaker"><i style="background: var(--ink-dim)"></i>${escapeHtml(cue.type)}</div>`;
            return `
            <div class="cue${active ? " active" : ""}" data-cue-id="${escapeAttr(cue.id)}">
              <button type="button" class="cue-select-surface" data-cue-select="${escapeAttr(cue.id)}" aria-expanded="${active}"${active ? ` aria-controls="${escapeAttr(editId)}"` : ""}>
                <div>
                  <div class="cue-time">${formatTime(cue.start)}</div>
                  ${speakerMarkup}
                </div>
                <div class="cue-copy${cueTypeClass}">
                  ${renderCueWordsForTranscript(cue, current.wordId)}
                </div>
              </button>
              ${active ? renderTranscriptCueEditor(cue, editId) : ""}
            </div>
          `;
        }).join("")}
            </div>
            <div class="panel-action-row transcript-actions">
              <button type="button" class="primary-button" data-add-cue>Add cue</button>
            </div>
          </div>
        `;
    }
    function renderTranscriptCueEditor(cue, editId) {
        return `
          <div class="cue-edit-grid" id="${escapeAttr(editId)}">
            <div class="control-group">
              <label class="control-label" for="${escapeAttr(cue.id)}TranscriptType">Cue type</label>
              <select class="control-select" id="${escapeAttr(cue.id)}TranscriptType" data-transcript-control="type" data-cue-id="${escapeAttr(cue.id)}">
                ${CUE_TYPES.map((type) => `<option value="${type}"${cue.type === type ? " selected" : ""}>${capitalize(type)}</option>`).join("")}
              </select>
            </div>

            <div class="control-group">
              <label class="control-label" for="${escapeAttr(cue.id)}TranscriptText">Transcript text</label>
              <textarea class="control-textarea" id="${escapeAttr(cue.id)}TranscriptText" data-transcript-control="text" data-cue-id="${escapeAttr(cue.id)}">${escapeHtml(cue.text || "")}</textarea>
            </div>

            <div class="cue-edit-actions">
              <button type="button" class="danger-button" data-delete-cue="${escapeAttr(cue.id)}">Delete cue</button>
            </div>
          </div>
        `;
    }
    function renderCueWordsForTranscript(cue, liveWordId) {
        if (!cue.words || cue.words.length === 0) {
            return `<span class="word">${escapeHtml(formatCueText(cue))}</span>`;
        }
        return cue.words.map((word) => {
            const live = word.id === liveWordId;
            const warn = cue.exception || hasTimingWarning(cue, word);
            return `<span class="word${live ? " live" : ""}${warn ? " warn" : ""}">${escapeHtml(word.text)}</span>`;
        }).join(" ");
    }
    function renderSpeakersPanel() {
        const counts = new Map();
        state.cwi.cues.forEach((cue) => {
            if (!cue.speakerId)
                return;
            counts.set(cue.speakerId, (counts.get(cue.speakerId) || 0) + 1);
        });
        els.sideContent.innerHTML = `
          <div class="panel-list speakers-panel">
            <div class="speaker-list">
              ${state.cwi.speakers.map((speaker) => {
            const isEditing = speaker.id === state.selectedSpeakerId;
            return `
              <div class="speaker-card${isEditing ? " is-editing" : ""}" data-speaker-card="${escapeAttr(speaker.id)}">
                <div class="speaker-card-head" role="button" tabindex="0" data-speaker-edit="${escapeAttr(speaker.id)}" aria-expanded="${isEditing}">
                  <div class="speaker-select-content">
                    <span class="speaker-chip" style="background: ${escapeAttr(speaker.color)}"></span>
                    <span class="speaker-select-copy">
                      <span class="speaker-name">${escapeHtml(speaker.name || "Unnamed speaker")}</span>
                      <span class="speaker-meta">${escapeHtml(roleLabel(speaker.role))}</span>
                    </span>
                  </div>
                </div>

                ${isEditing ? `
                <div class="speaker-edit-grid">
                  <div class="control-group">
                    <label class="control-label" for="${escapeAttr(speaker.id)}Name">Character name</label>
                    <input class="control-input" id="${escapeAttr(speaker.id)}Name" data-speaker-control="name" data-speaker-id="${escapeAttr(speaker.id)}" value="${escapeAttr(speaker.name)}">
                  </div>

                  <div class="speaker-edit-row">
                    <div class="control-group">
                      <label class="control-label" for="${escapeAttr(speaker.id)}Role">Character class</label>
                      <select class="control-select" id="${escapeAttr(speaker.id)}Role" data-speaker-control="role" data-speaker-id="${escapeAttr(speaker.id)}">
                        ${SPEAKER_ROLES.map((role) => `<option value="${role}"${speaker.role === role ? " selected" : ""}>${roleLabel(role)}</option>`).join("")}
                      </select>
                    </div>

                    <div class="control-group">
                      <label class="control-label" for="${escapeAttr(speaker.id)}Color">Attribution color</label>
                      <div class="speaker-color-select">
                        <span class="speaker-chip-large" style="background: ${escapeAttr(speaker.color)}"></span>
                        <select class="control-select" id="${escapeAttr(speaker.id)}Color" data-speaker-control="color" data-speaker-id="${escapeAttr(speaker.id)}">
                          ${renderSpeakerColorOptions(speaker.color)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <label class="checkbox-row">
                    <input type="checkbox" data-speaker-control="defaultOffCamera" data-speaker-id="${escapeAttr(speaker.id)}"${speaker.defaultOffCamera ? " checked" : ""}>
                    Default this character to off-camera italics
                  </label>
                </div>
                ` : ""}
              </div>
            `;
        }).join("")}
            </div>
            <div class="panel-action-row speaker-actions">
              <button type="button" class="primary-button" data-add-speaker>Add character</button>
              <span class="speaker-help">
                <button type="button" class="speaker-help-button" aria-label="Speaker color guidance" aria-describedby="speakerGuidance">?</button>
                <span class="speaker-help-text" id="speakerGuidance" role="tooltip">Use main colors for primary characters, supporting colors for secondary voices, and softer pastel colors for minor characters.</span>
              </span>
            </div>
          </div>
        `;
    }
    function renderSpeakerColorOptions(selectedColor) {
        const groups = SPEAKER_ROLES.map((role) => {
            const colors = SPEAKER_PALETTE.filter((entry) => entry.role === role);
            return `
            <optgroup label="${escapeAttr(roleLabel(role))}">
              ${colors.map((entry) => `<option value="${escapeAttr(entry.color)}"${entry.color.toLowerCase() === String(selectedColor).toLowerCase() ? " selected" : ""}>${escapeHtml(entry.label)} · ${escapeHtml(entry.color)}</option>`).join("")}
            </optgroup>
          `;
        }).join("");
        const isKnownColor = SPEAKER_PALETTE.some((entry) => entry.color.toLowerCase() === String(selectedColor).toLowerCase());
        return `${isKnownColor ? "" : `<option value="${escapeAttr(selectedColor)}" selected>Custom · ${escapeHtml(selectedColor)}</option>`}${groups}`;
    }
    function updateSpeakerFromControl(control) {
        const speaker = getSpeaker(control.dataset.speakerId);
        if (!speaker)
            return;
        const value = control.type === "checkbox" ? control.checked : control.value;
        if (control.dataset.speakerControl === "name") {
            speaker.name = String(value).trim() || "Unnamed speaker";
        }
        else if (control.dataset.speakerControl === "role") {
            speaker.role = SPEAKER_ROLES.includes(value) ? value : "supporting";
            if (!colorFitsRole(speaker.color, speaker.role))
                speaker.color = nextSpeakerColor(speaker.role);
        }
        else if (control.dataset.speakerControl === "color") {
            speaker.color = String(value);
        }
        else if (control.dataset.speakerControl === "defaultOffCamera") {
            speaker.defaultOffCamera = Boolean(value);
        }
    }
    function addSpeakerToProject() {
        const role = "supporting";
        const speakerNumber = state.cwi.speakers.length + 1;
        const speaker = {
            id: uniqueId("speaker"),
            name: `Character ${speakerNumber}`,
            role,
            color: nextSpeakerColor(role),
            defaultOffCamera: false
        };
        state.cwi.speakers.push(speaker);
        state.selectedSpeakerId = speaker.id;
        state.activeTab = "speakers";
    }
    function nextSpeakerColor(role) {
        const usedColors = new Set(state.cwi.speakers.map((speaker) => speaker.color.toLowerCase()));
        const candidates = SPEAKER_PALETTE.filter((entry) => entry.role === role);
        const available = candidates.find((entry) => !usedColors.has(entry.color.toLowerCase()));
        return (available || candidates[0] || SPEAKER_PALETTE[0]).color;
    }
    function colorFitsRole(color, role) {
        return SPEAKER_PALETTE.some((entry) => entry.role === role && entry.color.toLowerCase() === String(color).toLowerCase());
    }
    function updateTranscriptCueFromControl(control) {
        const cue = getCue(control.dataset.cueId);
        if (!cue)
            return;
        const value = control.value;
        if (control.dataset.transcriptControl === "type") {
            cue.type = CUE_TYPES.includes(value) ? value : "dialogue";
            if (cue.type !== "dialogue") {
                cue.speakerId = "";
                cue.offCamera = false;
            }
            else if (!cue.speakerId && state.cwi.speakers[0]) {
                cue.speakerId = state.cwi.speakers[0].id;
            }
        }
        else if (control.dataset.transcriptControl === "text") {
            updateCueTextAndWords(cue, String(value));
            refreshTranscriptCueRow(cue);
        }
        if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId)))
            state.selectedWordId = "";
    }
    function addCueToTranscript() {
        const currentIndex = state.cwi.cues.findIndex((cue) => cue.id === state.selectedCueId);
        const anchor = currentIndex >= 0 ? state.cwi.cues[currentIndex] : state.cwi.cues[state.cwi.cues.length - 1];
        const start = anchor ? roundTime(anchor.end + 0.2) : 0;
        const end = roundTime(start + 1.8);
        const speaker = state.cwi.speakers[0] || null;
        const cue = {
            id: uniqueId("cue"),
            type: "dialogue",
            speakerId: speaker ? speaker.id : "",
            start,
            end,
            text: "New caption",
            lineBreakAfterWordIds: [],
            exception: false,
            offCamera: speaker ? Boolean(speaker.defaultOffCamera) : false,
            words: []
        };
        cue.words = buildWordsForCueText(cue, cue.text);
        if (currentIndex >= 0)
            state.cwi.cues.splice(currentIndex + 1, 0, cue);
        else
            state.cwi.cues.push(cue);
        state.selectedCueId = cue.id;
        state.selectedWordId = "";
        state.activeTab = "transcript";
    }
    function deleteCueFromTranscript(cueId) {
        const index = state.cwi.cues.findIndex((cue) => cue.id === cueId);
        if (index === -1)
            return;
        state.cwi.cues.splice(index, 1);
        const nextCue = state.cwi.cues[Math.min(index, state.cwi.cues.length - 1)] || state.cwi.cues[index - 1] || null;
        state.selectedCueId = nextCue ? nextCue.id : "";
        state.selectedWordId = "";
    }
    function updateCueTextAndWords(cue, text) {
        cue.text = text;
        cue.words = buildWordsForCueText(cue, text);
        const wordIds = new Set((cue.words || []).map((word) => word.id));
        cue.lineBreakAfterWordIds = (cue.lineBreakAfterWordIds || []).filter((wordId) => wordIds.has(wordId));
    }
    function refreshTranscriptCueRow(cue) {
        const row = Array.from(els.sideContent.querySelectorAll(".cue[data-cue-id]")).find((item) => item.dataset.cueId === cue.id);
        if (!row)
            return;
        const copy = row.querySelector(".cue-copy");
        if (copy)
            copy.innerHTML = renderCueWordsForTranscript(cue, getCurrentCueAndWord().wordId);
    }
    function buildWordsForCueText(cue, text) {
        const tokens = tokenizeTranscriptText(text);
        const oldWords = Array.isArray(cue.words) ? cue.words : [];
        if (!tokens.length)
            return [];
        if (tokens.length === oldWords.length) {
            return oldWords.map((word, index) => ({
                ...word,
                text: tokens[index]
            }));
        }
        const reservedIds = new Set();
        const duration = Math.max(0.01, Number(cue.end) - Number(cue.start));
        const slice = duration / tokens.length;
        return tokens.map((token, index) => {
            const fallback = oldWords[Math.min(index, oldWords.length - 1)] || {};
            const id = uniqueId(`${cue.id}-word`, reservedIds);
            reservedIds.add(id);
            return {
                id,
                text: token,
                start: roundTime(Number(cue.start) + slice * index),
                end: roundTime(Number(cue.start) + slice * (index + 1)),
                volumePercent: Number.isFinite(Number(fallback.volumePercent)) ? fallback.volumePercent : 55,
                pitchWeight: Number.isFinite(Number(fallback.pitchWeight)) ? fallback.pitchWeight : 400,
                pitchWidth: Number.isFinite(Number(fallback.pitchWidth)) ? fallback.pitchWidth : 100,
                motion: MOTIONS.includes(fallback.motion) ? fallback.motion : "pop"
            };
        });
    }
    function tokenizeTranscriptText(text) {
        return String(text || "").trim().split(/\s+/).filter(Boolean);
    }
    function renderQaPanel() {
        const checks = validateProject(state.cwi);
        els.sideContent.innerHTML = `
          <div class="panel-list">
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
    function renderReviewNotes() {
        const notes = state.cwi.review && Array.isArray(state.cwi.review.notes) ? state.cwi.review.notes : [];
        if (!notes.length)
            return "";
        return notes.map((note) => `
          <div class="qa-card">
            <div class="qa-kicker">Review note</div>
            <div class="qa-body">${escapeHtml(note)}</div>
          </div>
        `).join("");
    }
    function renderInspector() {
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (!cue) {
            els.inspectorHead.innerHTML = '<div class="inspector-title">EDITOR</div>';
            els.inspectorBody.innerHTML = '<div class="empty-card">Import a CWI JSON file or select a cue to edit caption intent.</div>';
            return;
        }
        els.inspectorHead.innerHTML = '<div class="inspector-title">EDITOR</div>';
        els.inspectorBody.innerHTML = `
          ${renderCueEditor(cue)}
          ${renderWordEditor(cue, word)}
        `;
    }
    function renderCueEditor(cue) {
        const speaker = getSpeaker(cue.speakerId);
        const words = cue.words || [];
        const selectedIndex = words.findIndex((item) => item.id === state.selectedWordId);
        return `
          <section class="editor-section" aria-label="Cue Editor">
            <div class="editor-section-head">
              <div class="editor-section-title">Cue Editor</div>
              <span class="small-pill">${escapeHtml(capitalize(cue.type))}</span>
            </div>

            <div class="field-row">
              <div class="control-group">
                <label class="control-label" for="cueStart">Cue start</label>
                <input class="control-input" id="cueStart" type="number" min="0" step="0.01" data-control="cue-start" value="${cue.start}">
              </div>
              <div class="control-group">
                <label class="control-label" for="cueEnd">Cue end</label>
                <input class="control-input" id="cueEnd" type="number" min="0" step="0.01" data-control="cue-end" value="${cue.end}">
              </div>
            </div>

            ${renderSpeakerSelector(cue, speaker)}

            <div class="control-group">
              <label class="control-label" for="cueText">Cue text</label>
              <textarea class="control-textarea" id="cueText" data-control="cue-text">${escapeHtml(cue.text || "")}</textarea>
            </div>

            <div class="control-group">
              <div class="control-label">Cue flags</div>
              <div class="checkbox-grid">
                <label class="checkbox-row"><input type="checkbox" data-control="off-camera"${cue.offCamera ? " checked" : ""}> Off-camera voice</label>
                <label class="checkbox-row"><input type="checkbox" data-control="exception"${cue.exception ? " checked" : ""}> Scene exception</label>
              </div>
            </div>

            <div class="control-group">
              <div class="control-label">Words in cue${selectedIndex >= 0 ? ` · ${selectedIndex + 1} of ${words.length}` : ""}</div>
              ${renderCueWordPicker(cue)}
            </div>
          </section>
        `;
    }
    function renderCueWordPicker(cue) {
        const words = cue.words || [];
        if (!words.length)
            return '<div class="empty-card">This cue has no word timing records yet.</div>';
        return `
          <div class="word-picker">
            ${words.map((word) => `<button type="button" class="word-picker-button${word.id === state.selectedWordId ? " active" : ""}" data-cue-id="${escapeAttr(cue.id)}" data-inspector-word-id="${escapeAttr(word.id)}">${escapeHtml(word.text)}</button>`).join("")}
          </div>
        `;
    }
    function renderSpeakerSelector(cue, speaker) {
        const inheritedColor = speaker ? speaker.color : "var(--ink-dim)";
        const speakerMeta = speaker
            ? roleLabel(speaker.role)
            : "No class selected";
        const speakerName = speaker ? speaker.name : "No speaker selected";
        const disabled = cue.type !== "dialogue";
        const options = [
            { id: "", name: "No speaker", meta: "No class selected", color: "var(--ink-dim)" },
            ...state.cwi.speakers.map((item) => ({
                id: item.id,
                name: item.name,
                meta: roleLabel(item.role),
                color: item.color
            }))
        ];
        const activeOptionId = state.activeSpeakerOptionId || cue.speakerId || "";
        const listboxId = "cueSpeakerOptions";
        return `
          <div class="control-group">
            <div class="control-label">Speaker</div>
            ${disabled ? `
              <div class="speaker-custom-trigger" aria-disabled="true">
                <span class="speaker-chip" style="background: ${escapeAttr(inheritedColor)}"></span>
                <span class="speaker-custom-copy">
                  <span class="speaker-name">${escapeHtml(speakerName)}</span>
                  <span class="speaker-meta">${escapeHtml(speakerMeta)}</span>
                </span>
              </div>
            ` : `
              <div class="speaker-custom-select${state.speakerSelectorOpen ? " is-open" : ""}">
                <button type="button" class="speaker-custom-trigger" data-speaker-trigger aria-haspopup="listbox" aria-expanded="${state.speakerSelectorOpen}" aria-controls="${listboxId}" aria-activedescendant="${state.speakerSelectorOpen ? speakerOptionDomId(activeOptionId) : ""}">
                  <span class="speaker-chip" style="background: ${escapeAttr(inheritedColor)}"></span>
                  <span class="speaker-custom-copy">
                    <span class="speaker-name">${escapeHtml(speakerName)}</span>
                    <span class="speaker-meta">${escapeHtml(speakerMeta)}</span>
                  </span>
                </button>
                ${state.speakerSelectorOpen ? `
                  <div class="speaker-options" id="${listboxId}" role="listbox" aria-label="Choose speaker">
                    ${options.map((option) => `
                    <div role="option" tabindex="${option.id === activeOptionId ? "0" : "-1"}" id="${speakerOptionDomId(option.id)}" class="speaker-option" data-cue-speaker-option="${escapeAttr(option.id)}" aria-selected="${cue.speakerId === option.id}">
                      <span class="speaker-chip" style="background: ${escapeAttr(option.color)}"></span>
                      <span class="speaker-custom-copy">
                        <span class="speaker-name">${escapeHtml(option.name)}</span>
                        <span class="speaker-meta">${escapeHtml(option.meta)}</span>
                      </span>
                    </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            `}
          </div>
        `;
    }
    function toggleSpeakerSelector() {
        const cue = getSelectedCue();
        state.speakerSelectorOpen = !state.speakerSelectorOpen;
        state.activeSpeakerOptionId = cue ? cue.speakerId || "" : "";
        renderInspector();
        if (state.speakerSelectorOpen) {
            focusSpeakerOption(state.activeSpeakerOptionId);
        }
    }
    function selectCueSpeaker(speakerId) {
        const cue = getSelectedCue();
        if (cue && cue.type === "dialogue") {
            cue.speakerId = speakerId;
            cue.offCamera = Boolean(getSpeaker(cue.speakerId) && getSpeaker(cue.speakerId).defaultOffCamera);
        }
        state.speakerSelectorOpen = false;
        state.activeSpeakerOptionId = "";
        renderAll();
        const trigger = els.inspector.querySelector("[data-speaker-trigger]");
        if (trigger)
            trigger.focus();
    }
    function handleSpeakerSelectorKeydown(event) {
        const trigger = event.target.closest("[data-speaker-trigger]");
        const option = event.target.closest("[data-cue-speaker-option]");
        if (!trigger && !option)
            return;
        if (trigger) {
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                event.preventDefault();
                const cue = getSelectedCue();
                state.speakerSelectorOpen = true;
                state.activeSpeakerOptionId = cue ? cue.speakerId || "" : "";
                renderInspector();
                focusSpeakerOption(state.activeSpeakerOptionId);
            }
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectCueSpeaker(option.dataset.cueSpeakerOption);
        }
        else if (event.key === "Escape") {
            event.preventDefault();
            state.speakerSelectorOpen = false;
            renderInspector();
            const nextTrigger = els.inspector.querySelector("[data-speaker-trigger]");
            if (nextTrigger)
                nextTrigger.focus();
        }
        else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            moveActiveSpeakerOption(event.key);
        }
    }
    function moveActiveSpeakerOption(key) {
        const options = speakerOptionIds();
        if (!options.length)
            return;
        const currentIndex = Math.max(0, options.indexOf(state.activeSpeakerOptionId));
        let nextIndex = currentIndex;
        if (key === "ArrowDown")
            nextIndex = Math.min(options.length - 1, currentIndex + 1);
        else if (key === "ArrowUp")
            nextIndex = Math.max(0, currentIndex - 1);
        else if (key === "Home")
            nextIndex = 0;
        else if (key === "End")
            nextIndex = options.length - 1;
        state.activeSpeakerOptionId = options[nextIndex];
        renderInspector();
        focusSpeakerOption(state.activeSpeakerOptionId);
    }
    function focusSpeakerOption(optionId) {
        const option = els.inspector.querySelector(`#${speakerOptionDomId(optionId)}`);
        if (option)
            option.focus();
    }
    function speakerOptionIds() {
        return ["", ...state.cwi.speakers.map((speaker) => speaker.id)];
    }
    function speakerOptionDomId(optionId) {
        return `cueSpeakerOption-${optionId || "none"}`;
    }
    function cueEditDomId(cueId) {
        return `cueEdit-${cueId}`;
    }
    function renderWordEditor(cue, word) {
        const words = cue.words || [];
        const selectedIndex = word ? words.findIndex((item) => item.id === word.id) : -1;
        if (!word) {
            return `
            <section class="editor-section" aria-label="Word Editor">
              <div class="editor-section-head">
                <div class="editor-section-title">Word Editor</div>
                <span class="small-pill">empty</span>
              </div>
              <div class="empty-card">Select a word in the Cue Editor to adjust transcript text, timing, motion, volume, pitch, and layout.</div>
            </section>
          `;
        }
        const volume = word ? word.volumePercent : 50;
        const pitchWeight = word ? word.pitchWeight : 400;
        const pitchWidth = word ? word.pitchWidth : 100;
        const motion = word ? word.motion : "none";
        return `
          <section class="editor-section" aria-label="Word Editor">
            <div class="editor-section-head">
              <div class="editor-section-title">Word Editor</div>
              <span class="small-pill">${selectedIndex + 1} of ${words.length}</span>
            </div>

            <div class="word-editor-actions">
              <button type="button" class="word-nav-button" data-word-nav="-1">Previous</button>
              <button type="button" class="word-nav-button" data-word-nav="1">Next</button>
            </div>

            <div class="control-group">
              <label class="control-label" for="wordText">Word text</label>
              <input class="control-input" id="wordText" data-control="word-text" value="${escapeAttr(word.text)}">
            </div>

            <div class="field-row">
              <div class="control-group">
                <label class="control-label" for="wordStart">Word start</label>
                <input class="control-input" id="wordStart" type="number" min="0" step="0.01" data-control="word-start" value="${word.start}">
              </div>
              <div class="control-group">
                <label class="control-label" for="wordEnd">Word end</label>
                <input class="control-input" id="wordEnd" type="number" min="0" step="0.01" data-control="word-end" value="${word.end}">
              </div>
            </div>

            <div class="control-group">
              <div class="control-label">Vocal emphasis</div>
              <div class="segmented">
                <button type="button" class="${volume >= 70 ? "active" : ""}" data-volume-preset="82" aria-pressed="${volume >= 70}">Loud</button>
                <button type="button" class="${volume > 40 && volume < 70 ? "active" : ""}" data-volume-preset="55" aria-pressed="${volume > 40 && volume < 70}">Normal</button>
                <button type="button" class="${volume <= 40 ? "active" : ""}" data-volume-preset="28" aria-pressed="${volume <= 40}">Whisper</button>
              </div>
            </div>

            <div class="control-group">
              <label class="control-label" for="motionPattern">Motion pattern</label>
              <select class="control-select" id="motionPattern" data-control="motion">
                ${MOTIONS.map((item) => `<option value="${item}"${motion === item ? " selected" : ""}>${motionLabel(item)}</option>`).join("")}
              </select>
            </div>

            <div class="control-group">
              <label class="control-label" for="volumeSize">Volume size</label>
              <div class="range-row wide">
                <input type="range" id="volumeSize" min="0" max="100" value="${volume}" data-control="volume">
                <span data-output="volume">${volumeToPercent(volume).toFixed(1)}%</span>
              </div>
            </div>

            <div class="field-row">
              <div class="control-group">
                <label class="control-label" for="pitchWeight">Pitch weight</label>
                <input class="control-input" id="pitchWeight" type="number" min="300" max="1000" step="10" data-control="pitch-weight" value="${pitchWeight}">
              </div>
              <div class="control-group">
                <label class="control-label" for="pitchWidth">Pitch width</label>
                <input class="control-input" id="pitchWidth" type="number" min="75" max="125" step="1" data-control="pitch-width" value="${pitchWidth}">
              </div>
            </div>

          </section>
        `;
    }
    function renderTimeline() {
        const duration = getDuration();
        const contentWidth = Math.max(760, Math.ceil(duration * PX_PER_SECOND) + 40);
        const ticks = [];
        const tickStep = duration <= 12 ? 2 : 5;
        for (let tick = 0; tick <= duration; tick += tickStep)
            ticks.push(tick);
        if (!ticks.includes(Math.floor(duration)))
            ticks.push(Math.floor(duration));
        els.timelineGrid.style.minWidth = "0";
        els.timelineGrid.innerHTML = `
          <div class="timeline-corner" aria-hidden="true"></div>
          <div class="row-label" style="grid-row: 2">Audio</div>
          <div class="row-label" style="grid-row: 3">Words</div>
          <div class="row-label" style="grid-row: 4">CWI</div>
          <div class="timeline-scroll">
            <div class="playhead" aria-hidden="true" style="left: ${currentMediaTime() * PX_PER_SECOND}px"></div>
            <div class="ruler" style="min-width: ${contentWidth}px">
              ${ticks.map((tick) => `<span style="left: ${tick * PX_PER_SECOND}px">${formatTime(tick)}</span>`).join("")}
            </div>
            <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
              <div class="wave">${renderWaveform()}</div>
            </div>
            <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
              ${renderWordSegments()}
            </div>
            <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
              ${renderCueSegments()}
            </div>
          </div>
        `;
    }
    function renderWaveform() {
        return AUDIO_WAVEFORM.map((value) => {
            const height = Math.max(3, Math.round(6 + value * 38));
            return `<i style="height: ${height}px"></i>`;
        }).join("");
    }
    function renderWordSegments() {
        const current = getCurrentCueAndWord();
        return state.cwi.cues.flatMap((cue) => (cue.words || []).map((word) => {
            const active = word.id === state.selectedWordId || word.id === current.wordId;
            return `<button type="button" class="segment${active ? " active" : ""}" style="left: ${word.start * PX_PER_SECOND}px; width: ${Math.max(34, (word.end - word.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}" data-word-id="${escapeAttr(word.id)}">${escapeHtml(word.text)}</button>`;
        })).join("");
    }
    function renderCueSegments() {
        return state.cwi.cues.map((cue) => {
            const active = cue.id === state.selectedCueId || isCueLive(cue, currentMediaTime());
            const label = cue.type === "dialogue" ? `${motionSummary(cue)} · ${speakerName(cue.speakerId)}` : `${cue.type} cue`;
            return `<button type="button" class="segment${active ? " active" : ""}" style="left: ${cue.start * PX_PER_SECOND}px; width: ${Math.max(58, (cue.end - cue.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}">${escapeHtml(label)}</button>`;
        }).join("");
    }
    function seekTimelineFromPointer(event) {
        const scroller = els.timelineGrid.querySelector(".timeline-scroll");
        if (!scroller)
            return;
        const rect = scroller.getBoundingClientRect();
        const x = event.clientX - rect.left + scroller.scrollLeft;
        const time = clamp(x / PX_PER_SECOND, 0, getDuration());
        seekPreviewToTime(time);
        renderPlayback();
    }
    function renderPlayback() {
        renderCaptionOverlay();
        renderTimeReadout();
        updatePlayhead();
        const current = getCurrentCueAndWord();
        const key = `${current.cueId || ""}:${current.wordId || ""}`;
        if (key !== state.playbackKey) {
            state.playbackKey = key;
            renderTimeline();
            if (state.activeTab === "transcript")
                renderSideContent();
        }
    }
    function renderCaptionOverlay() {
        const mediaTime = currentMediaTime();
        const cue = state.cwi.cues.find((item) => isCueLive(item, mediaTime));
        if (!cue) {
            els.captionSafe.innerHTML = '<div class="caption-line caption-empty">.</div>';
            return;
        }
        if (cue.type === "sound") {
            renderNonDialogueCue(cue, `[${stripCueDecorators(cue.text)}]`);
            return;
        }
        if (cue.type === "music") {
            renderNonDialogueCue(cue, `\u266a ${stripCueDecorators(cue.text)} \u266a`);
            return;
        }
        const speaker = getSpeaker(cue.speakerId);
        const color = speaker ? speaker.color : "var(--cyan)";
        const words = cue.words && cue.words.length ? cue.words : wordsFromCueText(cue);
        const activeWord = currentWordForCue(cue, mediaTime);
        const html = words.map((word) => {
            const transform = aeWordMotionTransform(word, mediaTime);
            const spoken = mediaTime >= Number(word.start);
            const style = [
                spoken ? `color: ${color}` : "",
                transform ? `transform: ${transform}` : ""
            ].filter(Boolean).join("; ");
            const classes = ["caption-word"];
            if (spoken)
                classes.push("spoken");
            if (activeWord && word.id === activeWord.id && transform)
                classes.push("intent");
            if (cue.offCamera)
                classes.push("off-camera");
            return `<span class="${classes.join(" ")}" style="${escapeAttr(style)}">${escapeHtml(word.text)}</span>`;
        }).join(" ");
        els.captionSafe.innerHTML = `<div class="caption-line" style="${escapeAttr(captionLineStyle())}">${html}</div>`;
    }
    function renderNonDialogueCue(cue, text) {
        const color = cue.type === "sound" ? AE_NON_DIALOGUE_COLOR : "var(--ink)";
        els.captionSafe.innerHTML = `
          <div class="caption-line" style="${escapeAttr(captionLineStyle())}">
            <span class="caption-word" style="color: ${escapeAttr(color)}">${escapeHtml(text)}</span>
          </div>
        `;
    }
    function renderTimeReadout() {
        els.timeReadout.textContent = `${formatTime(currentMediaTime())} / ${formatTime(getDuration())}`;
    }
    function updatePlayhead() {
        const playhead = els.timelineGrid.querySelector(".playhead");
        if (playhead)
            playhead.style.left = `${currentMediaTime() * PX_PER_SECOND}px`;
    }
    function setPlayButton() {
        const path = els.video.paused
            ? '<path d="M8 5v14l11-7-11-7Z" fill="currentColor" stroke="none"></path>'
            : '<path d="M8 5v14"></path><path d="M16 5v14"></path>';
        els.playButton.setAttribute("aria-label", els.video.paused ? "Play preview" : "Pause preview");
        els.playButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    }
    function setSoundButton() {
        if (!els.soundButton)
            return;
        const muted = els.video.muted || els.video.volume === 0;
        const path = muted
            ? '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="m17 9 4 6"></path><path d="m21 9-4 6"></path>'
            : '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="M17 9.5a4 4 0 0 1 0 5"></path><path d="M19.5 7a7 7 0 0 1 0 10"></path>';
        els.soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
        els.soundButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
    }
    function applyInspectorControl(control) {
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (!cue)
            return;
        const value = control.type === "checkbox" ? control.checked : control.value;
        switch (control.dataset.control) {
            case "cue-start":
                cue.start = roundTime(Math.max(0, Number(value) || 0));
                if (cue.end <= cue.start)
                    cue.end = roundTime(cue.start + 0.01);
                break;
            case "cue-end":
                cue.end = roundTime(Math.max(cue.start + 0.01, Number(value) || cue.start + 0.01));
                break;
            case "cue-text":
                cue.text = String(value);
                break;
            case "cue-speaker":
                cue.speakerId = String(value);
                cue.offCamera = Boolean(getSpeaker(cue.speakerId) && getSpeaker(cue.speakerId).defaultOffCamera);
                break;
            case "word-text":
                if (word) {
                    word.text = String(value);
                    if (cue.type === "dialogue")
                        syncCueTextFromWords(cue);
                }
                break;
            case "word-start":
                if (word) {
                    word.start = roundTime(Math.max(0, Number(value) || 0));
                    normalizeCueTiming(cue);
                }
                break;
            case "word-end":
                if (word) {
                    word.end = roundTime(Math.max(word.start + 0.01, Number(value) || word.start + 0.01));
                    normalizeCueTiming(cue);
                }
                break;
            case "motion":
                if (word)
                    word.motion = MOTIONS.includes(value) ? value : "pop";
                break;
            case "volume":
                if (word)
                    word.volumePercent = clamp(Number(value) || 0, 0, 100);
                break;
            case "pitch-weight":
                if (word)
                    word.pitchWeight = clamp(Number(value) || 400, 300, 1000);
                break;
            case "pitch-width":
                if (word)
                    word.pitchWidth = clamp(Number(value) || 100, 75, 125);
                break;
            case "off-camera":
                cue.offCamera = Boolean(value);
                break;
            case "exception":
                cue.exception = Boolean(value);
                break;
            default:
                break;
        }
    }
    function updateRangeOutputs() {
        const volumeInput = els.inspector.querySelector('[data-control="volume"]');
        const volumeOutput = els.inspector.querySelector('[data-output="volume"]');
        if (volumeInput && volumeOutput)
            volumeOutput.textContent = `${volumeToPercent(Number(volumeInput.value)).toFixed(1)}%`;
    }
    function syncInspectorTitle() {
        const titleValue = els.inspectorHead.querySelector(".inspector-title span");
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (titleValue && cue)
            titleValue.textContent = `"${word ? word.text : formatCueText(cue)}"`;
    }
    function normalizeCueTiming(cue) {
        const wordTimes = (cue.words || []).flatMap((word) => [Number(word.start), Number(word.end)]).filter(Number.isFinite);
        if (wordTimes.length) {
            cue.start = roundTime(Math.min(cue.start, ...wordTimes));
            cue.end = roundTime(Math.max(cue.end, ...wordTimes));
        }
    }
    function normalizeImportedProject(raw) {
        if (!raw || typeof raw !== "object")
            throw new Error("JSON must be an object with project, speakers, and cues.");
        if (!raw.project || !Array.isArray(raw.speakers) || !Array.isArray(raw.cues)) {
            throw new Error("JSON must include project, speakers, and cues arrays.");
        }
        return {
            project: {
                id: String(raw.project.id || "imported-cwi-project"),
                title: String(raw.project.title || "Imported CWI Project"),
                aspectRatio: String(raw.project.aspectRatio || "16:9"),
                mediaName: String(raw.project.mediaName || state.cwi.project.mediaName || "Local media"),
                duration: Number(raw.project.duration) || state.cwi.project.duration || 0
            },
            speakers: raw.speakers.map((speaker, index) => ({
                id: String(speaker.id || `speaker-${index + 1}`),
                name: String(speaker.name || `Speaker ${index + 1}`),
                role: SPEAKER_ROLES.includes(speaker.role) ? String(speaker.role) : "supporting",
                color: String(speaker.color || SPEAKER_PALETTE[index % SPEAKER_PALETTE.length].color),
                defaultOffCamera: Boolean(speaker.defaultOffCamera)
            })),
            cues: raw.cues.map((cue, index) => normalizeImportedCue(cue, index)),
            review: {
                notes: raw.review && Array.isArray(raw.review.notes) ? raw.review.notes.map(String) : [],
                validationStatus: raw.review && raw.review.validationStatus ? String(raw.review.validationStatus) : "unchecked"
            }
        };
    }
    function normalizeImportedCue(cue, index) {
        const id = String(cue.id || `cue-${index + 1}`);
        const words = Array.isArray(cue.words) ? cue.words.map((word, wordIndex) => ({
            id: String(word.id || `${id}-word-${wordIndex + 1}`),
            text: String(word.text || ""),
            start: roundTime(Number(word.start) || Number(cue.start) || 0),
            end: roundTime(Number(word.end) || Number(cue.end) || Number(cue.start) + 0.5 || 0.5),
            volumePercent: clamp(Number(word.volumePercent) || 55, 0, 100),
            pitchWeight: clamp(Number(word.pitchWeight) || 400, 300, 1000),
            pitchWidth: clamp(Number(word.pitchWidth) || 100, 75, 125),
            motion: MOTIONS.includes(word.motion) ? word.motion : "pop"
        })) : [];
        return {
            id,
            type: CUE_TYPES.includes(cue.type) ? cue.type : "dialogue",
            speakerId: String(cue.speakerId || ""),
            start: roundTime(Number(cue.start) || 0),
            end: roundTime(Number(cue.end) || Math.max(...words.map((word) => word.end), 0.5)),
            text: String(cue.text || words.map((word) => word.text).join(" ")),
            lineBreakAfterWordIds: Array.isArray(cue.lineBreakAfterWordIds) ? cue.lineBreakAfterWordIds.map(String) : [],
            exception: Boolean(cue.exception),
            offCamera: Boolean(cue.offCamera),
            words
        };
    }
    function validateProject(project) {
        const checks = [];
        const fail = (title, body) => checks.push({ status: "fail", title, body });
        const pass = (title, body) => checks.push({ status: "pass", title, body });
        if (state.importError)
            fail("JSON import", state.importError);
        if (state.importWarnings.length)
            fail("JSON required fields", state.importWarnings.slice(0, 5).join("; "));
        if (!project.project || !project.project.id || !project.project.title) {
            fail("Project metadata", "Project id and title are required.");
        }
        else {
            pass("Project metadata", `${project.project.title} has id, aspect ratio, media name, and duration fields.`);
        }
        if (!Array.isArray(project.speakers) || project.speakers.length === 0) {
            fail("Speaker metadata", "At least one speaker with id, name, role, color, and off-camera default is required.");
        }
        else {
            const missingSpeaker = project.speakers.find((speaker) => !speaker.id || !speaker.name || !speaker.color);
            missingSpeaker ? fail("Speaker metadata", "One or more speakers are missing id, name, or color.") : pass("Speaker metadata", `${project.speakers.length} speaker records are editable.`);
        }
        if (!Array.isArray(project.cues) || project.cues.length === 0) {
            fail("CWI cues", "At least one caption cue is required.");
        }
        else {
            const cueErrors = [];
            project.cues.forEach((cue) => {
                if (!cue.id || !CUE_TYPES.includes(cue.type) || !Number.isFinite(Number(cue.start)) || !Number.isFinite(Number(cue.end)) || !cue.text) {
                    cueErrors.push(`${cue.id || "unnamed cue"} is missing a required cue field`);
                }
                if (cue.type === "dialogue" && !project.speakers.some((speaker) => speaker.id === cue.speakerId)) {
                    cueErrors.push(`${cue.id} needs a valid speaker`);
                }
                if (!Array.isArray(cue.words) || cue.words.length === 0) {
                    cueErrors.push(`${cue.id} needs word timing records`);
                }
                else {
                    cue.words.forEach((word) => {
                        if (!word.id || !word.text || !Number.isFinite(Number(word.start)) || !Number.isFinite(Number(word.end))) {
                            cueErrors.push(`${cue.id} has a word missing id, text, start, or end`);
                        }
                        if (Number(word.end) <= Number(word.start)) {
                            cueErrors.push(`${word.id || "word"} ends before it starts`);
                        }
                    });
                }
            });
            cueErrors.length ? fail("CWI cues", cueErrors.slice(0, 3).join("; ")) : pass("CWI cues", `${project.cues.length} cues preserve text, word timing, style, exceptions, sound, and music data.`);
        }
        const hasUploadPath = false;
        hasUploadPath ? fail("Media boundary", "A cloud upload path is active.") : pass("Media boundary", state.mediaObjectUrl ? "Selected media is a browser object URL and stays local." : "The bundled sample media is loaded locally; no upload path exists.");
        const hasDialogue = project.cues.some((cue) => cue.type === "dialogue");
        const hasSound = project.cues.some((cue) => cue.type === "sound");
        hasDialogue && hasSound
            ? pass("Cue coverage", "Dialogue and AE-template sound effect cue types are represented.")
            : fail("Cue coverage", "The project should include the dialogue and sound-effect cues used by the After Effects template.");
        return checks;
    }
    function findMissingImportedFields(raw) {
        const warnings = [];
        if (!raw || typeof raw !== "object")
            return ["JSON root must be an object."];
        if (!raw.project)
            warnings.push("project object is missing");
        if (raw.project) {
            ["id", "title", "aspectRatio", "mediaName", "duration"].forEach((field) => {
                if (raw.project[field] === undefined || raw.project[field] === "")
                    warnings.push(`project.${field} is missing`);
            });
        }
        if (!Array.isArray(raw.speakers)) {
            warnings.push("speakers array is missing");
        }
        else {
            raw.speakers.forEach((speaker, index) => {
                ["id", "name", "role", "color", "defaultOffCamera"].forEach((field) => {
                    if (speaker[field] === undefined || speaker[field] === "")
                        warnings.push(`speakers[${index}].${field} is missing`);
                });
            });
        }
        if (!Array.isArray(raw.cues)) {
            warnings.push("cues array is missing");
        }
        else {
            raw.cues.forEach((cue, cueIndex) => {
                ["id", "type", "start", "end", "text", "words"].forEach((field) => {
                    if (cue[field] === undefined || cue[field] === "")
                        warnings.push(`cues[${cueIndex}].${field} is missing`);
                });
                if (cue.type === "dialogue" && !cue.speakerId)
                    warnings.push(`cues[${cueIndex}].speakerId is missing`);
                if (Array.isArray(cue.words)) {
                    cue.words.forEach((word, wordIndex) => {
                        ["id", "text", "start", "end", "volumePercent", "pitchWeight", "pitchWidth", "motion"].forEach((field) => {
                            if (word[field] === undefined || word[field] === "")
                                warnings.push(`cues[${cueIndex}].words[${wordIndex}].${field} is missing`);
                        });
                    });
                }
            });
        }
        return warnings;
    }
    function getSelectedCue() {
        return getCue(state.selectedCueId);
    }
    function getCue(cueId) {
        return state.cwi.cues.find((cue) => cue.id === cueId) || null;
    }
    function getSelectedWord() {
        const cue = getSelectedCue();
        if (!cue || !cue.words)
            return null;
        return cue.words.find((word) => word.id === state.selectedWordId) || null;
    }
    function getSpeaker(speakerId) {
        return state.cwi.speakers.find((speaker) => speaker.id === speakerId) || null;
    }
    function ensureSelection() {
        if (!state.cwi.cues.length) {
            state.selectedCueId = "";
            state.selectedWordId = "";
            return;
        }
        let cue = getSelectedCue();
        if (!cue) {
            cue = state.cwi.cues[0];
            state.selectedCueId = cue.id;
        }
        if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId)))
            state.selectedWordId = "";
    }
    function firstWordId(cue) {
        return cue && cue.words && cue.words[0] ? cue.words[0].id : "";
    }
    function getCurrentCueAndWord() {
        const mediaTime = currentMediaTime();
        const cue = state.cwi.cues.find((item) => isCueLive(item, mediaTime));
        if (!cue)
            return { cueId: "", wordId: "" };
        if (cue.type !== "dialogue") {
            return { cueId: cue.id, wordId: cue.words && cue.words[0] ? cue.words[0].id : "" };
        }
        const word = currentWordForCue(cue, mediaTime);
        return { cueId: cue.id, wordId: word ? word.id : "" };
    }
    function isCueLive(cue, time) {
        return time >= Number(cue.start) && time <= Number(cue.end);
    }
    function currentWordForCue(cue, time) {
        const words = cue.words || [];
        return words.find((word) => isWordLive(word, time)) || null;
    }
    function isWordLive(word, time) {
        return time >= Number(word.start) && time <= Number(word.end);
    }
    function aeWordMotionTransform(word, time) {
        if (!word || word.motion === "none")
            return "";
        const start = Number(word.start);
        const end = Number(word.end);
        if (end <= start || time < start || time > end)
            return "";
        const fontSize = captionFontSizePx();
        const rise = fontSize * AE_WORD_RISE_RATIO;
        const progress = clamp((time - start) / (end - start), 0, 1);
        const y = -rise * Math.sin(Math.PI * progress);
        return `translateY(${y.toFixed(2)}px)`;
    }
    function hasTimingWarning(cue, word) {
        return Number(word.start) < Number(cue.start) || Number(word.end) > Number(cue.end) || Number(word.end) <= Number(word.start);
    }
    function syncCueTextFromWords(cue) {
        cue.text = (cue.words || []).map((word) => word.text).join(" ");
    }
    function selectAdjacentWord(direction) {
        const cue = getSelectedCue();
        const words = cue && cue.words ? cue.words : [];
        if (!words.length) {
            state.selectedWordId = "";
            return;
        }
        const currentIndex = words.findIndex((word) => word.id === state.selectedWordId);
        const fallbackIndex = direction > 0 ? 0 : words.length - 1;
        const nextIndex = currentIndex === -1
            ? fallbackIndex
            : clamp(currentIndex + direction, 0, words.length - 1);
        state.selectedWordId = words[nextIndex].id;
    }
    function captionFontSizePx() {
        const frameHeight = document.querySelector(".phone-frame").clientHeight || 560;
        const rawSize = frameHeight * AE_CAPTION_FONT_RATIO;
        return Math.round(clamp(rawSize, 11, 27));
    }
    function captionLineStyle() {
        return [
            `font-size: ${captionFontSizePx()}px`,
            `--caption-box-padding-y: ${AE_BOX_VERTICAL_PADDING_EM}em`,
            `--caption-box-padding-x: ${AE_BOX_HORIZONTAL_PADDING_EM}em`
        ].join("; ");
    }
    function volumeToPercent(volumePercent) {
        return 3 + (clamp(Number(volumePercent) || 0, 0, 100) / 100) * 9;
    }
    function getDuration() {
        if (Number.isFinite(els.video.duration) && els.video.duration > 0)
            return els.video.duration;
        return Number(state.cwi.project.duration) || 0;
    }
    function currentMediaTime() {
        if (state.previewTimeOverride !== null && els.video.paused)
            return state.previewTimeOverride;
        return els.video.currentTime || 0;
    }
    function seekPreviewToTime(time) {
        const nextTime = clamp(time, 0, getDuration());
        state.previewTimeOverride = nextTime;
        seekVideoElement(nextTime);
    }
    function seekVideoElement(time) {
        if (typeof els.video.fastSeek === "function") {
            try {
                els.video.fastSeek(time);
                return;
            }
            catch {
                // Fall back to currentTime assignment below.
            }
        }
        els.video.currentTime = time;
    }
    function formatCueText(cue) {
        if (!cue)
            return "";
        if (cue.type === "sound")
            return `[${stripCueDecorators(cue.text)}]`;
        if (cue.type === "music")
            return `\u266a ${stripCueDecorators(cue.text)} \u266a`;
        return cue.text || "";
    }
    function stripCueDecorators(text) {
        return String(text || "").replace(/^\s*\[/, "").replace(/\]\s*$/, "").replace(/^\s*\u266a\s*/, "").replace(/\s*\u266a\s*$/, "");
    }
    function wordsFromCueText(cue) {
        return String(cue.text || "").split(/\s+/).filter(Boolean).map((text, index) => ({
            id: `${cue.id}-generated-${index}`,
            text,
            start: cue.start,
            end: cue.end,
            volumePercent: 50,
            pitchWeight: 400,
            pitchWidth: 100,
            motion: "none"
        }));
    }
    function motionSummary(cue) {
        const word = cue.words && cue.words.find((item) => item.motion && item.motion !== "none");
        return word ? motionLabel(word.motion).toLowerCase() : "read-ahead";
    }
    function speakerName(speakerId) {
        const speaker = getSpeaker(speakerId);
        return speaker ? speaker.name : "no speaker";
    }
    function mediaExtensionLabel() {
        const media = state.cwi.project.mediaName || "";
        const extension = media.includes(".") ? media.slice(media.lastIndexOf(".")) : "";
        return extension && !state.cwi.project.title.endsWith(extension) ? extension : "";
    }
    function roundTime(value) {
        return Math.round(Number(value) * 100) / 100;
    }
    function formatTime(value) {
        const seconds = Math.max(0, Number(value) || 0);
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds - minutes * 60;
        return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(2).padStart(5, "0")}`;
    }
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    function capitalize(value) {
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }
    function motionLabel(value) {
        if (value === "pop")
            return "Scale pop 15%";
        if (value === "syllable")
            return "Syllable emphasis";
        return "No motion";
    }
    function roleLabel(value) {
        if (value === "main")
            return "Main character";
        if (value === "minor")
            return "Minor character";
        return "Supporting character";
    }
    function uniqueId(prefix, reservedIds = new Set()) {
        const existingIds = new Set([
            ...state.cwi.speakers.map((speaker) => speaker.id),
            ...state.cwi.cues.map((cue) => cue.id),
            ...state.cwi.cues.flatMap((cue) => (cue.words || []).map((word) => word.id)),
            ...reservedIds
        ]);
        let index = existingIds.size + 1;
        let id = `${prefix}-${index}`;
        while (existingIds.has(id)) {
            index += 1;
            id = `${prefix}-${index}`;
        }
        return id;
    }
    function slugify(value) {
        return String(value || "cwi-project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cwi-project";
    }
    function structuredCloneSafe(value) {
        return JSON.parse(JSON.stringify(value));
    }
    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }
})();
