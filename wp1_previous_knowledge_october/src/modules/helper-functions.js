"use strict";
/**
 * Compares two arrays to check if they are equal in length and have the same elements at each corresponding index.
 * @param {Array} a - The first array to compare.
 * @param {Array} b - The second array to compare.
 * @returns {boolean} - True if the arrays are equal, false otherwise.
 */
export const arraysEqual = (a, b) =>
  a.length === b.length && // Make sure both arrays have the same length
  a.every((element, index) => element === b[index]); // Check whether they are equal at every index

export function convertToStimulusList(array, pathStimuli, fileFormat) {
  // convert to stimulus list expected by jsPsych
  // add path to object {stimulus: path/stimulus}
  return array.map((item) => ({ stimulus: pathStimuli + item.stimulus + fileFormat }));
}

export function getBrowserInfo() {
  var ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return "IE " + (tem[1] || "");
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return { browser: M[0], version: M[1] };
}
export function damerauLevenshtein(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  const d = Array.from({ length: lenA + 2 }, () => Array(lenB + 2));
  const maxDist = lenA + lenB;
  const da = {};

  d[0][0] = maxDist;
  for (let i = 0; i <= lenA; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    let db = 0;
    for (let j = 1; j <= lenB; j++) {
      const k = da[b[j - 1]] || 0;
      const l = db;
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
        db = j;
      }
      d[i + 1][j + 1] = Math.min(
        d[i][j] + cost, // substitution
        d[i + 1][j] + 1, // insertion
        d[i][j + 1] + 1, // deletion
        d[k][l] + (i - k - 1) + 1 + (j - l - 1) // transposition
      );
    }
    da[a[i - 1]] = i;
  }
  return d[lenA + 1][lenB + 1];
}

// A function to test the Damerau-Levenshtein algorithm
function runTestsDL() {
  const testCases = [
    { a: "kitten", b: "sitting", expected: 3 },
    { a: "saturday", b: "sunday", expected: 3 },
    { a: "abcd", b: "acbd", expected: 1 }, // One transposition
    { a: "abcd", b: "abcd", expected: 0 }, // Identical strings
    { a: "", b: "abc", expected: 3 }, // One string is empty
    // Add more test cases as needed
  ];

  testCases.forEach((test, index) => {
    const result = damerauLevenshtein(test.a, test.b);
    console.assert(result === test.expected, `Test ${index + 1} failed: Expected ${test.expected}, got ${result}`);
  });

  console.log("All tests completed.");
}
