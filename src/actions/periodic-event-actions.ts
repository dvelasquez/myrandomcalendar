import { ActionError, defineAction } from 'astro:actions';
import { db, PeriodicEvents } from 'astro:db';
import { auth } from '../lib/better-auth';

/**
 * Create a new periodic event
 */
export const createPeriodicEventAction = defineAction({
  accept: 'form',
  handler: async (formData, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create periodic events',
        });
      }

      // Extract and validate form data
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const frequency = formData.get('frequency') as string;
      const frequencyCount = parseInt(formData.get('frequencyCount') as string);
      const duration = parseInt(formData.get('duration') as string);
      const category = formData.get('category') as string;
      const priority = formData.get('priority') as string;
      const color = formData.get('color') as string;

      // Validation
      if (!title || title.trim().length === 0) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Title is required',
        });
      }

      if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Valid frequency is required (daily, weekly, or monthly)',
        });
      }

      if (!frequencyCount || frequencyCount < 1) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Frequency count must be at least 1',
        });
      }

      if (!duration || duration < 1) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Duration must be at least 1 minute',
        });
      }

      if (!category || !['exercise', 'personal', 'family', 'work', 'health', 'hobby', 'other'].includes(category)) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Valid category is required',
        });
      }

      if (!priority || !['high', 'medium', 'low'].includes(priority)) {
        throw new ActionError({
          code: 'VALIDATION_ERROR',
          message: 'Valid priority is required',
        });
      }

      // Generate unique ID
      const id = crypto.randomUUID();

      // Create the periodic event
      await db.insert(PeriodicEvents).values({
        id,
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        frequency,
        frequencyCount,
        duration,
        category,
        priority,
        color: color || '#10b981',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: {
          id,
          title: title.trim(),
          description: description?.trim(),
          frequency,
          frequencyCount,
          duration,
          category,
          priority,
          color: color || '#10b981',
        },
      };
    } catch (error) {
      console.error('Error in createPeriodicEventAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create periodic event',
      });
    }
  },
});
