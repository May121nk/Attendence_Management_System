export const STANDARD_SHIFT_HOURS = 8;

export const getHoursStatus = (totalHours) =>
  totalHours >= STANDARD_SHIFT_HOURS ? "Completed" : "Incomplete";
