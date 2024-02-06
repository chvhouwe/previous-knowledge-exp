import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import { fischerYatesShuffle } from "./random";
export function createHugginsPitchTask(jsPsych, assetPath, fileFormat, trialList) {
  // shuffle the trial order
  fischerYatesShuffle(trialList);

  // an empty timeline to add trial to
  let timeline = [];
  trialList.forEach((trial) => {
    const splitFileName = trial.split("_"); // Create an array with each "_" separated character
    const correctPosition = splitFileName[splitFileName.length - 1]; // The last character indicates the correct position
    const stimulusPath = `${assetPath}${trial}${fileFormat}`;
    const correctResponse = getCorrectResponse(correctPosition);

    // Create the timeline for the task
    // Add the sound file

    timeline.push({
      // ready announcement
      type: HtmlKeyboardResponsePlugin,
      choices: " ",
      stimulus: "",
      prompt: "Duw op de spatiebalk als je klaar bent.",
    });
    timeline.push({
      stimulus: stimulusPath,
      prompt: "+",
      trial_ends_after_audio: true,
    });

    // Add a response trial
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      prompt: "In welk ruissignaal hoorde je een subtiele toon?",
      choices: ["&", "é", '"', "1", "2", "3"],
      data: {
        correctResponse: correctResponse,
        correctPosition: correctPosition,
      },
      on_finish: function (data) {
        if (correctResponse.includes(data.response)) {
          data.correct = true;
        } else {
          data.correct = false;
        }
        data.responsePosition = getResponsePosition(data.response);
        data.results = true;
        data.task = "huggins_pitch";
      },
    });
  });

  return {
    type: AudioKeyboardResponsePlugin,
    prompt: "Welk ruissignaal bevatte een subtiele toon, duw op 1, 2 of 3.",
    choices: "NO_KEYS",
    response_allowed_while_playing: false,
    timeline: timeline,
  };
}

function getCorrectResponse(correctPosition) {
  const responseMapping = {
    1: ["&", "1"],
    2: ["é", "2"],
    3: ['"', "3"],
  };

  if (correctPosition in responseMapping) {
    return responseMapping[correctPosition];
  } else {
    throw new Error(`Correct position has incorrect value, should be 1, 2, or 3, but is ${correctPosition}`);
  }
}

function getResponsePosition(response) {
  const mapping = {
    "&": 1,
    1: 1,
    é: 2,
    2: 2,
    '"': 3,
    3: 3,
  };

  if (response in mapping) {
    return mapping[response];
  } else {
    throw new Error("incorrect response");
  }
}
