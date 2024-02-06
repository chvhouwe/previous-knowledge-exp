"use strict";
import { fischerYatesShuffle, getRandomInt } from "./random.js";
import { streamTimeline } from "./instruction.js";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
const { startCatchTrial, catchTrialResponseList, awaitingResponse } = require("./catch-trial-manager.js");
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
/**
 * Represents a stream/sequence made up of patterns
 */
export class Stream {
  /**
   * Constructs a new Stream with the specified patterns and numberOfRepetitions.
   *
   * @param {Array} patterns - The list of unique patterns to be included in the stream.
   * @param {number} numberOfRepetitions - The number of times the entire pattern list should be repeated.
   */
  constructor(jsPsych, patterns, numberOfRepetitions) {
    this.patternSize = patterns[0].length;
    this.patterns = this.createPatternObjects(patterns);
    this.numberOfRepetitions = numberOfRepetitions;
    this.jsPsych = jsPsych;
    this.itemIndexList = this.createItemIndexMap(this.patterns);
    this.chunkedPatternList = this.fillChunkedPatternList();
    this.patternList = this.chunkedPatternList.flat();
    this.totalNumberOfPatterns = this.patternList.length;
    this.itemList = this.patternListToItemList(this.patternList, this.patternSize);
    this.catchTrials = this.createCatchTrials(); //temporary with ping for testing
    this.timeline;
  }
  fillChunkedPatternList() {
    let chunkedPatternList = [];
    for (let i = 0; i < this.numberOfRepetitions; i++) {
      chunkedPatternList.push(structuredClone(this.patterns));
    }

    return chunkedPatternList;
  }

