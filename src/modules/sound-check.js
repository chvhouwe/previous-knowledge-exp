import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
export function createSoundCheck(jsPsych, assetPath, fileFormat, fileName) {
  const soundCheck = {
    type: AudioKeyboardResponsePlugin,
    prompt:
      "<div style='text-align: left; width:600px;'>" +
      "<b>Volume instellen </b><br><br>" +
      "Zorg dat je het geluid luid en duidelijk hoort. Duw op 'r' om het geluid opnieuw te beluisteren." +
      " Duw op de spatiebalk als je klaar bent om verder te gaan." +
      "</div>",
    stimulus: assetPath + fileName + fileFormat,
    choices: ["r", " "],
    on_finish: function (data) {
      if (data.response === "r") {
        data.repeat = true;
      } else {
        data.repeat = false;
      }
    },
  };

  return {
    type: AudioKeyboardResponsePlugin,
    timeline: [soundCheck],
    data: {
      task: "sound_check",
    },
    loop_function: function (data) {
      return jsPsych.data.getLastTrialData().select("repeat").values[0];
    },
  };
}

export function createCatchSoundCheck(jsPsych, assetPath, fileFormat, fileName) {
  const soundCheck = {
    type: AudioKeyboardResponsePlugin,
    prompt:
      "<div style='text-align: left; width:600px;'>" +
      "<b>Doelwit Xu </b><br><br>" +
      "Duw op 'r' om het geluid opnieuw te beluisteren. Zorg dat je het duidelijk hoort, dit is het doelwit dat je na deze pagina zal moeten detecteren. " +
      "Elke keer als je dit geluid (Xu) hoort, moet je zo snel mogelijk op de spatiebalk duwen!" +
      " Duw op de spatiebalk als je klaar bent om verder te gaan." +
      "</div>",
    stimulus: assetPath + fileName + fileFormat,
    choices: ["r", " "],
    on_finish: function (data) {
      if (data.response === "r") {
        data.repeat = true;
      } else {
        data.repeat = false;
      }
    },
  };

  return {
    type: AudioKeyboardResponsePlugin,
    timeline: [soundCheck],
    data: {
      task: "sound_check",
    },
    loop_function: function (data) {
      return jsPsych.data.getLastTrialData().select("repeat").values[0];
    },
  };
}
