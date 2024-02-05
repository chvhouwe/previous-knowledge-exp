import { mulberry32 } from "./random";

function createSeededGenerator(seed) {
  let prng = mulberry32(seed);
  return (min, max) => {
    return Math.floor(prng() * (max - min + 1)) + min;
  };
}
export function selectTriplets(sonaId, qrTripletsHighFrequency, qrTripletsLowFrequency, frTriplets) {
  let selected = [];

  const getRandomIntSeeded = createSeededGenerator(sonaId);
  let randomList = [];
  // qr high frequency triplets
  let randomIndex = getRandomIntSeeded(0, 1);
  randomList.push(randomIndex);

  selected.push(qrTripletsHighFrequency[randomIndex]);

  randomIndex = getRandomIntSeeded(0, 1);
  randomList.push(randomIndex);

  selected.push(qrTripletsLowFrequency[randomIndex]);
  for (let i = 0; i < 2; i++) {
    randomIndex = getRandomIntSeeded(0, frTriplets.length - 1); // -1 because getRandomInt is inclusive on both boundaries
    randomList.push(randomIndex);

    selected.push(frTriplets[randomIndex]);

    frTriplets.splice(randomIndex, 1); // remove the triplet so it can't be selected again
  }

  return selected;
}
