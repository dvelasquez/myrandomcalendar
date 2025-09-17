import auth from '../features/auth/actions';
import periodicEvents from '../features/periodic-events/actions';
import schedule from '../features/schedule/actions';
import { fetchCalendar } from './fetch-calendar';

export const server = {
  auth,
  fetchCalendar,
  schedule,
  periodicEvents,
};
