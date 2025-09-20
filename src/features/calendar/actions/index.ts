import { fetchCalendar } from '../providers/google-calendar/actions/fetchCalendar';
import { calculateAvailability, getBackgroundEvents } from './calendar';
import { getCalendarPageDataAction } from './getCalendarPageData';

const calendar = {
  calculateAvailability,
  getBackgroundEvents,
  getCalendarPageData: getCalendarPageDataAction,
  providers: {
    google: {
      fetchCalendar,
    },
  },
};

export default calendar;
