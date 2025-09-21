import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { toggleScheduleBlockDb } from '../db/toggle';
import type { ScheduleBlock } from '../models/ScheduleBlocks.types';

export const toggleScheduleBlock = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
  }),
  handler: async ({ id }, context): Promise<ScheduleBlock> => {
    try {
      // Authentication check
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to toggle schedule blocks',
        });
      }

      // Call DB function
      const result = await toggleScheduleBlockDb(id);

      // Return result directly
      return result;
    } catch (error) {
      console.error('Error in toggleScheduleBlock:', error);

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
