"use strict";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";

const assetPath = "assets/";
function createInstructions(pages, allowBackward, clickableNavigation) {
  const instructions = {
    type: InstructionsPlugin,
    pages: pages,
    allowBackward: allowBackward,
    show_clickable_nav: clickableNavigation,
  };
  return instructions;
}

export const setFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: true,
};

// STREAM RELATED INSTRUCTIONS
// pages to add to instructions
const streamPage1 =
  "<b> AUDIO TAAK </b><br><br>" +
  "De audio taak gaat nu starten, dit duurt ongeveer 10 minuten. <br>Gedurende deze taak moet je aandachtig luisteren" +
  " en elke keer je een 'woef' hoort moet je duwen op de spatiebalk!<br>" +
  "Plaats je hand alvast op de spatiebalk en klik op 'volgende' om te starten.";
export const streamInstructions = createInstructions([streamPage1], true, true);

// SICR related instructions
const sicrPage1 =
  "<b>GEHEUGEN TAAK</b><br><br>" +
  "In deze taak krijg je een reeks lettergrepen te horen. Jij moet deze proberen onthouden en achteraf in te vullen." +
  "Voordat de taak start, zal je 12 oefentrials voltooien, daarna start de echte taak die bestaat uit 32 trials.<br>" +
  "Klik op 'volgende' om te starten.";

export const sicrInstructions = createInstructions([sicrPage1], true, true);

// AFC related instructions
const afcPage1 =
  "<b> MEERKEUZE TAAK </b><br><br>" +
  "In deze taak zal je steeds moeten kiezen tussen meerdere opties. Er zijn twee soorten trials:<br>" +
  "- Combinatie kiezen: Je hoort meerdere combinaties van lettergrepen, jij moet aangeven welke het meest bekend klinkt.<br>" +
  "- Combinatie aanvullen: Je hoort een combinatie van lettergrepen, waar één lettergreep ontbreekt (aangeduid door een 'woef' geluid).<br>" +
  "Jij kan dan achteraf kiezen welke lettergreep volgens jou ontbreekt.<br>" +
  "Klik op 'volgende' om te starten.";

export const afcInstructions = createInstructions([afcPage1], true, true);

export const goodbyeTrial = {
  type: HtmlKeyboardResponsePlugin,
  stimulus: "Goodbye!",
};
