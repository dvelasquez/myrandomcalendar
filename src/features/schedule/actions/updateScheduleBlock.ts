import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../auth/lib/better-auth";
import { updateScheduleBlock as updateScheduleBlockDb } from "../db/update";
import { scheduleBlockBaseSchema } from "../models/ScheduleBlock.schema";
import type { ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";

/**
 * Update an existing schedule block
 */
export const updateScheduleBlock = defineAction({
  accept: 'form',
  input: z.object({
    id: z.string().min(1, 'Schedule block ID is required'),
    ...scheduleBlockBaseSchema.shape,
  }),
  handler: async ({ id, ...data }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update schedule blocks',
        });
      }

      const updateData = {
        ...data,
        type: data.type as ScheduleBlockType,
        priority: data.priority as SchedulePriority,
      };

      const result = await updateScheduleBlockDb(id, session.user.id, updateData);
      
      return {
        success: true,
        data: result
      };
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