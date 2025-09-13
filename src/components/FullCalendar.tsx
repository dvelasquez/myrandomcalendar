import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import React, { useEffect, useRef } from 'react';

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
}

export default function FullCalendarComponent({ 
  events, 
  onEventClick, 
  onDateClick 
}: FullCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarInstanceRef = useRef<Calendar | null>(null);

  useEffect(() => {
    if (!calendarRef.current) return;

    // Initialize FullCalendar
    const calendar = new Calendar(calendarRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: events,
      eventClick: (info) => {
        if (onEventClick) {
          onEventClick({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start?.toISOString() || '',
            end: info.event.end?.toISOString(),
            allDay: info.event.allDay,
            description: info.event.extendedProps.description,
            location: info.event.extendedProps.location,
            url: info.event.url
          });
        }
      },
      dateClick: (info) => {
        if (onDateClick) {
          onDateClick(info.date);
        }
      },
      height: 'auto',
      aspectRatio: 1.8,
      dayMaxEvents: true,
      moreLinkClick: 'popover',
      eventDisplay: 'block',
      eventTextColor: '#ffffff',
      eventBackgroundColor: '#3b82f6',
      eventBorderColor: '#1d4ed8',
      weekends: true,
      editable: false,
      selectable: true,
      selectMirror: true,
      dayMaxEventRows: true,
      handleWindowResize: true,
      locale: 'en',
      buttonText: {
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day'
      }
    });

    calendar.render();
    calendarInstanceRef.current = calendar;

    // Cleanup
    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
      }
    };
  }, []);

  // Update events when they change
  useEffect(() => {
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.removeAllEvents();
      calendarInstanceRef.current.addEventSource(events);
    }
  }, [events]);

  return (
    <div className="w-full">
      <div ref={calendarRef} className="w-full"></div>
    </div>
  );
}
