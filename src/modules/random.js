"use strict";
export function getRandomInt(min, max) {
  /**
   * Generates a random integer within the inclusive range of [min, max].
   *
   * @param {number} min - The minimum value of the range (inclusive).
   * @param {number} max - The maximum value of the range (inclusive).
   * @returns {number} A random integer within the specified inclusive range.
   */

  // Make sure both min and max values are integers
  min = Math.ceil(min);
  max = Math.floor(max);

  // Generate a random integer within the inclusive range [min, max]
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function fischerYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (getRandomInt => inclusive [min,max])
    const randomIndex = getRandomInt(0, i);

    // Swap the elements at randomIndex and i
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
}

// Mulberry32 random number generator function
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
