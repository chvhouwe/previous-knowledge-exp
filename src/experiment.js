/**
 * @title Online studie
 * @description Online studie
 * @version 0.9
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
  afcInstructions,
  hpInstructions,
  welcomeInstructions,
  soundCheckInstructions,
} from "./modules/instruction.js";
import { demographics, headphoneQuestion } from "./modules/survey.js";
import { Stream } from "./modules/stream.js";
import { AfcTask } from "./modules/afc.js";

import { getBrowserInfo } from "./modules/helper-functions.js";

import {
  completionTrialListSet1,
  completionTrialListSet2,
  recognitionTrialListSet1,
  recognitionTrialListSet2,
} from "./modules/afc-trials.js";

import { createHugginsPitchTask } from "./modules/huggins-pitch";
import { createSoundCheck, createCatchSoundCheck } from "./modules/sound-check.js";
import { finishCondition, getCondition } from "./modules/counter-balance.js";
import { hugginsStimuli, patterns } from "./modules/experiment-info.js";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych({
    on_finish: function () {
      finishCondition(condition);
      // Retrieve all data
      let allData = jsPsych.data.get();

      // Apply any filtering or processing here
      // For example, filtering to include only certain trial types
      let filteredData = allData.filter({ results: true });

      // Convert the filtered/processed data to JSON
      let jsonData = filteredData.json();

      // Send the processed data to JATOS
      jatos.endStudy(jsonData);
    },
  });

  // Get user info, add to data file
  const browserInfo = getBrowserInfo();
  const sonaId = jatos.urlQueryParameters.SONA_ID;

  // Get the condition from batch file (jatos)
  const condition = getCondition();

  // which set is used today for testing
  const setNumber = condition === "a" ? 1 : 2;

  jsPsych.data.addProperties({
    sonaId: sonaId,
    browser: browserInfo.browser,
    browserVersion: browserInfo.version,
    condition: condition,
    setNumber: setNumber,
  });

  // Stimulus data
  const assetPath = "assets/";
  const fileFormat = ".wav";

  // Create the experiment timeline - the "macro timeline" which contains all individual parts
  const timeline = [];

  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });

  /*
   ****************** SOUND CHECKS *******************
   */
  const hugginsTimeline = createHugginsPitchTask(jsPsych, assetPath, fileFormat, hugginsStimuli);
  const soundCheck = createSoundCheck(jsPsych, assetPath, fileFormat, "Ke");
  const catchSoundCheck = createCatchSoundCheck(jsPsych, assetPath, fileFormat, "Xu");
  /*
   ****************** EXPOSURE *******************
   */

  const streamInfo = {
    assetPath: assetPath,
    fileFormat: fileFormat,
    patterns: patterns,
    numberOfRepetitions: 72,
    chunkSize: 4,
    modality: "auditory",
  };
  // Create the stream with streamInfo (include instance of jspsych so the stream class can use jspsych functions)
  const stream = new Stream(jsPsych, streamInfo);

  // push all the tasks and trials to the experiment timeline
  timeline.push(
    welcomeInstructions,
    demographics,
    soundCheckInstructions,
    soundCheck,
    setFullscreen,
    hpInstructions,
    hugginsTimeline,
    streamInstructions,
    catchSoundCheck,
    stream.timeline,
    headphoneQuestion,
    goodbyeTrial
  );
  await jsPsych.run(timeline);
}
