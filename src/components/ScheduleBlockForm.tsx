import React, { useState, useEffect } from 'react';
import { validateScheduleBlock, getDefaultColorForScheduleType } from '../lib/schedule-transformers';
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from '../lib/types';

interface ScheduleBlockFormProps {
  scheduleBlock?: ScheduleBlock;
  onSave: (scheduleBlock: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  userId: string;
}

const SCHEDULE_TYPES: { value: ScheduleBlockType; label: string; description: string }[] = [
  { value: 'work', label: 'Work', description: 'Work hours and professional commitments' },
  { value: 'sleep', label: 'Sleep', description: 'Sleep schedule and rest time' },
  { value: 'personal', label: 'Personal', description: 'Personal time, hobbies, and relaxation' },
  { value: 'travel', label: 'Travel', description: 'Commute time and transportation' },
  { value: 'meal', label: 'Meals', description: 'Meal times and eating schedules' },
  { value: 'exercise', label: 'Exercise', description: 'Gym, workout, and physical activity' },
  { value: 'family', label: 'Family', description: 'Family time and family commitments' },
  { value: 'study', label: 'Study', description: 'Learning, studying, and education' },
  { value: 'other', label: 'Other', description: 'Custom categories and other activities' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

const PRIORITIES: { value: SchedulePriority; label: string; description: string }[] = [
  { value: 'high', label: 'High', description: 'Critical time that cannot be interrupted' },
  { value: 'medium', label: 'Medium', description: 'Important time with some flexibility' },
  { value: 'low', label: 'Low', description: 'Flexible time that can be adjusted' }
];

export default function ScheduleBlockForm({ 
  scheduleBlock, 
  onSave, 
  onCancel, 
  userId 
}: ScheduleBlockFormProps) {
  const [formData, setFormData] = useState({
    title: scheduleBlock?.title || '',
    type: scheduleBlock?.type || 'work' as ScheduleBlockType,
    startTime: scheduleBlock?.startTime || '09:00',
    endTime: scheduleBlock?.endTime || '17:00',
    daysOfWeek: scheduleBlock?.daysOfWeek || [1, 2, 3, 4, 5], // Default to Mon-Fri
    isRecurring: scheduleBlock?.isRecurring ?? true,
    priority: scheduleBlock?.priority || 'medium' as SchedulePriority,
    isActive: scheduleBlock?.isActive ?? true,
    timezone: scheduleBlock?.timezone || 'UTC',
    description: scheduleBlock?.description || '',
    color: scheduleBlock?.color || getDefaultColorForScheduleType(scheduleBlock?.type || 'work'),
    bufferBefore: scheduleBlock?.bufferBefore || 0,
    bufferAfter: scheduleBlock?.bufferAfter || 0
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update color when type changes
  useEffect(() => {
    if (!scheduleBlock) {
      setFormData(prev => ({
        ...prev,
        color: getDefaultColorForScheduleType(formData.type)
      }));
    }
  }, [formData.type, scheduleBlock]);

  const handleInputChange = (field: string, value: string | ScheduleBlockType | SchedulePriority | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validationErrors = validateScheduleBlock(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Prepare data for saving
      const scheduleBlockData = {
        userId,
        title: formData.title.trim(),
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        daysOfWeek: formData.daysOfWeek,
        isRecurring: formData.isRecurring,
        priority: formData.priority,
        isActive: formData.isActive,
        timezone: formData.timezone,
        description: formData.description.trim(),
        color: formData.color,
        bufferBefore: formData.bufferBefore,
        bufferAfter: formData.bufferAfter
      };

      onSave(scheduleBlockData);
    } catch (error) {
      console.error('Error saving schedule block:', error);
      setErrors(['Failed to save schedule block. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {scheduleBlock ? 'Edit Schedule Block' : 'Add Schedule Block'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Please fix the following errors:</h3>
          <ul className="list-disc list-inside mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Work Hours, Sleep Time"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as ScheduleBlockType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {SCHEDULE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {SCHEDULE_TYPES.find(t => t.value === formData.type)?.description}
            </p>
          </div>
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="time"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of Week *
          </label>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  formData.daysOfWeek.includes(day.value)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{day.short}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select the days when this schedule applies
          </p>
        </div>

        {/* Priority and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as SchedulePriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {PRIORITIES.find(p => p.value === formData.priority)?.description}
            </p>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>

        {/* Buffer Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="bufferBefore" className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Before (minutes)
            </label>
            <input
              type="number"
              id="bufferBefore"
              value={formData.bufferBefore}
              onChange={(e) => handleInputChange('bufferBefore', parseInt(e.target.value) || 0)}
              min="0"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time to prepare before this activity (e.g., commute time)
            </p>
          </div>

          <div>
            <label htmlFor="bufferAfter" className="block text-sm font-medium text-gray-700 mb-2">
              Buffer After (minutes)
            </label>
            <input
              type="number"
              id="bufferAfter"
              value={formData.bufferAfter}
              onChange={(e) => handleInputChange('bufferAfter', parseInt(e.target.value) || 0)}
              min="0"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time to wrap up after this activity (e.g., cleanup time)
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description or notes about this schedule block"
          />
        </div>

        {/* Settings */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Recurring</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : scheduleBlock ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
