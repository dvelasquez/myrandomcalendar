import type { AstroGlobal } from 'astro';
import { actions } from 'astro:actions';
import { auth } from '../../auth/lib/better-auth';
import { FREQUENCY_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS, COLOR_OPTIONS } from '../lib/constants'; 
import type { PeriodicEvent as PeriodicEventType } from '../models/PeriodicEvents.types';

/**
 * Page data for periodic events index page
 */
export interface PeriodicEventsIndexPageData {
  periodicEvents: PeriodicEventType[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Page data for periodic events create page
 */
export interface PeriodicEventsCreatePageData {
  formOptions: {
    frequencyOptions: typeof FREQUENCY_OPTIONS;
    categoryOptions: typeof CATEGORY_OPTIONS;
    priorityOptions: typeof PRIORITY_OPTIONS;
    colorOptions: typeof COLOR_OPTIONS;
  };
  // Only pass the actual data we need, not the entire action result
  createdEvent?: PeriodicEventType;
  hasError?: boolean;
  errorMessage?: string;
}

/**
 * Handle periodic events index page logic
 * Orchestrates authentication and business logic
 * Note: Data fetching should be done in Astro frontmatter using Astro.callAction()
 */
export async function handlePeriodicEventsIndexPage(
  request: Request,
  periodicEvents: PeriodicEventType[]
): Promise<PeriodicEventsIndexPageData | null> {
  // 1. Authentication check (infrastructure concern)
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null; // Will trigger redirect in Astro file
  }

  // 2. Return structured page data (domain concern)
  return {
    periodicEvents,
    user: {
      id: session.user.id,
      name: session.user.name || 'User',
      email: session.user.email,
    },
  };
}

/**
 * Handle periodic events create page logic
 * Orchestrates form options and action results
 * Note: actionResult uses any due to Astro's complex SafeResult form schema inference
 */
export function handlePeriodicEventsCreatePage(Astro: AstroGlobal): PeriodicEventsCreatePageData {

  const actionResult = Astro.getActionResult(actions.periodicEvents.create);
  
  // 1. Prepare form options (domain concern)
  const formOptions = {
    frequencyOptions: FREQUENCY_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS,
    priorityOptions: PRIORITY_OPTIONS,
    colorOptions: COLOR_OPTIONS,
  };

  // 2. Extract only the data we need from the action result
  let createdEvent: PeriodicEventType | undefined;
  let hasError = false;
  let errorMessage: string | undefined;

  if (actionResult?.error) {
    hasError = true;
    errorMessage = actionResult.error.message;
  } else if (actionResult?.data) {
    createdEvent = actionResult.data;
  }

  // 3. Return structured page data
  return {
    formOptions,
    createdEvent,
    hasError,
    errorMessage,
  };
}
