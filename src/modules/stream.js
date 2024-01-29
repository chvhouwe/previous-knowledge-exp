"use strict";
import { fischerYatesShuffle } from "./random.js";
import { streamTimeline } from "./trials.js";

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
  constructor(patterns, numberOfRepetitions) {
    this.patternSize = patterns[0].length;
    this.patterns = this.createPatternObjects(patterns);
    this.numberOfRepetitions = numberOfRepetitions;
    this.itemIndexList = this.createItemIndexMap(this.patterns);
    this._patternList = new Array(numberOfRepetitions).fill(structuredClone(this.patterns));

    this._itemList = this.patternListToItemList(this.patternList, this.patternSize);
  }

  get patternList() {
    // Returns the full pattern list
    return this._patternList.flat();
  }

  get itemList() {
    return this.patternListToItemList(this.patternList, this.patternSize);
  }

  get patternListNumbered() {
    let numberedList = [];
    this.patternList.forEach((pattern) => {
      numberedList.push(pattern.index);
    });

    return numberedList;
  }

  patternListToItemList(patternList, patternSize) {
    // Returns the full pattern list in a 1D array, per item (e.g., for looping)
    const flatArray = patternList.reduce((result, pattern) => {
      for (let i = 1; i <= patternSize; i++) {
        const itemIndex = this.itemIndexList[pattern[`stimulus${i}`]];
        result.push({
          stimulus: pattern[`stimulus${i}`],
          item_index: itemIndex,
          pattern_index: pattern.index,
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
      });
      patternArray.push(patternObject);
    });

    return patternArray;
  }

  convertToStimulusList(pathStimuli, fileFormat) {
    // convert to stimulus list expected by jsPsych
    // add path to object {stimulus: path/stimulus}
    // add file extension/format
    let stimulusList = this.itemList.map((item) => ({ stimulus: pathStimuli + item.stimulus + fileFormat }));
    streamTimeline.timeline = stimulusList;
    return streamTimeline;
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
      let chunk = structuredClone(this._patternList.slice(chunkIndex, chunkIndex + shuffleInterval).flat());

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

    this._patternList = shuffledList;
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
        pattern_index: pattern.index,
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
