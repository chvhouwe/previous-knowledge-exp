import { fischerYatesShuffle, getRandomInt } from "./random";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { startCatchTrial, CATCH_TRIAL_RESPONSE_LIST } from "./catch-trial-manager";

export let STREAM_ACTIVE = false;

/**
 * @class Stream
 * Stream to exposure Old/New task.
 * keep syllable pairs
 */
export class Stream {
  constructor(jsPsych, streamInfo) {
    this.jsPsych = jsPsych;
    this.streamInfo = streamInfo;
    this.patternSize = streamInfo.patterns[0].length;
    this.patterns = this.createPatternObjects(streamInfo.patterns); // only "Old"
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
      previousChunk = chunk;
    });
  }

  violatesRestrictions(patternList, previousPatternList) {
    const numberOfPatterns = patternList.length;

    // 1. no pattern repetition
    for (let i = 1; i < numberOfPatterns; i++) {
      if (patternList[i].patternIndex === patternList[i - 1].patternIndex) return true;
    }

    // 2. no item repetition
    const itemList = this.createItemList(patternList);
    for (let i = 1; i < itemList.length; i++) {
      if (itemList[i].itemIndex === itemList[i - 1].itemIndex) return true;
    }

    // 3. chunks restrictions
    if (previousPatternList) {
      const firstPattern = patternList[0].patternIndex;
      const secondPattern = patternList[1].patternIndex;
      const lastPrev = previousPatternList[previousPatternList.length - 1].patternIndex;
      const secondLastPrev = previousPatternList[previousPatternList.length - 2].patternIndex;
      if (firstPattern === lastPrev || firstPattern === secondLastPrev || secondPattern === lastPrev) return true;

      const firstItem = itemList[0].itemIndex;
      const lastPrevItem = this.createItemList(previousPatternList).slice(-1)[0].itemIndex;
      if (firstItem === lastPrevItem) return true;
    }

    // 4. distance between catch trials
    let catchPositions = patternList.map((p, idx) => p.isCatchTrial ? idx : null).filter(idx => idx !== null);
    for (let i = 1; i < catchPositions.length; i++) {
      if (catchPositions[i] - catchPositions[i - 1] < 5) return true;
    }
    if (catchPositions[0] < 3 || catchPositions[catchPositions.length - 1] > patternList.length - 3) return true;

    // 5. 2nd order
    for (let i = 2; i < numberOfPatterns; i++) {
      if (patternList[i - 2].patternIndex === patternList[i].patternIndex) return true;
    }

    return false;
  }

  createTimeline() {
    const pluginType = AudioKeyboardResponsePlugin;
    let _stimulusList = this.itemList.map((item) => ({
      type: pluginType,
      itemIndex: item.itemIndex,
      patternIndex: item.patternIndex,
      stimulus: this.streamInfo.assetPath + item.stimulus + this.streamInfo.fileFormat,
      isCatchTrial: item.isCatchTrial,
      on_start: () => {
        if (item.isCatchTrial) startCatchTrial();
      },
    }));

    _stimulusList.forEach((item) => {
      if (item.isCatchTrial) item.itemIndex = "catch";
    });

    const stimulusList = {
      type: pluginType,
      prompt: "+",
      choices: [],
      timeline: _stimulusList,
      on_timeline_start: () => { STREAM_ACTIVE = true; },
      on_timeline_finish: () => { STREAM_ACTIVE = false; },
      trial_ends_after_audio: true,
    };

    const finishedAnnouncement = {
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      data: { task: "exposure_result" },
      prompt: "Deze taak is afgelopen, duw op op de spatiebalk om verder te gaan.",
      on_finish: function (data) {
        let correctResponses = 0, tooSlowResponses = 0, incorrectResponses = 0;
        CATCH_TRIAL_RESPONSE_LIST.forEach((response, idx) => {
          if (idx === 0) return;
          if (response.isCatchTrial) {
            if (response.correct && !response.missed) correctResponses++;
            else if (response.missed) tooSlowResponses++;
          } else if (!response.correct && !response.missed) incorrectResponses++;
        });
        data.numberOfCatchTrials = correctResponses + tooSlowResponses;
        data.correctResponses = correctResponses;
        data.tooSlowResponses = tooSlowResponses;
        data.incorrectResponses = incorrectResponses;
        data.results = true;
      },
    };

    this.timeline = {
      type: pluginType,
      data: { task: "exposure" },
      timeline: [stimulusList, finishedAnnouncement],
    };
  }

  createChunkedPatternList() {
    const numberOfChunks = this.numberOfRepetitions / this.streamInfo.chunkSize;
    let chunkedPatternList = [];
    for (let c = 0; c < numberOfChunks; c++) {
      const chunk = new Array(this.streamInfo.chunkSize).fill(structuredClone(this.patterns)).flat();
      chunkedPatternList.push(chunk);
    }
    return chunkedPatternList;
  }

  createCatchTrials() {
    const catchSyllable = "Xu";
    let catchTrials = [];
    this.patterns.forEach((pattern) => {
      const keys = Object.keys(pattern).filter(k => k.startsWith("stimulus"));
      keys.forEach(k => {
        const catchTrial = { ...pattern, [k]: catchSyllable, isCatchTrial: true };
        catchTrials.push(catchTrial);
      });
    });
    return catchTrials;
  }

  insertCatchTrials(chunkedPatternList) {
    const numberOfChunks = this.streamInfo.numberOfRepetitions / this.streamInfo.chunkSize;
    const maxCatchPerChunk = 2;
    const _catchTrials = structuredClone(this.catchTrials);
    fischerYatesShuffle(_catchTrials);
    for (let chunk = 0; chunk < numberOfChunks; chunk++) chunkedPatternList[chunk].push(_catchTrials.pop());
    while (_catchTrials.length) {
      let randomChunk = getRandomInt(0, numberOfChunks - 1);
      if (chunkedPatternList[randomChunk].filter(p => p.isCatchTrial).length < maxCatchPerChunk) chunkedPatternList[randomChunk].push(_catchTrials.pop());
    }
  }

  createPatternObjects(patterns) {
    // keep "Old"
    const filtered = patterns.filter(p => p.type === "Old" || !p.type);
    return filtered.map((pattern, idx) => {
      const obj = { patternIndex: idx + 1, isCatchTrial: false };
      pattern.forEach((item, i) => { obj[`stimulus${i+1}`] = item; });
      return obj;
    });
  }

  createItemIndexList() {
    let idxObj = {}, currentIndex = 1;
    this.patterns.forEach(p => Object.values(p).forEach(v => {
      if (typeof v === "string" && !idxObj.hasOwnProperty(v)) idxObj[v] = currentIndex++;
    }));
    return idxObj;
  }

  createItemList(patternList) {
    return patternList.reduce((res, pattern) => {
      for (let i = 1; i <= this.patternSize; i++) {
        let itemIdx = this.itemIndexList[pattern[`stimulus${i}`]] || "catch";
        res.push({
          stimulus: pattern[`stimulus${i}`],
          itemIndex: itemIdx,
          patternIndex: pattern.patternIndex,
          isCatchTrial: itemIdx === "catch"
        });
      }
      return res;
    }, []);
  }
}
