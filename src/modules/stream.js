import { fischerYatesShuffle, getRandomInt } from "./random";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { startCatchTrial, CATCH_TRIAL_RESPONSE_LIST } from "./catch-trial-manager";
import ImageKeyboardResponsePlugin from "@jspsych/plugin-image-keyboard-response";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
export let STREAM_ACTIVE = false;
/**
 * @class Stream
 * @classdesc A class for creating a stream of stimuli for the Exposure task.
 * @param {Object} jsPsych - A reference to the jsPsych library.
 * @param {Object} streamInfo - Information about the stream, containing:
 *   @param {String} streamInfo.assetPath - The base path to the assets used in the stream.
 *   @param {String} streamInfo.fileFormat - The format of the files (e.g., '.wav', '.png').
 *   @param {Array} streamInfo.patterns - An array of patterns that make up the stream.
 *   @param {Number} streamInfo.numberOfRepetitions - How many times the patterns are repeated in the stream.
 *   @param {Number} streamInfo.modality - Visual or auditory
 */
export class Stream {
  constructor(jsPsych, streamInfo) {
    this.jsPsych = jsPsych;
    this.streamInfo = streamInfo;
    this.patternSize = streamInfo.patterns[0].length;
    this.patterns = this.createPatternObjects(streamInfo.patterns);
    this.numberOfRepetitions = streamInfo.numberOfRepetitions;
    this.numberOfPatterns = this.numberOfRepetitions * this.patterns.length;
    this.catchTrials = this.createCatchTrials();
    this.itemIndexList = this.createItemIndexList();
    this.patternList = [];
    this.itemList = [];
    this.timeline = null;
    this.createStream();
  }

  createStream() {
    // Create a stream, with several chunks (based on )
    this.chunkedPatternList = this.createChunkedPatternList();
    this.insertCatchTrials(this.chunkedPatternList);

    this.shuffle(this.chunkedPatternList);
    this.patternList = this.chunkedPatternList.flat();

    this.itemList = this.createItemList(this.patternList);

    this.createTimeline();
  }

  shuffle(chunkedPatternList) {
    let previousChunk = null;
    chunkedPatternList.forEach((chunk) => {
      let isValidShuffle = false;

      while (!isValidShuffle) {
        fischerYatesShuffle(chunk);

        if (!this.violatesRestrictions(chunk, previousChunk)) isValidShuffle = true;
      }

      // After processing the current chunk, set it as the previous chunk for the next iteration
      previousChunk = chunk;
    });
  }

