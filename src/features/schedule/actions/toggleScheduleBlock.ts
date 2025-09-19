import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../auth/lib/better-auth";
import { toggleScheduleBlock as toggleScheduleBlockDb } from "../db/toggle";

/**
 * Toggle the active status of a schedule block
 */
export const toggleScheduleBlock = defineAction({
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

      const result = await toggleScheduleBlockDb(id, session.user.id);
      
      return {
        success: true,
        data: result
      };
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