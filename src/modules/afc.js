"use strict";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import { fischerYatesShuffle } from "./random";
import { arraysEqual } from "./helper-functions";

// trial list is an array with trial arrays, think about different approach
// correctList is an array with the alternatives to store the correct answer
export class AfcTask {
  constructor(
    jsPsych,
    assetPath,
    fileFormat,
    recognitionTrialList,
    recognitionTrialCorrectList,
    completionTrialList,
    completionTrialCorrectList,
    shuffleTrials,
    shuffleAlternatives,
    timeBetweenAlternatives,
    instructions,
    recognitionInstructions,
    completionInstructions
  ) {
    this.jsPsych = jsPsych;
    this.assetPath = assetPath;
    this.fileFormat = fileFormat;
    this.recognitionTrialList = recognitionTrialList;
    this.recognitionTrialCorrectList = this.createCorrectList(
      recognitionTrialCorrectList,
      this.recognitionTrialList.length
    );
    this.completionTrialList = completionTrialList;
    this.completionTrialCorrectList = this.createCorrectList(
      completionTrialCorrectList,
      this.completionTrialList.length
    );
    this.shuffleTrials = shuffleTrials;
    this.shuffleAlternatives = shuffleAlternatives;
    this.timeBetweenAlternatives = timeBetweenAlternatives;
    this.trialCounter = 1;
    this.timeline = this.createTask();
  }
  createTask() {
    const numberOfRecognitionTrials = this.recognitionTrialList.length;
    const numberOfCompletionTrials = this.completionTrialList.length;
    let trialList = [];
    let _recognitionTrialList = [];
    let _completionTrialList = [];

    // Add the recognition trials, shuffle if necessary
    for (let trial = 0; trial < numberOfRecognitionTrials; trial++) {
      const currentTrial = this.createRecognitionTrial(
        this.recognitionTrialList[trial],
        this.recognitionTrialCorrectList[trial]
      );

      _recognitionTrialList.push(currentTrial);
      this.trialCounter += _recognitionTrialList.length;
    }

    // Shuffle if necessary and push to trial list
    if (this.shuffleTrials) {
      fischerYatesShuffle(_recognitionTrialList);
    }

    // Assign a trial number to each trial after shuffling
    _recognitionTrialList.forEach((trial, index) => {
      trial.data = trial.data || {}; // Ensure the data object exists
      trial.data.trialNumber = index + 1; // Assign trial number
    });

    trialList.push(..._recognitionTrialList); // ... _> spread operator to push the individual items of the array

    // Add the completion trials, shuffle if necessary
    for (let trial = 0; trial < numberOfCompletionTrials; trial++) {
      const currentTrial = this.createCompletionTrial(
        this.completionTrialList[trial][0],
        this.completionTrialList[trial][1],
        this.completionTrialCorrectList[trial]
      );

      _completionTrialList.push(currentTrial);
    }

    // Shuffle if necessary and push to trial list
    if (this.shuffleTrials) {
      fischerYatesShuffle(_completionTrialList);
    }

    // Assign a trial number to each trial after shuffling
    _completionTrialList.forEach((trial, index) => {
      trial.data = trial.data || {}; // Ensure the data object exists
      trial.data.trialNumber = index + this.trialCounter; // Assign trial number
    });

    trialList.push(..._completionTrialList); // ... _> spread operator to push the individual items of the array

    this.trialCounter += _completionTrialList.length;

    // create a jspsych object with trial list as timeline
    const afcTask = {
      type: AudioKeyboardResponsePlugin,
      timeline: trialList,
    };

    return afcTask;
  }

  createRecognitionTrial(alternatives, correctPosition) {
    const numberOfAlternatives = alternatives.length;
    let correctAlternative = alternatives[correctPosition - 1]; // The actual correct alternative
    let delay = { type: HtmlKeyboardResponsePlugin, stimulus: "", trial_duration: this.timeBetweenAlternatives };
    let totalRT = 0;
    const afcTaskInstance = this; // create an instance of this, to use inside jspsych plugins (scope problem)

    // shuffle the trial order while storing the correct response
    if (this.shuffleAlternatives) {
      fischerYatesShuffle(alternatives);
      for (let alternative = 0; alternative < numberOfAlternatives; alternative++) {
        if (arraysEqual(alternatives[alternative], correctAlternative)) {
          correctPosition = alternative + 1;
        }
      }
    }

    let responseChoices = this.getResponseChoices(numberOfAlternatives); // possible keys to respond with
    let correctResponse = this.getCorrectResponse(correctPosition); // The actual key value of the correct response
    let responseMessage = this.getResponseMessage(numberOfAlternatives, "patternRecognition"); // Depending on the number of alternatives, the prompt message will change

    // Load each stimulus separately, add them to an object that jspsych can read
    // add a silence between the alternatives
    let _stimulusList = [];
    for (let alternative = 0; alternative < numberOfAlternatives; alternative++) {
      const items = alternatives[alternative].flat();
      const numberOfItems = items.length;

      for (let item = 0; item < numberOfItems; item++) {
        _stimulusList.push({
          stimulus: this.assetPath + items[item] + this.fileFormat,
          prompt: String(alternative + 1),
        });
      }
      _stimulusList.push(delay);
    }

    //jspsych object
    const stimulusList = {
      type: AudioKeyboardResponsePlugin,
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
      timeline: _stimulusList,
    };

    // Create the response form (jspsych object)
    const responseScreen = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: responseMessage,
      choices: responseChoices,
      data: {
        task: "AFC",
        taskType: "pattern recognition",
        numberOfAlternatives: numberOfAlternatives,
        trialCompleted: false,
        repeat: false,
      },
      on_finish: function (data) {
        if (data.response === "r") {
          data.repeat = true; // repeat the entire trial (repeat is called in the trial container)
        } else {
          data.repeat = false;
          // Store whether the response is correct
          if (correctResponse.includes(data.response)) {
            data.correct = true;
          } else {
            data.correct = false;
          }

          data.responsePosition = afcTaskInstance.getResponsePosition(data.response);
          data.correctPosition = correctPosition;
          data.chosenAlternative = alternatives[data.responsePosition - 1].join("");
          data.correctAlternative = correctAlternative.join("");
          data.alternatives = alternatives.map((innerArray) => innerArray.join(""));
          data.alternatives.forEach((alternative, index) => {
            const alternativeName = `alternative${index + 1}`;
            data[alternativeName] = alternative;
          });
          data.trialCompleted = true;
          data.results = true; // marker that this trial contains relevant data
        }
      },
    };

