import React, { useState, useEffect } from 'react';
import type { ScheduleBlock, CalendarEvent } from '../lib/types';
import ScheduleBlockList from './ScheduleBlockList';
import AvailabilityViewer from './AvailabilityViewer';

interface ScheduleSettingsProps {
  userId: string;
  googleCalendarEvents: CalendarEvent[];
}

export default function ScheduleSettings({ 
  userId, 
  googleCalendarEvents 
}: ScheduleSettingsProps) {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'blocks' | 'availability'>('blocks');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load schedule blocks on component mount
  useEffect(() => {
    loadScheduleBlocks();
  }, [userId]);

  const loadScheduleBlocks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/schedule-blocks?userId=${userId}`);
      // const blocks = await response.json();
      
      // Mock data for now
      const mockBlocks: ScheduleBlock[] = [
        {
          id: 'work-1',
          userId,
          title: 'Work Hours',
          type: 'work',
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          isRecurring: true,
          priority: 'high',
          isActive: true,
          timezone: 'UTC',
          description: 'Regular work hours',
          color: '#3b82f6',
          bufferBefore: 15,
          bufferAfter: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sleep-1',
          userId,
          title: 'Sleep Time',
          type: 'sleep',
          startTime: '23:00',
          endTime: '07:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          isRecurring: true,
          priority: 'high',
          isActive: true,
          timezone: 'UTC',
          description: 'Sleep schedule',
          color: '#6366f1',
          bufferBefore: 30,
          bufferAfter: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setScheduleBlocks(mockBlocks);
    } catch (err) {
      setError('Failed to load schedule blocks');
      console.error('Error loading schedule blocks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScheduleBlock = async (scheduleBlockData: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/schedule-blocks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(scheduleBlockData)
      // });
      // const newBlock = await response.json();
      
      // Mock creation for now
      const newBlock: ScheduleBlock = {
        ...scheduleBlockData,
        id: `block-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setScheduleBlocks(prev => [...prev, newBlock]);
    } catch (err) {
      console.error('Error creating schedule block:', err);
      throw err;
    }
  };

  const handleUpdateScheduleBlock = async (id: string, updates: Partial<ScheduleBlock>) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/schedule-blocks/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // const updatedBlock = await response.json();
      
      // Mock update for now
      setScheduleBlocks(prev => 
        prev.map(block => 
          block.id === id 
            ? { ...block, ...updates, updatedAt: new Date() }
            : block
        )
      );
    } catch (err) {
      console.error('Error updating schedule block:', err);
      throw err;
    }
  };

  const handleDeleteScheduleBlock = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/schedule-blocks/${id}`, { method: 'DELETE' });
      
      // Mock deletion for now
      setScheduleBlocks(prev => prev.filter(block => block.id !== id));
    } catch (err) {
      console.error('Error deleting schedule block:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-400 text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadScheduleBlocks}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Settings</h1>
        <p className="text-gray-600">
          Manage your schedule preferences and view availability for optimal event planning.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'blocks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedule Blocks ({scheduleBlocks.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Availability
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'blocks' && (
        <ScheduleBlockList
          scheduleBlocks={scheduleBlocks}
          onUpdate={handleUpdateScheduleBlock}
          onDelete={handleDeleteScheduleBlock}
          onCreate={handleCreateScheduleBlock}
          userId={userId}
        />
      )}

      {activeTab === 'availability' && (
        <AvailabilityViewer
          scheduleBlocks={scheduleBlocks}
          googleCalendarEvents={googleCalendarEvents}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      )}

      {/* Quick Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scheduleBlocks.length}</div>
            <div className="text-sm text-gray-600">Total Blocks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scheduleBlocks.filter(b => b.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Blocks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {scheduleBlocks.filter(b => b.isRecurring).length}
            </div>
            <div className="text-sm text-gray-600">Recurring</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {scheduleBlocks.filter(b => b.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
}
