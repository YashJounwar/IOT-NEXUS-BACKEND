// find the time range for the observation of particular hour of the day
export function isWithinTimeRange() {
    const currentDate = new Date();
    const startTime = new Date(currentDate);
    const endTime = new Date(currentDate);
  
    // Set start time to 8:55 AM
    startTime.setHours(15, 55, 0, 0);
  
    // Set end time to 6:00 PM
    endTime.setHours(18, 0, 0, 0);

    // Check if the current time is within the time range
    return currentDate >= startTime && currentDate <= endTime;
  }