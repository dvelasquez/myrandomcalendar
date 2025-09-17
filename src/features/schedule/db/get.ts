import { db, eq, ScheduleBlocks } from "astro:db";
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from "../models/ScheduleBlocks.types";

/**
 * Get all schedule blocks for a user
 */
export async function readScheduleBlocks(userId: string): Promise<ScheduleBlock[]> {
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