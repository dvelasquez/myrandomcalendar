import { createDefaultScheduleBlocks } from "./createDefaultSchemaBlocks";
import { createScheduleBlock } from "./createScheduleBlock";
import { deleteScheduleBlock } from "./deleteScheduleBlock";
import { getScheduleBlocks } from "./getScheduleBlock";
import { toggleScheduleBlock } from "./toggleScheduleBlock";
import { updateScheduleBlock } from "./updateScheduleBlock";


const schedule =  { 
  createScheduleBlock, 
  deleteScheduleBlock, 
  getScheduleBlocks, 
  toggleScheduleBlock, 
  updateScheduleBlock,
  createDefaultScheduleBlocks
};

export default schedule;