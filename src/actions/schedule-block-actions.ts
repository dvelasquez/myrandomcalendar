import { defineAction, ActionError } from 'astro:actions';
import { createScheduleBlock, updateScheduleBlock, deleteScheduleBlock, toggleScheduleBlock, getScheduleBlocks } from '../actions/schedule-blocks';
import { auth } from '../lib/better-auth';
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from '../lib/types';

/**
 * Get all schedule blocks for the current user
 */
export const getScheduleBlocksAction = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule blocks',
        });
      }

      const blocks = await getScheduleBlocks(session.user.id);
      
      return {
        success: true,
        data: blocks
      };
    } catch (error) {
      console.error('Error in getScheduleBlocksAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load schedule blocks',
      });
    }
  },
});

/** 
 * Create a new schedule block
 */
export const createScheduleBlockAction = defineAction({
  accept: 'form',
  handler: async (formData, { request }) => {
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

    // Extract form data
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const daysOfWeek = JSON.parse(formData.get('daysOfWeek') as string);
    const isRecurring = formData.get('isRecurring') === 'true';
    const priority = formData.get('priority') as string;
    const isActive = formData.get('isActive') === 'true';
    const timezone = formData.get('timezone') as string;
    const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : undefined;
    const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;
    const bufferBefore = parseInt(formData.get('bufferBefore') as string) || 0;
    const bufferAfter = parseInt(formData.get('bufferAfter') as string) || 0;

    // Validate required fields
    if (!title || !startTime || !endTime || !daysOfWeek) {
      return {
        success: false,
        error: 'Missing required fields'
      };
    }

    const scheduleBlockData = {
      userId: session.user.id,
      title,
      type: type as ScheduleBlockType,
      startTime,
      endTime,
      daysOfWeek,
      isRecurring,
      priority: priority as SchedulePriority,
      isActive,
      timezone: timezone || 'UTC',
      startDate,
      endDate,
      description: description || undefined,
      color: color || '#3b82f6',
      bufferBefore,
      bufferAfter
    };

      const newBlock = await createScheduleBlock(scheduleBlockData);
      
      return {
        success: true,
        data: newBlock
      };
    } catch (error) {
      console.error('Error in createScheduleBlockAction:', error);
      
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

/**
 * Update an existing schedule block
 */
export const updateScheduleBlockAction = defineAction({
  accept: 'form',
  handler: async (formData, { request }) => {
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

    const id = formData.get('id') as string;
    if (!id) {
      return {
        success: false,
        error: 'Schedule block ID is required'
      };
    }

    // Extract update data
    const updates: Partial<ScheduleBlock> = {};
    
    if (formData.get('title')) updates.title = formData.get('title') as string;
    if (formData.get('type')) updates.type = formData.get('type') as ScheduleBlockType;
    if (formData.get('startTime')) updates.startTime = formData.get('startTime') as string;
    if (formData.get('endTime')) updates.endTime = formData.get('endTime') as string;
    if (formData.get('daysOfWeek')) updates.daysOfWeek = JSON.parse(formData.get('daysOfWeek') as string);
    if (formData.get('isRecurring')) updates.isRecurring = formData.get('isRecurring') === 'true';
    if (formData.get('priority')) updates.priority = formData.get('priority') as SchedulePriority;
    if (formData.get('isActive')) updates.isActive = formData.get('isActive') === 'true';
    if (formData.get('timezone')) updates.timezone = formData.get('timezone') as string;
    if (formData.get('startDate')) updates.startDate = new Date(formData.get('startDate') as string);
    if (formData.get('endDate')) updates.endDate = new Date(formData.get('endDate') as string);
    if (formData.get('description')) updates.description = formData.get('description') as string;
    if (formData.get('color')) updates.color = formData.get('color') as string;
    if (formData.get('bufferBefore')) updates.bufferBefore = parseInt(formData.get('bufferBefore') as string);
    if (formData.get('bufferAfter')) updates.bufferAfter = parseInt(formData.get('bufferAfter') as string);

    const updatedBlock = await updateScheduleBlock(id, session.user.id, updates);
    
    return {
      success: true,
      data: updatedBlock
    };
  } catch (error) {
    console.error('Error in updateScheduleBlockAction:', error);
    
    if (error instanceof ActionError) {
      throw error;
    }
    
    if (error instanceof Error && error.message.includes('not found')) {
      throw new ActionError({
        code: 'NOT_FOUND',
        message: 'Schedule block not found',
      });
    }
    
    throw new ActionError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to update schedule block',
    });
  }
},
});

