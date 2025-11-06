// Convert datetime-local string to timestamp (preserving local time)
export const datetimeLocalToTimestamp = (datetimeString: string): number => {
  if (!datetimeString) return Date.now();

  // Create date in local timezone
  const localDate = new Date(datetimeString);

  // Return timestamp (already correct for local timezone)
  return localDate.getTime();
};

// Convert timestamp to string datetime-local
export const timestampToDatetimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Format timestamp for display
export const formatTimestampForDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validate if the timestamp is in the future
export const isFutureTimestamp = (timestamp: number): boolean => {
  return timestamp > Date.now();
};

// Create timestamp for X days from now (useful for default values)
export const createFutureTimestamp = (daysFromNow: number = 7): number => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysFromNow);
  return futureDate.getTime();
};
