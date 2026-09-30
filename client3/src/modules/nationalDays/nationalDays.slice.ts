import type { PayloadAction } from "@reduxjs/toolkit";
import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import type { NationalDay, NationalDayMap } from "./types";
import { toKey } from "../pages/calendar/utils";

const nationalDaysSlice = eifCreateSlice('nationalDays', null, {
  reducers: {
    add(state: NationalDayMap | null, action: PayloadAction<NationalDay>) {
      const { payload: dto } = action;
      let newState = {} as NationalDayMap;
      if (state) {
        newState = { ...state };
      }

      const key = toKey(dto.day, dto.month, dto.year)
      return { ...newState, [key]: dto };
    },
    reset(_state: NationalDayMap | null) {
      return null;
    }
  },
});

export default nationalDaysSlice;
