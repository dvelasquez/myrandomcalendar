import auth from '../features/auth/actions';
import calendar from '../features/calendar/actions';
import periodicEvents from '../features/periodic-events/actions';
import schedule from '../features/schedule/actions';

export const server = {
  auth,
  calendar,
  schedule,
  periodicEvents,
};
