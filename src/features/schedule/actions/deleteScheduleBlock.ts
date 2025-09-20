import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../auth/lib/better-auth";
import { deleteScheduleBlockDb } from "../db/delete";

export const deleteScheduleBlock = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
  }),
  handler: async ({ id }, { request }): Promise<void> => {
    try {
      // Authentication check
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({ 
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to delete schedule blocks'
        });
      }

      // Call DB function
      await deleteScheduleBlockDb(id);
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