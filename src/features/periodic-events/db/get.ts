import { db, PeriodicEvent, eq } from "astro:db";
import type { PeriodicEvent as PeriodicEventType } from "../models/PeriodicEvents.types";

export const getPeriodicEventsDb = async (userId: string): Promise<PeriodicEventType[]> => {
  const events = await db
    .select()
    .from(PeriodicEvent)
    .where(eq(PeriodicEvent.userId, userId));
  return events;
};