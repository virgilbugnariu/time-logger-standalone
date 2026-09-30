/*
function Test<State, CR extends MSliceCaseReducers<State>>(_options: Input<State, CR>):
  { actions: MCaseReducerAction<CR> } {
  throw "Not implemented";
}

interface StateTest {
  count: number;
}

const tset = Test({
  reducers: {
    increment: (_state: StateTest, _payload: MPayloadAction<{ c1: number }>) => {
    },
    decrement: (_state: StateTest, _payload: MPayloadAction<{ c2: number }>) => {
    },
    jump: (_state) => {
    }
  }
})
tset.actions.increment();
tset.actions.decrement();
tset.actions.jump();
*/
