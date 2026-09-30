import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import omit from 'lodash/omit';

export interface CompaniesContractDetails {
  id?: string;
  description: string;
}

export type CompaniesContractDetailsMap = Record<string, CompaniesContractDetails>;

const companiesContractDetailsSlice = eifCreateSlice('companiesContractDetails', {}, {
  reducers: {
    set(state: CompaniesContractDetailsMap, action: PayloadAction<CompaniesContractDetails>) {
      const { id } = action.payload;
      return {
        ...state,
        [id]: action.payload,
      }
    },
    delete(state: CompaniesContractDetailsMap, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      return omit(state, id);
    },
    reset(_state: CompaniesContractDetailsMap) {
      return {}
    }
  }
});

export default companiesContractDetailsSlice;
