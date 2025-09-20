/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "60 min", "1h", "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format frequency and count to human-readable string
 * @param frequency - The frequency type (daily, weekly, monthly)
 * @param count - How many times per frequency
 * @returns Formatted frequency string (e.g., "Daily", "3 times per week")
 */
export function formatFrequency(frequency: string, count: number): string {
  if (frequency === 'daily') {
    return count === 1 ? 'Daily' : `${count} times daily`;
  } else if (frequency === 'weekly') {
    return count === 1 ? 'Weekly' : `${count} times per week`;
  } else if (frequency === 'monthly') {
    return count === 1 ? 'Monthly' : `${count} times per month`;
  }
  return `${count} times ${frequency}`;
}

/**
 * Get category color for UI display
 * @param category - The category name
 * @returns Color class string for Tailwind CSS
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    exercise: 'bg-green-100 text-green-800',
    personal: 'bg-blue-100 text-blue-800',
    family: 'bg-purple-100 text-purple-800',
    work: 'bg-gray-100 text-gray-800',
    health: 'bg-red-100 text-red-800',
    hobby: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };
  
  return colorMap[category] || colorMap.other;
}
