import { db, ScheduleBlock, eq } from "astro:db";
import type { ScheduleBlockUpdate, ScheduleBlock as ScheduleBlockType } from "../models/ScheduleBlocks.types";

export const updateScheduleBlockDb = async (id: string, data: ScheduleBlockUpdate): Promise<ScheduleBlockType> => {
  const updatedData = {
    ...data,
    // Handle optional fields
    ...(data.description !== undefined && { description: data.description?.trim() || null }),
    ...(data.startDate !== undefined && { startDate: data.startDate || null }),
    ...(data.endDate !== undefined && { endDate: data.endDate || null }),
    // ✅ updatedAt is now handled automatically by the database
  };

  await db.update(ScheduleBlock).set(updatedData).where(eq(ScheduleBlock.id, id));

  // Return updated record
  const [updated] = await db.select().from(ScheduleBlock).where(eq(ScheduleBlock.id, id));
  return updated;
};