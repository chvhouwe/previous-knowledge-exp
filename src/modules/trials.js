"use strict";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";

const assetPath = "assets/";

export const welcomeTrial = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Welcome to the best experiment ever!",
};

export const goodbyeTrial = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Goodbye!",
};

export const setFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: true,
};

export const streamTimeline = {
  type: AudioKeyboardResponsePlugin,
  prompt: "X",
  choices: "NO_KEYS",
  trial_ends_after_audio: true,
  timeline: [],
};
