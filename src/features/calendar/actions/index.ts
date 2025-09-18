import { fetchCalendar } from '../providers/google-calendar/actions/fetchCalendar';
import { calculateAvailability, getBackgroundEvents } from './calendar';

const calendar = {
  calculateAvailability,
  getBackgroundEvents,
  providers: {
    google: {
      fetchCalendar,
    },
  },
};

export default calendar;
