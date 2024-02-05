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
import {
  goodbyeTrial,
  setFullscreen,
  streamInstructions,
  sicrInstructions,
  afcInstructions,
  hpInstructions,
} from "./modules/instruction.js";
import { Stream } from "./modules/stream.js";
import { AfcTask } from "./modules/afc.js";
import { SicrTask } from "./modules/sicr.js";
import { selectTriplets } from "./modules/retest.js";

import { getBrowserInfo } from "./modules/helper-functions.js";
import { generateCombinations } from "./modules/helper-functions.js";
import { catchTrialResponseList, numberOfCatchTrials } from "./modules/catch-trial-manager.js";
import { recognitionTrialList, completionTrialList } from "./modules/afc-trials.js";
import { ChunkTrialList, foilTrialList } from "./modules/sicr-trials.js";
import { createHugginsPitchTask } from "./modules/huggins-pitch";

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
  const browserInfo = getBrowserInfo();
  const sonaID = parseInt(jsPsych.data.getURLVariable("SONA_ID"));
  jsPsych.data.addProperties({ sonaId: sonaID, browser: browserInfo.browser, browserVersion: browserInfo.version });
  console.log(sonaID);
  console.log(browserInfo.browser);

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
   ****************** HUGGINS PITCH HEADPHONE TEST *******************
   */
  let hugginsTimeline = createHugginsPitchTask(jsPsych, assetPath, fileFormat, [
    "HP_1_1",
    "HP_1_2",
    "HP_1_3",
    "HP_2_1",
    "HP_2_2",
    "HP_2_3",
  ]);
  console.log(hugginsTimeline);

  /*
   ****************** EXPOSURE *******************
   */
  // Patterns that are used for exposure

  const patterns = [
    ["Ho", "Di", "Ve"],
    ["Di", "Ho", "Mu"],
    ["Mu", "Ve", "Ho"],
    ["Ve", "Mu", "Di"],
    ["Ba", "Lu", "Gi"],
    ["Ze", "Ta", "Pu"],
    ["So", "Ne", "Ja"],
    ["Wi", "Ke", "Fo"],
  ];

  // Create the stream with patternlist and how many times they must be repeated
  const stream = new Stream(jsPsych, patterns, 75);
  stream.shuffle(1); // the interval in which shuffles should occur (i.e., should each pattern occur before the same one can occur again)
  stream.insertCatchTrials();
  stream.createTimeline(assetPath, fileFormat);

  /*
   ************** AFC TASK ****************
   */

  const timeBetweenAlternatives = 1000; // within a trial (milliseconds)
  const recognitionTrialCorrectList = 1;

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

  const sicrFoilTrials = [
    ["Lu", "Gi", "Ba", "Ke", "Fo", "Wi"],
    ["Gi", "Wi", "Lu", "Fo", "Ke", "Ba"],
  ];

  const sicrTask = new SicrTask(jsPsych, assetPath, fileFormat, ChunkTrialList, foilTrialList, true);

  // push all the tasks and trials to the experiment timeline
  timeline.push(
    hpInstructions,
    hugginsTimeline,
    //streamInstructions,
    //stream.timeline,
    //sicrInstructions,
    //sicrTask.timeline,
    //afcInstructions,
    //afcTask.timeline,
    goodbyeTrial
  );
  console.log(afcTask.timeline);
  console.log(sicrTask.timeline);

  await jsPsych.run(timeline);

  // Return the jsPsych instance so jsPsych  Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
