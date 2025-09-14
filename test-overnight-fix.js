// Test the fix for overnight events
function testOvernightFix() {
  // Sleep event: 21:30 to 06:30 next day
  const sleepEvent = {
    start: '2024-01-15T21:30:00.000Z',
    end: '2024-01-16T06:30:00.000Z',
    extendedProps: {
      scheduleBlockType: 'sleep',
      isScheduleBlock: true
    }
  };
  
  const testDate = new Date('2024-01-15');
  const startOfDay = new Date(testDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  console.log('Testing overnight fix...');
  console.log('Sleep event:', sleepEvent);
  
  // Test each hour slot
  for (let hour = 0; hour < 24; hour++) {
    const slotStart = new Date(startOfDay);
    slotStart.setHours(hour, 0, 0, 0);
    
    const slotEnd = new Date(startOfDay);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    const eventStart = new Date(sleepEvent.start);
    const eventEnd = new Date(sleepEvent.end);
    
    // Check if the event overlaps with this time slot
    const conflicts = eventStart < slotEnd && eventEnd > slotStart;
    
    const shouldConflict = (hour >= 21 || hour < 6); // Expected conflicts
    const isCorrect = conflicts === shouldConflict;
    
    console.log(`Slot ${hour}:00-${hour + 1}:00:`, {
      conflicts,
      shouldConflict,
      isCorrect: isCorrect ? '✅' : '❌'
    });
  }
}

testOvernightFix();
