import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../auth/lib/better-auth";
import { createScheduleBlock as createScheduleBlockDb } from "../db/create";
import { scheduleBlockBaseSchema } from "../models/ScheduleBlock.schema";
import type { ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";

/** 
 * Create a new schedule block
 */
export const createScheduleBlock = defineAction({
  accept: 'form',
  input: scheduleBlockBaseSchema,
  handler: async (data, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create schedule blocks',
        });
      }

      const scheduleBlockData = {
        userId: session.user.id,
        ...data,
        type: data.type as ScheduleBlockType,
        priority: data.priority as SchedulePriority,
        color: data.color || '#10b981', // Provide default color
      };

      const result = await createScheduleBlockDb(scheduleBlockData);
      
      return {
        success: true,
        data: result
      };
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