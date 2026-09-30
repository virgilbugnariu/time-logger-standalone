import type { Store } from "redux";
import { get, findLast, clone, isEmpty, trim } from 'lodash';
import validate from "./validate";

type Optional<T, Keys extends keyof T> = Omit<T, Keys> & Pick<Partial<T>, Keys>;

interface ErrorAtPath {
  __self?: string;
  [path: string]: string;
}

export default function eifInitActions<T extends EifState<any>>(store: Store<T, AnyAction>) {
  function getDataAtPath<TData>(dataPath: string) {
    const state = store.getState();
    return get(state, `data.${dataPath}`) as TData | undefined;
  }
  function getRootDataAtPath<TData>(dataPath: string) {
    const state = store.getState();
    return get(state, dataPath) as TData | undefined;
  }
  function getData<TData>(fn: (_: T['data']) => TData) {
    const state = store.getState();
    return fn(state.data);
  }
  function getRootData<TData>(fn: (_: T) => TData) {
    const state = store.getState();
    return fn(state);
  }
  function setError(dataPath: string, error: string) {
    store.dispatch({
      type: 'fw_set_error',
      payload: { dataPath, error },
    })
  }
  function setData(dataPath: string, data: any) {
    store.dispatch({
      type: 'fw_set_data',
      payload: { dataPath, data },
    })
  }
  function removeData(dataPath: string) {
    store.dispatch({
      type: 'fw_remove_data',
      payload: { dataPath },
    })
  }
  function addValidationRules(dataPath: string, rules: Record<string, string>) {
    store.dispatch({
      type: 'fw_vr_add',
      payload: { dataPath, rules },
    })
  }
  function removeValidationRules(dataPath: string) {
    store.dispatch({
      type: 'fw_vr_remove',
      payload: { dataPath },
    })
  }
  function popLayoutBlock(blockId: EifLayoutBlock['blockId'], effect?: 'deleteDataAtPath' | 'overrideOriginalWithClone') {
    if (!effect) {
      store.dispatch({ type: 'fw_pop_layout_block', payload: { blockId } })
      return;
    }

    const block = getRootData(state => state.layoutBlocks)
      .find(block => block.blockId === blockId)

    if (!block) {
      return;
    }

    if (effect === 'deleteDataAtPath') {
      removeData(block.dataPath);
    }

    if (effect === 'overrideOriginalWithClone') {
      if (block.clonedDataFrom) {
        const clonedData = getDataAtPath(block.dataPath);
        setData(block.clonedDataFrom, clonedData);
      }
      removeData(block.dataPath);
    }

    store.dispatch({ type: 'fw_pop_layout_block', payload: { blockId } })
  };
  let clonedDataId = 0;
  function pushLayoutBlock(block: Optional<EifLayoutBlock, 'blockId'>, cloneData?: 'cloneData') {
    if (cloneData) {
      const toCloneData = getRootDataAtPath(`data.${block.dataPath}`);

      const cloneDataPath = `cloned${++clonedDataId}`

      setData(cloneDataPath, clone(toCloneData));
      store.dispatch({
        type: 'fw_push_layout_block',
        payload: {
          block: {
            ...block,
            dataPath: cloneDataPath,
            clonedDataFrom: block.dataPath,
          } as EifLayoutBlock
        },
      });

      return;
    }
    store.dispatch({
      type: 'fw_push_layout_block',
      payload: { block },
    })
  };
  return {
    getData,
    getRootData,
    getDataAtPath,
    getRootDataAtPath,
    setError,
    setData,
    removeData,
    addValidationRules,
    removeValidationRules,
    popLayoutBlock,
    pushLayoutBlock,
    replaceLayoutBlock(block: Optional<EifLayoutBlock, 'blockId'>, removeEffect?: 'deleteDataAtPath' | 'overrideOriginalWithClone') {
      const blocks = getRootData((state) => state.layoutBlocks);
      const lastBlock = findLast(blocks, b => b.type === block.type);
      if (lastBlock) {
        popLayoutBlock(lastBlock.blockId, removeEffect);
      }
      pushLayoutBlock(block);
    },
    executeBlockAction(blockAction: EifLayoutBlockAction, block: EifLayoutBlock) {
      const { action, validateBeforeExecute } = blockAction;
      if (!validateBeforeExecute) {
        return action && action(block);
      }

      const { dataPath } = block;
      const allValidations = getRootData(state => state.validationRules) || {}
      const pathsWithValidations = Object.keys(allValidations).filter(dp => dp.startsWith(dataPath));

      for (const pwv of pathsWithValidations) {
        const data = getDataAtPath(pwv);
        const rules = getRootDataAtPath<Record<string, string>>(`validationRules['${pwv}']`) || {};

        const error = validate(data, rules);
        if (error) {
          setError(pwv, error);
          return;
        }
      }

      return action && action(block);
    },
    getErrorsAtPath(dataPath: string): ErrorAtPath | null {
      const allErrors = getRootData(state => state.errors);
      
      return Object.keys(allErrors)
        .filter(key => key.startsWith(dataPath))
        .reduce((all, currentKey) => {
          const newKey = trim(currentKey.replace(dataPath, ''), '.');
          all[newKey || '__self'] = allErrors[currentKey];
          return all
        }, {}) as ErrorAtPath
    },
    isDataAtPathValid(dataPath: string) {
      const allErrors = getRootData(state => state.errors);
      const childPathsWithError = Object.keys(allErrors).find(pwe => pwe.startsWith(dataPath));
      return !childPathsWithError || isEmpty(allErrors[childPathsWithError]);
    }
  };
}
