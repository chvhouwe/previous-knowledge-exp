const items = ["Ho", "Di", "Ve", "Mu", "Ba", "Lu", "Gi", "Ze", "Ta", "Pu", "So", "Ne", "Ja", "Wi", "Ke", "Fo"];

const recognitionIndexedSet1 = [
  [
    [1, 2, 3],
    [2, 13, 8],
  ],
  [
    [2, 1, 4],
    [1, 2, 4],
  ],
  [
    [5, 6, 7],
    [9, 5, 11],
  ],
  [
    [11, 12, 13],
    [14, 6, 10],
  ],
  [
    [1, 2, 3],
    [16, 11, 6],
  ],
  [
    [2, 1, 4],
    [14, 6, 10],
  ],
  [
    [5, 6, 7],
    [14, 3, 2],
  ],
  [
    [11, 12, 13],
    [1, 2, 4],
  ],
  [
    [1, 2, 3],
    [9, 5, 11],
    [2, 13, 8],
    [14, 3, 2],
  ],
  [
    [2, 1, 4],
    [9, 5, 11],
    [16, 11, 6],
    [1, 2, 4],
  ],
  [
    [5, 6, 7],
    [16, 11, 6],
    [14, 6, 10],
    [2, 13, 8],
  ],
  [
    [11, 12, 13],
    [14, 3, 2],
    [9, 5, 11],
    [1, 2, 4],
  ],
  [
    [2, 3],
    [1, 16],
  ],
  [
    [1, 4],
    [2, 4],
  ],
  [
    [6, 7],
    [5, 11],
  ],
  [
    [12, 13],
    [6, 11],
    [12, 15],
    [9, 4],
  ],
  [
    [1, 2],
    [7, 1],
    [3, 14],
    [13, 5],
  ],
];

const recognitionIndexedSet2 = [
  [
    [4, 3, 1],
    [4, 3, 9],
  ],
  [
    [3, 4, 2],
    [7, 1, 3],
  ],
  [
    [8, 9, 10],
    [4, 3, 9],
  ],
  [
    [14, 15, 16],
    [3, 1, 15],
  ],
  [
    [4, 3, 1],
    [15, 1, 4],
  ],
  [
    [3, 4, 2],
    [16, 7, 10],
  ],
  [
    [8, 9, 10],
    [5, 12, 13],
  ],
  [
    [14, 15, 16],
    [16, 7, 10],
  ],
  [
    [4, 3, 1],
    [16, 7, 10],
    [3, 1, 15],
    [7, 1, 3],
  ],
  [
    [3, 4, 2],
    [5, 12, 13],
    [15, 1, 4],
    [3, 1, 15],
  ],
  [
    [8, 9, 10],
    [7, 1, 3],
    [4, 3, 9],
    [15, 1, 4],
  ],
  [
    [14, 15, 16],
    [5, 12, 13],
    [4, 3, 9],
    [7, 1, 3],
  ],
  [
    [3, 1],
    [6, 3],
  ],
  [
    [4, 2],
    [13, 2],
  ],
  [
    [8, 9],
    [3, 14],
  ],
  [
    [14, 15],
    [8, 10],
    [1, 8],
    [15, 7],
  ],
  [
    [4, 3],
    [9, 2],
    [10, 4],
    [16, 12],
  ],
];

export const recognitionTrialListSet1 = recognitionIndexedSet1.map(
  (trial) => trial.map((pattern) => pattern.map((index) => items[index - 1])) // index -1 (array indexes start at 0)
);

export const recognitionTrialListSet2 = recognitionIndexedSet2.map(
  (trial) => trial.map((pattern) => pattern.map((index) => items[index - 1])) // index -1 (array indexes start at 0)
);

// completion trials
const completionIndexedSet1 = [
  [
    [1, -1, 3],
    [2, 13, 9],
  ],
  [
    [-1, 1],
    [2, 6, 16],
  ],
  [
    [-1, 6, 7],
    [5, 14, 3],
  ],
  [
    [11, -1],
    [12, 7, 1],
  ],
];
const completionIndexedSet2 = [
  [
    [-1, 3, 1],
    [4, 2, 5],
  ],
  [
    [-1, 4],
    [3, 11, 10],
  ],
  [
    [8, -1, 10],
    [9, 15, 4],
  ],

  [
    [-1, 15],
    [14, 8, 12],
  ],
];

// Indexes -1, if the index === -1 (missing syllable), replace by missing syllable sound
export const completionTrialListSet1 = completionIndexedSet1.map((trial) =>
  trial.map((pattern) => pattern.map((index) => (index === -1 ? "Ping" : items[index - 1])))
);

export const completionTrialListSet2 = completionIndexedSet2.map((trial) =>
  trial.map((pattern) => pattern.map((index) => (index === -1 ? "Ping" : items[index - 1])))
);
