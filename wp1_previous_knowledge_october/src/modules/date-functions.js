export function calculateNextPart() {
  // Get the current date and time
  const now = new Date();

  // Add 144 hours (6 days) to the current time
  // There are 24 hours in a day, so 6 days * 24 hours = 144 hours
  // The value for hours in the Date object's setHours method can exceed 24, and the Date object will correctly calculate the resulting date
  const hoursToAdd = 144;
  const futureDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000); // getTime returns milliseconds, so convert hours to milliseconds

  // Format the futureDate to a readable string, if necessary
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const futureDateString = futureDate.toLocaleDateString("nl-BE", options); // Adjust 'en-US' to your locale if needed

  return `Het volgende deel zal beschikbaar zijn op: ${futureDateString}`;
}
