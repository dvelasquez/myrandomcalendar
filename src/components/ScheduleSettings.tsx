import { actions } from 'astro:actions';
import { useState } from 'react';
import type { ScheduleBlock, CalendarEvent } from '../lib/types';
import AvailabilityViewer from './AvailabilityViewer'; 
import ScheduleBlockList from './ScheduleBlockList';

interface ScheduleSettingsProps {
  userId: string;
  googleCalendarEvents: CalendarEvent[];
  initialScheduleBlocks: ScheduleBlock[];
}

export default function ScheduleSettings({ 
  userId, 
  googleCalendarEvents,
  initialScheduleBlocks
}: ScheduleSettingsProps) {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(initialScheduleBlocks);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'blocks' | 'availability'>('blocks');

  const handleCreateScheduleBlock = async (scheduleBlockData: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleBlock> => {
    try {
      const formData = new FormData();
      formData.append('title', scheduleBlockData.title);
      formData.append('type', scheduleBlockData.type);
      formData.append('startTime', scheduleBlockData.startTime);
      formData.append('endTime', scheduleBlockData.endTime);
      formData.append('daysOfWeek', JSON.stringify(scheduleBlockData.daysOfWeek));
      formData.append('isRecurring', scheduleBlockData.isRecurring.toString());
      formData.append('priority', scheduleBlockData.priority);
      formData.append('isActive', scheduleBlockData.isActive.toString());
      formData.append('timezone', scheduleBlockData.timezone);
      if (scheduleBlockData.startDate) formData.append('startDate', scheduleBlockData.startDate.toISOString());
      if (scheduleBlockData.endDate) formData.append('endDate', scheduleBlockData.endDate.toISOString());
      if (scheduleBlockData.description) formData.append('description', scheduleBlockData.description);
      formData.append('color', scheduleBlockData.color);
      formData.append('bufferBefore', scheduleBlockData.bufferBefore.toString());
      formData.append('bufferAfter', scheduleBlockData.bufferAfter.toString());
      
      const result = await actions.createScheduleBlockAction(formData);
      
      if (result.data?.success && result.data.data) {
        setScheduleBlocks(prev => [...prev, result.data.data!]);
        return result.data.data!;
      } else {
        throw new Error(result.error?.message || 'Failed to create schedule block');
      }
    } catch (err: unknown) {
      console.error('Error creating schedule block:', err);
      throw err;
    }
  };

  const handleUpdateScheduleBlock = async (id: string, updates: Partial<ScheduleBlock>): Promise<ScheduleBlock> => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      if (updates.title !== undefined) formData.append('title', updates.title);
      if (updates.type !== undefined) formData.append('type', updates.type);
      if (updates.startTime !== undefined) formData.append('startTime', updates.startTime);
      if (updates.endTime !== undefined) formData.append('endTime', updates.endTime);
      if (updates.daysOfWeek !== undefined) formData.append('daysOfWeek', JSON.stringify(updates.daysOfWeek));
      if (updates.isRecurring !== undefined) formData.append('isRecurring', updates.isRecurring.toString());
      if (updates.priority !== undefined) formData.append('priority', updates.priority);
      if (updates.isActive !== undefined) formData.append('isActive', updates.isActive.toString());
      if (updates.timezone !== undefined) formData.append('timezone', updates.timezone);
      if (updates.startDate !== undefined) formData.append('startDate', updates.startDate.toISOString());
      if (updates.endDate !== undefined) formData.append('endDate', updates.endDate.toISOString());
      if (updates.description !== undefined) formData.append('description', updates.description);
      if (updates.color !== undefined) formData.append('color', updates.color);
      if (updates.bufferBefore !== undefined) formData.append('bufferBefore', updates.bufferBefore.toString());
      if (updates.bufferAfter !== undefined) formData.append('bufferAfter', updates.bufferAfter.toString());
      
      const result = await actions.updateScheduleBlockAction(formData);
      
      if (result.data?.success && result.data.data) {
        setScheduleBlocks(prev => 
          prev.map(block => 
            block.id === id ? result.data.data! : block
          )
        );
        return result.data.data!;
      } else {
        throw new Error(result.error?.message || 'Failed to update schedule block');
      }
    } catch (err: unknown) {
      console.error('Error updating schedule block:', err);
      throw err;
    }
  };

  const handleDeleteScheduleBlock = async (id: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      await actions.deleteScheduleBlockAction(formData);
      
      setScheduleBlocks(prev => prev.filter(block => block.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting schedule block:', err);
      throw err;
    }
  };

  const handleCreateDefaultScheduleBlocks = async (): Promise<void> => {
    try {
      const formData = new FormData();
      
      const result = await actions.createDefaultScheduleBlocksAction(formData);
      
      if (result.data?.success && result.data.data) {
        setScheduleBlocks(prev => [...prev, ...result.data.data!]);
        alert(result.data.message || 'Default schedule blocks created successfully!');
      } else {
        alert(result.error?.message || 'Failed to create default schedule blocks');
      }
    } catch (err: unknown) {
      console.error('Error creating default schedule blocks:', err);
      alert(err instanceof Error ? err.message : 'Failed to create default schedule blocks');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Settings</h1>
            <p className="text-gray-600">
              Manage your schedule preferences and view availability for optimal event planning.
            </p>
          </div>
          {scheduleBlocks.length === 0 && (
            <button
              onClick={handleCreateDefaultScheduleBlocks}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Create Default Schedule
            </button>
          )}
        </div>
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
