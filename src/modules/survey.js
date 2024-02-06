import SurveyPlugin from "@jspsych/plugin-survey";

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
        prompt: "Gelieve te antwoorden op volgende vragen:",
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
    ],
  ],
  on_finish: function (data) {
    data.gender = data.response.gender;
    data.age = data.response.age;
    data.neurologicalIssues = data.response.neurologicalIssues;
  },
};
