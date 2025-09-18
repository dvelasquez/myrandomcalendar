import auth from '../features/auth/actions';
import googleCalendar from '../features/google-calendar/actions';
import periodicEvents from '../features/periodic-events/actions';
import schedule from '../features/schedule/actions';

export const server = {
  auth,
  googleCalendar,
  schedule,
  periodicEvents,
};
