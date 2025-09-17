import { db, and, eq, ScheduleBlocks } from "astro:db";
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";

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