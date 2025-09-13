import type { EventClickArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import React, { useRef, useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
}

interface FullCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  showEventModal?: boolean;
}

export default function FullCalendarComponent({ 
  events, 
  onEventClick, 
  onDateClick,
  showEventModal = true
}: FullCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  const handleEventClick = (info: EventClickArg) => {
    // Prevent default link behavior
    info.jsEvent.preventDefault();
    
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start?.toISOString() || '',
      end: info.event.end?.toISOString(),
      allDay: info.event.allDay,
      description: info.event.extendedProps.description,
      location: info.event.extendedProps.location,
      url: info.event.url
    };

    if (showEventModal) {
      setSelectedEvent(eventData);
      setIsModalOpen(true);
    } else if (onEventClick) {
      onEventClick(eventData);
    }
  };

  const handleDateClick = (info: { date: Date }) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  const handleEventDidMount = (info: EventMountArg) => {
    // Remove any existing href attributes
    const element = info.el as HTMLAnchorElement;
    if (element.href) {
      element.removeAttribute('href');
    }
    // Ensure cursor is pointer for clickable events
    info.el.style.cursor = 'pointer';
  };

  // Helper function to format dates nicely
  const formatEventTime = (startDate: string, endDate?: string, allDay?: boolean) => {
    if (allDay) {
      return 'All Day Event';
    }

    try {
      const start = parseISO(startDate);
      const end = endDate ? parseISO(endDate) : null;

      // Format start time
      const startTime = format(start, 'h:mm a');
      
      if (!end) {
        return startTime;
      }

      // Check if it's the same day
      const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');
      
      if (isSameDay) {
        const endTime = format(end, 'h:mm a');
        return `${startTime} - ${endTime}`;
      } else {
        const endTime = format(end, 'h:mm a');
        return `${startTime} - ${endTime}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatEventDate = (startDate: string) => {
    try {
      const date = parseISO(startDate);
      
      if (isToday(date)) {
        return 'Today';
      } else if (isTomorrow(date)) {
        return 'Tomorrow';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'EEEE, MMMM d, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="w-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDidMount={handleEventDidMount}
        height="auto"
        aspectRatio={1.8}
        dayMaxEvents={true}
        moreLinkClick="popover"
        eventDisplay="block"
        eventTextColor="#ffffff"
        eventBackgroundColor="#3b82f6"
        eventBorderColor="#1d4ed8"
        weekends={true}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEventRows={true}
        handleWindowResize={true}
        locale="en"
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }}
      />
      
      {/* Event Details Modal */}
      {isModalOpen && selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 event-modal"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto event-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Date</h4>
                  <p className="text-gray-600">{formatEventDate(selectedEvent.start)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Time</h4>
                  <p className="text-gray-600">
                    {formatEventTime(selectedEvent.start, selectedEvent.end, selectedEvent.allDay)}
                  </p>
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Location</h4>
                    <p className="text-gray-600">{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.url && (
                  <div className="pt-4 border-t">
                    <a
                      href={selectedEvent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Open in Google Calendar
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
