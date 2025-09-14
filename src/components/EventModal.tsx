import React, { useEffect } from 'react';
import { formatEventTime, formatEventDate } from '../lib/event-utils'; 
import type { CalendarEvent } from '../lib/types';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}


export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !event) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 event-modal"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto event-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
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
                <a
                  href={event.url}
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
  );
}
