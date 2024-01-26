"use strict";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";
import { fischerYatesShuffle } from "./random";
import { damerauLevenshtein } from "./helper-functions";

export class SicrTask {
  constructor(jsPsych, assetPath, fileFormat, chunkTrialList, foilTrialList, shuffleTrials) {
    this.jsPsych = jsPsych;
    this.assetPath = assetPath;
    this.fileFormat = fileFormat;
    this.chunkTrialList = chunkTrialList;
    this.foilTrialList = foilTrialList;
    this.shuffleTrials = shuffleTrials;
    this.trialCounter = 1;
    this.timeline = this.createTask();
  }
  createTask() {
    let trialList = [];
    const numberOfChunkTrials = this.chunkTrialList.length;
    const numberOfFoilTrials = this.foilTrialList.length;
    const sicrTaskInstance = this;
    // Add chunk trials first
    for (let trial = 0; trial < numberOfChunkTrials; trial++) {
      let currentTrial = this.createSicrTrial(this.chunkTrialList[trial], "chunk", this.trialCounter);
      trialList.push(currentTrial);
      this.trialCounter++;
    }
    for (let trial = 0; trial < numberOfFoilTrials; trial++) {
      let currentTrial = this.createSicrTrial(this.foilTrialList[trial], "foil", this.trialCounter);
      trialList.push(currentTrial);
      this.trialCounter++;
    }

    if (this.shuffleTrials) {
      fischerYatesShuffle(trialList);
    }
    const sicrTask = {
      type: AudioKeyboardResponsePlugin,
      timeline: trialList,
    };

    return sicrTask;
  }
  createSicrTrial(sequence, trialType, trialNumber) {
    const sicrTaskInstance = this;
    const sequenceLength = sequence.length;
    let stimulusList = [];
    for (let stim = 0; stim < sequenceLength; stim++) {
      stimulusList.push({ stimulus: this.assetPath + sequence[stim] + this.fileFormat, prompt: "X" });
    }

    const stimuli = {
      type: AudioKeyboardResponsePlugin,
      timeline: stimulusList,
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
    };

    const responseScreen = {
      type: SurveyTextPlugin,
      questions: [
        {
          prompt: "Schrijf de reeks lettergrepen neer die je net gehoord hebt, geen spaties/speciale tekens!",
          placeholder: "xariquxariqu",
          required: true,
        },
      ],
      data: {
        trialType: trialType,
        sequence: sicrTaskInstance.preprocessString(sequence.join("")),
        task: "sicr",
        results: true, // marker that this trial contains relevant data
        trialNumber: trialNumber,
      },
      on_finish: function (data) {
        let response = data.response["Q0"];
        data.response = sicrTaskInstance.preprocessString(response);
        data.trialCompleted = true;
        data.distance = damerauLevenshtein(data.sequence, data.response);
      },
    };

    const trial = {
      type: AudioKeyboardResponsePlugin,
      timeline: [stimuli, responseScreen],
    };
    return trial;
  }
  preprocessString(str) {
    return str.toLowerCase().replace(/[^a-z]/gi, "");
  }
}
