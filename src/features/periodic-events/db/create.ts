import { db, PeriodicEvents } from "astro:db";
import { z } from "astro:schema";
import { periodicEventSchema } from "../models/PeriodicEvents.schema";

type PeriodicEvent = z.infer<typeof periodicEventSchema>;

export const createPeriodicEventDb = async ({ title, description, frequency, frequencyCount, duration, category, priority, color }: Omit<PeriodicEvent, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<PeriodicEvent> => {
  const id = crypto.randomUUID();

  const newPeriodicEvent = {
    id,
    userId,
    title: title.trim(),
    description: description?.trim() || undefined,
    frequency,
    frequencyCount,
    duration,
    category,
    priority,
    color: color || '#10b981',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Create the periodic event
  await db.insert(PeriodicEvents).values(newPeriodicEvent);

  return newPeriodicEvent;

};
