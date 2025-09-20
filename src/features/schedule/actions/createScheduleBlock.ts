import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../auth/lib/better-auth";
import { createScheduleBlockDb } from "../db/create";
import { ScheduleBlockFormSchema } from "../models/ScheduleBlock.schema";
import type { NewScheduleBlock } from "../models/ScheduleBlocks.types";

export const createScheduleBlock = defineAction({
  accept: 'form',
  input: ScheduleBlockFormSchema,
  handler: async (data, { request }): Promise<NewScheduleBlock> => {
    try {
      // Authentication check
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({ 
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create schedule blocks'
        });
      }
      
      // Prepare data with userId
      const scheduleBlockData: NewScheduleBlock = {
        ...data,
        userId: session.user.id,
        // daysOfWeek is already a JSON string from the form schema
      };
      
      // Call DB function
      const result = await createScheduleBlockDb(scheduleBlockData);
      
      // Return result directly
      return result;
    } catch (error) {
      console.error('Error in createScheduleBlock:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create schedule block',
      });
    }
  },
});