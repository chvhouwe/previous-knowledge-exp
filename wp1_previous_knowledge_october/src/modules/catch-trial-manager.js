import { STREAM_ACTIVE } from "./stream";
export let AWAITING_RESPONSE = false;
export let CATCH_TRIAL_START_TIME = null;
export let CATCH_TRIAL_RESPONSE_LIST = [];
export let RESPONSE_TIMEOUT = null; // Holds the reference to the timeout
export let NUMBER_OF_CATCH_TRIALS = 0;

export const startCatchTrial = () => {
  AWAITING_RESPONSE = true;
  CATCH_TRIAL_START_TIME = performance.now();

  // Set a timeout for the response window (e.g., 1200 ms)
  RESPONSE_TIMEOUT = setTimeout(() => {
    if (AWAITING_RESPONSE && STREAM_ACTIVE) {
      // Check if still awaiting response
      // No response received in time
      CATCH_TRIAL_RESPONSE_LIST.push({ correct: false, rt: null, missed: true, isCatchTrial: true });
      NUMBER_OF_CATCH_TRIALS++;
      AWAITING_RESPONSE = false; // Reset the flag
    }
  }, 1200); // Adjust the time as needed
};

const setupEventListener = () => {
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && AWAITING_RESPONSE && STREAM_ACTIVE) {
      clearTimeout(RESPONSE_TIMEOUT); // Clear the response timeout

      const reactionTime = performance.now() - CATCH_TRIAL_START_TIME;
      CATCH_TRIAL_RESPONSE_LIST.push({ correct: true, rt: reactionTime, missed: false, isCatchTrial: true });
      NUMBER_OF_CATCH_TRIALS++;
      AWAITING_RESPONSE = false; // Reset the flag
    } else if (event.code === "Space" && !AWAITING_RESPONSE && STREAM_ACTIVE) {
      CATCH_TRIAL_RESPONSE_LIST.push({ correct: false, rt: null, missed: false, isCatchTrial: false });
    }
  });
};

// Initialize the event listener when the module is loaded
setupEventListener();
