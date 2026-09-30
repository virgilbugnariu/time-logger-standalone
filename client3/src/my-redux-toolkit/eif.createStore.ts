import type { PayloadAction } from "@reduxjs/toolkit";
import { legacy_createStore as reduxCreateStore, type Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { eifReducer } from "./eif.reducer";

const reducersMap: SliceCaseReducers<any> = {};

export function eifCreateSlice<DefaultState extends State, State, CR extends SliceCaseReducers<State>>(name: string, initialState: DefaultState, _options: CreateSliceOptions<State, CR>)
  : { actions: CaseReducerAction<CR> } {
  const actionsToDisptch = {} as CaseReducerAction<CR>
  const reducersById = {} as Record<number, CaseReducer<State>>

  Object.keys(_options.reducers).forEach((actionName: keyof ValidateSliceCaseReducers<State, CR>) => {
    const id = `${name}:${actionName.toString()}`;
    // @ts-ignore
    actionsToDisptch[actionName] = (payload) => {
      // @ts-ignore
      window.__efiDispatch({ type: id, payload });
    };
    // @ts-ignore
    reducersById[id] = _options.reducers[actionName];
  });

  const reducer = (state: State = initialState, _action: AnyAction) => {
    if (reducersById[_action.type]) {
      return reducersById[_action.type](state, _action);
    }
    return state
  }

  reducersMap[name] = reducer;

  return {
    actions: actionsToDisptch,
  };
}

const DEFAULT_STATE: EifState<any> = {
  data: {},
  errors: {},
  validationRules: {},
  layoutBlocks: []
};

function combineReducers<T>(state: T, action: PayloadAction<any>): T {
  const newState = { ...state } as T;

  Object.keys(reducersMap).forEach((reducerKey: string) => {
    newState[reducerKey] = reducersMap[reducerKey](state[reducerKey], action);
  });

  return newState;
}

function rootReducer<T extends object>(state: EifState<T> = DEFAULT_STATE, action?: PayloadAction<any>): EifState<T> {
  return eifReducer<T>({
    ...state,
    data: combineReducers(state?.data, action),
  }, action);
}

export default function eifCreateStore<T>(): Store<EifState<T>, AnyAction> {
  let reduxStore: Store<EifState<T>, AnyAction> = reduxCreateStore(
    rootReducer,
    composeWithDevTools()
  );

  // @ts-ignore
  window.__efiDispatch = reduxStore.dispatch;

  return reduxStore;
}
