import type { ActionAPIContext } from 'astro:actions';
import { getScheduleBlocksDb } from '../db/get';
import type { ScheduleBlock } from '../models/ScheduleBlocks.types';
import { SCHEDULE_TYPES, PRIORITIES, DAYS_OF_WEEK } from './constants';

export interface MaintainerPageData {
  scheduleBlocks: ScheduleBlock[];
  editingBlock?: ScheduleBlock;
  formOptions: {
    scheduleTypes: typeof SCHEDULE_TYPES;
    priorities: typeof PRIORITIES;
    daysOfWeek: typeof DAYS_OF_WEEK;
  };
  successMessage?: string;
  errorMessage?: string;
  actionErrors: {
    createError?: string;
    updateError?: string;
    deleteError?: string;
  };
}

export async function handleMaintainerPage(
  context: ActionAPIContext,
  editId?: string,
  successMessage?: string,
  errorMessage?: string,
  actionErrors?: {
    createError?: string;
    updateError?: string;
    deleteError?: string;
  }
): Promise<MaintainerPageData | null> {
  try {
    if (!context.locals.user) {
      return null;
    }

    // Fetch schedule blocks
    const scheduleBlocks = await getScheduleBlocksDb(context.locals.user.id);

    // Find editing block if editId is provided
    let editingBlock: ScheduleBlock | undefined;
    if (editId) {
      editingBlock = scheduleBlocks.find(block => block.id === editId);
    }

    // Prepare form options
    const formOptions = {
      scheduleTypes: SCHEDULE_TYPES,
      priorities: PRIORITIES,
      daysOfWeek: DAYS_OF_WEEK,
    };

    return {
      scheduleBlocks,
      editingBlock,
      formOptions,
      successMessage,
      errorMessage,
      actionErrors: actionErrors || {},
    };
  } catch (error) {
    console.error('Error in handleMaintainerPage:', error);
    return null;
  }
}

export function getSuccessMessageText(successMessage: string): string {
  const messages = {
    created: 'Schedule block created successfully!',
    updated: 'Schedule block updated successfully!',
    deleted: 'Schedule block deleted successfully!',
  };
  return (
    messages[successMessage as keyof typeof messages] ||
    'Operation completed successfully!'
  );
}

export function getActionErrorText(
  actionErrors: MaintainerPageData['actionErrors']
): string | null {
  if (actionErrors.createError) return actionErrors.createError;
  if (actionErrors.updateError) return actionErrors.updateError;
  if (actionErrors.deleteError) return actionErrors.deleteError;
  return null;
}
