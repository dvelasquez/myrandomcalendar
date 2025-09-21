import React from 'react';
import { Button } from '@/components/ui/button';
import ButtonLink from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PeriodicEvent } from '@/features/periodic-events/models/PeriodicEvents.types';
import type { PeriodicEventsCreatePageData } from '@/features/periodic-events/services/page-handler';

interface PeriodicEventFormProps {
  initialData?: Partial<PeriodicEvent>;
  formOptions: PeriodicEventsCreatePageData['formOptions'];
}

export default function PeriodicEventForm({
  initialData,
  formOptions,
}: PeriodicEventFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      // Import actions dynamically to avoid server-side issues
      const { actions } = await import('astro:actions');

      const result = await actions.periodicEvents.create(formData);

      if (!result.error) {
        // Redirect on success
        window.location.href = '/periodic-events?success=created';
      } else {
        // Handle error - could show error message
        console.error('Form submission error:', result.error);
        alert('Error: ' + result.error.message);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      alert('Form submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-gray-700 mb-2">
          Activity Title *
        </Label>
        <Input
          type="text"
          id="title"
          name="title"
          defaultValue={initialData?.title || ''}
          className="w-full"
          placeholder="e.g., Go to the gym, Walk the dogs, Read books"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-gray-700 mb-2">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          className="w-full"
          placeholder="Add more details about this activity..."
          defaultValue={initialData?.description || ''}
        />
      </div>

      {/* Frequency and Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequency" className="text-gray-700 mb-2">
            Frequency *
          </Label>
          <Select
            name="frequency"
            defaultValue={initialData?.frequency || 'weekly'}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.frequencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="frequencyCount" className="text-gray-700 mb-2">
            How Many Times *
          </Label>
          <Input
            type="number"
            id="frequencyCount"
            name="frequencyCount"
            min="1"
            max="31"
            defaultValue={initialData?.frequencyCount || 3}
            className="w-full"
            placeholder="3"
            required
          />
          <p className="text-xs text-gray-500 mt-1">e.g., 3 times a week</p>
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label htmlFor="duration" className="text-gray-700 mb-2">
          Duration (minutes) *
        </Label>
        <Input
          type="number"
          id="duration"
          name="duration"
          min="1"
          max="1440"
          defaultValue={initialData?.duration || 60}
          className="w-full"
          placeholder="60"
          required
        />
        <p className="text-xs text-gray-500 mt-1">e.g., 60 minutes = 1 hour</p>
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="text-gray-700 mb-2">
            Category *
          </Label>
          <Select
            name="category"
            defaultValue={initialData?.category || 'exercise'}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority" className="text-gray-700 mb-2">
            Priority *
          </Label>
          <Select
            name="priority"
            defaultValue={initialData?.priority || 'medium'}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.priorityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color */}
      <div>
        <Label className="text-gray-700 mb-2">Color *</Label>
        <RadioGroup
          name="color"
          defaultValue={initialData?.color || '#10b981'}
          className="grid grid-cols-6 gap-2"
        >
          {formOptions.colorOptions.map(color => (
            <div
              key={color.value}
              className="flex flex-col items-center space-y-1"
            >
              <RadioGroupItem
                value={color.value}
                id={`color-${color.value}`}
                className="sr-only"
              />
              <label
                htmlFor={`color-${color.value}`}
                className="flex flex-col items-center space-y-1 cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full ${color.class} border-2 border-gray-300 hover:border-gray-400`}
                ></div>
                <span className="text-xs text-gray-600">{color.label}</span>
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" className="w-full">
          Create Periodic Event
        </Button>
      </div>
    </form>
  );
}
