import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createScheduleBlockDb } from '../db/create';
import type { NewScheduleBlock } from '../models/ScheduleBlocks.types';
import { serializeDaysOfWeek } from '../models/ScheduleBlocks.types';

/**
 * Create default schedule blocks for a new user
 */
export const createDefaultScheduleBlocks = defineAction({
  accept: 'form',
  input: z.object({
    timezone: z.string().default('UTC'),
  }),
  handler: async ({ timezone }, context) => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create default schedule blocks',
        });
      }

      const defaultBlocks: NewScheduleBlock[] = [
        {
          userId: context.locals.user.id,
          title: 'Work Hours',
          type: 'work',
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: serializeDaysOfWeek([1, 2, 3, 4, 5]), // Monday to Friday
          isRecurring: true,
          priority: 'high',
          isActive: true,
          timezone,
          description: 'Regular work hours',
          color: '#3b82f6',
          bufferBefore: 15,
          bufferAfter: 15,
        },
        {
          userId: context.locals.user.id,
          title: 'Sleep Schedule',
          type: 'sleep',
          startTime: '22:00',
          endTime: '07:00',
          daysOfWeek: serializeDaysOfWeek([0, 1, 2, 3, 4, 5, 6]), // Every day
          isRecurring: true,
          priority: 'high',
          isActive: true,
          timezone,
          description: 'Regular sleep schedule',
          color: '#1e40af',
          bufferBefore: 30,
          bufferAfter: 30,
        },
        {
          userId: context.locals.user.id,
          title: 'Personal Time',
          type: 'personal',
          startTime: '18:00',
          endTime: '22:00',
          daysOfWeek: serializeDaysOfWeek([0, 1, 2, 3, 4, 5, 6]), // Every day
          isRecurring: true,
          priority: 'medium',
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
        const result = await createScheduleBlockDb(blockData);
        results.push(result);
      }

      return {
        success: true,
        data: results,
        message: 'Default schedule blocks created successfully',
      };
    } catch (error) {
      console.error('Error in createDefaultScheduleBlocks:', error);

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