/**
 * Delete a schedule block
 */
export const deleteScheduleBlockAction = defineAction({
  accept: 'form',
  handler: async (formData, { request }) => {
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

      const id = formData.get('id') as string;
      if (!id) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Schedule block ID is required',
        });
      }

      await deleteScheduleBlock(id, session.user.id);
      
      return {
        success: true,
        data: { id }
      };
    } catch (error) {
      console.error('Error in deleteScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      if (error instanceof Error && error.message.includes('not found')) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'Schedule block not found',
        });
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete schedule block',
      });
    }
  },
});

/**
 * Toggle the active status of a schedule block
 */
export const toggleScheduleBlockAction = defineAction({
  accept: 'form',
  handler: async (formData, { request }) => {
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

      const id = formData.get('id') as string;
      if (!id) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Schedule block ID is required',
        });
      }

      const toggledBlock = await toggleScheduleBlock(id, session.user.id);
      
      return {
        success: true,
        data: toggledBlock
      };
    } catch (error) {
      console.error('Error in toggleScheduleBlockAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      if (error instanceof Error && error.message.includes('not found')) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'Schedule block not found',
        });
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to toggle schedule block',
      });
    }
  },
});

/**
 * Create default schedule blocks for testing/demo purposes
 */
export const createDefaultScheduleBlocksAction = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
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

      // Check if user already has schedule blocks
      const existingBlocks = await getScheduleBlocks(session.user.id);
      if (existingBlocks.length > 0) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'You already have schedule blocks. Delete existing ones first.',
        });
      }

      // Create default schedule blocks
      const defaultBlocks = [
        {
          title: 'Work Hours',
          type: 'work' as ScheduleBlockType,
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
          isRecurring: true,
          priority: 'high' as SchedulePriority,
          isActive: true,
          timezone: 'UTC',
          description: 'Regular work hours',
          color: '#3b82f6',
          bufferBefore: 15,
          bufferAfter: 15,
        },
        {
          title: 'Sleep Time',
          type: 'sleep' as ScheduleBlockType,
          startTime: '23:00',
          endTime: '07:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
          isRecurring: true,
          priority: 'high' as SchedulePriority,
          isActive: true,
          timezone: 'UTC',
          description: 'Sleep schedule',
          color: '#6366f1',
          bufferBefore: 30,
          bufferAfter: 30,
        },
        {
          title: 'Lunch Break',
          type: 'meal' as ScheduleBlockType,
          startTime: '12:00',
          endTime: '13:00',
          daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
          isRecurring: true,
          priority: 'medium' as SchedulePriority,
          isActive: true,
          timezone: 'UTC',
          description: 'Lunch break',
          color: '#f97316',
          bufferBefore: 0,
          bufferAfter: 0,
        }
      ];

      const createdBlocks = [];
      for (const blockData of defaultBlocks) {
        const block = await createScheduleBlock({
          ...blockData,
          userId: session.user.id,
        });
        createdBlocks.push(block);
      }
      
      return {
        success: true,
        data: createdBlocks,
        message: `Created ${createdBlocks.length} default schedule blocks`
      };
    } catch (error) {
      console.error('Error in createDefaultScheduleBlocksAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create default schedule blocks',
      });
    }
  },
});
