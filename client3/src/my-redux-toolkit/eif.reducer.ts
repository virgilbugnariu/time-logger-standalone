import type { PayloadAction } from '@reduxjs/toolkit';
import { produce } from 'immer';
import set from 'lodash/set';
import omit from 'lodash/omit';
import validate from './validate';

let blockId = 0;
export function eifReducer<T extends object>(state: EifState<T>, action: PayloadAction<any>): EifState<T> {
  if (action.type === 'fw_remove_data') {
    const { payload } = action as PayloadAction<{ dataPath: string }>;

    return produce(state, (draft: EifState<T>) => {
      draft.data = omit(draft.data, [payload.dataPath]) as T;
      return draft;
    });
  }

  if (action.type === 'fw_set_data') {
    const { payload: { dataPath, data } } = action as PayloadAction<{ dataPath: string, data: any }>;

    return produce(state, draft => {
      // TODO(bogdan): move validation into an async action
      const validationRules = draft.validationRules[dataPath] || {};
      const errorMessage = validate(data, validationRules);
      if (errorMessage) {
        set(draft.errors, `['${dataPath}']`, errorMessage);
      } else {
        set(draft.errors, `['${dataPath}']`, undefined);
      }

      set(draft, `data.${dataPath}`, data);
      return draft;
    });
  }

  if (action.type === 'fw_set_error') {
    const { payload: { dataPath, error } } = action as PayloadAction<{ dataPath: string, error: string }>;

    return produce(state, draft => {
      set(draft.errors, `['${dataPath}']`, error);
      return draft;
    });
  }

  if (action.type === 'fw_push_layout_block') {
    const { payload: { block } } = action as PayloadAction<{ block: EifLayoutBlock }>;

    return produce(state, draft => {
      draft.layoutBlocks.push({
        blockId: ++blockId,
        ...block,
      } as EifLayoutBlock);
      return draft;
    });
  }

  if (action.type === 'fw_pop_layout_block') {
    const { payload: { blockId } } = action as PayloadAction<{ blockId: number }>;

    return produce(state, draft => {
      draft.layoutBlocks = draft.layoutBlocks.filter(df => df.blockId !== blockId) || [];
      return draft
    });
  }

  if (action.type === 'fw_vr_remove') {
    const { payload: { dataPath } } = action as PayloadAction<{ dataPath: string }>;

    return produce(state, draft => {
      set(draft.validationRules, dataPath, undefined);
      return draft;
    });
  }

  if (action.type === 'fw_vr_add') {
    const { payload: { rules, dataPath } } = action as PayloadAction<{ dataPath: string, rules: Record<string, string> }>;

    return produce(state, draft => {
      draft.validationRules[dataPath] = rules;
      return draft;
    });
  }

  return state;
}
