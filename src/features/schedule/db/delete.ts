import { db, ScheduleBlock, eq } from "astro:db";

export const deleteScheduleBlockDb = async (id: string): Promise<void> => {
  await db.delete(ScheduleBlock).where(eq(ScheduleBlock.id, id));
};