import { db, PeriodicEvents, eq } from "astro:db";
import type { PeriodicEvent } from "../../../lib/types";

export const getPeriodicEventsDb = async (userId: string): Promise<PeriodicEvent[]> => {
  const events = await db
    .select()
    .from(PeriodicEvents)
    .where(eq(PeriodicEvents.userId, userId));
  return events;
};