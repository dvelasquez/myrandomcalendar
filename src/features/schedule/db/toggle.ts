import { db, ScheduleBlock, eq } from 'astro:db';
import type { ScheduleBlock as ScheduleBlockType } from '../models/ScheduleBlocks.types';
import { updateScheduleBlockDb } from './update';

export const toggleScheduleBlockDb = async (
  id: string
): Promise<ScheduleBlockType> => {
  // First get the current block to toggle its status
  const [currentBlock] = await db
    .select()
    .from(ScheduleBlock)
    .where(eq(ScheduleBlock.id, id))
    .limit(1);

  if (!currentBlock) {
    throw new Error('Schedule block not found');
  }

  const newActiveStatus = !currentBlock.isActive;
  return await updateScheduleBlockDb(id, { isActive: newActiveStatus });
};
