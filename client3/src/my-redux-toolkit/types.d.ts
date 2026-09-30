interface Action<T = any> {
  type: T
}

interface AnyAction extends Action {
  // Allows any extra properties to be defined in an action.
  [extraProps: string]: any
}

type PayloadAction<P = void> = {
  payload: P;
  type: number | string;
}

type CaseReducer<S = any, A extends Action = AnyAction> = (state: Partial<S>, action: A) => S;

type SliceCaseReducers<State> = {
  [K: string]: CaseReducer<State, PayloadAction<State>>;
}

type ValidateSliceCaseReducers<S, ACR extends SliceCaseReducers<S>> = ACR & {
  [T in keyof ACR]: ACR[T] extends {
    reducer(s: S, action?: infer A): any;
  } ? {
    prepare(...a: never[]): Omit<A, 'type'>;
  } : {};
};

interface CreateSliceOptions<State = any, CR extends SliceCaseReducers<State> = SliceCaseReducers<State>> {
  reducers: ValidateSliceCaseReducers<State, CR>;
}

type ActionCreatorForCaseReducer<CR> = CR extends (state: any, action: infer Action) => any
? Action extends { payload: infer P }
  ? (_: P) => void
  : () => void
: () => void;

type CaseReducerAction<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends {
    prepare: any;
  } ? 5
    : ActionCreatorForCaseReducer<CaseReducers[Type]>;
}
interface EifLayoutBlockAction {
  title: string;
  action?: (block: EifLayoutBlock) => Promise<void> | void;
  validateBeforeExecute?: boolean;
}

interface EifLayoutBlock {
  title?: string;

  blockId: number;

  // TODO(bogdan): we can add more types and let the layout render them! think about it
  type: 'page' | 'modal';

  dataPath: string;
  clonedDataFrom?: string;

  validationRules?: Record<string, string>;
  component?: any;
  actions?: Array<EifLayoutBlockAction>;
  extraProps?: any;
}

interface EifState<T extends Record<string, any>> {
  data: T;
  errors: Record<string, string>;
  validationRules: Record<string, Record<string, string>>;
  layoutBlocks: EifLayoutBlock[];
}

