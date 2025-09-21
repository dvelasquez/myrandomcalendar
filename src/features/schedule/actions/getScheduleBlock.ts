import { ActionError, defineAction } from 'astro:actions';
import { getScheduleBlocksDb } from '../db/get';
import type { ScheduleBlock } from '../models/ScheduleBlocks.types';

export const getScheduleBlocks = defineAction({
  accept: 'form',
  handler: async (_, context): Promise<ScheduleBlock[]> => {
    try {
      // Authentication check
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule blocks',
        });
      }

      // Call DB function
      const blocks = await getScheduleBlocksDb(context.locals.user.id);

      // Return result directly
      return blocks;
    } catch (error) {
      console.error('Error in getScheduleBlocks:', error);

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
