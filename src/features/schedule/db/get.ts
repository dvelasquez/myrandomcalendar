import { db, ScheduleBlock, eq } from "astro:db";
import type { ScheduleBlock as ScheduleBlockType } from "../models/ScheduleBlocks.types";

export const getScheduleBlocksDb = async (userId: string): Promise<ScheduleBlockType[]> => {
  const blocks = await db
    .select()
    .from(ScheduleBlock)
    .where(eq(ScheduleBlock.userId, userId))
    .orderBy(ScheduleBlock.createdAt);

  return blocks;
};