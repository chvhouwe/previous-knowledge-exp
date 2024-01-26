/**
 * @title ConsolidationExperiment2
 * @description A follow-up study to see if there is a test-effect and whether the target detection during exposure affects how people learn.
 * @version 0.1.0
 *
 * @assets assets/
 */

"use strict";
// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";
import { goodbyeTrial, setFullscreen, welcomeTrial } from "./modules/trials.js";
import { Stream } from "./modules/stream.js";
import { AfcTask } from "./modules/afc.js";
import { SicrTask } from "./modules/sicr.js";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import { damerauLevenshtein } from "./modules/helper-functions.js";
import { generateCombinations } from "./modules/helper-functions.js";
import { createInstructions } from "./modules/instructions.js";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych({
    on_finish: function () {
      jsPsych.data.displayData("csv");
    },
  });

  // Stimulus data
  const assetPath = "assets/";
  const fileFormat = ".wav";

  // Create the experiment timeline - the "macro timeline"
  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  /*
   ****************** EXPOSURE *******************
   */
  // Patterns that are used for exposure
  const patterns = [
    ["Ba", "Lu", "Gi"],
    ["Ze", "Ta", "Pu"],
    ["Wi", "Ke", "Fo"],
    ["Ho", "Di", "Ve"],
  ];

  // Create the stream with patternlist and how many times they must be repeated
  const stream = new Stream(patterns, 1);
  stream.shuffle(1); // the interval in which shuffles should occur (i.e., should each pattern occur before the same one can occur again)

  // Convert the stream to an object jsPsych can use
  let streamTimeline = stream.convertToStimulusList(assetPath, fileFormat);

  /*
   ************** AFC TASK ****************
   */

  const timeBetweenAlternatives = 1000; // within a trial (milliseconds)
  // Recognition trials, the first item is the correct one (before shuffling)
  const recognitionTrialList = [
    [
      ["Ba", "Lu", "Gi"],
      ["Ba", "Ba", "Ba"],
    ],
    // [
    //   ["Ba", "Lu", "Gi"],
    //   ["Gi", "Gi", "Gi"],
    // ],
    // [
    //   ["Ba", "Lu", "Gi"],
    //   ["Ba", "Ba", "Ba"],
    //   ["Gi", "Lu", "Gi"],
    //   ["Ba", "Ba", "Ba"],
    // ],
    // [
    //   ["Ba", "Lu", "Gi"],
    //   ["Lu", "Lu", "Lu"],
    //   ["Ba", "Ba", "Ba"],
    //   ["Lu", "Lu", "Ba"],
    // ],
  ];

  const recognitionTrialCorrectList = 1;

  const completionTrialList = [
    [
      ["Ba", "Ni", "Gi"], // completion pattern
      ["Lu", "Wi", "Wi"], // alternatives
    ],
    [
      ["Ba", "Ni"],
      ["Lu", "Wi", "Wi"],
    ],
  ];

  const completionTrialCorrectList = 1;

  const afcTask = new AfcTask(
    jsPsych,
    assetPath,
    fileFormat,
    recognitionTrialList,
    recognitionTrialCorrectList,
    completionTrialList,
    completionTrialCorrectList,
    true,
    true,
    1000
  );

  /*
   ************ SICR TASK***************
   */
  const sicrChunkTrials = [
    ["Ba", "Lu", "Gi", "Wi", "Ke", "Fo"],
    ["Wi", "Ke", "Fo", "Ba", "Lu", "Gi"],
  ];

  const sicrFoilTrials = [
    ["Lu", "Gi", "Ba", "Ke", "Fo", "Wi"],
    ["Gi", "Wi", "Lu", "Fo", "Ke", "Ba"],
  ];

  const sicrTask = new SicrTask(jsPsych, assetPath, fileFormat, sicrChunkTrials, sicrFoilTrials, true);

  // push all the tasks and trials to the experiment timeline
  timeline.push(instruction, welcomeTrial, sicrTask.timeline, afcTask.timeline, goodbyeTrial);

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych  Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
