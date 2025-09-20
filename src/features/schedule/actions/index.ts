import { createDefaultScheduleBlocks } from "./createDefaultSchemaBlocks";
import { createScheduleBlock } from "./createScheduleBlock";
import { deleteScheduleBlock } from "./deleteScheduleBlock";
import { getMaintainerPageDataAction } from "./getMaintainerPageData";
import { getScheduleBlocks } from "./getScheduleBlock";
import { 
  getSchedulePageDataAction, 
  getAvailabilityPageDataAction, 
  getCalendarPageDataAction, 
  refreshCalendarDataAction 
} from "./getSchedulePageData";
import { toggleScheduleBlock } from "./toggleScheduleBlock";
import { updateScheduleBlock } from "./updateScheduleBlock";

const schedule = { 
  createScheduleBlock, 
  deleteScheduleBlock, 
  getScheduleBlocks, 
  toggleScheduleBlock, 
  updateScheduleBlock,
  createDefaultScheduleBlocks,
  // New combined data fetching actions
  getSchedulePageData: getSchedulePageDataAction,
  getAvailabilityPageData: getAvailabilityPageDataAction,
  getCalendarPageData: getCalendarPageDataAction,
  refreshCalendarData: refreshCalendarDataAction,
  getMaintainerPageData: getMaintainerPageDataAction
};

export default schedule;