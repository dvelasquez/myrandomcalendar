import { and, db, eq, ScheduleBlocks } from "astro:db";
import type { ScheduleBlock } from "../models/ScheduleBlocks.types";
import { updateScheduleBlock } from "./update";

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