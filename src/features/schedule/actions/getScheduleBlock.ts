import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../auth/lib/better-auth";
import { readScheduleBlocks } from "../db/get";

/**
 * Get all schedule blocks for the current user
 */
export const getScheduleBlocks = defineAction({
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

      const blocks = await readScheduleBlocks(session.user.id);

      
      return {
        success: true,
        data: blocks
      };
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