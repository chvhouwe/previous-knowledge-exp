export let awaitingResponse = false;
export let catchTrialStartTime = null;
export let catchTrialResponseList = [];
export let responseTimeout = null; // Holds the reference to the timeout
export let numberOfCatchTrials = 0;

export const startCatchTrial = () => {
  awaitingResponse = true;
  catchTrialStartTime = performance.now();

  // Set a timeout for the response window (e.g., 1200 ms)
  responseTimeout = setTimeout(() => {
    if (awaitingResponse) {
      // Check if still awaiting response
      // No response received in time
      catchTrialResponseList.push({ correct: false, rt: null, missed: true, isCatchTrial: true });
      numberOfCatchTrials++;
      awaitingResponse = false; // Reset the flag
    }
  }, 1200); // Adjust the time as needed
};

const setupEventListener = () => {
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && awaitingResponse) {
      clearTimeout(responseTimeout); // Clear the response timeout

      const reactionTime = performance.now() - catchTrialStartTime;
      catchTrialResponseList.push({ correct: true, rt: reactionTime, missed: false, isCatchTrial: true });
      numberOfCatchTrials++;
      awaitingResponse = false; // Reset the flag
    } else if (event.code === "Space" && !awaitingResponse) {
      catchTrialResponseList.push({ correct: false, rt: null, missed: false, isCatchTrial: false });
    }
  });
};

// Initialize the event listener when the module is loaded
setupEventListener();
