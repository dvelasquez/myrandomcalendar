import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../auth/lib/better-auth";
import { getScheduleBlocksDb } from "../db/get";
import type { ScheduleBlock } from "../models/ScheduleBlocks.types";

export const getScheduleBlocks = defineAction({
  accept: 'form',
  handler: async (_, { request }): Promise<ScheduleBlock[]> => {
    try {
      // Authentication check
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({ 
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule blocks'
        });
      }

      // Call DB function
      const blocks = await getScheduleBlocksDb(session.user.id);
      
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