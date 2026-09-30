<script lang="ts">
  import { derived } from "svelte/store";
  import { eifActions, store } from "../../store";
  import Dropdown from "../common/Dropdown.svelte";
  import WorkedHoursDetailsManagement from "./WorkedHoursDetailsManagement.svelte";

  export let error = "";
  export let value = "";
  export let label = "";

  const options = derived(store, (state) => {
    return Object.values(state.data.workHoursDetails).map((detailsItem) => ({
      name: `${detailsItem.short} ${detailsItem.details}`,
      value: detailsItem.id,
    }));
  });

  function openManagementDialog() {
    eifActions.pushLayoutBlock({
      title: "Details C.R.U.D.",
      type: "modal",
      dataPath: "",
      component: WorkedHoursDetailsManagement,
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
  placeholder="Details"
  {error}
  {value}
  options={$options}
  on:change
  showMore
  on:show-more={openManagementDialog}
/>
