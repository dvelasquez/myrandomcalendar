import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../auth/lib/better-auth";
import { updateScheduleBlockDb } from "../db/update";
import { ScheduleBlockFormSchema } from "../models/ScheduleBlock.schema";
import type { ScheduleBlockUpdate, ScheduleBlock } from "../models/ScheduleBlocks.types";

export const updateScheduleBlock = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
    ...ScheduleBlockFormSchema.shape,
  }),
  handler: async ({ id, ...data }, { request }): Promise<ScheduleBlock> => {
    try {
      // Authentication check
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({ 
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update schedule blocks'
        });
      }

      // Prepare update data
      const updateData: ScheduleBlockUpdate = {
        ...data,
        daysOfWeek: data.daysOfWeek ? JSON.stringify(data.daysOfWeek) : undefined, // Convert array to JSON string
      };

      // Call DB function
      const result = await updateScheduleBlockDb(id, updateData);
      
      // Return result directly
      return result;
    } catch (error) {
      console.error('Error in updateScheduleBlock:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update schedule block',
      });
    }
  },
});