import { eifCreateSlice } from "../../../my-redux-toolkit/eif.createStore";
import dayjs from "dayjs";

export interface SelectedMonth {
  year: number;
  month: number;
}

const DEFAULT_DATA: SelectedMonth = {
  year: dayjs().year(),
  month: dayjs().month() + 1,
}

const selectedMonthSlice = eifCreateSlice('selectedMonth', DEFAULT_DATA, {
  reducers: {
    set: (_state: SelectedMonth, action: PayloadAction<{ month: SelectedMonth }>) => {
      return { ...action.payload.month }
    },
    prev: (state: SelectedMonth) => {
      const { year, month } = state;

      if (month - 1 < 1) {
        return { year: year - 1, month: 12 }
      }

      return { year: year, month: month - 1 }
    },
    next: (state: SelectedMonth) => {
      const { year, month } = state;

      if (month + 1 > 12) {
        return { year: year + 1, month: 1 }
      }

      return { year: year, month: month + 1 }
    },
    reset: (_state: SelectedMonth) => {
      return { year: DEFAULT_DATA.year, month: DEFAULT_DATA.month }
    }
  }
})

export default selectedMonthSlice;
