import type { PayloadAction } from "@reduxjs/toolkit";
import { eifCreateSlice } from "../../../my-redux-toolkit/eif.createStore";
import type { WorkDay } from "./types";

const workedHoursCopySlice = eifCreateSlice('workedHoursCopied', null, {
  reducers: {
    copy(_state: WorkDay | null, action: PayloadAction<WorkDay>) {
      const { payload: workDay } = action;
      return workDay;
    },
    reset(_state: WorkDay | null) {
      return null;
    }
  },
});

export default workedHoursCopySlice;
