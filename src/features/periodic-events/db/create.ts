import { db, PeriodicEvent, eq } from "astro:db";
import type { NewPeriodicEvent, PeriodicEvent as PeriodicEventType } from "../models/PeriodicEvents.types";

export const createPeriodicEventDb = async ({ title, description, frequency, frequencyCount, duration, category, priority, color, userId }: NewPeriodicEvent): Promise<PeriodicEventType> => {
  const id = crypto.randomUUID();

  const newPeriodicEvent = {
    id,
    userId,
    title: title.trim(),
    description: description?.trim() || null,
    frequency,
    frequencyCount,
    duration,
    category: category || 'personal',
    priority: priority || 'medium',
    color: color || '#10b981',
    isActive: true,
    // ✅ Timestamps are now handled automatically by the database
  }

  // Create the periodic event
  await db.insert(PeriodicEvent).values(newPeriodicEvent);

  // Return the created record (with auto-generated timestamps)
  const [created] = await db.select().from(PeriodicEvent).where(eq(PeriodicEvent.id, id));
  return created;

};
