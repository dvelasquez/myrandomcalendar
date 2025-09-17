import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createScheduleBlock, deleteScheduleBlock, getScheduleBlocks, toggleScheduleBlock, updateScheduleBlock } from '../actions/schedule-blocks';
import { auth } from '../lib/better-auth';
import type { ScheduleBlockType, SchedulePriority } from '../lib/types';

// Common Zod schemas for schedule blocks
const scheduleBlockBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['work', 'sleep', 'personal', 'travel', 'meal', 'exercise', 'family', 'study', 'other'], {
    errorMap: () => ({ message: 'Valid type is required' }),
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  daysOfWeek: z.string().transform((val) => {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every(d => typeof d === 'number' && d >= 0 && d <= 6)) {
        return parsed;
      }
      throw new Error('Invalid days of week format');
    } catch {
      throw new Error('Days of week must be a valid JSON array of numbers 0-6');
    }
  }),
  isRecurring: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
  }),
  isActive: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  timezone: z.string().default('UTC'),
  startDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  description: z.string().nullable().optional().transform((val) => val || undefined),
  color: z.string().nullable().optional().transform((val) => val || '#3b82f6'),
  bufferBefore: z.string().transform((val) => parseInt(val) || 0).default('0'),
  bufferAfter: z.string().transform((val) => parseInt(val) || 0).default('0'),
});

/**
 * Get all schedule blocks for the current user
 */
export const getScheduleBlocksAction = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule blocks',
        });
      }

      const blocks = await getScheduleBlocks(session.user.id);

      
      return {
        success: true,
        data: blocks
      };
    } catch (error) {
      console.error('Error in getScheduleBlocksAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load schedule blocks',
      });
    }
  },
});

/** 
 * Create a new schedule block
 */
export const createScheduleBlockAction = defineAction({
  accept: 'form',
  input: scheduleBlockBaseSchema,
  handler: async (data, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create schedule blocks',
        });
      }

      const scheduleBlockData = {
        userId: session.user.id,
        ...data,
        type: data.type as ScheduleBlockType,
        priority: data.priority as SchedulePriority,
        color: data.color || '#10b981', // Provide default color
      };

      const result = await createScheduleBlock(scheduleBlockData);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in createScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create schedule block',
      });
    }
  },
});

/**
 * Update an existing schedule block
 */
export const updateScheduleBlockAction = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
    ...scheduleBlockBaseSchema.shape,
  }),
  handler: async ({ id, ...data }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update schedule blocks',
        });
      }

      const updateData = {
        ...data,
        type: data.type as ScheduleBlockType,
        priority: data.priority as SchedulePriority,
      };

      const result = await updateScheduleBlock(id, session.user.id, updateData);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in updateScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update schedule block',
      });
    }
  },
});

/**
 * Delete a schedule block
 */
export const deleteScheduleBlockAction = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
  }),
  handler: async ({ id }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to delete schedule blocks',
        });
      }

      await deleteScheduleBlock(id, session.user.id);
      
      return {
        success: true,
        message: 'Schedule block deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete schedule block',
      });
    }
  },
});

/**
 * Toggle the active status of a schedule block
 */
export const toggleScheduleBlockAction = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
  }),
  handler: async ({ id }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to toggle schedule blocks',
        });
      }

      const result = await toggleScheduleBlock(id, session.user.id);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in toggleScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle schedule block',
      });
    }
  },
});

/**
 * Create default schedule blocks for a new user
 */
export const createDefaultScheduleBlocksAction = defineAction({
  accept: 'form',
  input: z.object({
    timezone: z.string().default('UTC'),
  }),
  handler: async ({ timezone }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create default schedule blocks',
        });
      }

      const defaultBlocks = [
        {
          title: 'Work Hours',
          type: 'work' as ScheduleBlockType,
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          isRecurring: true,
          priority: 'high' as SchedulePriority,
          isActive: true,
          timezone,
          description: 'Regular work hours',
          color: '#3b82f6',
          bufferBefore: 15,
          bufferAfter: 15,
        },
        {
          title: 'Sleep Schedule',
          type: 'sleep' as ScheduleBlockType,
          startTime: '22:00',
          endTime: '07:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
          isRecurring: true,
          priority: 'high' as SchedulePriority,
          isActive: true,
          timezone,
          description: 'Regular sleep schedule',
          color: '#1e40af',
          bufferBefore: 30,
          bufferAfter: 30,
        },
        {
          title: 'Personal Time',
          type: 'personal' as ScheduleBlockType,
          startTime: '18:00',
          endTime: '22:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
          isRecurring: true,
          priority: 'medium' as SchedulePriority,
          isActive: true,
          timezone,
          description: 'Personal time for hobbies and relaxation',
          color: '#10b981',
          bufferBefore: 0,
          bufferAfter: 0,
        },
      ];

      const results = [];
      for (const blockData of defaultBlocks) {
        const result = await createScheduleBlock({
          userId: session.user.id,
          ...blockData,
        });
        results.push(result);
      }
      
      return {
        success: true,
        data: results,
        message: 'Default schedule blocks created successfully'
      };
    } catch (error) {
      console.error('Error in createDefaultScheduleBlocksAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create default schedule blocks',
      });
    }
  },
});