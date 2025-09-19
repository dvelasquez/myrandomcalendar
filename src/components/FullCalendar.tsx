import type { EventClickArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRef, useState } from 'react';
import type { CalendarEvent } from '../features/calendar/models/Calendar.types';
import EventModal from './EventModal';

interface FullCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  showEventModal?: boolean;
}

export default function FullCalendarComponent({ 
  events, 
  onEventClick, 
  onDateClick,
  onDateRangeChange,
  showEventModal = true
}: FullCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDatesSet = (info: { start: Date; end: Date }) => {
    if (onDateRangeChange) {
      onDateRangeChange(info.start, info.end);
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
        datesSet={handleDatesSet}
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
      
      <EventModal 
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
