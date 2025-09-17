import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../../lib/better-auth";
import { deleteScheduleBlock as deleteScheduleBlockDb } from "../db/delete";

/**
 * Delete a schedule block
 */
export const deleteScheduleBlock = defineAction({
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

      await deleteScheduleBlockDb(id, session.user.id);
      
      return {
        success: true,
        message: 'Schedule block deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteScheduleBlock:', error);
      
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