const set1OldItems = [
  ["Be", "Pa"],
  ["Gi", "Va"],
  ["Je", "Wo"],
  ["Ju", "Mi"],
  ["Ke", "Ge"],
  ["Me", "Zu"],
  ["Ve", "Fe"],
  ["We", "To"]
];

const set1NewItems = [
  ["Be", "Ge"],
  ["Gi", "Mi"],
  ["Je", "To"],
  ["Ju", "Wo"],
  ["Ke", "Va"],
  ["Me", "Fe"],
  ["Ve", "Pa"],
  ["We", "Zu"]
];

const set2OldItems = [
  ["Du", "Jo"],
  ["Fu", "Di"],
  ["Le", "Fo"],
  ["Lu", "Tu"],
  ["No", "So"],
  ["Nu", "Bu"],
  ["Wi", "Vo"],
  ["Zo", "Pi"]
];
const set2NewItems = [
  ["Du", "Pi"],
  ["Fu", "Tu"],
  ["Le", "Vo"],
  ["Lu", "Fo"],
  ["No", "Jo"],
  ["Nu", "Di"],
  ["Wi", "Bu"],
  ["Zo", "So"]
];

export function oldNewTrialsSet1(jsPsych) {
  return jsPsych.randomization.shuffle([
    ...set1OldItems.map((pair, i) => ({
      stimulus: pair,
      correct_response: "old",
      data: {
        set: 1,
        condition: "old",
        trial_index_within_set: i + 1,
        id: `Set1_old_${i + 1}`
      }
    })),
    ...set1NewItems.map((pair, i) => ({
      stimulus: pair,
      correct_response: "new",
      data: {
        set: 1,
        condition: "new",
        trial_index_within_set: i + 1,
        id: `Set1_new_${i + 1}`
      }
    })),
  ]);
}


export function oldNewTrialsSet2(jsPsych) { 
  return jsPsych.randomization.shuffle([ 
    ...set2OldItems.map((pair, i) => ({
      stimulus: pair, 
      correct_response: "old", 
      data: { 
        set: 2, 
        condition: "old", 
        trial_index_within_set: i + 1, 
        id: `Set2_old_${i + 1}`
      } 
    })),
    ...set2NewItems.map((pair, i) => ({ 
      stimulus: pair, 
      correct_response: "new", 
      data: { 
        set: 2, 
        condition: "new", 
        trial_index_within_set: i + 1, 
        id: `Set2_new_${i + 1}`
      } 
    })), 
  ]); 
}

export function getCombinedOldNewTrials(jsPsych) {
  const allTrials = [
    ...oldNewTrialsSet1(jsPsych),
    ...oldNewTrialsSet2(jsPsych)
  ];
  return jsPsych.randomization.shuffle(allTrials);    
}