import { formatEventTime, formatEventDate } from '../features/calendar/lib/event-utils'; 
import type { CalendarEvent } from '../features/calendar/models/Calendar.types';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface EventModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Event details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Date</h4>
            <p className="text-gray-600">{formatEventDate(event.start)}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Time</h4>
            <p className="text-gray-600">
              {formatEventTime(event.start, event.end, event.allDay)}
            </p>
          </div>
          
          {event.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          
          {event.location && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Location</h4>
              <p className="text-gray-600">{event.location}</p>
            </div>
          )}
          
          {event.url && (
            <div className="pt-4 border-t">
              <Button
                asChild
                className="inline-flex items-center"
              >
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Calendar
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
