import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ButtonLink from '@/components/ui/button-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ScheduleBlock } from '@/features/schedule/models/ScheduleBlocks.types';
import type { MaintainerPageData } from '@/features/schedule/services/maintainer-handler';

interface ScheduleFormProps {
  initialData?: Partial<ScheduleBlock>;
  formOptions: MaintainerPageData['formOptions'];
}

export default function ScheduleForm({ initialData, formOptions }: ScheduleFormProps) {
  // Parse daysOfWeek from JSON string if it's a string
  const parsedDaysOfWeek = React.useMemo(() => {
    if (!initialData?.daysOfWeek) return [1, 2, 3, 4, 5]; // Default to Monday-Friday
    
    if (typeof initialData.daysOfWeek === 'string') {
      try {
        return JSON.parse(initialData.daysOfWeek);
      } catch {
        return [1, 2, 3, 4, 5];
      }
    }
    
    return initialData.daysOfWeek;
  }, [initialData?.daysOfWeek]);

  // Update days of week hidden input when checkboxes change
  useEffect(() => {
    const updateDaysOfWeek = () => {
      const checkboxes = document.querySelectorAll('.daysOfWeekCheckbox:checked') as NodeListOf<HTMLInputElement>;
      const selectedDays = Array.from(checkboxes).map(cb => parseInt(cb.value));
      const hiddenInput = document.getElementById('daysOfWeekJson') as HTMLInputElement;
      if (hiddenInput) {
        hiddenInput.value = JSON.stringify(selectedDays);
      }
    };

    // Add event listeners to checkboxes
    const checkboxes = document.querySelectorAll('.daysOfWeekCheckbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateDaysOfWeek);
    });

    // Initial update
    updateDaysOfWeek();

    // Cleanup
    return () => {
      checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', updateDaysOfWeek);
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    try {
      // Import actions dynamically to avoid server-side issues
      const { actions } = await import('astro:actions');
      
      let result;
      if (initialData?.id) {
        result = await actions.schedule.updateScheduleBlock(formData);
      } else {
        result = await actions.schedule.createScheduleBlock(formData);
      }
      
      if (!result.error) {
        // Redirect on success
        window.location.href = initialData?.id ? '/schedule/maintainer?success=updated' : '/schedule?success=created';
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
      {/* Hidden fields */}
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="timezone" value="UTC" />

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title" className="text-gray-700 mb-2">
            Title *
          </Label>
          <Input
            type="text"
            id="title"
            name="title"
            defaultValue={initialData?.title || ''}
            className="w-full"
            placeholder="e.g., Work Hours, Sleep Time"
            required
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-gray-700 mb-2">
            Type *
          </Label>
          <Select name="type" defaultValue={initialData?.type || 'work'} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.scheduleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startTime" className="text-gray-700 mb-2">
            Start Time *
          </Label>
          <Input
            type="time"
            id="startTime"
            name="startTime"
            defaultValue={initialData?.startTime || '09:00'}
            className="w-full"
            required
          />
        </div>

        <div>
          <Label htmlFor="endTime" className="text-gray-700 mb-2">
            End Time *
          </Label>
          <Input
            type="time"
            id="endTime"
            name="endTime"
            defaultValue={initialData?.endTime || '17:00'}
            className="w-full"
            required
          />
        </div>
      </div>

      {/* Days of Week */}
      <div>
        <Label className="text-gray-700 mb-2">
          Days of Week *
        </Label>
        <div className="grid grid-cols-7 gap-2">
          {formOptions.daysOfWeek.map((day) => (
            <label key={day.value} className="flex flex-col items-center p-2 text-sm rounded-md border cursor-pointer hover:bg-gray-50">
              <Checkbox
                name="daysOfWeekCheckbox"
                value={day.value}
                defaultChecked={parsedDaysOfWeek.includes(day.value)}
                className="mb-1 daysOfWeekCheckbox"
              />
              <span className="font-medium">{day.short}</span>
            </label>
          ))}
        </div>
        {/* Hidden input to send daysOfWeek as JSON */}
        <input type="hidden" name="daysOfWeek" value={JSON.stringify(parsedDaysOfWeek)} id="daysOfWeekJson" />
      </div>

      {/* Priority and Color */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="priority" className="text-gray-700 mb-2">
            Priority
          </Label>
          <Select name="priority" defaultValue={initialData?.priority || 'medium'}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {formOptions.priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color" className="text-gray-700 mb-2">
            Color
          </Label>
          <Input
            type="color"
            id="color"
            name="color"
            defaultValue={initialData?.color || '#3b82f6'}
            className="w-full h-10 cursor-pointer"
          />
        </div>
      </div>

      {/* Buffer Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="bufferBefore" className="text-gray-700 mb-2">
            Buffer Before (minutes)
          </Label>
          <Input
            type="number"
            id="bufferBefore"
            name="bufferBefore"
            defaultValue={initialData?.bufferBefore || 0}
            min="0"
            max="120"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="bufferAfter" className="text-gray-700 mb-2">
            Buffer After (minutes)
          </Label>
          <Input
            type="number"
            id="bufferAfter"
            name="bufferAfter"
            defaultValue={initialData?.bufferAfter || 0}
            min="0"
            max="120"
            className="w-full"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-gray-700 mb-2">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          className="w-full"
          placeholder="Optional description or notes about this schedule block"
          defaultValue={initialData?.description || ''}
        />
      </div>

      {/* Settings */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <Checkbox
            name="isRecurring"
            value="true"
            defaultChecked={initialData?.isRecurring ?? true}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Recurring</span>
        </label>

        <label className="flex items-center">
          <Checkbox
            name="isActive"
            value="true"
            defaultChecked={initialData?.isActive ?? true}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <ButtonLink variant="outline" href="/schedule">
          Cancel
        </ButtonLink>
        <Button type="submit">
          {initialData?.id ? 'Update' : 'Create'} Schedule Block
        </Button>
      </div>
    </form>
  );
}
