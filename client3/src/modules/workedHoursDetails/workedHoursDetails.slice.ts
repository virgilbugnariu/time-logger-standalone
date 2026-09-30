import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import omit from 'lodash/omit';

export interface WorkedHoursDetails {
  id: string;
  details: string;
  short: string;
  isThisWork: boolean;
  isReadonly?: boolean;
}

const workedHoursDetailsSlice = eifCreateSlice('workHoursDetails', {}, {
  reducers: {
    set(state: Record<string, WorkedHoursDetails>, action: PayloadAction<WorkedHoursDetails>) {
      const { id } = action.payload;
      return {
        ...state,
        [id]: action.payload,
      }
    },
    delete(state: Record<string, WorkedHoursDetails>, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      return omit(state, id);
    },
    reset(_state: Record<string, WorkedHoursDetails>) {
      return {}
    }
  }
});

export default workedHoursDetailsSlice;
