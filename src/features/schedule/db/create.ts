import { db, ScheduleBlock, eq } from "astro:db";
import type { NewScheduleBlock, ScheduleBlock as ScheduleBlockType } from "../models/ScheduleBlocks.types";

export const createScheduleBlockDb = async (data: NewScheduleBlock): Promise<ScheduleBlockType> => {
  const id = crypto.randomUUID();

  const newScheduleBlock = {
    id,
    userId: data.userId,
    title: data.title.trim(),
    type: data.type,
    startTime: data.startTime,
    endTime: data.endTime,
    daysOfWeek: data.daysOfWeek, // Already a JSON string from action
    isRecurring: data.isRecurring,
    priority: data.priority,
    isActive: data.isActive,
    timezone: data.timezone,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    description: data.description?.trim() || null,
    color: data.color || '#3b82f6',
    bufferBefore: data.bufferBefore,
    bufferAfter: data.bufferAfter,
    // ✅ Timestamps are now handled automatically by the database
  };

  // Create the schedule block
  await db.insert(ScheduleBlock).values(newScheduleBlock);

  // Return the created record (with auto-generated timestamps)
  const [created] = await db.select().from(ScheduleBlock).where(eq(ScheduleBlock.id, id));
  return created;
};