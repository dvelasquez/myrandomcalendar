import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { deleteScheduleBlockDb } from "../db/delete";

export const deleteScheduleBlock = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
  }),
  handler: async ({ id }, context): Promise<void> => {
    try {
      // Authentication check
      if (!context.locals.user) {
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