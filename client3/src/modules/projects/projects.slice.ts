import { eifCreateSlice } from "../../my-redux-toolkit/eif.createStore";
import omit from 'lodash/omit';

export interface Project {
  id: string;
  name: string;
  odooid: string;
  isReadonly?: boolean;
}

const projectsSlice = eifCreateSlice('projects', {}, {
  reducers: {
    set(state: Record<string, Project>, action: PayloadAction<Project>) {
      const project = action.payload;
      return {
        ...state,
        [project.id]: project,
      }
    },
    delete(state: Record<string, Project>, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const newState = omit(state, [id])
      return newState;
    },
    reset(_state: Record<string, Project>) {
      return {}
    },
  }
})

export default projectsSlice;
