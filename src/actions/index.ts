import { fetchCalendar } from './fetch-calendar';
import { login } from './login';
import { logout } from './logout';
import { register } from './register';
import { createScheduleBlockAction, updateScheduleBlockAction, deleteScheduleBlockAction, toggleScheduleBlockAction, getScheduleBlocksAction, createDefaultScheduleBlocksAction } from './schedule-block-actions';

export const server = {
  register,
  login,
  logout,
  fetchCalendar,
  createScheduleBlockAction,
  updateScheduleBlockAction,
  deleteScheduleBlockAction,
  toggleScheduleBlockAction,
  getScheduleBlocksAction,
  createDefaultScheduleBlocksAction,
};
