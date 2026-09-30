<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Dropdown from "../common/Dropdown.svelte";
  import ProjectsManagement from "./ProjectsManagement.svelte";

  export let error = "";
  export let value = "";
  export let label = "";

  const options = derived(store, (state) => {
    return Object.values(state.data.projects).map((project) => ({
      name: project.name,
      value: project.id,
    }));
  });

  function openManagementDialog() {
    eifActions.pushLayoutBlock({
      title: "Projects C.R.U.D.",
      type: "modal",
      dataPath: "",
      component: ProjectsManagement,
      actions: [
        {
          title: "back",
          action: ({ blockId }) => {
            eifActions.popLayoutBlock(blockId);
          },
        },
      ],
    });
  }
</script>

<Dropdown
  {label}
  placeholder="Select a project"
  {error}
  {value}
  options={$options}
  on:change
  showMore
  on:show-more={openManagementDialog}
/>