  // a function that checks whether the stream breaks no restrictions based on some conditions
  violatesRestrictions(patternList, previousPatternList) {
    const numberOfPatterns = patternList.length;

    // Restriction 1, no pattern repetitions
    for (let pattern = 1; pattern < numberOfPatterns; pattern++) {
      // get the current and last pattern
      const currentPattern = patternList[pattern].patternIndex;
      const previousPattern = patternList[pattern - 1].patternIndex;

      // return true if rule is violated
      if (currentPattern === previousPattern) {
        return true;
      }
    }

    // Restriction 2, no item repetitions
    const itemList = this.createItemList(patternList);
    const numberOfItems = itemList.length;
    for (let item = 1; item < numberOfItems; item++) {
      const currentItem = itemList[item].itemIndex;
      const previousItem = itemList[item - 1].itemIndex;

      // return true if rule is violated
      if (currentItem === previousItem) {
        return true;
      }
    }

    // Restriction 1 and 2, but between chunks (when concatenating them in the end)

    // Only compare if there is a previous pattern list (i.e., it is not the first chunk)
    if (previousPatternList) {
      // Patterns
      const firstPatternOfCurrentChunk = patternList[0].patternIndex;
      const secondPatternOfCurrentChunk = patternList[1].patternIndex;
      const lastPatternOfPreviousChunk = previousPatternList[previousPatternList.length - 1].patternIndex;
      const secondLastPatternOfPreviousChunk = previousPatternList[previousPatternList.length - 2].patternIndex;

      if (
        firstPatternOfCurrentChunk === lastPatternOfPreviousChunk ||
        firstPatternOfCurrentChunk === secondLastPatternOfPreviousChunk ||
        secondPatternOfCurrentChunk === lastPatternOfPreviousChunk
      ) {
        return true;
      }

      // items
      const previousItemList = this.createItemList(previousPatternList);
      const firstItemOfCurrentChunk = itemList[0].itemIndex;
      const lastItemOfPreviousChunk = previousItemList[previousItemList.length - 1].itemIndex;

      if (firstItemOfCurrentChunk === lastItemOfPreviousChunk) {
        return true;
      }
    }

    // make sure that catch trials are not too close (for overlapping event handlers)
    let distances = []; // Holds the position of catch trials in a chunk
    for (let pattern = 0; pattern < numberOfPatterns; pattern++) {
      if (patternList[pattern].isCatchTrial) distances.push(pattern);
    }
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] - distances[i - 1] < 5) {
        return true;
      }
    }

    // Make sure that catch trials cant be too close over chunks
    if (distances[0] < 3 || distances[distances.length - 1] > patternList.length - 3) return true;

    // second order regularity (A B A)
    for (let pattern = 2; pattern < numberOfPatterns; pattern++) {
      const firstPattern = patternList[pattern - 2].patternIndex;
      const thirdPattern = patternList[pattern].patternIndex;

      if (firstPattern === thirdPattern) {
        return true;
      }
    }

    // No restrictions are violated, jeej...
    return false;
  }

  // Method to create a timeline for jsPsych
  createTimeline() {
    // Variable that holds the type of plugin (visual or auditory for now)
    const pluginType =
      this.streamInfo.modality === "auditory" ? AudioKeyboardResponsePlugin : ImageKeyboardResponsePlugin;
    // convert to stimulus list expected by jsPsych
    // add path to object {stimulus: path/stimulus}
    // add file extension/format
    let _stimulusList = this.itemList.map((item) => ({
      type: pluginType,
      itemIndex: item.itemIndex,
      patternIndex: item.patternIndex,
      stimulus: this.streamInfo.assetPath + item.stimulus + this.streamInfo.fileFormat,
      isCatchTrial: item.isCatchTrial,

      on_start: () => {
        if (item.isCatchTrial) {
          startCatchTrial();
        }
      },
    }));

    _stimulusList.forEach((item) => {
      if (item.isCatchTrial) {
        item.itemIndex = "catch";
      }
    });

    const stimulusList = {
      type: pluginType,
      prompt: "+",
      choices: [],
      on_timeline_start: () => {
        STREAM_ACTIVE = true;
      },
      on_timeline_finish: () => {
        STREAM_ACTIVE = false;
      },
      timeline: _stimulusList,
    };

    if (this.streamInfo.modality === "auditory") {
      stimulusList.trial_ends_after_audio = true;
    }
    if (this.streamInfo.modality === "visual") {
      stimulusList.stimulus_duration = "500";
      stimulusList.trial_duration = "500";
    }

    const readyAnnouncement = {
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      prompt: "Duw op de spatiebalk als je klaar bent.",
    };
    const finishedAnnouncement = {
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      data: {
        task: "exposure_result",
      },
      prompt: "Deze taak is afgelopen, duw op op de spatiebalk om verder te gaan.",
      on_finish: function (data) {
        let correctResponses = 0;
        let tooSlowResponses = 0;
        let incorrectResponses = 0;

        CATCH_TRIAL_RESPONSE_LIST.forEach((response, index) => {
          if (index === 0) return; // Skip the first response (is from ready announcement)

          if (response.isCatchTrial) {
            if (response.correct && !response.missed) {
              correctResponses++;
            } else if (response.missed) {
              tooSlowResponses++;
            }
          } else if (!response.correct && !response.missed) {
            incorrectResponses++;
          }
        });

        data.numberOfCatchTrials = correctResponses + tooSlowResponses;
        data.correctResponses = correctResponses;
        data.tooSlowResponses = tooSlowResponses;
        data.incorrectResponses = incorrectResponses;
        data.results = true;
      },
    };
    let tempStream = {
      type: pluginType,
      data: {
        task: "exposure",
      },
      timeline: [stimulusList, finishedAnnouncement], // ready announcement replaced by catch sound check
    };

    this.timeline = tempStream;
  }

  // Creates an array per repetition, for shuffling
  // HARDCODED FOR NOW, does not account for: repetitions not matching chunks
  createChunkedPatternList() {
    let chunkedPatternList = [];
    const numberOfChunks = this.numberOfRepetitions / this.streamInfo.chunkSize;

    for (let chunkNumber = 0; chunkNumber < numberOfChunks; chunkNumber++) {
      const chunk = new Array(this.streamInfo.chunkSize).fill(structuredClone(this.patterns)).flat();
      chunkedPatternList.push(chunk);
    }

    return chunkedPatternList;
  }

  // Creates catch trials from the pattern list (1 per pattern, for each position)
  // The array is not yet shuffled
  createCatchTrials() {
    let catchTrials = [];
    const catchSyllable = "Xu";
    this.patterns.forEach((pattern) => {
      // Determine the number of stimuli in the current pattern
      const stimuliKeys = Object.keys(pattern).filter((key) => key.startsWith("stimulus"));
      stimuliKeys.forEach((stimulusKey) => {
        // Clone the current pattern to create a catch trial
        const catchTrial = { ...pattern };

        // Replace the current stimulus with the catch syllable
        catchTrial[stimulusKey] = catchSyllable;
        catchTrial["isCatchTrial"] = true;
        // Add the catch trial to the list
        catchTrials.push(catchTrial);
      });
    });
    return catchTrials;
  }

  // Inserts the catch trials into the chunked patternList
  // HARDCODED FOR NOW
  insertCatchTrials(chunkedPatternList) {
    const numberOfChunks = this.streamInfo.numberOfRepetitions / this.streamInfo.chunkSize;
    const numberOfCatchTrials = 24;
    const maxCatchTrialsPerChunk = 2;

    // Shuffle the catch trials
    fischerYatesShuffle(this.catchTrials);

    // Make a clone of catch trials (so that the original this.catchTrials doesnt get changed)
    const _catchTrials = structuredClone(this.catchTrials);

    // First, distribute one catch trial per chunk to ensure each chunk has at least one
    for (let chunk = 0; chunk < numberOfChunks; chunk++) {
      chunkedPatternList[chunk].push(_catchTrials.pop());
    }

    // Now, distribute the remaining catch trials randomly across the chunks
    while (_catchTrials.length > 0) {
      let randomChunkIndex = getRandomInt(0, numberOfChunks - 1);

      // Ensure that there are no more than 2 catch trials per chunk
      if (chunkedPatternList[randomChunkIndex].filter((item) => item.isCatchTrial).length < maxCatchTrialsPerChunk) {
        chunkedPatternList[randomChunkIndex].push(_catchTrials.pop());
      }
    }
  }

  // Make objects from the pattern list (adds extra data such as item and pattern index)
  createPatternObjects(patterns) {
    const patternArray = [];
    const startIndex = 1;

    patterns.forEach((pattern, index) => {
      const patternObject = {};
      patternObject.patternIndex = index + startIndex;
      pattern.forEach((item, itemIndex) => {
        patternObject[`stimulus${itemIndex + 1}`] = item;
        patternObject["isCatchTrial"] = false;
      });
      patternArray.push(patternObject);
    });

    return patternArray;
  }
  createItemIndexList() {
    let itemIndexObject = {};
    let currentIndex = 1; // Start indexing from 1

    this.patterns.forEach((pattern) => {
      Object.values(pattern).forEach((value) => {
        if (typeof value === "string" && !itemIndexObject.hasOwnProperty(value)) {
          itemIndexObject[value] = currentIndex++;
        }
      });
    });

    return itemIndexObject;
  }

  // Creates an item list from a patternlist
  createItemList(patternList) {
    // patternlist is a 2D array
    // Returns the full pattern list in a 1D array, per item (e.g., for looping)
    const flatArray = patternList.reduce((result, pattern) => {
      for (let i = 1; i <= this.patternSize; i++) {
        let itemIndex = this.itemIndexList[pattern[`stimulus${i}`]];
        if (itemIndex === undefined) {
          itemIndex = "catch";
        }
        let isCatchTrial = false;
        if (itemIndex === "catch") {
          isCatchTrial = true;
        }
        result.push({
          stimulus: pattern[`stimulus${i}`],
          itemIndex: itemIndex,
          patternIndex: pattern.patternIndex,
          isCatchTrial: isCatchTrial,
        });
      }
      return result;
    }, []);

    return flatArray;
  }
}
