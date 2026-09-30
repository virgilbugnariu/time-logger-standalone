import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import omit from 'lodash/omit';
import type { Signature, SignaturesMap } from "./types";

const signaturesSlice = eifCreateSlice('signatures', {}, {
  reducers: {
    set(state: SignaturesMap, action: PayloadAction<Signature>) {
      const { id } = action.payload;
      return {
        ...state,
        [id]: action.payload,
      }
    },
    delete(state: SignaturesMap, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      return omit(state, id);
    },
    reset(_state: SignaturesMap) {
      return {}
    }
  }
});

export default signaturesSlice;
