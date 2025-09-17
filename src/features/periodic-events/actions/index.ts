import { createPeriodicEvent } from "./createPeriodicEvent";
import { getPeriodicEvents } from "./getPeriodicEvent";

const periodicEvents = {
  create: createPeriodicEvent,
  get: getPeriodicEvents,
};

export default periodicEvents;