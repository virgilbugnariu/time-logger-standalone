import type { Readable } from "svelte/store";
import type { RootState } from "./types";

import './modules/pages/calendar/selectedMonth.slice';
import './modules/pages/calendar/workedHours.slice';
import './modules/pages/calendar/workedHoursCopy.slice';
import './modules/projects/projects.slice';
import './modules/workedHoursDetails/workedHoursDetails.slice';
import './modules/nationalDays/nationalDays.slice';
import './modules/signatures/signatures.slice';
import './modules/companies/companies.slice';
import './modules/contractDetails/contractDetails.slice';

import eifCreateStore from "./my-redux-toolkit/eif.createStore";
import eifInitActions from "./my-redux-toolkit/eif.actions";

const reduxStore = eifCreateStore<RootState>();
const eifActions = eifInitActions(reduxStore);

const store: Readable<EifState<RootState>> = {
  ...reduxStore,
  subscribe(fn) {
    fn(reduxStore.getState())

    return reduxStore.subscribe(() => {
      fn(reduxStore.getState())
    });
  },
}

const dispatch = reduxStore.dispatch;

export { store, eifActions, dispatch }
