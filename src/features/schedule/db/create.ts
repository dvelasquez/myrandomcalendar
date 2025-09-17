import { db, ScheduleBlocks } from "astro:db";
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";

/**
 * Create a new schedule block
 */
export async function createScheduleBlock(scheduleBlockData: Omit<ScheduleBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleBlock> {
  try {
    const now = new Date();
    
    const newBlock = {
      id: `schedule-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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