  createCatchTrials() {
    let catchTrials = [];
    const catchSyllable = "woef";
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

    fischerYatesShuffle(catchTrials);
    return catchTrials;
  }
  get patternListNumbered() {
    let numberedList = [];
    this.patternList.forEach((pattern) => {
      numberedList.push(pattern.index);
    });

    return numberedList;
  }
  insertCatchTrials() {
    // very specific to this experiment, think about making it modular
    const minDistance = 5; // minimum gap between consecutive catch trials
    const numberOfCatchTrials = this.catchTrials.length;
    let insertedIndexes = [];

    for (let catchTrial = 0; catchTrial < numberOfCatchTrials; catchTrial++) {
      let insertLocation;
      let tooClose;

      do {
        // get a random index from the pattern list, adjust for the length after insertions
        insertLocation = getRandomInt(0, this.totalNumberOfPatterns - 1);

        // Check if the current catch trial is within the minimum distance
        tooClose = insertedIndexes.some((index) => Math.abs(index - insertLocation) <= minDistance);
      } while (tooClose);

      // Insert the catch trial at the specified location
      this.patternList.splice(insertLocation, 0, this.catchTrials[catchTrial]);
      // Increment the indexes that are >= insertLocation (because they shift due to the insertion)
      insertedIndexes = insertedIndexes.map((index) => (index >= insertLocation ? index + 1 : index));
      insertedIndexes.push(insertLocation);
      insertedIndexes.sort((a, b) => a - b);
    }

    this.itemList = this.patternListToItemList(this.patternList, this.patternSize);
  }
  patternListToItemList(patternList, patternSize) {
    // Returns the full pattern list in a 1D array, per item (e.g., for looping)
    const flatArray = patternList.reduce((result, pattern) => {
      for (let i = 1; i <= patternSize; i++) {
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
          patternIndex: pattern.index,
          isCatchTrial: isCatchTrial,
        });
      }
      return result;
    }, []);

    return flatArray;
  }

  createPatternObjects(patterns) {
    const patternArray = [];
    const startIndex = 1;

    patterns.forEach((pattern, index) => {
      const patternObject = {};
      patternObject.index = index + startIndex;
      pattern.forEach((item, itemIndex) => {
        patternObject[`stimulus${itemIndex + 1}`] = item;
        patternObject["isCatchTrial"] = false;
      });
      patternArray.push(patternObject);
    });

    return patternArray;
  }

  createTimeline(assetPath, fileFormat) {
    let streamInstance = this; // bind this to stream instance for use in jspsych plugins

    // convert to stimulus list expected by jsPsych
    // add path to object {stimulus: path/stimulus}
    // add file extension/format
    let _stimulusList = this.itemList.map((item) => ({
      type: AudioKeyboardResponsePlugin,
      itemIndex: item.itemIndex,
      patternIndex: item.patternIndex,
      stimulus: assetPath + item.stimulus + fileFormat,
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
      type: AudioKeyboardResponsePlugin,
      prompt: "X",
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
      timeline: _stimulusList,
    };

    const readyAnnouncement = {
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      prompt: "Duw op de spatiebalk als je klaar bent.",
    };
    let tempStream = {
      type: AudioKeyboardResponsePlugin,
      data: {
        task: "exposure",
      },
      timeline: [readyAnnouncement, stimulusList],
      on_timeline_finish: function () {
        let correctResponses = 0;
        let tooSlowResponses = 0;
        let incorrectResponses = 0;

        catchTrialResponseList.forEach((response) => {
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

        const summary = {
          totalCatchTrials: correctResponses + tooSlowResponses,
          correctResponses: correctResponses,
          tooSlowResponses: tooSlowResponses,
          incorrectResponses: incorrectResponses,
          results: true,
        };

        streamInstance.jsPsych.data.write({
          catchTrialSummary: summary,
        });
      },
    };

    this.timeline = tempStream;
  }
  createItemIndexMap(patterns) {
    let itemIndexMap = new Map();
    let currentIndex = 1; // Start indexing from 1

    patterns.forEach((pattern) => {
      Object.values(pattern).forEach((value) => {
        if (typeof value === "string" || value instanceof String) {
          if (!itemIndexMap.has(value)) {
            itemIndexMap.set(value, currentIndex++);
          }
        }
      });
    });

    // Convert the Map to a plain object for the desired format
    const resultObject = {};
    itemIndexMap.forEach((index, stimulus) => {
      resultObject[stimulus] = index;
    });
    return resultObject;
  }

  shuffle(
    shuffleInterval,
    allowPatternRepetitions = false,
    allowSecondOrderPatternRepetitions = false,
    allowItemRepetitions = false
  ) {
    /**
     * Shuffles the stream at a specified interval.
     *
     * @param {number} shuffleInterval - The interval at which the stream should be shuffled.
     *    For example, if value = 1: Every pattern has to appear once before the same can appear again
     * @param {boolean} [allowPatternRepetitions=false] - Whether to allow repetitions of patterns in the stream. Default = false.
     * @param {boolean} [allowSecondOrderPatternRepetitions=false] - Whether to allow higher order repetitions, e.g., A-B-A-B. Default = false.
     * @param {boolean} [allowItemRepetitions=false] - Whether to allow repetitions of individual items (within patterns) in the stream, e.g., A-A. Default = false.
     */

    // Set variable to indicate whether the shuffle is completed
    const shuffledList = [];

    let previousChunk = null;

    // These only get assigned values after the first loop
    // This makes sure to avoid not assigned errors
    let firstPatternFromCurrentChunk = [1, 1, 1];
    let lastPatternFromPreviousChunk = [2, 2, 2];

    for (let chunkIndex = 0; chunkIndex < this.numberOfRepetitions; chunkIndex += shuffleInterval) {
      // Get the chunk, make it flat so the pattern are combined into a 2D array
      // (Note to self: If the last chunk is smaller, slice only takes the remainder of the array)
      let chunk = structuredClone(this.chunkedPatternList.slice(chunkIndex, chunkIndex + shuffleInterval).flat());

      let shuffleComplete = false;

      while (shuffleComplete === false) {
        fischerYatesShuffle(chunk);

        const patternRepetitions = hasPatternRepetitions(chunk);
        const secondOrderPatternRepetitions = hasSecondOrderPatternRepetitions(chunk);
        const itemRepetitions = hasItemRepetitions(chunk);

        if (chunkIndex > 0 && chunkIndex <= chunk.length - shuffleInterval) {
          firstPatternFromCurrentChunk = getFirstPatternFromPatternList(chunk);
          lastPatternFromPreviousChunk = getLastPatternFromPatternList(previousChunk);
        }

        // Check all conditions, if fulfilled shuffle will be complete

        if (
          firstPatternFromCurrentChunk === lastPatternFromPreviousChunk ||
          (allowPatternRepetitions === false && patternRepetitions === true) ||
          (allowSecondOrderPatternRepetitions === false && secondOrderPatternRepetitions) === true ||
          (allowItemRepetitions === false && itemRepetitions === true)
        ) {
          // pass and redo the loop
        } else {
          shuffledList.push(chunk);
          previousChunk = structuredClone(chunk);
          shuffleComplete = true;
        }
      }
    }

    this.chunkedPatternList = shuffledList;
    this.patternList = this.chunkedPatternList.flat();
    this.itemList = this.patternListToItemList(this.patternList, this.patternSize);
  }
}
function hasPatternRepetitions(array) {
  for (let pattern = 0; pattern < array.length - 1; pattern++) {
    const currentPattern = array[pattern].index;
    const nextPattern = array[pattern + 1].index;

    // If two patterns are repeating/ they are similar, return true
    if (currentPattern === nextPattern) {
      return true;
    }
  }

  return false; // No pattern repetitions
}
function hasSecondOrderPatternRepetitions(array) {
  // 2D array
  for (let pattern = 0; pattern < array.length - 1; pattern++) {
    // Prevent out of index error
    if (pattern < array.length - 3) {
      // Get the next two patterns
      const first_sequence = parseInt(array[pattern].index.toString() + array[pattern + 1].index.toString());
      // 3rd and 4th pattern
      const second_sequence = parseInt(array[pattern + 2].index.toString() + array[pattern + 3].index.toString());

      // // If two patterns are repeating/ they are similar, return true
      if (first_sequence === second_sequence) {
        return true;
      }
    }
  }
  return false; // No second order repetitions
}

function hasItemRepetitions(array) {
  // 1D array
  const flatArray = flattenPatternList(array);
  for (let stimulus = 0; stimulus < flatArray.length; stimulus++) {
    const currentItem = flatArray[stimulus].itemIndex;
    const nextItem = flatArray[stimulus + 1].itemIndex;
    if (currentItem === nextItem) {
      return true;
    }
  }
}

function flattenPatternList(patternList, patternSize) {
  const flatArray = patternList.reduce((result, pattern) => {
    for (let i = 1; i <= patternSize; i++) {
      const itemIndex = (pattern.index - 1) * patternSize + i;
      result.push({
        name: pattern[`stimulus${i}`],
        itemIndex: itemIndex,
        patternIndex: pattern.index,
      });
    }
    return result;
  }, []);

  return flatArray;
}

function getFirstPatternFromPatternList(patternList) {
  return patternList[0].index;
}

function getLastPatternFromPatternList(patternList) {
  return patternList[patternList.length - 1].index;
}
