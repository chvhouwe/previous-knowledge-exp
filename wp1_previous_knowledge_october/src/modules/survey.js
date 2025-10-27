import SurveyPlugin from "@jspsych/plugin-survey";
import "@jspsych/plugin-survey/css/survey.css";
export const headphoneQuestion = {
  type: SurveyPlugin,
  data: {
    task: "headphoneQuestion",
  },
  button_label_finish: "Doorgaan",
  pages: [
    [
      {
        type: "html",
        prompt:
          "<div style='text-align: left; width:600px;'>" +
          "Voor dit deel van de studie afgelopen is, hebben we nog één vraag. " +
          "Gelieve eerlijk te antwoorden, dit heeft geen invloed op jouw credits." +
          "</div>",
      },
      {
        type: "multi-choice",
        prompt: "Welk audioapparaat heb je gebruikt gedurende de studie?",
        name: "headphoneQuestion",
        options: ["Hoofdtelefoon", "Oortjes", "Luidsprekers"],
        required: true,
      },
    ],
  ],
  on_finish: function (data) {
    data.headphoneQuestion = data.response.headphoneQuestion;
    data.results = true;
  },
};
export const demographics = {
  type: SurveyPlugin,
  data: {
    task: "demographics",
  },
  button_label_finish: "Doorgaan",
  pages: [
    [
      {
        type: "html",
        prompt: "<b>Gelieve te antwoorden op volgende vragen (scroll naar beneden om verder te gaan):<b>",
      },
      {
        type: "multi-choice",
        prompt: "Wat is jouw geslacht?",
        name: "gender",
        options: ["Vrouw", "Man", "Overige"],
        required: true,
      },
      {
        type: "text",
        prompt: "Wat is jouw leeftijd?",
        name: "age",
        required: true,
        input_type: "number",
      },
      {
        type: "multi-choice",
        prompt: "Heb je neurologische aandoeningen, bv. dyslexie, epilepsie, ...",
        name: "neurologicalIssues",
        options: ["Ja", "Neen", "Ik zeg het liever niet."],
        required: true,
      },
      {
        type: "multi-choice",
        prompt: "Wat is jouw voorkeurshand?",
        name: "handedness",
        options: ["Rechts", "Links", "Ambidexter"],
        required: true,
      },
    ],
  ],
  on_finish: function (data) {
    data.gender = data.response.gender;
    data.age = data.response.age;
    data.neurologicalIssues = data.response.neurologicalIssues;
    data.handedness = data.response.handedness;
    data.results = true;
  },
};
export const behaviorscreeningquestion = {
  type: SurveyPlugin,
  data: {
    task: "behaviorscreeningquestion",
  },
  button_label_finish: "Doorgaan",
  pages: [
    [
      {
        type: "yes/no",
        prompt: "Heb je alle instructies gevolgd om het experiment uit te voeren?",
        name: "behaviorscreeningquestion",
        options: ["Ja", "Ne"],
        required: true,
      },
    ],
  ],
  on_finish: function (data) {
    data.behaviorscreeningquestion = data.response.behaviorscreeningquestion;
    data.results = true;
  },
};