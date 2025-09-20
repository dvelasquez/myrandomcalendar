import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { handleMaintainerPage } from "../services/maintainer-handler";
import type { MaintainerPageData } from "../services/maintainer-handler";

export const getMaintainerPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    editId: z.string().optional(),
    successMessage: z.string().optional(),
    errorMessage: z.string().optional(),
    createError: z.string().optional(),
    updateError: z.string().optional(),
    deleteError: z.string().optional(),
  }),
  handler: async ({ editId, successMessage, errorMessage, createError, updateError, deleteError }, context): Promise<MaintainerPageData> => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule maintainer'
        });
      }

      const actionErrors = {
        createError,
        updateError,
        deleteError,
      };

      const data = await handleMaintainerPage(
        context,
        editId,
        successMessage,
        errorMessage,
        actionErrors
      );

      if (!data) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule maintainer'
        });
      }

      return data;
    } catch (error) {
      console.error('Error in getMaintainerPageDataAction:', error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch maintainer page data',
      });
    }
  },
});
