import { defineDb } from 'astro:db';
import { Users, Sessions, Accounts, Verifications } from '../src/features/auth/models';
import { PeriodicEvent } from '../src/features/periodic-events/models/PeriodicEvents.db';
import { ScheduleBlock } from '../src/features/schedule/models/ScheduleBlock.db';





// Export tables for use in actions
export { Users, Sessions, Accounts, Verifications, ScheduleBlock, PeriodicEvent };

// https://astro.build/db/config
export default defineDb({
  tables: {
    Users,
    Sessions,
    Accounts,
    Verifications,
    PeriodicEvent,
    ScheduleBlock,
  }
});
