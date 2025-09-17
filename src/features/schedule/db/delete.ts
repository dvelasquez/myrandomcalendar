import { and, db, eq, ScheduleBlocks } from "astro:db";

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