    const trial = {
      type: AudioKeyboardResponsePlugin,
      timeline: [stimulusList, responseScreen],
      loop_function: function (data) {
        let rt = afcTaskInstance.jsPsych.data.getLastTrialData().select("rt").values[0];
        totalRT += rt;
        afcTaskInstance.jsPsych.data.getLastTrialData().addToAll({ trialRT: totalRT });
        // get the repeat value from the last trial to see whether the entire trial has to repeat
        let repeat = afcTaskInstance.jsPsych.data.getLastTrialData().select("repeat").values[0];
        if (repeat) {
          return true;
        } else {
          return false;
        }
      },
      onfinish: function () {
        afcTaskInstance.jsPsych.data.getLastTrialData().addToAll({ trialRT: totalRT });
      },
    };

    return trial;
  }

  createCompletionTrial(completionPattern, alternatives, correctPosition) {
    let numberOfAlternatives = alternatives.length; // How many alternatives there are
    let patternLength = completionPattern.length; // how long is the completionPattern to be completed
    let correctAlternative = alternatives[correctPosition - 1];
    let delay = { type: HtmlKeyboardResponsePlugin, stimulus: "", trial_duration: this.timeBetweenAlternatives };
    let totalRT = 0;
    const afcTaskInstance = this; // create an instance of this, to use inside jspsych plugins (scope problem)

    // shuffle and update the correct position
    if (this.shuffleAlternatives) {
      fischerYatesShuffle(alternatives);
      for (let alternative = 0; alternative < numberOfAlternatives; alternative++) {
        if (alternatives[alternative] === correctAlternative) {
          correctPosition = alternative + 1;
        }
      }
    }

    let responseChoices = this.getResponseChoices(numberOfAlternatives); // possible keys to respond with
    let correctResponse = this.getCorrectResponse(correctPosition); // The actual key value of the correct response
    let responseMessage = this.getResponseMessage(numberOfAlternatives, "patternCompletion"); // Depending on the number of alternatives, the prompt message will change

    // Load each stimulus separately, for the completionPattern and alternatives
    let _stimulusListPattern = []; // temporary array that stores the completion pattern trial
    let _stimulusListAlternatives = []; // temporary array that stores the alternatives of the trial

    for (let stim = 0; stim < patternLength; stim++) {
      _stimulusListPattern.push({ stimulus: this.assetPath + completionPattern[stim] + this.fileFormat, prompt: "X" });
    }
    for (let stim = 0; stim < numberOfAlternatives; stim++) {
      _stimulusListAlternatives.push({
        stimulus: this.assetPath + alternatives[stim] + this.fileFormat,
        prompt: String(stim + 1),
      });
      _stimulusListAlternatives.push(delay); // add a delay between alternatives
    }

    // Create the jspsych object
    const completionPatternStimuli = {
      type: AudioKeyboardResponsePlugin,
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
      timeline: _stimulusListPattern,
    };

    const alternativesAnnouncement = {
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      prompt: "Hierna volgen de antwoordmogelijkheden, duw op de spatiebalk om verder te gaan.",
    };

    const alternativesStimuli = {
      type: AudioKeyboardResponsePlugin,
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
      timeline: _stimulusListAlternatives,
    };

    const responseScreen = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: responseMessage,
      choices: responseChoices,
      data: {
        task: "AFC",
        taskType: "pattern completion",
        numberOfAlternatives: numberOfAlternatives,
        trialCompleted: false,
        repeat: false, // set repeat to false at start, but this doesn't seem necessary (resetting the value that is)
      },
      // Store all the relevant data
      // if "r" is pressed, set repeat to true (will be called in the parent object)
      on_finish: function (data) {
        if (data.response === "r") {
          // repeat the entire trial (repeat is called in the trial container timeline)
          data.repeat = true;
        } else {
          data.repeat = false;
          // Store whether the response is correct
          if (correctResponse.includes(data.response)) {
            data.correct = true;
          } else {
            data.correct = false;
          }

          data.responsePosition = afcTaskInstance.getResponsePosition(data.response);
          data.correctPosition = correctPosition;
          data.chosenAlternative = alternatives[data.responsePosition - 1];
          data.correctAlternative = correctAlternative;
          data.completionPattern = completionPattern.join("");
          data.alternatives = alternatives;
          let alternativesArray = [...data.alternatives];
          alternativesArray.forEach((alternative, index) => {
            const alternativeName = `alternative${index + 1}`;
            data[alternativeName] = alternative;
          });

          data.trialCompleted = true;
          data.results = true; // marker that this trial contains relevant data
        }
      },
    };

    const trial = {
      type: AudioKeyboardResponsePlugin,
      timeline: [completionPatternStimuli, alternativesAnnouncement, alternativesStimuli, responseScreen],
      loop_function: function (data) {
        let rt = afcTaskInstance.jsPsych.data.getLastTrialData().select("rt").values[0];
        totalRT += rt;
        afcTaskInstance.jsPsych.data.getLastTrialData().addToAll({ trialRT: totalRT });

        // get the repeat value from the last trial to see whether the entire trial has to repeat
        let repeat = afcTaskInstance.jsPsych.data.getLastTrialData().select("repeat").values[0];
        if (repeat) {
          return true;
        } else {
          return false;
        }
      },
      on_finish: function (data) {
        afcTaskInstance.jsPsych.data.getLastTrialData().addToAll({ trialRT: totalRT });
      },
    };

    return trial;
  }
  getResponseMessage(numberOfAlternatives, trialType) {
    if (trialType === "patternRecognition") {
      const alternativesMapping = {
        2: "Duw op 1 of 2 om desbetreffend antwoord te kiezen. Duw op 'r' om te herbeluisteren.",
        3: "Duw op 1, 2 of 3 om desbetreffend antwoord te kiezen. Duw op 'r' om te herbeluisteren.",
        4: "Duw op 1, 2, 3 of 4 om desbetreffende antwoord te kiezen. Duw op 'r' om te herbeluisteren.",
      };

      if (numberOfAlternatives in alternativesMapping) {
        return alternativesMapping[numberOfAlternatives];
      } else {
        throw new Error(`Invalid number of alternatives, can be 2, 3 or 4, but is ${numberOfAlternatives}`);
      }
    } else if (trialType === "patternCompletion") {
      const alternativesMapping = {
        2: "Duw op 1 of 2 om het geluid te kiezen dat best past in het patroon. Duw op 'r' om te herbeluisteren.",
        3: "Duw op 1, 2 of 3 om het geluid te kiezen dat best past in het patroon. Duw op 'r' om te herbeluisteren.",
        4: "Duw op 1, 2, 3 of 4 om het geluid te kiezen dat best past in het patroon. Duw op 'r' om te herbeluisteren.",
      };
      if (numberOfAlternatives in alternativesMapping) {
        return alternativesMapping[numberOfAlternatives];
      } else {
        throw new Error(`Invalid number of alternatives, can be 2, 3 or 4, but is ${numberOfAlternatives}`);
      }
    }
  }
  getResponseChoices(numberOfAlternatives) {
    const alternativeMapping = {
      2: ["&", "é", "r", "1", "2"],
      3: ["&", "é", '"', "r", "1", "2", "3"],
      4: ["&", "é", '"', "'", "r", "1", "2", "3", "4"],
    };

    if (numberOfAlternatives in alternativeMapping) {
      return alternativeMapping[numberOfAlternatives];
    } else {
      throw new Error(`Invalid number of alternatives, can be 2, 3 or 4, but is ${numberOfAlternatives}`);
    }
  }
  /**
   * Returns the correct response for a given correct position.
   * @param {number} correctPosition - The correct position of the response.
   * @returns {string[]} The correct response for the given position.
   */
  getCorrectResponse(correctPosition) {
    const responseMapping = {
      1: ["&", "1"],
      2: ["é", "2"],
      3: ['"', "3"],
      4: ["'", "4"],
    };

    if (correctPosition in responseMapping) {
      return responseMapping[correctPosition];
    } else {
      throw new Error(`Correct position has incorrect value, should be 1, 2, 3 or 4, but is ${correctPosition}`);
    }
  }

  getResponsePosition(response) {
    const mapping = {
      "&": 1,
      1: 1,
      é: 2,
      2: 2,
      '"': 3,
      3: 3,
      "'": 4,
      4: 4,
    };

    if (response in mapping) {
      return mapping[response];
    } else {
      throw new Error("incorrect response");
    }
  }
  createCorrectList(correctList, numberOfTrials) {
    if (Array.isArray(correctList)) {
      return correctList;
    } else if (Number.isInteger(correctList)) {
      return Array(numberOfTrials).fill(correctList);
    } else {
      throw new Error("Incorrect type for correct list");
    }
  }
}
