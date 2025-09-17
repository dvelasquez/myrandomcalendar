import schedule from '../features/schedule/actions';
import { fetchCalendar } from './fetch-calendar';
import { login } from './login';
import { logout } from './logout';
import { createPeriodicEventAction, getPeriodicEventsAction } from './periodic-event-actions'; 
import { register } from './register';

export const server = {
  register,
  login,
  logout,
  fetchCalendar,
  schedule,
  createPeriodicEventAction,
  getPeriodicEventsAction,
};
