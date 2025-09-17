import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../../lib/better-auth";
import { createScheduleBlock } from "../db/create";
import type { ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";


/**
 * Create default schedule blocks for a new user
 */
export const createDefaultScheduleBlocks = defineAction({
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