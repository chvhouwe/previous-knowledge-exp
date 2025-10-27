"use strict";

import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import LikertPlugin from "@jspsych/plugin-survey-likert";
import { fischerYatesShuffle } from "./random";

/**
 * OldNewTask.js
 *
 * Old/New recognition test with confidence rating,
 * and, for the general block, an additional question about word origin.
 */
export class OldNewTask {
  constructor(jsPsych, assetPath, fileFormat, trialList, setName) {
    this.jsPsych = jsPsych;
    this.assetPath = assetPath;
    this.fileFormat = fileFormat;
    this.trialList = JSON.parse(JSON.stringify(trialList));
    this.setName = setName; // "Set1", "Set2" or "General"
    this.trialCounter = 1;
    this.timeline = this.createTask();
  }

  createTask() {
    const timeline = [];

    for (let i = 0; i < this.trialList.length; i++) {
      const trialObj = this.trialList[i];

      /**
       * play syllables in sequence
       */
      const syllableTrials = trialObj.stimulus.map((syllable, idx) => ({
        type: AudioKeyboardResponsePlugin,
        stimulus: `${this.assetPath}${syllable}${this.fileFormat}`,
        choices: "NO_KEYS",
        trial_ends_after_audio: false,
        response_ends_trial: true,
        data: {
          task: "syllable_playback",
          syllableIndex: idx + 1,
          id: trialObj.data?.id || null,
          setName: this.setName,
        },
      }));

      /**
       * old/new
       */
      const responseTrial = {
        type: HtmlKeyboardResponsePlugin,
        stimulus:
          "<p>Press 1 if you think this word was OLD, or 2 if it was NEW.</p>",
        choices: ["1", "2"],
        data: {
          setName: this.setName,
          correctResponse: trialObj.correct_response,
          id: trialObj.data?.id || null,
          task: "oldnew",
        },
        on_finish: (data) => {
          data.correct =
            data.response ===
            (trialObj.correct_response === "old" ? "1" : "2");
        },
      };

      /**
       * confidence
       */
      const confidenceTrial = {
        type: LikertPlugin,
        questions: [
          {
            prompt: "How confident are you in your response?",
            labels: ["0", "1", "2", "3", "4", "5", "6"],
            required: true,
          },
        ],
        data: {
          task: "confidence",
          setName: this.setName,
          id: trialObj.data?.id || null,
        },
        on_finish: (data) => {
          data.confidence = parseInt(data.response[0]);
        },
      };

      /**
       * extra question in. when “General”
       */
      if (this.setName === "General") {
        const languageTrial = {
          type: HtmlKeyboardResponsePlugin,
          stimulus:
            "<p>Press 1 if you think this word belonged to the first language you heard, or 2 if it belonged to the second language.</p>",
          choices: ["1", "2"],
          data: {
            task: "language",
            setName: this.setName,
            id: trialObj.data?.id || null,
            correctLanguage: trialObj.setOrigin === "Set1" ? "1" : "2",
          },
          on_finish: (data) => {
            data.correct = data.response === data.correctLanguage;
          },
        };
        timeline.push(...syllableTrials, responseTrial, confidenceTrial, languageTrial);
      } else {
        timeline.push(...syllableTrials, responseTrial, confidenceTrial);
      }
    }

    return timeline;
  }
}

/**
 * general block: combines Set1 + Set2
 */
export function createGeneralBlock(jsPsych, trialsSet1, trialsSet2, assetPath, fileFormat) {
  const trialsWithOrigin = [
    ...trialsSet1.map((t) => ({ ...t, setOrigin: "Set1" })),
    ...trialsSet2.map((t) => ({ ...t, setOrigin: "Set2" })),
  ];
  fischerYatesShuffle(trialsWithOrigin);

  const generalTask = new OldNewTask(
    jsPsych,
    assetPath,
    fileFormat,
    trialsWithOrigin,
    "General"
  );
  return generalTask.timeline;
}
