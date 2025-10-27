"use strict";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";
import { calculateNextPart } from "./date-functions";

const assetPath = "assets/";
export function createInstructions(pages, allowBackward, clickableNavigation) {
  const instructions = {
    type: InstructionsPlugin,
    data: {
      task: "instruction",
    },
    pages: pages,
    allowBackward: allowBackward,
    show_clickable_nav: clickableNavigation,
    button_label_next: "Volgende",
    button_label_previous: "Vorige",
    show_page_number: true,
    page_label: "Pagina",
  };
  return instructions;
}

// WELCOME INSTRUCTIONS
const welcomePage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> Welkom </b><br><br>" +
  "Deze studie bestaat uit 4 delen. <br>" +
  "<b>1.</b> Enkele vragen over jou. <br>" +
  "<b>2.</b> Testen van de geluidskwaliteit. <br>" + //change to old/new
  "<b>3.</b> Een geluid detecteren. <br>" +
  "<b>4.</b> Een herkenningstaat. <br><br>" +
  "Meer info volgt als het deel start.<br>" +
  "</div>";

const welcomePage2 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> Welkom </b><br><br>" +
  "Gelieve het volgende te doen voor je start met de studie:<br>" +
  "<b>1.</b> Sluit alle browser tabbladen, dit is belangrijk om het experiment vlot te laten verlopen.<br>" +
  "<b>2.</b> Verwijder zaken die voor afleiding kunnen zorgen (geen TV, gsm, ...) zodat je klaar bent om je te concentreren op de taak.<br>" +
  "<b>3.</b> Sluit je hoofdtelefoon of oortjes aan.<br><br>" +
  "Klik op volgende om verder te gaan naar deel 1.<br>" +
  "</div>";

export const welcomeInstructions = createInstructions([welcomePage1, welcomePage2], true, true);

// SOUND CHECK
const soundCheckPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b>Volume instellen </b><br><br>" +
  "Nu gaan we het volume correct instellen. Je gaat een geluid horen, pas je volume aan " +
  "zodat je dit geluid luid en duidelijk hoort. Klik op volgende als je klaar bent." +
  "</div>";

export const soundCheckInstructions = createInstructions([soundCheckPage1], true, true);

// FULLSCREEN
export const setFullscreen = {
  type: FullscreenPlugin,
  fullscreen_mode: true,
  button_label: "Doorgaan",
  message:
    "<div style='text-align: left; width:600px;'>Het experiment gaat het volledige scherm innemen als je op onderstaande knop klikt.</div>",
};

// HUGGINS PITCH INSTRUCTIONS
const hpPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> HOOFDTELEFOON CHECK </b><br><br>" +
  "Voor je aan de studie begint volgt nog een korte test om zeker te zijn " +
  "dat jouw hoofdtelefoon of oortjes functioneren. Je krijgt drie ruissignalen te horen, in één " +
  "ruissignaal zit een subtiele toon verborgen. Jij moet aangeven in welk ruissignaal " +
  "de toon te horen is. Antwoorden kan met de nummertoetsen:<img src='assets/numberkeys_study.png'></img><br><br>" +
  "Dit zal je 6 keer doen in totaal. Klik op volgende om te starten. Opgelet, je kan maar één keer luisteren!" +
  "</div>";

export const hpInstructions = createInstructions([hpPage1], true, true);

// STREAM RELATED INSTRUCTIONS
// pages to add to instructions
const streamPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> DETECTIE TAAK </b><br><br>" +
  "De detectie taak gaat nu starten. Je gaat luisteren naar een lange reeks met lettergrepen, dit duurt ongeveer 10 minuten. <br> Gedurende deze taak moet je aandachtig luisteren" +
  " en elke keer je de lettergreep 'Xu' hoort moet je duwen op de spatiebalk. Probeer zo snel mogelijk te reageren, je reactietijden worden opgeslagen!<br>" +
  "Op de volgende pagina laten we je het doelwit 'Xu' horen, je kan dit zo vaak herbeluisteren als je wil." +
  "</div>";

export const streamInstructions = createInstructions([streamPage1], true, true);

const oldnewPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> HERKENNINGSTAKE </b><br><br>" +
  "In deze taak moet je aangeven of het geluid bekend (oud) of nieuw is:<br>" +
  "<b> Je kunt antwoorden door op toets 1 te drukken als je denkt dat het geluid bekend is of op toets 2 als je denkt dat het geluid nieuw is (je hoeft de shift-toets niet in te drukken): <img src='assets/study_img.png'></img><br><br>" +
  "Klik op 'volgende' om te starten." +
  "</div>";

const oldnewPage2 = 
  "<div style='text-align: left; width:600px;'>" + 
  "<b> HERKENNINGSTAKE </b><br><br>" +
  "Geef na elke poging aan hoeverre u overtuigd bent van uw antwoord.<br>" +
  "Selecteer een waarde van 0 tot en met 6 met de muis, " +
  "waarbij 0 staat voor helemaal niet overtuigd en 6 voor volledig overtuigd.<br><br>" +
  "Klik op 'volgende' om te starten." +
  "</div>";

  export const oldnewInstructions = createInstructions([oldnewPage1, oldnewPage2], true, true);


  const wordoriginsPage =
  "<div style='text-align: left; width:600px;'>" + 
  "Nu moet je na elke poging aangeven of het geluid bij de eerste set geluiden hoort die je hoorde of bij de tweede.<br>" +
  "Druk op 1 als je denkt dat het bij de eerste hoort of op 2 als je denkt dat het bij de tweede hoort" +
  "Klik op 'volgende' om te starten." +
  "</div>";

  export const wordoriginsInstructions = createInstructions([wordoriginsPage], true, true);


  // GOODBYE TRIAL

const nextPartTime = calculateNextPart();

const goodbyeText =
  "<div style='text-align: left; width:600px;'>" +
  "<b> Einde experiment </b><br><br>" +
  "Bedankt voor je deelname aan deel 1 van de studie! <br>" +
  "Wacht even voor je deze pagina afsluit (+- 30 seconden), zodat alle data zeker opgeslagen is. <br>" +
  "<b>" +
  nextPartTime +
  "</b>" +
  "</div>";

export const goodbyeTrial = createInstructions([goodbyeText], true, true);
goodbyeTrial.button_label_next = "Studie afsluiten";
