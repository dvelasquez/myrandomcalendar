// Simple test to verify schedule transformer logic
function parseTime(timeString) {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return { hours, minutes };
  } catch {
    return null;
  }
}

function generateEventForDate(block, date) {
  try {
    // Parse start and end times
    const startTime = parseTime(block.startTime);
    const endTime = parseTime(block.endTime);
    
    if (!startTime || !endTime) {
      console.warn('Invalid time format for schedule block:', block.id);
      return null;
    }
    
    // Create start datetime
    const startDateTime = new Date(date);
    startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
    
    // Create end datetime
    const endDateTime = new Date(date);
    endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);
    
    // Handle overnight events (e.g., sleep from 22:00 to 06:00)
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    // Apply buffer times
    const bufferedStart = new Date(startDateTime.getTime() - block.bufferBefore * 60 * 1000);
    const bufferedEnd = new Date(endDateTime.getTime() + block.bufferAfter * 60 * 1000);
    
    return {
      id: `${block.id}-${date.toISOString().split('T')[0]}`,
      title: block.title,
      start: bufferedStart.toISOString(),
      end: bufferedEnd.toISOString(),
      allDay: false,
      description: block.description,
      backgroundColor: block.color,
      extendedProps: {
        scheduleBlockId: block.id,
        scheduleBlockType: block.type,
        priority: block.priority,
        isScheduleBlock: true
      }
    };
  } catch (error) {
    console.error('Error generating event for schedule block:', block.id, error);
    return null;
  }
}

// Test the schedule transformer with sleep schedule
const testSleepBlock = {
  id: 'sleep-test',
  userId: 'test-user',
  title: 'Sleep Time',
  type: 'sleep',
  startTime: '23:00',
  endTime: '07:00',
  daysOfWeek: [1], // Monday only for testing
  isRecurring: true,
  priority: 'high',
  isActive: true,
  timezone: 'UTC',
  description: 'Test sleep schedule',
  color: '#6366f1',
  bufferBefore: 30,
  bufferAfter: 30,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Test with a Monday date
const testDate = new Date('2024-01-15'); // This is a Monday

console.log('Testing sleep schedule generation...');
console.log('Test date:', testDate.toISOString());
console.log('Day of week:', testDate.getDay()); // Should be 1 (Monday)

const generatedEvent = generateEventForDate(testSleepBlock, testDate);

console.log('Generated event:', generatedEvent);

if (generatedEvent) {
  console.log('Sleep event details:');
  console.log('- Start:', generatedEvent.start);
  console.log('- End:', generatedEvent.end);
  
  const startTime = new Date(generatedEvent.start);
  const endTime = new Date(generatedEvent.end);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  console.log('- Duration:', durationMs, 'ms');
  console.log('- Duration in hours:', durationHours);
  
  // Check if it spans midnight correctly
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  console.log('- Start hour:', startHour);
  console.log('- End hour:', endHour);
  console.log('- Spans midnight:', endHour < startHour);
} else {
  console.log('No event generated!');
}