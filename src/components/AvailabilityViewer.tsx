import { startOfDay, endOfDay, subDays, addDays, set, isBefore, isAfter } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { scheduleBlocksToCalendarEvents, combineCalendarEvents } from '../lib/schedule-transformers';
import type { ScheduleBlock, CalendarEvent } from '../lib/types';

interface AvailabilityViewerProps {
  scheduleBlocks: ScheduleBlock[];
  googleCalendarEvents: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface TimeSlot {
  start: string;
  end: string;
  type: 'available' | 'busy' | 'schedule-block';
  title?: string;
  priority?: string;
  color?: string;
}

export default function AvailabilityViewer({
  scheduleBlocks,
  googleCalendarEvents,
  selectedDate,
  onDateChange
}: AvailabilityViewerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Generate time slots for the selected date
  useEffect(() => {
    const startOfDayDate = startOfDay(selectedDate);
    const endOfDayDate = endOfDay(selectedDate);

    // Generate schedule block events for the day and previous day (for overnight events)
    const previousDay = subDays(startOfDayDate, 1);
    
    const scheduleBlockEvents = [
      ...scheduleBlocksToCalendarEvents(
        scheduleBlocks.filter(block => block.isActive),
        previousDay,
        endOfDayDate
      )
    ];

    // Filter Google Calendar events to include those that might overlap with the current day
    // This includes events from the previous day that continue into the current day
    const relevantGoogleEvents = googleCalendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end || event.start);
      
      // Include events that overlap with the current day using date-fns
      return isBefore(eventStart, endOfDayDate) && isAfter(eventEnd, startOfDayDate);
    });

    // Combine with Google Calendar events
    const allEvents = combineCalendarEvents(relevantGoogleEvents, scheduleBlockEvents);

    // Generate hourly time slots using date-fns
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const slotStart = set(startOfDayDate, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
      const slotEnd = set(startOfDayDate, { hours: hour + 1, minutes: 0, seconds: 0, milliseconds: 0 });

      // Check if this slot conflicts with any events using date-fns
      const conflictingEvent = allEvents.find(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end || event.start);
        
        // Check if the event overlaps with this time slot using date-fns
        // An event conflicts if:
        // 1. Event starts before slot ends AND event ends after slot starts
        // 2. This covers all overlap scenarios including overnight events
        return isBefore(eventStart, slotEnd) && isAfter(eventEnd, slotStart);
      });

      if (conflictingEvent) {
        const isScheduleBlock = conflictingEvent.extendedProps?.isScheduleBlock;
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: isScheduleBlock ? 'schedule-block' : 'busy',
          title: conflictingEvent.title,
          priority: conflictingEvent.extendedProps?.priority,
          color: conflictingEvent.backgroundColor
        });
      } else {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          type: 'available'
        });
      }
    }

    setTimeSlots(slots);
  }, [scheduleBlocks, googleCalendarEvents, selectedDate]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSlotColor = (slot: TimeSlot) => {
    switch (slot.type) {
      case 'available':
        return 'bg-green-100 border-green-200';
      case 'busy':
        return 'bg-red-100 border-red-200';
      case 'schedule-block':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getSlotTextColor = (slot: TimeSlot) => {
    switch (slot.type) {
      case 'available':
        return 'text-green-800';
      case 'busy':
        return 'text-red-800';
      case 'schedule-block':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getSlotIcon = (slot: TimeSlot) => {
    switch (slot.type) {
      case 'available':
        return '✅';
      case 'busy':
        return '❌';
      case 'schedule-block':
        return '📅';
      default:
        return '❓';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    if (viewMode === 'day') {
      newDate = addDays(selectedDate, direction === 'next' ? 1 : -1);
    } else {
      newDate = addDays(selectedDate, direction === 'next' ? 7 : -7);
    }
    onDateChange(newDate);
  };

  const availableSlots = timeSlots.filter(slot => slot.type === 'available');
  const busySlots = timeSlots.filter(slot => slot.type === 'busy');
  const scheduleSlots = timeSlots.filter(slot => slot.type === 'schedule-block');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-md">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'day' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              ←
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">✅</span>
            <div>
              <div className="text-sm font-medium text-green-800">Available</div>
              <div className="text-lg font-bold text-green-900">{availableSlots.length}h</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📅</span>
            <div>
              <div className="text-sm font-medium text-blue-800">Schedule Blocks</div>
              <div className="text-lg font-bold text-blue-900">{scheduleSlots.length}h</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">❌</span>
            <div>
              <div className="text-sm font-medium text-red-800">Busy</div>
              <div className="text-lg font-bold text-red-900">{busySlots.length}h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="space-y-2">
        {timeSlots.map((slot, index) => {
          const startTime = new Date(slot.start);
          const endTime = new Date(slot.end);
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-3 transition-colors ${getSlotColor(slot)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getSlotIcon(slot)}</span>
                  <div>
                    <div className={`font-medium ${getSlotTextColor(slot)}`}>
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </div>
                    {slot.title && (
                      <div className={`text-sm ${getSlotTextColor(slot)} opacity-75`}>
                        {slot.title}
                        {slot.priority && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white bg-opacity-50">
                            {slot.priority}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`text-sm font-medium ${getSlotTextColor(slot)}`}>
                  {slot.type === 'available' && 'Available'}
                  {slot.type === 'busy' && 'Busy'}
                  {slot.type === 'schedule-block' && 'Scheduled'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span className="text-green-800">Available - Free time for new events</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span className="text-blue-800">Scheduled - Your schedule blocks</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span className="text-red-800">Busy - Existing calendar events</span>
          </div>
        </div>
      </div>
    </div>
  );
}
