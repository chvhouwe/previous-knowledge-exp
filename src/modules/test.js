let insertedIndices = []; // Keep track of the indices where catch trials have been inserted

for (let i = 0; i < this.catchTrials.length; i++) {
  let minDistance = 2; // Minimum distance between catch trials
  let insertLocation;
  do {
    insertLocation = getRandomInt(0, this.totalNumberOfPatterns + insertedIndices.length); // Adjust for the length of the list with inserted catch trials

    // Increment indices in insertedIndices that are >= insertLocation to account for the shift
    insertedIndices = insertedIndices.map((index) => (index >= insertLocation ? index + 1 : index));

    // Check if the new location is at least minDistance away from all previous insertions
    let tooClose = insertedIndices.some((index) => Math.abs(index - insertLocation) <= minDistance);
    if (!tooClose) break; // If not too close to any, use this location
    insertLocation = -1; // Reset if too close and retry
  } while (insertLocation === -1);

  if (insertLocation !== -1) {
    // If a valid location is found
    this.patternList.splice(insertLocation, 0, this.catchTrials[i]);
    insertedIndices.push(insertLocation);
    insertedIndices.sort((a, b) => a - b); // Keep the list sorted
  }
}
