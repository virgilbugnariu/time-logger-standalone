import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import omit from 'lodash/omit';
import type { Company } from "./types";

export type CompaniesMap = Record<string, Company>;

const companiesSlice = eifCreateSlice('companies', {}, {
  reducers: {
    set(state: CompaniesMap, action: PayloadAction<Company>) {
      const company = action.payload;
      return {
        ...state,
        [company.id]: company,
      }
    },
    delete(state: CompaniesMap, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const newState = omit(state, [id])
      return newState;
    },
    reset(_state: CompaniesMap) {
      return {}
    },
  }
})

export default companiesSlice;
