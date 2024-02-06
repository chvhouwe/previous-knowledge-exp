"use strict";
import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import AudioKeyboardResponsePlugin from "@jspsych/plugin-audio-keyboard-response";
import InstructionsPlugin from "@jspsych/plugin-instructions";
import { calculateNextPart } from "./date-functions";

const assetPath = "assets/";
function createInstructions(pages, allowBackward, clickableNavigation) {
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
  "<b>1.</b> Enkele vragen over jou + testen van de geluidskwaliteit. <br>" +
  "<b>2.</b> Een geluid detecteren. <br>" +
  "<b>3.</b> Een geheugentaak.  <br>" +
  "<b>4.</b> Een meerkeuzetaak. <br><br>" +
  "Meer info volgt als het deel start.<br>" +
  "</div>";

const welcomePage2 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> Welkom </b><br><br>" +
  "Gelieve het volgende te doen voor je start met de studie:<br>" +
  "<b>1.</b> Sluit alle browser tabbladen, dit is belangrijk om het experiment vlot te laten verlopen.<br>" +
  "<b>2.</b> Verwijder zaken die voor afleiding kunnen zorgen (geen TV, gsm, ...) zodat je klaar bent om je te concentreren op de taak.<br><br>" +
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
  "Voor je aan de studie begint volgt nog een korte test om zeker te zijn" +
  "dat jouw hoofdtelefoon functioneert. Je krijgt drie ruissignalen te horen, in één " +
  "ruissignaal zit een subtiele toon verborgen. Jij moet aangeven in welk ruissignaal" +
  "de toon te horen is. Antwoorden kan met de nummertoetsen:<img src='assets/numberkeys_study.png'></img><br><br>" +
  "Klik op volgende om te starten. Opgelet, je kan maar één keer luisteren!" +
  "</div>";

export const hpInstructions = createInstructions([hpPage1], true, true);

// STREAM RELATED INSTRUCTIONS
// pages to add to instructions
const streamPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> DETECTIE TAAK </b><br><br>" +
  "De detectie taak gaat nu starten, dit duurt ongeveer 10 minuten. <br>Gedurende deze taak moet je aandachtig luisteren" +
  " en elke keer je een 'woef' hoort moet je duwen op de spatiebalk!<br>" +
  "Plaats je hand alvast op de spatiebalk en klik op 'volgende' om te starten." +
  "</div>";

export const streamInstructions = createInstructions([streamPage1], true, true);

// SICR related instructions
const sicrPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b>GEHEUGEN TAAK</b><br><br>" +
  "In deze taak krijg je een reeks lettergrepen te horen. Jij moet deze proberen onthouden en achteraf in te vullen." +
  "Voordat de taak start, zal je 6 oefentrials voltooien, daarna start de echte taak die bestaat uit 16 trials.<br>" +
  "Klik op 'volgende' om te starten." +
  "</div>";

export const sicrInstructions = createInstructions([sicrPage1], true, true);

// SICR practice instructions
const sicrPracticePage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b>Oefenronde</b><br><br>" +
  "Voor je begint aan de taak, krijg je eerst enkele oefenrondes." +
  "Klik op volgende om te starten. Opgelet, je kan maar één keer luisteren!" +
  "</div>";
export const sicrPracticeInstructions = createInstructions([sicrPracticePage1], true, true);

// SICR Start real task instructions
const sicrTaskStartPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b>Start van de geheugentaak </b><br><br>" +
  "De oefenrondes zijn voorbij en nu start de taak. Klik op volgende om te starten. Opgelet, je kan maar één keer luisteren!" +
  "</div>";

export const sicrTaskStartInstructions = createInstructions([sicrTaskStartPage1], true, true);
// AFC related instructions
const afcPage1 =
  "<div style='text-align: left; width:600px;'>" +
  "<b> MEERKEUZE TAAK </b><br><br>" +
  "In deze taak zal je steeds moeten kiezen tussen meerdere opties. Er zijn twee soorten trials:<br>" +
  "<b>1. Combinatie kiezen:</b> Je hoort meerdere combinaties van lettergrepen, jij moet aangeven welke het meest bekend klinkt.<br>" +
  "<b>2. Combinatie aanvullen:</b> Je hoort een combinatie van lettergrepen, waar één lettergreep ontbreekt (aangeduid door een 'woef' geluid).<br>" +
  "Jij kan dan achteraf kiezen welke lettergreep volgens jou ontbreekt.<br><br>" +
  "Antwoorden kan met de nummertoetsen (je hoeft de shift-toets niet in te drukken): <img src='assets/numberkeys_study.png'></img><br><br>" +
  "Klik op 'volgende' om te starten." +
  "</div>";

export const afcInstructions = createInstructions([afcPage1], true, true);

// GOODBYE TRIAL

const nextPartTime = calculateNextPart();

const goodbyeText =
  "<div style='text-align: left; width:600px;'>" +
  "<b> Einde experiment </b><br><br>" +
  "Bedankt voor je deelname aan deel 1 van de studie! <br>" +
  "Je kan de studie nu afsluiten, <b>wacht zeker tot alle data opgeslagen is. </b><br>" +
  "<b>" +
  nextPartTime +
  "</b>" +
  "</div>";

export const goodbyeTrial = createInstructions([goodbyeText], true, true);
goodbyeTrial.button_label_next = "Studie afsluiten";
