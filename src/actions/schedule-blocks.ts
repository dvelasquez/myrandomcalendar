import { db } from 'astro:db';
import { ScheduleBlocks } from 'astro:db';
import { eq, and } from 'drizzle-orm';
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from '../lib/types';

// Type for database update operations
type ScheduleBlockUpdateData = {
  title?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string; // JSON string
  isRecurring?: boolean;
  priority?: string;
  isActive?: boolean;
  timezone?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
  color?: string;
  bufferBefore?: number;
  bufferAfter?: number;
  updatedAt: Date;
};

/**
 * Get all schedule blocks for a user
 */
export async function getScheduleBlocks(userId: string): Promise<ScheduleBlock[]> {
  try {
    const blocks = await db
      .select()
      .from(ScheduleBlocks)
      .where(eq(ScheduleBlocks.userId, userId))
      .orderBy(ScheduleBlocks.createdAt);

    // Transform database rows to ScheduleBlock format
    return blocks.map(block => ({
      id: block.id,
      userId: block.userId,
      title: block.title,
      type: block.type as ScheduleBlockType,
      startTime: block.startTime,
      endTime: block.endTime,
      daysOfWeek: JSON.parse(block.daysOfWeek),
      isRecurring: block.isRecurring,
      priority: block.priority as SchedulePriority,
      isActive: block.isActive,
      timezone: block.timezone,
      startDate: block.startDate || undefined,
      endDate: block.endDate || undefined,
      description: block.description || undefined,
      color: block.color,
      bufferBefore: block.bufferBefore,
      bufferAfter: block.bufferAfter,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching schedule blocks:', error);
    throw new Error('Failed to fetch schedule blocks');
  }
}

/**
 * Create a new schedule block
 */
export async function createScheduleBlock(scheduleBlockData: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleBlock> {
  try {
    const now = new Date();
    
    const newBlock = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: scheduleBlockData.userId,
      title: scheduleBlockData.title,
      type: scheduleBlockData.type,
      startTime: scheduleBlockData.startTime,
      endTime: scheduleBlockData.endTime,
      daysOfWeek: JSON.stringify(scheduleBlockData.daysOfWeek),
      isRecurring: scheduleBlockData.isRecurring,
      priority: scheduleBlockData.priority,
      isActive: scheduleBlockData.isActive,
      timezone: scheduleBlockData.timezone,
      startDate: scheduleBlockData.startDate || null,
      endDate: scheduleBlockData.endDate || null,
      description: scheduleBlockData.description || null,
      color: scheduleBlockData.color,
      bufferBefore: scheduleBlockData.bufferBefore,
      bufferAfter: scheduleBlockData.bufferAfter,
      createdAt: now,
      updatedAt: now
    };

    await db.insert(ScheduleBlocks).values(newBlock);

    // Return the created block in ScheduleBlock format
    return {
      id: newBlock.id,
      userId: newBlock.userId,
      title: newBlock.title,
      type: newBlock.type as ScheduleBlockType,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      daysOfWeek: scheduleBlockData.daysOfWeek,
      isRecurring: newBlock.isRecurring,
      priority: newBlock.priority as SchedulePriority,
      isActive: newBlock.isActive,
      timezone: newBlock.timezone,
      startDate: newBlock.startDate || undefined,
      endDate: newBlock.endDate || undefined,
      description: newBlock.description || undefined,
      color: newBlock.color,
      bufferBefore: newBlock.bufferBefore,
      bufferAfter: newBlock.bufferAfter,
      createdAt: newBlock.createdAt,
      updatedAt: newBlock.updatedAt
    };
  } catch (error) {
    console.error('Error creating schedule block:', error);
    throw new Error('Failed to create schedule block');
  }
}

/**
 * Update an existing schedule block
 */
export async function updateScheduleBlock(id: string, userId: string, updates: Partial<ScheduleBlock>): Promise<ScheduleBlock> {
  try {
    const now = new Date();
    
    // Prepare update data for database
    const updateData: ScheduleBlockUpdateData = {
      updatedAt: now
    };

    // Only include fields that are being updated
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.daysOfWeek !== undefined) updateData.daysOfWeek = JSON.stringify(updates.daysOfWeek);
    if (updates.isRecurring !== undefined) updateData.isRecurring = updates.isRecurring;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate || null;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate || null;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.bufferBefore !== undefined) updateData.bufferBefore = updates.bufferBefore;
    if (updates.bufferAfter !== undefined) updateData.bufferAfter = updates.bufferAfter;

    const result = await db
      .update(ScheduleBlocks)
      .set(updateData)
      .where(and(eq(ScheduleBlocks.id, id), eq(ScheduleBlocks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error('Schedule block not found or access denied');
    }

    const updatedBlock = result[0];

    // Return the updated block in ScheduleBlock format
    return {
      id: updatedBlock.id,
      userId: updatedBlock.userId,
      title: updatedBlock.title,
      type: updatedBlock.type as ScheduleBlockType,
      startTime: updatedBlock.startTime,
      endTime: updatedBlock.endTime,
      daysOfWeek: JSON.parse(updatedBlock.daysOfWeek),
      isRecurring: updatedBlock.isRecurring,
      priority: updatedBlock.priority as SchedulePriority,
      isActive: updatedBlock.isActive,
      timezone: updatedBlock.timezone,
      startDate: updatedBlock.startDate || undefined,
      endDate: updatedBlock.endDate || undefined,
      description: updatedBlock.description || undefined,
      color: updatedBlock.color,
      bufferBefore: updatedBlock.bufferBefore,
      bufferAfter: updatedBlock.bufferAfter,
      createdAt: updatedBlock.createdAt,
      updatedAt: updatedBlock.updatedAt
    };
  } catch (error) {
    console.error('Error updating schedule block:', error);
    throw new Error('Failed to update schedule block');
  }
}

/**
 * Delete a schedule block
 */
export async function deleteScheduleBlock(id: string, userId: string): Promise<void> {
  try {
    const result = await db
      .delete(ScheduleBlocks)
      .where(and(eq(ScheduleBlocks.id, id), eq(ScheduleBlocks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error('Schedule block not found or access denied');
    }
  } catch (error) {
    console.error('Error deleting schedule block:', error);
    throw new Error('Failed to delete schedule block');
  }
}

/**
 * Toggle the active status of a schedule block
 */
export async function toggleScheduleBlock(id: string, userId: string): Promise<ScheduleBlock> {
  try {
    // First get the current block to toggle its status
    const currentBlock = await db
      .select()
      .from(ScheduleBlocks)
      .where(and(eq(ScheduleBlocks.id, id), eq(ScheduleBlocks.userId, userId)))
      .limit(1);

    if (currentBlock.length === 0) {
      throw new Error('Schedule block not found or access denied');
    }

    const newActiveStatus = !currentBlock[0].isActive;

    return await updateScheduleBlock(id, userId, { isActive: newActiveStatus });
  } catch (error) {
    console.error('Error toggling schedule block:', error);
    throw new Error('Failed to toggle schedule block');
  }
}