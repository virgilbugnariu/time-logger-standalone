import type { PayloadAction } from "@reduxjs/toolkit";
import { eifCreateSlice } from "../../../my-redux-toolkit/eif.createStore";
import type { CalendarWorkedHours, WorkDay } from "./types";
import { toKey } from "./utils";

const workedHoursSlice = eifCreateSlice('calendarWorkedHours', {}, {
  reducers: {
    set(state: CalendarWorkedHours, action: PayloadAction<WorkDay>) {
      const { payload: workDay } = action;
      const key = toKey(workDay.day, workDay.month, workDay.year);
      const oldWorkedHoursOnDate = state[key] || {};
      return {
        ...state,
        [key]: {
          ...oldWorkedHoursOnDate,
          ...workDay,
        }
      }
    },
    addWorkHoursTo(state: CalendarWorkedHours, action: PayloadAction<WorkDay>) {
      const { payload: workDay } = action;
      const key = toKey(workDay.day, workDay.month, workDay.year);
      return {
        ...state,
        [key]: {
          ...workDay,
          workedHours: [
            ...workDay.workedHours,
            {
              hours: '0',
              projectId: '',
              detailsId: '',
            }
          ]
        }
      };
    },
    reset(_state: CalendarWorkedHours) {
      return {};
    }
  },
});

export default workedHoursSlice;
