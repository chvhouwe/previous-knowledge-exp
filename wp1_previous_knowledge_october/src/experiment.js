/**
 * @title Online study
 * @description Online study
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
  oldnewInstructions,
  wordoriginsInstructions,
  hpInstructions,
  welcomeInstructions,
  soundCheckInstructions,
} from "./modules/instruction.js";

import { demographics, headphoneQuestion, behaviorscreeningquestion } from "./modules/survey.js";
import { Stream } from "./modules/stream.js";
import { OldNewTask, createGeneralBlock } from "./modules/oldNewtask.js";
import { oldNewTrialsSet1, oldNewTrialsSet2 } from "./modules/oldnewtrials.js";
import { getBrowserInfo } from "./modules/helper-functions.js";
import { createHugginsPitchTask } from "./modules/huggins-pitch";
import { createSoundCheck, createCatchSoundCheck } from "./modules/sound-check.js";
import { finishCondition, getCondition } from "./modules/counter-balance.js";
import { hugginsStimuli, allPatternSets } from "./modules/experiment-info.js";
import { fischerYatesShuffle } from "./modules/random";

/**
 * This function will be executed by jsPsych Builder and runs the experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych({
    on_finish: function () {
      finishCondition(condition);

      // Retrieve and filter data
      let allData = jsPsych.data.get();
      let filteredData = allData.filter({ results: true });
      let jsonData = filteredData.json();

      // Send data to JATOS
      jatos.endStudy(jsonData);
    },
  });

  // Get participant info and condition
  const browserInfo = getBrowserInfo();
  const sonaId = jatos.urlQueryParameters.SONA_ID;
  const condition = getCondition();

  // Determine order of sets per participant
  const setOrder = condition === "a" ? [1, 2] : [2, 1];

  // Save participant properties
  jsPsych.data.addProperties({
    sonaId: sonaId,
    browser: browserInfo.browser,
    browserVersion: browserInfo.version,
    condition: condition,
    setOrder: setOrder,
  });

  // Stimulus data
  const assetPath = "assets/";
  const fileFormat = ".wav";

  // Main timeline
  const timeline = [];

  // Old/New trials for each set
  const oldNewSet1 = oldNewTrialsSet1(jsPsych);
  const oldNewSet2 = oldNewTrialsSet2(jsPsych);

  // Preload all assets including individual syllables
  const allSyllables = allPatternSets.flat(2).map(
    syllable => `${assetPath}${syllable}${fileFormat}`
  );

  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: allSyllables,
    video: assetPaths.video,
  });

  /*
   ****************** SOUND CHECKS *******************
   */
  const hugginsTimeline = createHugginsPitchTask(jsPsych, assetPath, fileFormat, hugginsStimuli);
  const soundCheck = createSoundCheck(jsPsych, assetPath, fileFormat, "Ke");
  const catchSoundCheck = createCatchSoundCheck(jsPsych, assetPath, fileFormat, "Xu");

  // Add welcome and demographics
  timeline.push(
    welcomeInstructions,
    demographics,
    soundCheckInstructions,
    soundCheck,
    setFullscreen,
    hpInstructions,
    hugginsTimeline,
    streamInstructions,
    catchSoundCheck
  );

  /*
   ****************** EXPOSURE + OLD/NEW TESTS *******************
   */
  setOrder.forEach((setNumber) => {
    // Stream for current set
    const streamInfo = {
      assetPath: assetPath,
      fileFormat: fileFormat,
      patterns: allPatternSets[setNumber - 1],
      numberOfRepetitions: 24,
      chunkSize: 1,
      modality: "auditory",
    };
    const stream = new Stream(jsPsych, streamInfo);

    // Old/New trials for current set
    let trials = setNumber === 1 ? oldNewSet1 : oldNewSet2;

    // Shuffle old/new trials to mix them
    fischerYatesShuffle(trials);

    const oldNewBlock = new OldNewTask(jsPsych, assetPath, fileFormat, trials, `Set${setNumber}`).timeline;

  
    // Push stream and test for this set
    timeline.push(...stream.timeline);
    timeline.push(oldnewInstructions); // Instructions before each set test
    timeline.push(...oldNewBlock);     // Old/New trials + confidence ratings
  });

  /*
   ****************** GENERAL BLOCK *******************
   */
  const generalBlock = createGeneralBlock(jsPsych, oldNewSet1, oldNewSet2);
  timeline.push(wordoriginsInstructions);
  timeline.push(...generalBlock); // Confidence + language origin question after each trial

  /*
   ****************** FINAL SURVEYS & GOODBYE *******************
   */
  timeline.push(
    behaviorscreeningquestion,
    headphoneQuestion,
    goodbyeTrial
  );

  await jsPsych.run(timeline);
}
